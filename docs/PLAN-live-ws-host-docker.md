## Goals
- Replace client-side polling with a live WebSocket feed for session and host status.
- Add host telemetry (CPU, RAM, uptime) and Docker visibility (containers/images/volumes/networks).
- Keep UX fast and resilient when hosts are offline or Docker is unavailable.
- Clean up Claude-specific rough edges in the agent while touching the backend.

## Non-Goals
- Full terminal data streaming changes (tmux websocket stays as-is).
- Heavy Docker control actions (start/stop/etc.) in this pass.
- Background push notifications or offline caching beyond current behavior.

## User Experience
- Home screen shows live session state per host without manual refresh or polling.
- Host detail screen shows live CPU/RAM and Docker summary.
- Optional dedicated Docker view shows container stats similar to Docker Desktop.
- Clear offline/error states when host or Docker is unavailable.

## Architecture
- Add a new WebSocket endpoint (`/events`) on the agent server.
- Client opens one `/events` socket per host in view.
- Server pushes periodic snapshots based on query params (sessions/insights/preview/host/docker).
- UI updates from socket messages; no client polling intervals.

## WebSocket Protocol
- Client connects to: `ws(s)://<host>/events?...`
- Query params:
  - `sessions=1` to include session list
  - `preview=1` + `previewLines=12` for previews
  - `insights=1` to include session insights
  - `host=1` to include host telemetry
  - `docker=1` to include docker snapshot
- Server messages:
  - `snapshot` with `{ ts, sessions?, host?, docker? }`
  - `error` with `{ message }`

## Data Model
- `HostInfo`: cpu, memory, uptime, load, platform metadata.
- `DockerSnapshot`: availability flag + containers/images/volumes/networks.
- Extend frontend types to include the new payloads.

## Algorithms
- CPU usage derived from `/proc/stat` delta over time.
- Memory usage derived from total/free bytes.
- Docker info via `docker ps/stats/images/volume ls/network ls` with JSON templates.

## Cleanup (Claude)
- Trim error-handling and prompt-response noise in `agent/claude.ts`.
- Avoid long-lived orphan Claude PTYs.

## ElectricSQL
- Not applicable to this project.

## WhatsApp/Baileys Messaging
- Not applicable to this project.

## OpenRouter NLP
- Not applicable to this project.

## LLM Prompts
- Not applicable to this project.

## Migration Notes
- Remove `refetchInterval` polling in the app screens.
- Add socket lifecycle handling and offline fallbacks.

## Testing
- Run agent locally, connect app, verify live session updates.
- Verify CPU/RAM values against `top`/`free`.
- Verify Docker data with running/stopped containers.
- Verify offline behavior and reconnection handling.

