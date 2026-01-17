# Plan: Bridge - Native iOS Redesign

## Goal
Transform "Terminal" into **Bridge** - a native-feeling iOS app for managing tmux sessions across remote hosts, with Docker as a secondary feature. Embrace iOS system design with liquid glass, SF Symbols, and native components.

## Design Philosophy
**"Feel like a native iOS app, not a web app in a wrapper"**

Current pain points:
- Docker requires 2-3 taps (Home → Host → Docker)
- Host detail screen is overloaded
- Custom components where native would be better
- Doesn't feel like a "real" iOS app

## Visual Identity: Native iOS

### Color Strategy: System Adaptive

Use iOS semantic colors via `PlatformColor` - they automatically adapt to light/dark mode and accessibility settings:

```typescript
import { PlatformColor } from 'react-native';

const colors = {
  // Backgrounds
  background: PlatformColor('systemBackground'),
  secondaryBackground: PlatformColor('secondarySystemBackground'),
  tertiaryBackground: PlatformColor('tertiarySystemBackground'),
  groupedBackground: PlatformColor('systemGroupedBackground'),

  // Text
  label: PlatformColor('label'),
  secondaryLabel: PlatformColor('secondaryLabel'),
  tertiaryLabel: PlatformColor('tertiaryLabel'),

  // System colors (for status/accents)
  blue: PlatformColor('systemBlue'),
  green: PlatformColor('systemGreen'),
  red: PlatformColor('systemRed'),
  orange: PlatformColor('systemOrange'),
  teal: PlatformColor('systemTeal'),

  // Separators
  separator: PlatformColor('separator'),
  opaqueSeparator: PlatformColor('opaqueSeparator'),
};
```

**Status mapping:**
- Running/Online → `systemGreen`
- Stopped/Offline → `systemRed`
- Idle/Warning → `systemOrange`
- Info/Accent → `systemBlue` or `systemTeal`

**Host identification:** Use system colors (blue, purple, pink, teal, orange, indigo) for host accents.

### Typography: System Fonts

Let iOS handle typography with system fonts:

```typescript
import { Text } from 'react-native';

// Large title (navigation)
<Text style={{ fontSize: 34, fontWeight: '700' }}>Bridge</Text>

// Headline
<Text style={{ fontSize: 17, fontWeight: '600' }}>Session Name</Text>

// Body
<Text style={{ fontSize: 17 }}>Regular text</Text>

// Caption
<Text style={{ fontSize: 12, color: PlatformColor('secondaryLabel') }}>
  Muted label
</Text>

// Monospace (for terminal/code)
<Text style={{ fontFamily: 'Menlo' }}>code here</Text>
```

### Native Components

**Use `@expo/ui/swift-ui` for:**
- Buttons (system styling, haptics)
- Lists with swipe actions
- Switches and toggles
- Context menus (long press)
- Bottom sheets

**Use native iOS patterns:**
- `NativeTabs` for tab bar (liquid glass)
- SF Symbols for all icons
- Native navigation headers
- Pull-to-refresh
- Grouped table views for settings

### Visual Elements

**Cards/Surfaces:**
- Use `systemGroupedBackground` for grouped content
- Native list rows instead of custom cards where possible
- Glass effects via `expo-glass-effect` for overlays

**Icons:**
- SF Symbols exclusively (via NativeTabs `Icon sf=`)
- For inline icons, use `expo-symbols` or icon images

**Animations:**
- Native spring animations
- System haptic feedback on actions
- Native transition animations

## Navigation Redesign

### New Structure: Bottom Tab Bar + Quick Actions

```
┌─────────────────────────────────────┐
│  Bridge                    [+] [⚙]  │  ← Minimal header
├─────────────────────────────────────┤
│                                     │
│  [Content Area - scrollable]        │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Sessions] [Hosts] [Docker] [More] │  ← Bottom tabs
└─────────────────────────────────────┘
```

### Bottom Tab Bar (4 tabs)

| Tab | Icon | Content |
|-----|------|---------|
| **Sessions** | Terminal | All active sessions across hosts (current home) |
| **Hosts** | Server | Host cards with status, quick actions |
| **Docker** | Container | All containers across all hosts |
| **More** | Menu | Projects, Ports, Settings |

**Key insight:** Docker gets its own top-level tab = 1 tap access (down from 2-3)

### Tab Details

#### 1. Sessions Tab (Default/Home)
```
┌─────────────────────────────────────┐
│  Bridge                    [+] [⚙]  │
├─────────────────────────────────────┤
│  ● KAIA  3 sessions                 │  ← Host chip (tap to filter)
│  ● Local 1 session                  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● claude-dev          ▶ ⚡  │    │  ← Session card
│  │   claude --permission-mode   │    │     ● = host color
│  │   main branch               │    │     ▶ = running state
│  └─────────────────────────────┘    │     ⚡ = quick attach
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● api-server          ▶     │    │
│  │   npm run dev               │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
│  [Sessions] [Hosts] [Docker] [More] │
└─────────────────────────────────────┘
```

- Tap session → Terminal (1 tap!)
- Long press → Options (kill, detach, rename)
- Host chips at top for quick filtering
- FAB [+] → Quick launch sheet

#### 2. Hosts Tab
```
┌─────────────────────────────────────┐
│  Hosts                      [+ Add] │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ ● KAIA              Online  │    │
│  │   3 sessions  2 containers  │    │
│  │   CPU 12%  RAM 45%          │    │
│  │   [Terminal] [Docker]       │    │  ← Inline quick actions
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ○ Backup             Offline│    │
│  │   Last seen 2h ago          │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- Each host card shows: status, session count, container count, metrics
- Inline [Terminal] button → Launch sheet for that host
- Inline [Docker] button → Docker view filtered to that host
- Tap card → Host detail (edit, remove, full metrics)

#### 3. Docker Tab
```
┌─────────────────────────────────────┐
│  Docker                   [Refresh] │
├─────────────────────────────────────┤
│  ● KAIA  ● Local                    │  ← Host filter chips
├─────────────────────────────────────┤
│  Running (3)                        │
│  ┌─────────────────────────────┐    │
│  │ postgres        ▶ Running   │    │
│  │ KAIA • 2.1% CPU • 156MB     │    │
│  │ [Terminal] [Stop]           │    │  ← Inline actions!
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ redis           ▶ Running   │    │
│  │ KAIA • 0.3% CPU • 12MB      │    │
│  │ [Terminal] [Stop]           │    │
│  └─────────────────────────────┘    │
│                                     │
│  Stopped (2)                        │
│  ┌─────────────────────────────┐    │
│  │ nginx           ○ Exited    │    │
│  │ Local                       │    │
│  │ [Start] [Remove]            │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- **1 tap to Docker** (currently 2-3)
- **1 tap to container terminal** (currently 4)
- Grouped by status (Running first)
- Host filter chips
- Inline actions: Terminal, Start/Stop

#### 4. More Tab
```
┌─────────────────────────────────────┐
│  More                               │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ 📁 Projects              4  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 🔌 Ports                 12 │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ⌨️  Keybinds                │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ⚙️  Settings                │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Quick Launch (FAB → Bottom Sheet)

Keep the excellent LaunchSheet but make it more accessible:
- FAB always visible on Sessions tab
- Can also trigger from Host card [Terminal] button
- Recent launches prominent at top

## Technical Choices (Expo Go Compatible)

- **Navigation**: expo-router NativeTabs (`app/(tabs)/`) - liquid glass on iOS 26+
- **Colors**: iOS `PlatformColor` for system-adaptive theming
- **Lists**: FlatList + `react-native-gesture-handler` Swipeable for swipe actions
- **Sheets**: `@gorhom/bottom-sheet` (already installed)
- **Glass**: `expo-glass-effect` for overlays
- **Haptics**: `expo-haptics` for feedback
- **Icons**: SF Symbols in NativeTabs, Lucide for inline (keep current)
- **Fonts**: System fonts (San Francisco) - remove custom font loading
- **Animations**: react-native-reanimated (already installed)

## Tasks

### Task 1: Create Native Theme System
Replace custom colors with iOS system colors for native feel.

- [ ] Create `lib/colors.ts` with PlatformColor mappings
- [ ] Create `hostColors` array using system colors (blue, purple, pink, teal, orange, indigo)
- [ ] Update `lib/theme.ts` to use system colors
- [ ] Remove custom palette in favor of semantic colors
- [ ] Add Android fallback colors (PlatformColor is iOS-only for some values)

**Files to create:**
- `lib/colors.ts`

**Files to modify:**
- `lib/theme.ts`

**Implementation:**
```typescript
// lib/colors.ts
import { Platform, PlatformColor } from 'react-native';

export const systemColors = Platform.select({
  ios: {
    background: PlatformColor('systemBackground'),
    secondaryBackground: PlatformColor('secondarySystemBackground'),
    groupedBackground: PlatformColor('systemGroupedBackground'),
    label: PlatformColor('label'),
    secondaryLabel: PlatformColor('secondaryLabel'),
    separator: PlatformColor('separator'),
    // Status
    green: PlatformColor('systemGreen'),
    red: PlatformColor('systemRed'),
    orange: PlatformColor('systemOrange'),
    blue: PlatformColor('systemBlue'),
    teal: PlatformColor('systemTeal'),
  },
  android: {
    // Fallback colors for Android
    background: '#FFFFFF',
    secondaryBackground: '#F2F2F7',
    // ... etc
  },
});

export const hostColors = [
  PlatformColor('systemBlue'),
  PlatformColor('systemPurple'),
  PlatformColor('systemPink'),
  PlatformColor('systemTeal'),
  PlatformColor('systemOrange'),
  PlatformColor('systemIndigo'),
];
```

### Task 2: Convert to Tab-Based Navigation
Restructure from stack to tab navigation using Expo Router NativeTabs.

- [ ] Create `app/(tabs)/_layout.tsx` with NativeTabs
- [ ] Create `app/(tabs)/index.tsx` (Sessions - moved from current index)
- [ ] Create `app/(tabs)/hosts.tsx` (Hosts list)
- [ ] Create `app/(tabs)/docker.tsx` (All Docker containers)
- [ ] Create `app/(tabs)/more.tsx` (Projects, Ports, Settings links)
- [ ] Update root `_layout.tsx` to point to tabs group
- [ ] Move existing routes under appropriate structure

**Files to create:**
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/hosts.tsx`
- `app/(tabs)/docker.tsx`
- `app/(tabs)/more.tsx`

**Files to modify:**
- `app/_layout.tsx`

### Task 3: Build Unified Docker View
New Docker tab showing all containers across all hosts.

- [ ] Create hook `useAllDocker()` that aggregates from all hosts
- [ ] Build Docker tab with host filter chips
- [ ] Group containers by status (Running, Stopped)
- [ ] Add inline actions (Terminal, Start/Stop)
- [ ] Container tap → Container detail or direct terminal

**Files to create:**
- `lib/docker-hooks.ts`

**Files to modify:**
- `app/(tabs)/docker.tsx`

### Task 4: Redesign Session Cards
Compact, action-focused session display.

- [ ] New `SessionCard` component with inline actions
- [ ] Show: name, command, git branch, state indicator
- [ ] Tap → Terminal (1 tap)
- [ ] Long press → Options menu
- [ ] Host color indicator

**Files to create:**
- `components/SessionCard.tsx`

### Task 5: Redesign Host Cards
Host cards with inline quick actions.

- [ ] New `HostCard` component
- [ ] Show: name, status, counts, metrics preview
- [ ] Inline [Terminal] and [Docker] buttons
- [ ] Tap → Host detail (edit/remove)

**Files to create:**
- `components/HostCard.tsx`

### Task 6: Update Components for Native Feel (Expo Go Compatible)
Use system colors and swipeable lists for native feel without dev build.

- [ ] Update `Screen` to use `PlatformColor('systemBackground')`
- [ ] Update `AppText` to use system fonts and `PlatformColor`
- [ ] Update `GlassCard` to use `expo-glass-effect` GlassView
- [ ] Replace `Pill` with system-colored badges
- [ ] Create `SwipeableRow` component using gesture-handler
- [ ] Add `expo-haptics` feedback on actions
- [ ] Long-press → Alert.alert() for options (Expo Go fallback for context menus)

**Files to modify:**
- `components/Screen.tsx` - system background
- `components/AppText.tsx` - system fonts/colors
- `components/GlassCard.tsx` - use GlassView
- `components/Pill.tsx` - system colors

**Files to create:**
- `components/SwipeableRow.tsx`

**Swipeable Row Example:**
```tsx
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';

function SwipeableRow({ children, onDelete, onAction }) {
  const renderRightActions = () => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete();
      }}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
}
```

**Long-press fallback (no native ContextMenu):**
```tsx
<Pressable
  onPress={() => openTerminal(session)}
  onLongPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(session.name, 'Choose action', [
      { text: 'Kill', style: 'destructive', onPress: () => killSession(session) },
      { text: 'Rename', onPress: () => renameSession(session) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }}
>
```

### Task 7: Native Tabs with Liquid Glass
Use Expo Router's built-in `NativeTabs` for automatic liquid glass on iOS 26+.

- [ ] Use `expo-router/unstable-native-tabs` in tabs layout
- [ ] Configure SF Symbols for iOS icons
- [ ] Configure Android drawables as fallback
- [ ] Set `tintColor` to accent cyan
- [ ] Add badge support for session/container counts
- [ ] Enable `minimizeBehavior="onScrollDown"` for iOS 26

**Files to modify:**
- `app/(tabs)/_layout.tsx`

**Implementation:**
```tsx
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs tintColor="#00d9ff">
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'terminal', selected: 'terminal.fill' }} />
        <Label>Sessions</Label>
        <Badge>{sessionCount > 0 ? sessionCount : undefined}</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="hosts">
        <Icon sf={{ default: 'server.rack', selected: 'server.rack' }} />
        <Label>Hosts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="docker">
        <Icon sf={{ default: 'shippingbox', selected: 'shippingbox.fill' }} />
        <Label>Docker</Label>
        <Badge>{runningContainers > 0 ? runningContainers : undefined}</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <Icon sf={{ default: 'ellipsis', selected: 'ellipsis' }} />
        <Label>More</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

**Note:** Liquid glass appears automatically on iOS 26+ when built with Xcode 26. Falls back to standard tab bar on older iOS/Android.

### Task 8: Update App Branding
Rebrand to "Bridge".

- [ ] Update `app.json` name and slug
- [ ] Update header text in screens
- [ ] Create/update app icon (dark with cyan accent)
- [ ] Update splash screen

**Files to modify:**
- `app.json`
- Various screen headers

### Task 9: Simplify Host Detail Screen
Remove redundancy now that Docker has its own tab.

- [ ] Remove Docker preview section (redundant with Docker tab)
- [ ] Keep: Host info, Sessions list, Create session
- [ ] Add: Quick link to Docker tab filtered to this host

**Files to modify:**
- `app/hosts/[id]/index.tsx`

### Task 10: Polish & Animations
Final visual polish.

- [ ] Add glow effects to accent elements
- [ ] Smooth tab transitions
- [ ] Pull-to-refresh styling
- [ ] Loading states with skeleton/shimmer
- [ ] Status indicator pulse animation

## Success Criteria

### Automated Verification:
- [ ] TypeScript compiles: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint`
- [ ] App builds: `npx expo prebuild && npx expo run:ios` (or Android)

### Manual Verification:
- [ ] Sessions tab shows all sessions, tap → terminal works
- [ ] Docker tab shows all containers in 1 tap from anywhere
- [ ] Container terminal reachable in 2 taps (Docker tab → Terminal button)
- [ ] Host quick actions work (Terminal, Docker buttons)
- [ ] Dark theme applied consistently
- [ ] Accent glow effects visible on active states
- [ ] Bottom tab bar animates smoothly

### Click Distance Verification:
| Action | Before | After |
|--------|--------|-------|
| View all Docker containers | 2 taps | **1 tap** |
| Open container terminal | 4 taps | **2 taps** |
| Start/stop container | 3 taps | **2 taps** |
| View all sessions | 0 taps | 0 taps |
| Open session terminal | 1 tap | 1 tap |

## Out of Scope
- New features (focus is redesign)
- Backend/agent changes
- Authentication flow changes
- App icon design (placeholder update only)
- Splash screen animation

## Risks (Pre-Mortem)

### Tigers:
- **Expo Router tabs migration complexity** (MEDIUM)
  - Mitigation: Incremental migration, keep old routes working during transition
- **Performance with aggregated Docker data** (MEDIUM)
  - Mitigation: Use existing polling, don't add new requests

### Elephants:
- **User familiarity** - Existing users might be confused by new layout
  - Note: Improvement outweighs temporary confusion
