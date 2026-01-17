import { DockerSnapshot, Host, HostInfo, HostStatus, Session } from '@/lib/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type LiveOptions = {
  sessions?: boolean;
  preview?: boolean;
  previewLines?: number;
  insights?: boolean;
  host?: boolean;
  docker?: boolean;
  intervalMs?: number;
};

type HostLiveState = {
  status: HostStatus;
  sessions: Session[];
  hostInfo?: HostInfo;
  docker?: DockerSnapshot;
  error?: string;
  lastUpdate?: number;
};

type LiveSnapshotMessage = {
  type: 'snapshot';
  ts?: number;
  sessions?: Session[];
  host?: HostInfo;
  docker?: DockerSnapshot;
};

type LiveErrorMessage = {
  type: 'error';
  message?: string;
};

type ConnectionEntry = {
  socket: WebSocket;
  optionsKey: string;
  reconnects: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
};

function buildEventsUrl(host: Host, options: LiveOptions): string {
  try {
    const base = new URL(host.baseUrl);
    const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    const params = new URLSearchParams();
    if (options.sessions) params.set('sessions', '1');
    if (options.preview) params.set('preview', '1');
    if (options.previewLines) params.set('previewLines', String(options.previewLines));
    if (options.insights) params.set('insights', '1');
    if (options.host) params.set('host', '1');
    if (options.docker) params.set('docker', '1');
    if (options.intervalMs) params.set('interval', String(options.intervalMs));
    if (host.authToken) params.set('token', host.authToken);
    const query = params.toString();
    return `${protocol}//${base.host}/events${query ? `?${query}` : ''}`;
  } catch {
    return '';
  }
}

function buildOptionsKey(options: LiveOptions): string {
  return [
    options.sessions ? 's1' : 's0',
    options.preview ? 'p1' : 'p0',
    options.previewLines ? `l${options.previewLines}` : 'l0',
    options.insights ? 'i1' : 'i0',
    options.host ? 'h1' : 'h0',
    options.docker ? 'd1' : 'd0',
    options.intervalMs ? `t${options.intervalMs}` : 't0',
  ].join('|');
}

export function useHostsLive(hosts: Host[], options: LiveOptions) {
  const [stateMap, setStateMap] = useState<Record<string, HostLiveState>>({});
  const connectionsRef = useRef<Map<string, ConnectionEntry>>(new Map());
  const mountedRef = useRef(true);
  const optionsRef = useRef(options);
  const optionsKey = useMemo(
    () => buildOptionsKey(options),
    [
      options.sessions,
      options.preview,
      options.previewLines,
      options.insights,
      options.host,
      options.docker,
      options.intervalMs,
    ]
  );

  useEffect(() => {
    optionsRef.current = options;
  }, [optionsKey]);

  const updateState = useCallback((hostId: string, updater: (prev: HostLiveState) => HostLiveState) => {
    if (!mountedRef.current) return;
    setStateMap((prev) => {
      const current = prev[hostId] || { status: 'checking', sessions: [] };
      const nextState = updater(current);
      return { ...prev, [hostId]: nextState };
    });
  }, []);

  const connectHost = useCallback(
    (host: Host) => {
      const url = buildEventsUrl(host, optionsRef.current);
      if (!url) {
        updateState(host.id, (prev) => ({ ...prev, status: 'offline', error: 'Invalid URL' }));
        return;
      }

      updateState(host.id, (prev) => ({ ...prev, status: 'checking', error: undefined }));

      const socket = new WebSocket(url);
      const entry: ConnectionEntry = {
        socket,
        optionsKey,
        reconnects: 0,
        reconnectTimer: null,
      };
      connectionsRef.current.set(host.id, entry);

      socket.onmessage = (event) => {
        let payload: LiveSnapshotMessage | LiveErrorMessage | null = null;
        try {
          payload = JSON.parse(String(event.data));
        } catch {
          return;
        }
        if (!payload) return;
        if (payload.type === 'snapshot') {
          updateState(host.id, (prev) => ({
            ...prev,
            status: 'online',
            sessions: payload.sessions ?? prev.sessions,
            hostInfo: payload.host ?? prev.hostInfo,
            docker: payload.docker ?? prev.docker,
            lastUpdate: payload.ts || Date.now(),
            error: undefined,
          }));
        } else if (payload.type === 'error') {
          updateState(host.id, (prev) => ({
            ...prev,
            status: prev.status === 'online' ? 'online' : 'offline',
            error: payload.message || 'Live feed error',
          }));
        }
      };

      socket.onclose = () => {
        updateState(host.id, (prev) => ({ ...prev, status: 'offline' }));
        const current = connectionsRef.current.get(host.id);
        if (!current || current.socket !== socket) return;
        const delay = Math.min(10000, 1000 * Math.pow(2, current.reconnects));
        current.reconnects += 1;
        current.reconnectTimer = setTimeout(() => {
          if (!mountedRef.current) return;
          const latest = connectionsRef.current.get(host.id);
          if (!latest || latest !== current) return;
          connectHost(host);
        }, delay);
      };

      socket.onerror = () => {
        updateState(host.id, (prev) => ({ ...prev, status: 'offline' }));
      };
    },
    [optionsKey, updateState]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const entry of connectionsRef.current.values()) {
        if (entry.reconnectTimer) clearTimeout(entry.reconnectTimer);
        entry.socket.close();
      }
      connectionsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const hostIds = new Set(hosts.map((host) => host.id));
    setStateMap((prev) => {
      const keysToRemove = Object.keys(prev).filter((id) => !hostIds.has(id));
      if (keysToRemove.length === 0) return prev;
      const next = { ...prev };
      for (const id of keysToRemove) {
        delete next[id];
      }
      return next;
    });

    for (const [id, entry] of connectionsRef.current.entries()) {
      if (!hostIds.has(id) || entry.optionsKey !== optionsKey) {
        if (entry.reconnectTimer) clearTimeout(entry.reconnectTimer);
        entry.socket.close();
        connectionsRef.current.delete(id);
      }
    }

    hosts.forEach((host) => {
      if (!connectionsRef.current.has(host.id)) {
        connectHost(host);
      }
    });
  }, [hosts, optionsKey, connectHost]);

  const refreshHost = useCallback((hostId: string) => {
    const entry = connectionsRef.current.get(hostId);
    if (!entry || entry.socket.readyState !== WebSocket.OPEN) return;
    entry.socket.send(JSON.stringify({ type: 'refresh' }));
  }, []);

  const refreshAll = useCallback(() => {
    for (const [hostId] of connectionsRef.current.entries()) {
      refreshHost(hostId);
    }
  }, [refreshHost]);

  return { stateMap, refreshAll, refreshHost };
}

export function useHostLive(host: Host | undefined, options: LiveOptions) {
  const hosts = useMemo(() => (host ? [host] : []), [host]);
  const { stateMap, refreshAll, refreshHost } = useHostsLive(hosts, options);
  const state = host ? stateMap[host.id] : undefined;
  const refresh = useCallback(() => {
    if (host) refreshHost(host.id);
  }, [host, refreshHost]);
  return { state, refresh, refreshAll };
}

