# Agent module guide

Source code now lives under `src/` for a cleaner package layout. Quick map:

- `src/config.ts`: environment + constants
- `src/state.ts`: shared in-memory caches
- `src/binaries.ts`: resolve CLI locations
- `src/pty.ts` + `src/pty-runner.ts`: node-pty integration
- `src/codex.ts`, `src/claude.ts`, `src/copilot.ts`, `src/cursor.ts`: provider usage collectors
- `src/usage.ts`: usage aggregation + scheduling
- `src/tmux.ts` + `src/sessions.ts`: tmux helpers
- `src/git.ts` + `src/agents.ts`: git + agent state helpers
- `src/http/`: HTTP routes + WebSocket handlers
- `src/server.ts`: server wiring
- `src/index.ts`: entrypoint
