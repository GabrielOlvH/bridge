import { getDockerSnapshot } from '../docker';
import { getHostInfo } from '../host';
import { fetchSessions } from './sessions';

export type LiveConfig = {
  sessions: boolean;
  preview: boolean;
  previewLines: number;
  insights: boolean;
  host: boolean;
  docker: boolean;
  intervalMs: number;
};

type LiveSnapshot = Record<string, unknown>;

type LiveSnapshotCacheEntry = {
  ts: number;
  value: LiveSnapshot | null;
  inflight: Promise<LiveSnapshot> | null;
};

const liveSnapshotCache = new Map<string, LiveSnapshotCacheEntry>();
const LIVE_CACHE_MIN_TTL_MS = 1000;
const LIVE_CACHE_MAX_TTL_MS = 4000;

export function parseLiveConfig(url: URL): LiveConfig {
  const sessions = url.searchParams.get('sessions') === '1';
  const preview = url.searchParams.get('preview') === '1';
  const previewLines = Number(url.searchParams.get('previewLines') || '6');
  const insights = url.searchParams.get('insights') === '1';
  const host = url.searchParams.get('host') === '1';
  const docker = url.searchParams.get('docker') === '1';
  const rawInterval = Number(url.searchParams.get('interval') || '5000');
  const intervalMs = Math.max(2000, Number.isFinite(rawInterval) ? rawInterval : 5000);
  return {
    sessions,
    preview,
    previewLines: Number.isFinite(previewLines) ? previewLines : 6,
    insights,
    host,
    docker,
    intervalMs,
  };
}

function buildCacheKey(config: LiveConfig): string {
  return [
    config.sessions ? 's1' : 's0',
    config.preview ? 'p1' : 'p0',
    config.preview ? `l${config.previewLines}` : 'l0',
    config.insights ? 'i1' : 'i0',
    config.host ? 'h1' : 'h0',
    config.docker ? 'd1' : 'd0',
  ].join('|');
}

function getCacheTtl(config: LiveConfig): number {
  const interval = Number.isFinite(config.intervalMs) ? config.intervalMs : 5000;
  return Math.max(LIVE_CACHE_MIN_TTL_MS, Math.min(LIVE_CACHE_MAX_TTL_MS, interval));
}

export async function buildLiveSnapshot(config: LiveConfig) {
  const snapshot: Record<string, unknown> = { type: 'snapshot', ts: Date.now() };
  if (config.sessions) {
    snapshot.sessions = await fetchSessions({
      preview: config.preview,
      previewLines: config.previewLines,
      insights: config.insights,
    });
  }
  if (config.host) {
    snapshot.host = getHostInfo();
  }
  if (config.docker) {
    snapshot.docker = await getDockerSnapshot();
  }
  return snapshot;
}

export async function getLiveSnapshot(config: LiveConfig): Promise<LiveSnapshot> {
  const key = buildCacheKey(config);
  const now = Date.now();
  let entry = liveSnapshotCache.get(key);
  if (!entry) {
    entry = { ts: 0, value: null, inflight: null };
    liveSnapshotCache.set(key, entry);
  }
  const ttl = getCacheTtl(config);
  if (entry.value && now - entry.ts < ttl) {
    return entry.value;
  }
  if (entry.inflight) {
    return entry.value || entry.inflight;
  }
  const previous = entry.value;
  entry.inflight = buildLiveSnapshot(config)
    .then((value) => {
      entry.value = value;
      entry.ts = Date.now();
      return value;
    })
    .catch((err) => {
      if (previous) return previous;
      throw err;
    })
    .finally(() => {
      entry.inflight = null;
    });
  return entry.value || entry.inflight;
}

