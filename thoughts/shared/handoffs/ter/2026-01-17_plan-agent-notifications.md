---
date: 2026-01-17T12:25:00Z
type: plan
status: complete
plan_file: thoughts/shared/plans/PLAN-agent-notifications.md
---

# Plan Handoff: Agent State Notifications

## Summary
Planned local notification system that fires when Claude/Codex agents finish working (transition from `running` to `idle`). Uses expo-notifications for Expo Go compatibility.

## Plan Created
`thoughts/shared/plans/PLAN-agent-notifications.md`

## Key Technical Decisions
- **expo-notifications**: Official Expo library, works in Expo Go for local notifications
- **useRef for state tracking**: Compare previous vs current state per session on each 15s poll
- **Per-session notifications**: Each session tracked independently, not global state
- **Graceful degradation**: If permissions denied, app works normally without notifications

## Task Overview
1. **Install dependencies** - expo-notifications, expo-device
2. **Configure app.json** - Add notification plugin and Android settings
3. **Create notification utility** - lib/notifications.ts with setup and trigger functions
4. **Create state detection hook** - hooks/useAgentStateNotifications.ts
5. **Integrate into home screen** - Wire up in app/index.tsx
6. **Add notification icon** - Android requires 96x96 white-on-transparent PNG

## Research Findings
- Agent state defined at `lib/types.ts:95` as `'running' | 'idle' | 'stopped'`
- Home screen polls every 15s at `app/index.tsx:72`
- State detection in backend at `agent/agents.ts:139-155`
- No existing notification infrastructure - only expo-haptics installed
- app.json currently only has expo-router plugin

## Assumptions Made
- Local notifications work reliably in Expo Go (verify on device)
- User wants notifications only for `running → idle` (not other transitions)
- 15s polling interval is acceptable latency for notifications

## Limitations Noted
- Only works while app is active or recently backgrounded (iOS suspends apps)
- Push notifications would require dev account + server changes (out of scope)
- No Dynamic Island support (requires native Swift + dev account)

## For Next Steps
- User should review plan at: `thoughts/shared/plans/PLAN-agent-notifications.md`
- After approval, run `/implement_plan` with the plan path
- Test on physical device - notifications may behave differently in simulator
