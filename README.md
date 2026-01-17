# Tmux Dock

React Native (Expo) app to manage tmux sessions across multiple hosts.

## Features

- Multiple host profiles with per-host auth tokens
- Live session lists + create/kill/rename
- Mosh/SSH command generator for attach and new-or-attach
- Keybind panel to send tmux keys remotely
- Auto refresh + persistent host storage
- Full TUI terminal via WebView + xterm.js (uses agent WebSocket)

## Run the app

```bash
npm install
npm start
```

## Run the tmux agent

```bash
cd agent
npm install
npm start
```

Point the app to `http://<host>:4020` (or your configured port). Add a token in the app if you set `TMUX_AGENT_TOKEN`.

The terminal view connects to the agent WebSocket at `/ws` and uses xterm.js loaded via CDN.

See `agent/types.md` for the new module layout.
