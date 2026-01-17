import { useMemo } from 'react';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { useStore } from '@/lib/store';
import { useHostsLive } from '@/lib/live';
import { useTheme } from '@/lib/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();
  const { hosts } = useStore();
  const { stateMap } = useHostsLive(hosts, { sessions: true, docker: true });

  const sessionCount = useMemo(() => {
    return Object.values(stateMap).reduce(
      (acc, state) => acc + (state?.sessions?.length ?? 0),
      0
    );
  }, [stateMap]);

  const runningContainers = useMemo(() => {
    return Object.values(stateMap).reduce(
      (acc, state) =>
        acc + (state?.docker?.containers?.filter((c) => c.state === 'running')?.length ?? 0),
      0
    );
  }, [stateMap]);

  return (
    <NativeTabs tintColor={colors.blue} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'terminal', selected: 'terminal.fill' }} />
        <Label>Sessions</Label>
        <Badge hidden={sessionCount === 0}>{String(sessionCount)}</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="hosts">
        <Icon sf={{ default: 'server.rack', selected: 'server.rack' }} />
        <Label>Hosts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="docker">
        <Icon sf={{ default: 'shippingbox', selected: 'shippingbox.fill' }} />
        <Label>Docker</Label>
        <Badge hidden={runningContainers === 0}>{String(runningContainers)}</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <Icon sf={{ default: 'ellipsis', selected: 'ellipsis' }} />
        <Label>More</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
