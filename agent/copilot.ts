import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { oauthCache } from './state';
import { formatOAuthError } from './utils';

type CopilotHostEntry = {
  oauth_token?: string;
};

type CopilotAuthResult = { data: any } | { error: string };


function resolveCopilotToken(): string | null {
  const envToken = (process.env.COPILOT_API_TOKEN || '').trim();
  if (envToken) return envToken;
  const home = os.homedir();
  const candidates = [
    path.join(home, '.config', 'github-copilot', 'hosts.json'),
    path.join(home, '.github-copilot', 'hosts.json'),
    path.join(home, '.copilot', 'hosts.json'),
    path.join(home, '.copilit', 'hosts.json'),
  ];
  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, CopilotHostEntry> | null;
      const values = Object.values(parsed || {});
      for (const entry of values) {
        if (entry && typeof entry.oauth_token === 'string' && entry.oauth_token.trim()) {
          return entry.oauth_token.trim();
        }
      }
    } catch {}
  }

  const ghHosts = path.join(home, '.config', 'gh', 'hosts.yml');
  try {
    const raw = fs.readFileSync(ghHosts, 'utf8');
    const match = raw.match(/oauth_token:\s*([^\s]+)/);
    if (match && match[1]) return match[1].trim();
  } catch {}

  try {
    const raw = execFileSync('gh', ['auth', 'token'], { timeout: 3000 });
    const token = raw.toString().trim();
    if (token) return token;
  } catch {}
  return null;
}

async function fetchCopilotUsage(token: string): Promise<CopilotAuthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const schemes = ['Bearer', 'token'] as const;
  let lastAuthError: string | null = null;

  try {
    for (const scheme of schemes) {
      const response = await fetch('https://api.github.com/copilot_internal/user', {
        method: 'GET',
        headers: {
          Authorization: `${scheme} ${token}`,
          Accept: 'application/json',
          'Editor-Version': 'vscode/1.96.2',
          'Editor-Plugin-Version': 'copilot-chat/0.26.7',
          'User-Agent': 'GitHubCopilotChat/0.26.7',
          'X-Github-Api-Version': '2025-04-01',
        },
        signal: controller.signal,
      });
      const text = await response.text();

      if (response.ok) {
        const payload = JSON.parse(text);
        return { data: payload };
      }

      if (response.status === 401 || response.status === 403) {
        lastAuthError = `copilot unauthorized (${scheme.toLowerCase()})`;
        continue;
      }

      return { error: `copilot http ${response.status}: ${text.slice(0, 200)}` };
    }

    return { error: lastAuthError || 'copilot unauthorized' };
  } catch (err) {
    return { error: formatOAuthError(err) || 'copilot request failed' };
  } finally {
    clearTimeout(timeout);
  }
}

function copilotWindow(snapshot: { percent_remaining?: number } | null | undefined): { percentLeft: number } | null {
  if (!snapshot || typeof snapshot.percent_remaining !== 'number') return null;
  const percentLeft = Math.max(0, Math.round(snapshot.percent_remaining));
  return { percentLeft };
}

export async function getCopilotStatus(): Promise<{ session?: { percentLeft?: number }; weekly?: { percentLeft?: number }; source?: string; error?: string }> {
  const now = Date.now();
  if (oauthCache.copilot.value && now - oauthCache.copilot.ts < 60000) {
    return oauthCache.copilot.value;
  }
  if (oauthCache.copilot.error && now - oauthCache.copilot.ts < 60000) {
    return { error: oauthCache.copilot.error };
  }
  const token = resolveCopilotToken();
  if (!token) {
    oauthCache.copilot = { ts: now, value: null, error: 'copilot token missing' };
    return { error: 'copilot token missing' };
  }
  const result = await fetchCopilotUsage(token);
  if ('error' in result) {
    oauthCache.copilot = { ts: now, value: null, error: result.error };
    return { error: result.error };
  }
  const quota = result.data?.quotaSnapshots || result.data?.quota_snapshots || {};
  const premium = copilotWindow(quota.premiumInteractions || quota.premium_interactions);
  const chat = copilotWindow(quota.chat);
  const value = {
    session: premium ? { percentLeft: premium.percentLeft } : undefined,
    weekly: chat ? { percentLeft: chat.percentLeft } : undefined,
    source: 'api',
  };
  oauthCache.copilot = { ts: now, value, error: null };
  return value;
}
