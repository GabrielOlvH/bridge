import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { resolveBinary } from './binaries';
import { runPtyCommand } from './pty-runner';
import { stripAnsi } from './utils';
import { tokenCache } from './state';
import { MAX_TOKEN_FILES } from './config';

import type { ProviderUsage, TokenUsage } from './state';

type CodexStatus = ProviderUsage & { credits?: number };

type CodexRpcResult = {
  session?: { percentLeft?: number; reset?: string };
  weekly?: { percentLeft?: number; reset?: string };
  credits?: number;
  source?: string;
};

type RateLimitWindow = {
  usedPercent?: number;
  resetsAt?: number;
};

type RateLimitCredits = {
  balance?: number | string;
};

type RateLimitsPayload = {
  rateLimits?: {
    primary?: RateLimitWindow;
    secondary?: RateLimitWindow;
    credits?: RateLimitCredits;
  };
  primary?: RateLimitWindow;
  secondary?: RateLimitWindow;
  credits?: RateLimitCredits;
};

function percentLeftFromLine(line: string): number | undefined {
  const left = line.match(/(\d{1,3})%\s*(left|remaining)/i);
  if (left) return Number(left[1]);
  const used = line.match(/(\d{1,3})%\s*used/i);
  if (used) return Math.max(0, 100 - Number(used[1]));
  const any = line.match(/(\d{1,3})%/);
  return any ? Number(any[1]) : undefined;
}

function resetFromLine(line: string): string | null {
  const match = line.match(/reset[s]?\s*(?:in|at)?\s*(.*)$/i);
  if (match && match[1]) return match[1].trim();
  return null;
}

export async function getCodexStatus(): Promise<CodexStatus | { error: string }> {
  const binary = await resolveBinary('codex', 'TMUX_AGENT_CODEX_BIN');
  if (!binary) return { error: 'codex not installed' };
  const rpc = (await getCodexStatusRPC(binary)) as CodexRpcResult | { error: string } | null;
  if (rpc && !('error' in rpc)) return rpc as CodexStatus;
  const fallbackError = rpc && 'error' in rpc ? String(rpc.error) : null;
  const output = await runPtyCommand(binary, ['-s', 'read-only', '-a', 'untrusted'], '/status\n', {
    rows: 60,
    cols: 200,
    timeoutMs: 8000,
  });
  const clean = stripAnsi(output).trim();
  if (!clean) return fallbackError ? { error: fallbackError } : { error: 'codex status unavailable' };
  const lower = clean.toLowerCase();
  if (lower.includes('update available') && lower.includes('codex')) {
    return { error: 'codex update required' };
  }
  const lines = clean.split('\n');
  const creditsMatch = clean.match(/Credits:\s*([0-9][0-9.,]*)/i);
  const credits = creditsMatch ? Number(creditsMatch[1].replace(/,/g, '')) : undefined;
  const fiveLine =
    lines.find((line) => /5\s*h/i.test(line)) ||
    lines.find((line) => /5-hour/i.test(line)) ||
    lines.find((line) => /5 hour/i.test(line));
  const weekLine = lines.find((line) => /week/i.test(line));
  const session = fiveLine
    ? {
        percentLeft: percentLeftFromLine(fiveLine),
        reset: resetFromLine(fiveLine) || undefined,
      }
    : undefined;
  const weekly = weekLine
    ? {
        percentLeft: percentLeftFromLine(weekLine),
        reset: resetFromLine(weekLine) || undefined,
      }
    : undefined;
  const percentLines = lines.filter((line) => /\b\d{1,3}%\b/.test(line));
  if (session && !Number.isFinite(session.percentLeft) && percentLines[0]) {
    session.percentLeft = percentLeftFromLine(percentLines[0]);
  }
  if (weekly && !Number.isFinite(weekly.percentLeft) && percentLines[1]) {
    weekly.percentLeft = percentLeftFromLine(percentLines[1]);
  }
  if (!session?.percentLeft && !weekly?.percentLeft && rpc && 'error' in rpc) return rpc;
  return { session, weekly, credits, source: 'cli' };
}

type RpcPending = {
  resolve: (value: RpcResponse) => void;
  reject: (reason?: unknown) => void;
};

type RpcResponse = {
  id?: number;
  result?: unknown;
} & Record<string, unknown>;

async function getCodexStatusRPC(binary: string): Promise<CodexRpcResult | { error: string } | null> {
  return new Promise<CodexRpcResult | { error: string } | null>((resolve) => {
    let settled = false;
    const pending = new Map<number, RpcPending>();
    let nextId = 1;

    const proc = spawn(binary, ['-s', 'read-only', '-a', 'untrusted', 'app-server'], {
      env: { ...process.env, PATH: process.env.PATH || '' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const finish = (result: CodexRpcResult | { error: string }) => {
      if (settled) return;
      settled = true;
      try {
        proc.kill();
      } catch {}
      resolve(result);
    };

    const timeout = setTimeout(() => finish({ error: 'codex rpc timeout' }), 7000);

    const rl = readline.createInterface({ input: proc.stdout });
    rl.on('line', (line) => {
      let msg: RpcResponse | null = null;
      try {
        msg = JSON.parse(line) as RpcResponse;
      } catch {
        return;
      }
      if (msg && msg.id != null && pending.has(msg.id)) {
        const pendingReq = pending.get(msg.id);
        if (!pendingReq) return;
        pending.delete(msg.id);
        pendingReq.resolve(msg);
      }
    });

    proc.on('exit', () => {
      clearTimeout(timeout);
      finish({ error: 'codex rpc closed' });
    });

    function send(payload: Record<string, unknown>) {
      try {
        proc.stdin.write(`${JSON.stringify(payload)}\n`);
      } catch {}
    }

    function request(method: string, params?: Record<string, unknown>): Promise<RpcResponse> {
      const id = nextId++;
      return new Promise<RpcResponse>((resolveReq, rejectReq) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          rejectReq(new Error('request timeout'));
        }, 5000);
        pending.set(id, {
          resolve: (msg) => {
            clearTimeout(timer);
            resolveReq(msg);
          },
          reject: rejectReq,
        });
        send({ id, method, params: params || {} });
      });
    }

    (async () => {
      try {
        await request('initialize', { clientInfo: { name: 'ter', version: '0.1' } });
        send({ method: 'initialized', params: {} });
        const rateLimitsResponse = await request('account/rateLimits/read', {});
        const result = (rateLimitsResponse.result || rateLimitsResponse) as RateLimitsPayload;
        const rateLimits = result.rateLimits || result;
        const primary = rateLimits.primary;
        const secondary = rateLimits.secondary;
        const credits = rateLimits.credits;
        const session = primary
          ? {
              percentLeft:
                typeof primary.usedPercent === 'number' ? Math.max(0, Math.round(100 - primary.usedPercent)) : undefined,
              reset:
                primary.resetsAt != null
                  ? new Date(primary.resetsAt * 1000).toISOString()
                  : undefined,
            }
          : undefined;
        const weekly = secondary
          ? {
              percentLeft:
                typeof secondary.usedPercent === 'number'
                  ? Math.max(0, Math.round(100 - secondary.usedPercent))
                  : undefined,
              reset:
                secondary.resetsAt != null
                  ? new Date(secondary.resetsAt * 1000).toISOString()
                  : undefined,
            }
          : undefined;
        const creditValue = credits?.balance != null ? Number(String(credits.balance).replace(/,/g, '')) : undefined;
        clearTimeout(timeout);
        finish({ session, weekly, credits: Number.isFinite(creditValue) ? creditValue : undefined, source: 'rpc' });
      } catch (err) {
        clearTimeout(timeout);
        const message = err instanceof Error ? err.message : String(err || 'rpc failed');
        finish({ error: `codex rpc failed: ${message}` });
      }
    })().catch((err) => {
      const message = err instanceof Error ? err.message : String(err || 'rpc failed');
      finish({ error: `codex rpc failed: ${message}` });
    });
  });
}

function toInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

type TokenUsageSnapshot = {
  input_tokens?: unknown;
  cached_input_tokens?: unknown;
  cache_read_input_tokens?: unknown;
  output_tokens?: unknown;
};

function dayFolder(date: Date): { year: string; month: string; day: string } {
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return { year, month, day };
}

async function listCodexFiles(root: string, days: number): Promise<string[]> {
  const files: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const { year, month, day } = dayFolder(date);
    const dir = path.join(root, year, month, day);
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.jsonl')) continue;
        files.push(path.join(dir, entry.name));
        if (files.length >= MAX_TOKEN_FILES) return files;
      }
    } catch {}
  }
  return files;
}

async function scanJsonlFile(filePath: string, onLine: (line: string) => void): Promise<void> {
  return new Promise<void>((resolve) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk;
      let idx = buffer.indexOf('\n');
      while (idx >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.trim().length > 0) onLine(line);
        idx = buffer.indexOf('\n');
      }
    });
    stream.on('end', () => {
      if (buffer.trim().length > 0) onLine(buffer);
      resolve();
    });
    stream.on('error', () => resolve());
  });
}

export async function getCodexTokenUsage(days = 7): Promise<TokenUsage | null> {
  const now = Date.now();
  if (tokenCache.codex.value && now - tokenCache.codex.ts < 60000) {
    return tokenCache.codex.value;
  }
  if (tokenCache.codex.inflight) {
    return tokenCache.codex.value;
  }
  const codexHome = process.env.CODEX_HOME ? path.resolve(process.env.CODEX_HOME) : path.join(os.homedir(), '.codex');
  const root = path.join(codexHome, 'sessions');
  try {
    await fs.promises.access(root);
  } catch {
    return null;
  }
  const files = await listCodexFiles(root, days);
  if (files.length === 0) return null;
  const totals = { input: 0, cached: 0, output: 0 };
  for (const filePath of files) {
    let previousTotals: { input: number; cached: number; output: number } | null = null;
    await scanJsonlFile(filePath, (line) => {
      let obj: Record<string, unknown>;
      try {
        obj = JSON.parse(line) as Record<string, unknown>;
      } catch {
        return;
      }
      const payload = (obj.payload || obj) as Record<string, unknown>;
      const info = (payload.info || obj.info) as { total_token_usage?: unknown; last_token_usage?: unknown } | undefined;
      if (!info) return;
      const total = info.total_token_usage;
      const last = info.last_token_usage;
      const inputKey = (data: TokenUsageSnapshot | null | undefined) => data?.input_tokens;
      const cachedKey = (data: TokenUsageSnapshot | null | undefined) => data?.cached_input_tokens ?? data?.cache_read_input_tokens;
      const outputKey = (data: TokenUsageSnapshot | null | undefined) => data?.output_tokens;
      if (total) {
        const snapshot = total as TokenUsageSnapshot;
        const input = toInt(inputKey(snapshot));
        const cached = toInt(cachedKey(snapshot));
        const output = toInt(outputKey(snapshot));
        const prev = previousTotals || { input: 0, cached: 0, output: 0 };
        totals.input += Math.max(0, input - prev.input);
        totals.cached += Math.max(0, cached - prev.cached);
        totals.output += Math.max(0, output - prev.output);
        previousTotals = { input, cached, output };
        return;
      }
      if (last) {
        const snapshot = last as TokenUsageSnapshot;
        totals.input += Math.max(0, toInt(inputKey(snapshot)));
        totals.cached += Math.max(0, toInt(cachedKey(snapshot)));
        totals.output += Math.max(0, toInt(outputKey(snapshot)));
      }
    });
  }
  const result = {
    input: totals.input,
    cached: totals.cached,
    output: totals.output,
    total: totals.input + totals.output,
    periodDays: days,
    updatedAt: Date.now(),
    source: 'logs',
  };
  tokenCache.codex = { ts: now, value: result, inflight: null };
  return result;
}
