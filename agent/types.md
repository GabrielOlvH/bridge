# Agent module guide

This folder now uses a small module layout instead of a single `index.ts` file. Quick map:

- `config.ts`: environment + constants
- `state.ts`: shared in-memory caches
- `binaries.ts`: resolve CLI locations
- `pty.ts` + `pty-runner.ts`: node-pty integration
- `codex.ts`, `claude.ts`, `copilot.ts`, `cursor.ts`: provider usage collectors
- `usage.ts`: usage aggregation + scheduling
- `tmux.ts` + `sessions.ts`: tmux helpers
- `git.ts` + `agents.ts`: git + agent state helpers
- `server.ts`: HTTP + WebSocket server
- `index.ts`: entrypoint
