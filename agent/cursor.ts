import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { oauthCache } from './state';
import { formatOAuthError } from './utils';

async function resolveCursorCookieHeader(): Promise<string | null> {
  const envHeader = (process.env.CURSOR_COOKIE || '').trim();
  if (envHeader) return envHeader;
  const home = os.homedir();
  const candidates = [
    path.join(home, '.cursor', 'session.json'),
    path.join(home, '.cursor', 'cookie.json'),
  ];
  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.cookie === 'string') return parsed.cookie;
      if (parsed && Array.isArray(parsed.cookies)) {
        const header = (parsed.cookies as Array<{ name?: string; value?: string }>)
          .map((cookie) => `${cookie.name ?? ''}=${cookie.value ?? ''}`)
          .filter((cookie: string) => cookie !== '=')
          .join('; ');
        if (header) return header;
      }
    } catch {}
  }
  return null;
}

type CursorAuthResult = { data: any } | { error: string };

type CursorUsage = {
  session?: { percentLeft?: number; reset?: string };
  source?: string;
  error?: string;
};

async function fetchCursorUsage(cookieHeader: string): Promise<CursorAuthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://cursor.com/api/usage-summary', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    if (response.status === 401 || response.status === 403) {
      return { error: 'cursor not logged in' };
    }
    if (!response.ok) {
      return { error: `cursor http ${response.status}: ${text.slice(0, 200)}` };
    }
    const payload = JSON.parse(text);
    return { data: payload };
  } catch (err) {
    return { error: formatOAuthError(err) || 'cursor request failed' };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCursorStatus(): Promise<CursorUsage> {
  const now = Date.now();
  if (oauthCache.cursor.value && now - oauthCache.cursor.ts < 60000) {
    return oauthCache.cursor.value;
  }
  if (oauthCache.cursor.error && now - oauthCache.cursor.ts < 60000) {
    return { error: oauthCache.cursor.error };
  }
  const cookieHeader = await resolveCursorCookieHeader();
  if (!cookieHeader) {
    oauthCache.cursor = { ts: now, value: null, error: 'cursor cookie missing' };
    return { error: 'cursor not configured' };
  }
  const result = await fetchCursorUsage(cookieHeader);
  if ('error' in result) {
    oauthCache.cursor = { ts: now, value: null, error: result.error };
    return { error: result.error };
  }
  const summary = result.data || {};
  const billingCycleEnd = summary.billingCycleEnd || summary.billing_cycle_end;
  const planUsed = Number(summary.individualUsage?.plan?.totalPercentUsed ?? summary.individual_usage?.plan?.total_percent_used ?? 0);
  const planPercentLeft = Number.isFinite(planUsed) ? Math.max(0, Math.round(100 - planUsed)) : undefined;
  const value = {
    session: Number.isFinite(planPercentLeft) ? { percentLeft: planPercentLeft, reset: billingCycleEnd } : undefined,
    source: 'web',
  };
  oauthCache.cursor = { ts: now, value, error: null };
  return value;
}
