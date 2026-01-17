import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type DockerContainer = {
  id: string;
  name: string;
  image: string;
  status?: string;
  state?: string;
  ports?: string;
  createdAt?: string;
  runningFor?: string;
  cpuPercent?: number;
  memoryPercent?: number;
  memoryUsage?: string;
  memoryUsedBytes?: number;
  memoryLimitBytes?: number;
  netIO?: string;
  blockIO?: string;
  pids?: number;
};

type DockerImage = {
  id: string;
  repository: string;
  tag: string;
  size?: string;
  createdAt?: string;
  createdSince?: string;
};

type DockerVolume = {
  name: string;
  driver?: string;
  scope?: string;
};

type DockerNetwork = {
  id: string;
  name: string;
  driver?: string;
  scope?: string;
};

export type DockerSnapshot = {
  available: boolean;
  error?: string;
  containers: DockerContainer[];
  images: DockerImage[];
  volumes: DockerVolume[];
  networks: DockerNetwork[];
};

const dockerActions = new Set(['start', 'stop', 'restart', 'pause', 'unpause', 'kill']);

const dockerCache: {
  ts: number;
  value: DockerSnapshot | null;
  inflight: Promise<DockerSnapshot> | null;
} = {
  ts: 0,
  value: null,
  inflight: null,
};

function parseJsonLines<T>(input: string): T[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as T];
      } catch {
        return [];
      }
    });
}

function parsePercent(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.trim().match(/-?\d+(\.\d+)?/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBytes(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.trim().match(/^([\d.]+)\s*([kmgpt]?i?b)$/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  const unit = match[2].toLowerCase();
  const base = unit.includes('ib') ? 1024 : 1000;
  const exponent = (() => {
    if (unit.startsWith('k')) return 1;
    if (unit.startsWith('m')) return 2;
    if (unit.startsWith('g')) return 3;
    if (unit.startsWith('t')) return 4;
    if (unit.startsWith('p')) return 5;
    return 0;
  })();
  return Math.round(amount * Math.pow(base, exponent));
}

function parseMemoryUsage(value: string | undefined): {
  usedBytes?: number;
  limitBytes?: number;
} {
  if (!value) return {};
  const [usedRaw, limitRaw] = value.split('/').map((part) => part.trim());
  return {
    usedBytes: parseBytes(usedRaw),
    limitBytes: parseBytes(limitRaw),
  };
}

async function runDockerJson<T>(args: string[], timeout = 8000): Promise<T[]> {
  const { stdout } = await execFileAsync('docker', args, { timeout });
  return parseJsonLines<T>(stdout);
}

function toDockerError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
    return 'docker not installed';
  }
  if (err instanceof Error && err.message) return err.message;
  return 'docker unavailable';
}

export async function runDockerContainerAction(containerId: string, action: string): Promise<void> {
  if (!dockerActions.has(action)) {
    throw new Error('invalid action');
  }
  await execFileAsync('docker', [action, containerId], { timeout: 15000 });
}

async function buildDockerSnapshot(): Promise<DockerSnapshot> {
  let containers: DockerContainer[] = [];
  let images: DockerImage[] = [];
  let volumes: DockerVolume[] = [];
  let networks: DockerNetwork[] = [];

  try {
    const [ps, stats, imageRows, volumeRows, networkRows] = await Promise.allSettled([
      runDockerJson<any>(['ps', '-a', '--no-trunc', '--format', '{{json .}}']),
      runDockerJson<any>(['stats', '--no-stream', '--no-trunc', '--format', '{{json .}}']),
      runDockerJson<any>(['images', '--no-trunc', '--format', '{{json .}}']),
      runDockerJson<any>(['volume', 'ls', '--format', '{{json .}}']),
      runDockerJson<any>(['network', 'ls', '--format', '{{json .}}']),
    ]);

    if (ps.status === 'rejected') {
      return { available: false, error: toDockerError(ps.reason), containers: [], images: [], volumes: [], networks: [] };
    }

    const statsMap = new Map<string, any>();
    if (stats.status === 'fulfilled') {
      for (const row of stats.value) {
        if (row?.ID) statsMap.set(row.ID, row);
        if (row?.Name) statsMap.set(row.Name, row);
      }
    }

    containers = ps.value.map((row: any) => {
      const statsRow = statsMap.get(row.ID) || statsMap.get(row.Names);
      const memUsage = statsRow?.MemUsage as string | undefined;
      const memParsed = parseMemoryUsage(memUsage);
      return {
        id: row.ID,
        name: row.Names,
        image: row.Image,
        status: row.Status,
        state: row.State,
        ports: row.Ports,
        createdAt: row.CreatedAt,
        runningFor: row.RunningFor,
        cpuPercent: parsePercent(statsRow?.CPUPerc),
        memoryPercent: parsePercent(statsRow?.MemPerc),
        memoryUsage: memUsage,
        memoryUsedBytes: memParsed.usedBytes,
        memoryLimitBytes: memParsed.limitBytes,
        netIO: statsRow?.NetIO,
        blockIO: statsRow?.BlockIO,
        pids: statsRow?.PIDs ? Number(statsRow.PIDs) : undefined,
      };
    });

    if (imageRows.status === 'fulfilled') {
      images = imageRows.value.map((row: any) => ({
        id: row.ID,
        repository: row.Repository,
        tag: row.Tag,
        size: row.Size,
        createdAt: row.CreatedAt,
        createdSince: row.CreatedSince,
      }));
    }

    if (volumeRows.status === 'fulfilled') {
      volumes = volumeRows.value.map((row: any) => ({
        name: row.Name,
        driver: row.Driver,
        scope: row.Scope,
      }));
    }

    if (networkRows.status === 'fulfilled') {
      networks = networkRows.value.map((row: any) => ({
        id: row.ID,
        name: row.Name,
        driver: row.Driver,
        scope: row.Scope,
      }));
    }
  } catch (err) {
    return { available: false, error: toDockerError(err), containers: [], images: [], volumes: [], networks: [] };
  }

  return { available: true, containers, images, volumes, networks };
}

export async function getDockerSnapshot(): Promise<DockerSnapshot> {
  const now = Date.now();
  if (dockerCache.value && now - dockerCache.ts < 5000) {
    return dockerCache.value;
  }
  if (dockerCache.inflight) {
    return dockerCache.value || dockerCache.inflight;
  }
  dockerCache.inflight = buildDockerSnapshot()
    .then((value) => {
      dockerCache.value = value;
      dockerCache.ts = Date.now();
      return value;
    })
    .catch((err) => {
      const fallback =
        dockerCache.value || { available: false, error: toDockerError(err), containers: [], images: [], volumes: [], networks: [] };
      dockerCache.value = fallback;
      dockerCache.ts = Date.now();
      return fallback;
    })
    .finally(() => {
      dockerCache.inflight = null;
    });
  return dockerCache.inflight;
}

