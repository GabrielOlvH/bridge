import { useMemo } from 'react';
import { useStore } from './store';
import { useHostsLive } from './live';
import { DockerContainer, Host, HostStatus } from './types';

export type ContainerWithHost = DockerContainer & {
  host: Host;
  hostStatus: HostStatus;
};

export type UseAllDockerResult = {
  containers: ContainerWithHost[];
  running: ContainerWithHost[];
  stopped: ContainerWithHost[];
  refreshAll: () => void;
  refreshHost: (hostId: string) => void;
  hosts: Host[];
  isLoading: boolean;
  hasDocker: boolean;
};

export function useAllDocker(options?: { enabled?: boolean }): UseAllDockerResult {
  const { hosts } = useStore();
  const { stateMap, refreshAll, refreshHost } = useHostsLive(hosts, { docker: true, enabled: options?.enabled });

  const containers = useMemo(() => {
    const all: ContainerWithHost[] = [];
    hosts.forEach((host) => {
      const hostState = stateMap[host.id];
      const hostStatus = hostState?.status ?? 'checking';
      const dockerContainers = hostState?.docker?.containers ?? [];
      dockerContainers.forEach((container) => {
        all.push({ ...container, host, hostStatus });
      });
    });
    return all;
  }, [hosts, stateMap]);

  const running = useMemo(
    () => containers.filter((c) => isContainerRunning(c)),
    [containers]
  );

  const stopped = useMemo(
    () => containers.filter((c) => !isContainerRunning(c)),
    [containers]
  );

  const isLoading = useMemo(() => {
    if (hosts.length === 0) return false;
    return hosts.every((host) => {
      const state = stateMap[host.id];
      return !state || state.status === 'checking';
    });
  }, [hosts, stateMap]);

  const hasDocker = useMemo(() => {
    return hosts.some((host) => {
      const state = stateMap[host.id];
      return state?.docker?.available === true;
    });
  }, [hosts, stateMap]);

  return {
    containers,
    running,
    stopped,
    refreshAll,
    refreshHost,
    hosts,
    isLoading,
    hasDocker,
  };
}

export function isContainerRunning(container: DockerContainer): boolean {
  if (container.state) return container.state.toLowerCase() === 'running';
  if (container.status) return container.status.toLowerCase().startsWith('up');
  return false;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}
