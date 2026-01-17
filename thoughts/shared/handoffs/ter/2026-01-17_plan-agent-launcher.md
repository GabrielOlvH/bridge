---
date: 2026-01-17
type: plan
status: complete
plan_file: thoughts/shared/plans/PLAN-agent-launcher.md
---

# Plan Handoff: Agent Launcher Feature

## Summary
Designed a UX flow for launching any command (agent CLIs, npm scripts, custom commands) from the home screen via a bottom sheet, with recent launches, host/project selection, and immediate terminal attachment.

## Plan Created
`thoughts/shared/plans/PLAN-agent-launcher.md`

## Key Technical Decisions
- **Bottom sheet UX**: User preferred bottom sheet over wizard or dedicated tab - shows recent launches at top for quick re-launch
- **Per-host projects**: Each host has its own project list (not global with overrides)
- **On-demand script detection**: Fetch package.json from host when project selected (not cached)
- **In-app custom commands**: User adds custom commands via app form (not config file in project)
- **Auto-generated session names**: Format like `projectName-timestamp` (no prompt for name)
- **Any command support**: Not limited to specific agent CLIs - any command string works

## Task Overview
1. Add new types (Project, Command, RecentLaunch)
2. Create projects/launch store with AsyncStorage
3. Add backend endpoint to fetch package.json scripts
4. Add script fetching to API layer
5. Install @gorhom/bottom-sheet
6. Create LaunchSheet component (main UI)
7. Create Add Project screen
8. Create Manage Projects screen
9. Create Custom Commands editor
10. Add launch button to home screen
11. Implement launch logic (create session → run command → attach)
12. Add projects link to navigation

## Research Findings
- App uses Context + AsyncStorage pattern for state (hosts, keybinds) - follow same pattern
- Terminal attachment already works via WebView + xterm.js
- Session creation uses POST /sessions to host agent
- Existing components: Field, Screen, HostForm - reuse these patterns

## Assumptions Made
- Agent backend can be extended with new endpoint for package.json reading - verify agent code location
- @gorhom/bottom-sheet compatible with current Expo/RN version - verify in package.json

## For Next Steps
- User should review plan at: `thoughts/shared/plans/PLAN-agent-launcher.md`
- After approval, run `/implement_plan` with the plan path
- May want to start with Tasks 1-5 (foundation) before UI tasks
