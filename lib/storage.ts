import AsyncStorage from '@react-native-async-storage/async-storage';
import { Host, Keybind } from '@/lib/types';

const HOSTS_KEY = 'tmux.hosts.v1';
const KEYBINDS_KEY = 'tmux.keybinds.v1';

export async function loadHosts(): Promise<Host[]> {
  const raw = await AsyncStorage.getItem(HOSTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Host[];
  } catch {
    return [];
  }
}

export async function saveHosts(hosts: Host[]): Promise<void> {
  await AsyncStorage.setItem(HOSTS_KEY, JSON.stringify(hosts));
}

export async function loadKeybinds(): Promise<Keybind[]> {
  const raw = await AsyncStorage.getItem(KEYBINDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Keybind[];
  } catch {
    return [];
  }
}

export async function saveKeybinds(keybinds: Keybind[]): Promise<void> {
  await AsyncStorage.setItem(KEYBINDS_KEY, JSON.stringify(keybinds));
}
