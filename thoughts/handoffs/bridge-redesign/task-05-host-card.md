# Task 5: Redesign Host Cards

## Status: complete

## Changes Made

### components/HostCard.tsx
Completely redesigned the HostCard component with:

**New Props Interface:**
```typescript
type HostCardProps = {
  host: Host;
  status: 'online' | 'offline' | 'checking';
  sessionCount: number;
  containerCount?: number;
  metrics?: { cpu?: number; ram?: number };
  onPress: () => void;
  onTerminal: () => void;
  onDocker: () => void;
};
```

**Features:**
- Uses GlassCard as base component
- Header row with host color dot, name/hostname, and status badge
- Status badge with appropriate colors:
  - Online: green (accent/mint)
  - Offline: red (clay/blush)
  - Checking: orange (gold/surfaceAlt)
- Stats row showing session count, optional container count, and optional CPU/RAM metrics
- Inline action buttons:
  - [Terminal] button - mint background, accent text
  - [Docker] button - surfaceAlt background, blue text
- Buttons are disabled when host is offline
- Card tap navigates to host detail

**Icons:**
- Terminal: lucide-react-native Terminal icon
- Docker: lucide-react-native Box icon (Container icon doesn't exist in lucide)

### app/(tabs)/hosts.tsx
Refactored to use the new HostCard component:
- Added docker data fetching via `useHostsLive` with `docker: true`
- Added `containerCounts` memo for docker container counts
- Added `handleTerminal` and `handleDocker` callbacks
- Replaced inline card JSX with HostCard component
- Removed unused styles (hostCard, hostRow, hostDot, etc.)

### app/hosts/index.tsx
Updated to use the new HostCard component:
- Added docker data fetching
- Added session/container count memos
- Added terminal/docker action handlers
- Fixed type compatibility issue with HostStatus (created local CardStatus type)

## Implementation Notes

### Status Type Handling
The `HostStatus` type from `lib/types.ts` includes 'unknown' which isn't valid for the card.
Created a local `CardStatus` type that maps:
- 'online' -> 'online'
- 'offline' -> 'offline'
- anything else -> 'checking'

### Color Strategy
Used the existing palette colors for status instead of systemColors (PlatformColor) because:
- PlatformColor returns symbols, can't concatenate with strings for opacity
- Palette provides consistent fallback colors that work on both iOS and Android

### Navigation Actions
- `onTerminal`: Navigates to `/hosts/${hostId}` (host detail with sessions)
- `onDocker`: Navigates to `/hosts/${hostId}/docker` (docker management for host)
- `onPress`: Navigates to `/hosts/${hostId}` (same as terminal for now)

## Files Changed
- `/home/gabrielolv/Documents/Projects/ter/components/HostCard.tsx` - Redesigned component
- `/home/gabrielolv/Documents/Projects/ter/app/(tabs)/hosts.tsx` - Use new HostCard
- `/home/gabrielolv/Documents/Projects/ter/app/hosts/index.tsx` - Use new HostCard

## TypeScript Validation
All changes pass `npx tsc --noEmit` with no errors.

## Next Steps
Consider adding:
- Host metrics (CPU/RAM) from hostInfo when available
- Animated status indicator for 'checking' state
- Long-press context menu for additional actions
