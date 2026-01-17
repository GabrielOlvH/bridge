import { Host, Keybind } from '@/lib/types';
import { hostAccents } from '@/lib/theme';

export function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function pickHostAccent(hosts: Host[]): string {
  const used = new Set(hosts.map((host) => host.color).filter(Boolean));
  const available = hostAccents.find((color) => !used.has(color));
  return available ?? hostAccents[hosts.length % hostAccents.length];
}

export function defaultKeybinds(): Keybind[] {
  return [
    { id: createId('kb'), label: 'Prefix', keys: ['C-b'], color: '#2F6F66' },
    { id: createId('kb'), label: 'New Window', keys: ['C-b', 'c'], color: '#4F6FA9' },
    { id: createId('kb'), label: 'Split Vert', keys: ['C-b', '"'], color: '#C75B39' },
    { id: createId('kb'), label: 'Split Horiz', keys: ['C-b', '%'], color: '#D0A03A' },
    { id: createId('kb'), label: 'Next Window', keys: ['C-b', 'n'], color: '#2F6F66' },
    { id: createId('kb'), label: 'Prev Window', keys: ['C-b', 'p'], color: '#4F6FA9' },
    { id: createId('kb'), label: 'Detach', keys: ['C-b', 'd'], color: '#C75B39' },
  ];
}
