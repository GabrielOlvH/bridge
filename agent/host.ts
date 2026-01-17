import os from 'node:os';

type CpuTotals = {
  idle: number;
  total: number;
};

let lastCpuTotals: CpuTotals | null = null;

function readCpuTotals(): CpuTotals {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle;
  }
  return { idle, total };
}

export type HostInfo = {
  hostname: string;
  platform: string;
  release: string;
  arch: string;
  uptime: number;
  load: number[];
  cpu: {
    model?: string;
    cores: number;
    usage?: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usedPercent: number;
  };
};

export function getHostInfo(): HostInfo {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = Math.max(0, totalMem - freeMem);
  const usedPercent = totalMem > 0 ? Math.round((usedMem / totalMem) * 1000) / 10 : 0;

  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model?.trim();
  const cores = cpus.length;
  const totals = readCpuTotals();

  let usage: number | undefined;
  if (lastCpuTotals) {
    const idleDelta = totals.idle - lastCpuTotals.idle;
    const totalDelta = totals.total - lastCpuTotals.total;
    if (totalDelta > 0) {
      usage = Math.max(0, Math.min(100, Math.round((1 - idleDelta / totalDelta) * 1000) / 10));
    }
  }

  lastCpuTotals = totals;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    uptime: os.uptime(),
    load: os.loadavg(),
    cpu: {
      model: cpuModel || undefined,
      cores,
      usage,
    },
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usedPercent,
    },
  };
}

