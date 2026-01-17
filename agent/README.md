# tmux agent

Minimal REST agent for tmux. Run this on every host you want the mobile app to control.

## Install

```bash
cd agent
npm install
```

## Run

```bash
npm start
```

## Architecture

The agent is split into small modules for readability. See `agent/types.md` for the quick map.

## Environment

- `TMUX_AGENT_PORT` (default: `4020`)
- `TMUX_AGENT_TOKEN` (optional bearer token)
- `TMUX_AGENT_HOST` (optional label override)
- `TMUX_AGENT_SOCKET` (optional tmux socket path)

## Endpoints

- `GET /health`
- `GET /sessions`
- `POST /sessions` `{ name, windowName?, command? }`
- `POST /sessions/:name/rename` `{ name }`
- `POST /sessions/:name/kill`
- `POST /sessions/:name/keys` `{ keys: string[] }`
- `POST /sessions/:name/resize` `{ cols, rows }`
- `GET /sessions/:name/capture` `?lines=60&cursor=1`

## WebSocket terminal

For the in-app terminal (xterm.js), connect via WebSocket:

```
ws://<host>:4020/ws?session=<name>&cols=80&rows=24&token=<optional>
```

Messages:
- Client -> server: `{ type: "input", data: "<string>" }`
- Client -> server: `{ type: "resize", cols, rows }`
- Server -> client: raw terminal data
