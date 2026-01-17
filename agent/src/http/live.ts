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

