# Plan: Local Notifications for Agent State Changes

## Goal
Add local notifications that fire when a Claude/Codex agent transitions from `running` to `idle` (finished working and waiting for input). This provides awareness of agent status without keeping the app in foreground.

## Technical Choices
- **expo-notifications**: Official Expo library, works in Expo Go for local notifications
- **State tracking via useRef**: Compare previous vs current agentState on each poll
- **Per-session tracking**: Notify for each session independently, not just global state
- **Foreground + background support**: Local notifications work while app is active or recently backgrounded

## Current State Analysis

### Agent State Flow
1. Backend (`agent/agents.ts:139-155`) detects state via terminal output hash comparison
2. Frontend polls every 15s (`app/index.tsx:72`)
3. State returned in `session.insights.meta.agentState`
4. Current values: `'running' | 'idle' | 'stopped'`

### Key Files
- `app/index.tsx` - Home screen with session polling (15s interval)
- `lib/types.ts:89-97` - InsightsMeta type with agentState
- `app.json` - App configuration (needs notification plugin)

### No Existing Notification Infrastructure
- Only `expo-haptics` installed for vibration
- No notification permissions or handlers

## Tasks

### Task 1: Install Dependencies
Install expo-notifications and expo-device packages.

- [ ] Run `npx expo install expo-notifications expo-device`
- [ ] Verify packages added to package.json

**Files to modify:**
- `package.json` (auto-updated by expo install)

### Task 2: Configure App for Notifications
Add notification plugin and Android settings to app.json.

- [ ] Add `expo-notifications` to plugins array
- [ ] Configure Android notification icon and color
- [ ] Add iOS notification settings

**Files to modify:**
- `app.json`

**Config to add:**
```json
{
  "plugins": [
    "expo-router",
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#1a1a2e"
      }
    ]
  ]
}
```

### Task 3: Create Notification Utility Module
Create a utility module for notification setup, permissions, and triggering.

- [ ] Create `lib/notifications.ts`
- [ ] Add permission request function
- [ ] Add notification scheduling function
- [ ] Add notification channel setup for Android
- [ ] Export typed interfaces

**Files to create:**
- `lib/notifications.ts`

**API design:**
```typescript
// lib/notifications.ts
export async function setupNotifications(): Promise<boolean>
export async function notifyAgentStateChange(
  sessionName: string,
  agentType: 'claude' | 'codex',
  newState: 'idle' | 'stopped'
): Promise<void>
```

### Task 4: Add State Change Detection Hook
Create a custom hook that tracks previous agent states and detects transitions.

- [ ] Create `hooks/useAgentStateNotifications.ts`
- [ ] Track previous states per session using useRef
- [ ] Compare on each poll cycle
- [ ] Trigger notification on `running → idle` transition
- [ ] Handle multiple sessions independently

**Files to create:**
- `hooks/useAgentStateNotifications.ts`

**Hook signature:**
```typescript
export function useAgentStateNotifications(
  sessions: SessionWithHost[]
): void
```

### Task 5: Integrate into Home Screen
Wire up the notification system in the home screen.

- [ ] Import and call `setupNotifications()` on mount
- [ ] Pass sessions to `useAgentStateNotifications` hook
- [ ] Handle permission denial gracefully (no error, just skip)

**Files to modify:**
- `app/index.tsx`

**Integration point (after line 38):**
```typescript
// Request notification permissions on mount
useEffect(() => {
  setupNotifications();
}, []);

// Track state changes and notify
useAgentStateNotifications(sessions);
```

### Task 6: Add Notification Icon Asset
Create a simple notification icon for Android.

- [ ] Create or copy `assets/images/notification-icon.png`
- [ ] Must be 96x96 pixels, white on transparent
- [ ] Can reuse existing icon with modifications

**Files to create:**
- `assets/images/notification-icon.png`

## Success Criteria

### Automated Verification
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] App builds: `npx expo start` launches without errors
- [ ] Lint passes: `pnpm lint`

### Manual Verification
- [ ] Permission prompt appears on first launch
- [ ] Notification fires when agent transitions running → idle
- [ ] Notification shows session name and agent type
- [ ] Tapping notification opens app (default behavior)
- [ ] Multiple sessions notify independently
- [ ] No notification spam (only on actual transitions)

## Out of Scope
- Push notifications (requires dev account + server changes)
- Dynamic Island / Live Activities (requires native Swift)
- Background polling when app is suspended
- Notification settings UI
- Custom notification sounds
- Notification for `idle → running` (user initiated, no need)

## Risks (Pre-Mortem)

### Tigers
- **Expo Go limitations** (MEDIUM): Local notifications should work in Expo Go, but test thoroughly
  - Mitigation: Test on physical device before merging
- **Permission denial** (LOW): User may deny notifications
  - Mitigation: Graceful degradation, haptics still work

### Elephants
- **Background execution limits** (MEDIUM): iOS suspends apps aggressively, polling stops
  - Note: This is expected - local notifications only work while app is active/recent
