# Task 7: Display Copilot Usage in Session Insights

## Status: COMPLETE

## Summary

Added Copilot usage display to the main index screen alongside existing Claude and Codex usage cards.

## Changes Made

### Modified File: `app/(tabs)/index.tsx`

#### 1. Added Copilot to Usage Aggregation

Extended the `aggregatedUsage` memo to include Copilot:

```typescript
const aggregatedUsage = useMemo(() => {
  let claude: ProviderUsage | null = null;
  let codex: ProviderUsage | null = null;
  let copilot: ProviderUsage | null = null;  // NEW
  let claudePolled = 0;
  let codexPolled = 0;
  let copilotPolled = 0;  // NEW

  sessions.forEach((session) => {
    // ... existing logic for claude and codex ...

    if (insights.copilot && polled > copilotPolled) {
      copilot = insights.copilot;
      copilotPolled = polled;
    }
  });

  return { claude, codex, copilot };
}, [sessions]);
```

#### 2. Added Copilot Usage Card

Added a third UsageCard for Copilot in the render:

```tsx
{aggregatedUsage.copilot && (
  <UsageCard provider="Copilot" usage={aggregatedUsage.copilot} color="#6366F1" />
)}
```

Color `#6366F1` is indigo - chosen to complement existing colors (Claude: amber, Codex: green).

#### 3. Updated Styling for 3+ Cards

Made the usage cards row wrap-friendly:

```typescript
usageCardsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',  // NEW: handles overflow
  gap: 10,
},
usageCard: {
  flex: 1,
  minWidth: 140,  // NEW: prevents cards from becoming too narrow
  padding: 12,
  gap: 10,
},
```

## UI Behavior

- Copilot usage card appears in the same row as Claude and Codex cards
- If all 3 providers have usage data, cards will wrap to a new line on narrow screens
- Each card shows daily/weekly percentages and reset times (reuses existing `UsageCard` component)
- Copilot data comes from `session.insights.copilot` which is populated by `agent/copilot.ts`

## Notes

- **SessionCard.tsx**: Not modified - the card is already compact and adding usage would clutter it
- **Session detail screen**: Not modified - focused on session management, not usage metrics
- **The main index screen is the appropriate location** for usage display as it aggregates data across all sessions

## Verification

- TypeScript compiles without errors
- Existing Claude/Codex display unaffected
- Copilot card will only appear when `copilot` data exists in session insights

## Dependencies

- Task 1-6 must be complete for Copilot data to be available in `session.insights.copilot`
- Types already support `copilot?: ProviderUsage` in `SessionInsights` (lib/types.ts:153)
