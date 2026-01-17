# Task 3: Unified Docker View

## Status: COMPLETE

## Changes Made

### Created Files

**lib/docker-hooks.ts**
Custom hook to aggregate Docker data from all hosts:
- `useAllDocker()` - Main hook returning containers, running/stopped counts, refresh functions
- `ContainerWithHost` - Type extending DockerContainer with host info
- `isContainerRunning()` - Helper to check container state
- `formatBytes()` - Utility for memory display

Features:
- Aggregates containers from all connected hosts
- Tracks loading state across hosts
- Detects if any host has Docker available
- Provides per-host and global refresh functions

### Modified Files

**app/(tabs)/docker.tsx**
Full Docker tab implementation replacing placeholder.

Features implemented:
1. **Summary bar** - Shows running/stopped/host counts at top
2. **Host filter chips** - Horizontal scrolling filter chips when multiple hosts have containers
   - "All Hosts" chip plus one chip per host with containers
   - Shows container count per host
   - Tap to filter, tap again to clear filter
3. **Container cards** - GlassCard for each container showing:
   - Status dot (green glowing for running, gray for stopped)
   - Container name
   - Host badge with host color
   - State/status text
   - CPU percentage (if available)
   - Memory usage (if available)
   - Port mappings (if available)
4. **Inline action buttons**:
   - Terminal button - navigates to container detail
   - Start/Stop button - confirms via Alert, shows loading spinner
5. **Pull to refresh** - RefreshControl with accent color
6. **Empty states**:
   - No hosts configured → prompt to add host
   - Loading → centered spinner
   - No Docker available → message with refresh button
   - Filtered with no results → "Show all" link

### Styling

- Uses existing GlassCard, FadeIn, SectionHeader components
- Status colors from palette (accent for running, muted for stopped)
- Host colors match existing host accent system
- Action buttons use mint (start/terminal) and blush (stop) backgrounds
- Consistent with hosts tab and sessions tab design patterns

## Dependencies Used

- lucide-react-native: Play, Square, Terminal icons
- expo-router: navigation
- Existing lib/api.ts: dockerContainerAction
- Existing lib/live.tsx: useHostsLive
- Existing lib/store.tsx: useStore
- Existing lib/types.ts: DockerContainer, Host types

## Navigation

- Tap container card → `/hosts/${hostId}/docker/${containerId}`
- Terminal button → same route
- Add host button → `/hosts/new`

## Type Safety

- Full TypeScript with no errors
- Proper types for ContainerWithHost extending DockerContainer
- Type-safe host filtering

## Testing Notes

1. App should show Docker tab in bottom navigation
2. With no hosts: shows "Add Host" prompt
3. With hosts but no Docker: shows "No Docker available"
4. With containers: shows summary + grouped containers
5. Multiple hosts: shows filter chips
6. Start/Stop actions show confirmation alert
7. Pull down triggers refresh
8. Container tap navigates to detail view

## Next Task

Task 4: Session Quick Actions (swipe actions or long-press menu for sessions)
