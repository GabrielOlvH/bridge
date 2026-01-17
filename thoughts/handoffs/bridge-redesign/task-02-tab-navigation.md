# Task 2: Tab-Based Navigation

## Status: PENDING CLEANUP

## Changes Made

### Created Files

**app/(tabs)/_layout.tsx**
Tab layout using Expo Router NativeTabs with 4 tabs:
- Sessions (index) - terminal icon
- Hosts - server.rack icon
- Docker - shippingbox icon
- More - ellipsis icon

Uses SF Symbols for iOS with automatic theming.

**app/(tabs)/index.tsx**
Sessions tab showing all sessions across hosts, grouped by host.
- Copied core session listing logic from old app/index.tsx
- Removed hero section with greeting (NativeTabs provides header)
- Kept LaunchSheet FAB for creating new sessions
- Pull-to-refresh support
- Long press to kill sessions

**app/(tabs)/hosts.tsx**
Hosts tab with host list:
- Shows host name, URL, status (online/offline/checking)
- Session count per host
- Color-coded status badges
- Add host button
- Tap to navigate to /hosts/[id]

**app/(tabs)/docker.tsx**
Placeholder Docker tab:
- Simple "Coming soon" message
- Will be fully implemented in Task 3

**app/(tabs)/more.tsx**
More tab with grouped menu:
- Projects link
- Ports link
- Keybinds link
- Settings link (placeholder)

### Modified Files

**app/_layout.tsx**
Updated Stack to include:
- `(tabs)` as the root route
- All other screens as stack screens for navigation from tabs

## Pending Action

**DELETE these files to complete the migration:**

1. **app/index.tsx** - Old home screen, replaced by `app/(tabs)/index.tsx`
2. **app/hosts/index.tsx** - Old hosts list screen, replaced by `app/(tabs)/hosts.tsx`

These need to be removed to avoid Expo Router conflicts. The new (tabs) structure handles the root `/` and hosts list routes.

## Implementation Notes

### NativeTabs Import
The correct import path is `expo-router/unstable-native-tabs` (not `expo-router/native-tabs`).

### SF Symbols Used
- terminal / terminal.fill - Sessions
- server.rack - Hosts (no fill variant)
- shippingbox / shippingbox.fill - Docker
- ellipsis - More (no fill variant)

### Backwards Compatibility
- All existing routes continue to work
- hosts/[id], projects, ports, keybinds accessible from tabs
- Terminal sessions navigate via stack push

## Testing

1. App should show 4-tab navigation at bottom
2. Sessions tab shows all sessions grouped by host
3. Hosts tab shows host list with status
4. Docker tab shows placeholder
5. More tab links to Projects, Ports, Keybinds
6. Navigation from tabs to detail screens works

## Next Task
Task 3: Docker Tab Implementation
