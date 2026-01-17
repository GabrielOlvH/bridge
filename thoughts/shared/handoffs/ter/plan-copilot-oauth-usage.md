---
date: 2026-01-17T18:45:00Z
type: plan
status: complete
plan_file: thoughts/shared/plans/PLAN-copilot-oauth-usage.md
---

# Plan Handoff: Copilot OAuth Device Flow + Usage Display

## Summary

Created implementation plan for adding GitHub Copilot authentication via OAuth Device Flow and displaying usage metrics in the ter app. The app already has Copilot usage fetching but requires pre-existing tokens. This plan adds device-based authentication directly from the app.

## Plan Created

`thoughts/shared/plans/PLAN-copilot-oauth-usage.md`

## Key Technical Decisions

- **OAuth Device Flow**: Using GitHub's RFC 8628 implementation with VS Code's public client ID (`Iv1.b507a08c87ecfe98`)
- **Token Storage**: File-based at `~/.ter/copilot-token` (simple, works with agent architecture)
- **Scope**: Minimal `read:user` scope for usage API access only
- **UI Pattern**: Dedicated screen with user code display + browser redirect

## Task Overview

1. **Device Flow OAuth** - Create `copilot-oauth.ts` with device code + polling logic
2. **Token Storage + Cleanup** - Remove legacy methods (env vars, config files, gh CLI), add file-based storage
3. **Server Endpoints** - Add `/copilot/auth/*` routes for start/poll/status/logout
4. **API Client** - Add OAuth methods to `lib/api.ts`
5. **OAuth UI Screen** - Create `app/copilot/auth.tsx` with user code display
6. **Settings Section** - Add Copilot status and connect/disconnect to More screen
7. **Usage Display** - Show metrics in session insights (optional)

## Research Findings

- CodexBar uses identical OAuth flow at `/tmp/CodexBar/Sources/CodexBarCore/Providers/Copilot/CopilotDeviceFlow.swift`
- Current `agent/copilot.ts:14-45` has legacy token resolution from 5 sources (env, config files, gh CLI) - **will be removed** as they don't work
- Usage data already flows through `SessionInsights.copilot` but UI doesn't display it
- `ProviderUsage` type at `lib/types.ts:113-120` already has session/weekly/tokens fields

## Assumptions Made

- VS Code's client ID is stable (widely used by third-party tools)
- File-based token storage is acceptable for agent (runs on user's machine)
- Device flow UX is acceptable (requires browser switch)

## For Next Steps

- User should review plan at: `thoughts/shared/plans/PLAN-copilot-oauth-usage.md`
- After approval, run `/implement_plan thoughts/shared/plans/PLAN-copilot-oauth-usage.md`
- Consider running `/premortem` for deeper risk analysis before implementation
