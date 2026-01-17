import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Host, HostDraft, Keybind } from '@/lib/types';
import { loadHosts, loadKeybinds, saveHosts, saveKeybinds } from '@/lib/storage';
import { createId, defaultKeybinds, pickHostAccent } from '@/lib/defaults';

const StoreContext = createContext<{
  hosts: Host[];
  keybinds: Keybind[];
  ready: boolean;
  upsertHost: (host: HostDraft, id?: string) => Promise<Host>;
  removeHost: (id: string) => Promise<void>;
  updateHostLastSeen: (id: string, timestamp: number) => void;
  addKeybind: (label: string, keys: string[]) => Promise<void>;
  updateKeybind: (id: string, updates: Partial<Keybind>) => Promise<void>;
  removeKeybind: (id: string) => Promise<void>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [keybinds, setKeybinds] = useState<Keybind[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [storedHosts, storedKeybinds] = await Promise.all([loadHosts(), loadKeybinds()]);
      if (!mounted) return;
      setHosts(storedHosts);
      if (storedKeybinds.length === 0) {
        const defaults = defaultKeybinds();
        setKeybinds(defaults);
        await saveKeybinds(defaults);
      } else {
        setKeybinds(storedKeybinds);
      }
      setReady(true);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistHosts = useCallback(async (nextHosts: Host[]) => {
    setHosts(nextHosts);
    await saveHosts(nextHosts);
  }, []);

  const persistKeybinds = useCallback(async (nextKeybinds: Keybind[]) => {
    setKeybinds(nextKeybinds);
    await saveKeybinds(nextKeybinds);
  }, []);

  const upsertHost = useCallback(
    async (draft: HostDraft, id?: string) => {
      const nextId = id ?? createId('host');
      const nextHosts = [...hosts];
      const index = nextHosts.findIndex((host) => host.id === nextId);
      const color = draft.color ?? (index >= 0 ? nextHosts[index]?.color : pickHostAccent(nextHosts));
      const host: Host = {
        ...draft,
        id: nextId,
        color,
      };

      if (index >= 0) {
        nextHosts[index] = host;
      } else {
        nextHosts.push(host);
      }

      await persistHosts(nextHosts);
      return host;
    },
    [hosts, persistHosts]
  );

  const removeHost = useCallback(
    async (id: string) => {
      const nextHosts = hosts.filter((host) => host.id !== id);
      await persistHosts(nextHosts);
    },
    [hosts, persistHosts]
  );

  const updateHostLastSeen = useCallback((id: string, timestamp: number) => {
    setHosts((prev) => {
      const next = prev.map((host) => (host.id === id ? { ...host, lastSeen: timestamp } : host));
      saveHosts(next);
      return next;
    });
  }, []);

  const addKeybind = useCallback(
    async (label: string, keys: string[]) => {
      const nextKeybinds = [...keybinds, { id: createId('kb'), label, keys }];
      await persistKeybinds(nextKeybinds);
    },
    [keybinds, persistKeybinds]
  );

  const updateKeybind = useCallback(
    async (id: string, updates: Partial<Keybind>) => {
      const nextKeybinds = keybinds.map((keybind) =>
        keybind.id === id ? { ...keybind, ...updates } : keybind
      );
      await persistKeybinds(nextKeybinds);
    },
    [keybinds, persistKeybinds]
  );

  const removeKeybind = useCallback(
    async (id: string) => {
      const nextKeybinds = keybinds.filter((keybind) => keybind.id !== id);
      await persistKeybinds(nextKeybinds);
    },
    [keybinds, persistKeybinds]
  );

  const value = useMemo(
    () => ({
      hosts,
      keybinds,
      ready,
      upsertHost,
      removeHost,
      updateHostLastSeen,
      addKeybind,
      updateKeybind,
      removeKeybind,
    }),
    [
      hosts,
      keybinds,
      ready,
      upsertHost,
      removeHost,
      updateHostLastSeen,
      addKeybind,
      updateKeybind,
      removeKeybind,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
