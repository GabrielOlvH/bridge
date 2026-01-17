# Task 07: Native Tabs with Liquid Glass

## Status: COMPLETED

## Summary

Enhanced the tabs layout with proper NativeTabs configuration for liquid glass on iOS 26+.

## Changes Made

### `/home/gabrielolv/Documents/Projects/ter/app/(tabs)/_layout.tsx`

Updated to include:

1. **tintColor** - Set to `#00d9ff` for active tab indicator
2. **minimizeBehavior** - Set to `onScrollDown` for iOS 26+ liquid glass tab bar minimization
3. **Badge components** - Added dynamic badges for:
   - Sessions tab: Shows total session count across all hosts
   - Docker tab: Shows count of running containers across all hosts
4. **Store/Live integration** - Imports `useStore` and `useHostsLive` to get real-time data

## Implementation Details

```tsx
import { useMemo } from 'react';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { useStore } from '@/lib/store';
import { useHostsLive } from '@/lib/live';

export default function TabLayout() {
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
    <NativeTabs tintColor="#00d9ff" minimizeBehavior="onScrollDown">
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
```

## Key Features

### iOS 26+ Liquid Glass Support
- `minimizeBehavior="onScrollDown"` enables the tab bar to minimize when scrolling down and expand when scrolling back up
- This leverages the new liquid glass design language in iOS 26

### Dynamic Badges
- Badges are hidden when count is 0 using the `hidden` prop
- Badge children must be strings, so counts are converted with `String()`
- Real-time updates via WebSocket connections through `useHostsLive`

### SF Symbols
- Using proper SF Symbol names with default/selected states
- `terminal`/`terminal.fill` for Sessions
- `server.rack` (no fill variant) for Hosts
- `shippingbox`/`shippingbox.fill` for Docker
- `ellipsis` (no fill variant) for More

## Verification

- Bundle compiled successfully with `npx expo export --platform ios`
- No runtime errors expected as all imports and types are validated

## Dependencies

- expo-router ~6.0.21 (already installed, supports NativeTabs)
- @/lib/store - Provides hosts array
- @/lib/live - Provides useHostsLive for WebSocket state

## Notes

- The `Badge` component requires string children, not numbers
- The `hidden` prop on Badge is cleaner than conditional rendering
- `useHostsLive` accepts options object with `sessions: true, docker: true` to fetch relevant data
