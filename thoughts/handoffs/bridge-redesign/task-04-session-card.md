# Task 04: Session Card Component

## Status: COMPLETE

## Summary

Created a new `SessionCard` component with a compact, action-focused design for displaying tmux session information.

## Files Created

### `/home/gabrielolv/Documents/Projects/ter/components/SessionCard.tsx`

A new reusable component featuring:
- Compact card layout using GlassCard as base
- Host color indicator (vertical bar on left edge)
- State badge with icon and label: Running (green), Idle (orange), Stopped (gray)
- Session name as primary text
- Git branch display with GitBranch icon (when available)
- Command display in monospace (when available)
- Single tap navigates to terminal (via `onPress` callback)
- Long press triggers haptic feedback and shows Alert with Kill option

## Props Interface

```typescript
type SessionCardProps = {
  session: Session;
  host: Host;
  hostColor: string;
  onPress: () => void;
  onKill: () => void;
};
```

## Design Details

- Uses `palette` colors for state indicators (compatible with string concat for opacity)
- Color bar: 4px wide, uses `hostColor` prop
- State badge: Rounded pill with semi-transparent background
- Haptic feedback: `ImpactFeedbackStyle.Medium` on long press
- Compact padding: 12px content padding

## State Color Mapping

| State | Color | Background |
|-------|-------|------------|
| Running | `palette.accent` (green) | accent + 20% opacity |
| Idle | `palette.clay` (orange) | clay + 20% opacity |
| Stopped | `palette.muted` (gray) | muted + 20% opacity |

## Integration Notes

To use this component, import it and replace the inline session rendering in `app/(tabs)/index.tsx`:

```tsx
import { SessionCard } from '@/components/SessionCard';

// Inside the sessions map:
<SessionCard
  session={session}
  host={group.host}
  hostColor={group.host.color || hostAccents[groupIndex % hostAccents.length]}
  onPress={() => router.push(`/session/${group.host.id}/${encodeURIComponent(session.name)}/terminal`)}
  onKill={() => handleKillSession(group.host, session.name)}
/>
```

## Type Check

- SessionCard.tsx: 0 errors
- Pre-existing errors in other files (HostCard.tsx, hosts/index.tsx) not related to this task

## Checkpoints

- Phase 1 (Component Creation): VALIDATED
- Phase 2 (Type Check): VALIDATED
