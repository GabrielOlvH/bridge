# Implementation Plan: Agent Installer with Auto-Update

Generated: 2026-01-17

## Goal

Create a simple installation system for the Bridge agent that:
1. Allows users to install with a single command (clone + setup)
2. Runs as a systemd service (auto-starts on boot)
3. Automatically updates from GitHub and gracefully restarts

## Research Summary

**Systemd Best Practices (2024-2025):**
- Use `Restart=on-failure` or `Restart=always` for resilience
- Run as non-root user for security
- Use `journalctl` for logging (built-in, no extra dependencies)
- Symlink service file from repo to `/etc/systemd/system/` for easier updates
- Set `WorkingDirectory` to the app directory

**Auto-Update Patterns:**
- Cron-based polling with `git fetch` + compare is simple and reliable
- Check if remote has changes before pulling to avoid unnecessary restarts
- Use `systemctl restart` for graceful service restart
- Add delay/backoff to prevent restart loops

## Existing Codebase Analysis

**Agent Structure:**
- Entry: `agent/index.ts` - imports server, starts polling
- Server: `agent/server.ts` - Hono HTTP + WebSocket server
- Config: `agent/config.ts` - environment variables (PORT, TOKEN, etc.)
- Dependencies: `@hono/node-server`, `dotenv`, `hono`, `node-pty`, `ws`
- Runtime: Uses `tsx` for TypeScript execution (`npm start` = `tsx index.ts`)

**Key Environment Variables:**
```bash
TMUX_AGENT_PORT=4020          # Server port
TMUX_AGENT_HOST=<hostname>    # Display name
TMUX_AGENT_TOKEN=             # Auth token (optional)
TMUX_AGENT_SOCKET=            # Tmux socket path
TMUX_AGENT_USAGE_POLL_MS=60000
TMUX_AGENT_TOKEN_POLL_MS=180000
```

**Repository:** https://github.com/GabrielOlvH/bridge

## Implementation Phases

### Phase 1: Create Installation Script

**Files to create:**
- `agent/install.sh` - Main installation script

**Script functionality:**
```bash
#!/bin/bash
# Bridge Agent Installer

INSTALL_DIR="${BRIDGE_INSTALL_DIR:-$HOME/.bridge-agent}"
SERVICE_NAME="bridge-agent"
REPO_URL="https://github.com/GabrielOlvH/bridge.git"
```

**Steps:**
1. Check prerequisites (git, node >= 18, npm)
2. Clone repository to `$INSTALL_DIR`
3. Run `npm install` in `agent/` directory
4. Create `.env` file with defaults (prompt for TOKEN)
5. Create systemd service file
6. Enable and start service
7. Set up update timer

**Acceptance criteria:**
- [ ] Script runs without errors on fresh Ubuntu/Debian
- [ ] Script is idempotent (can run multiple times safely)
- [ ] Script handles existing installation gracefully

### Phase 2: Create Systemd Service File

**Files to create:**
- `agent/bridge-agent.service` - Systemd unit file template

**Service file content:**
```ini
[Unit]
Description=Bridge Agent - Tmux/Docker Management Server
Documentation=https://github.com/GabrielOlvH/bridge
After=network.target

[Service]
Type=simple
User=%i
WorkingDirectory=INSTALL_DIR/agent
ExecStart=/usr/bin/node INSTALL_DIR/agent/node_modules/.bin/tsx INSTALL_DIR/agent/index.ts
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bridge-agent
EnvironmentFile=-INSTALL_DIR/agent/.env

[Install]
WantedBy=multi-user.target
```

**Steps:**
1. Template uses placeholders for install directory
2. Install script replaces placeholders with actual paths
3. Service runs as installing user (not root)
4. Uses `EnvironmentFile` for configuration

**Acceptance criteria:**
- [ ] Service starts successfully
- [ ] Service restarts on crash
- [ ] Logs viewable via `journalctl -u bridge-agent`

### Phase 3: Create Auto-Update Mechanism

**Files to create:**
- `agent/update.sh` - Update check and apply script
- `agent/bridge-agent-update.service` - One-shot update service
- `agent/bridge-agent-update.timer` - Systemd timer for periodic updates

**update.sh functionality:**
```bash
#!/bin/bash
# Check for updates and apply if available

INSTALL_DIR="$1"
cd "$INSTALL_DIR"

# Fetch latest from remote
git fetch origin main --quiet

# Compare local and remote
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "Update available, pulling changes..."
    git pull origin main

    # Reinstall dependencies if package.json changed
    if git diff --name-only "$LOCAL" "$REMOTE" | grep -q "agent/package.json"; then
        echo "Dependencies changed, running npm install..."
        cd agent && npm install
    fi

    # Restart service
    echo "Restarting bridge-agent service..."
    systemctl --user restart bridge-agent
    echo "Update complete"
else
    echo "Already up to date"
fi
```

**Timer configuration:**
```ini
# bridge-agent-update.timer
[Unit]
Description=Bridge Agent Auto-Update Timer

[Timer]
OnBootSec=5min
OnUnitActiveSec=1h
Persistent=true

[Install]
WantedBy=timers.target
```

**Steps:**
1. Timer triggers every hour (configurable)
2. Update script checks if remote has new commits
3. Only pulls if changes detected
4. Only runs npm install if package.json changed
5. Graceful restart via systemctl

**Acceptance criteria:**
- [ ] Timer runs automatically after boot
- [ ] Updates are detected and applied
- [ ] Service restarts gracefully after update
- [ ] No restart if no changes

### Phase 4: Create Uninstall Script

**Files to create:**
- `agent/uninstall.sh` - Clean removal script

**Functionality:**
1. Stop and disable services
2. Remove timer and service files
3. Optionally remove installation directory
4. Clean up symlinks

**Acceptance criteria:**
- [ ] Clean removal of all installed components
- [ ] Preserves user data if requested

### Phase 5: Create Environment Configuration

**Files to create:**
- `agent/.env.example` - Example environment file with documentation

**Content:**
```bash
# Bridge Agent Configuration

# Server port (default: 4020)
TMUX_AGENT_PORT=4020

# Host label shown in app (default: hostname)
# TMUX_AGENT_HOST=my-server

# Authentication token (optional but recommended)
# TMUX_AGENT_TOKEN=your-secret-token

# Tmux socket path (optional, uses default if not set)
# TMUX_AGENT_SOCKET=/tmp/tmux-1000/default

# Polling intervals
TMUX_AGENT_USAGE_POLL_MS=60000
TMUX_AGENT_TOKEN_POLL_MS=180000
```

**Acceptance criteria:**
- [ ] All options documented
- [ ] Sensible defaults

### Phase 6: Update README with Installation Instructions

**Files to modify:**
- `README.md` - Add installation section

**Content to add:**
```markdown
## Installation (Server)

### Quick Install

```bash
curl -sSL https://raw.githubusercontent.com/GabrielOlvH/bridge/main/agent/install.sh | bash
```

Or clone and run manually:

```bash
git clone https://github.com/GabrielOlvH/bridge.git
cd bridge/agent
./install.sh
```

### Configuration

Edit `~/.bridge-agent/agent/.env`:

```bash
TMUX_AGENT_PORT=4020
TMUX_AGENT_TOKEN=your-secret-token  # Recommended
```

### Service Management

```bash
# View status
systemctl --user status bridge-agent

# View logs
journalctl --user -u bridge-agent -f

# Restart
systemctl --user restart bridge-agent

# Disable auto-updates
systemctl --user disable bridge-agent-update.timer
```

### Uninstall

```bash
~/.bridge-agent/agent/uninstall.sh
```
```

**Acceptance criteria:**
- [ ] Clear, copy-pasteable commands
- [ ] Covers all common operations

## Testing Strategy

1. **Fresh Install Test:**
   - Spin up clean VM/container
   - Run install script
   - Verify service starts and responds

2. **Update Test:**
   - Make change to repo
   - Wait for timer or manually trigger
   - Verify update applies and service restarts

3. **Resilience Test:**
   - Kill the service process
   - Verify systemd restarts it

4. **Uninstall Test:**
   - Run uninstall script
   - Verify all components removed

## Risks and Considerations

1. **Node.js Version:**
   - Script should check for Node >= 18
   - Consider adding nvm install fallback

2. **Permissions:**
   - Uses user-level systemd (`--user`) to avoid root
   - Requires `loginctl enable-linger $USER` for user services to persist

3. **node-pty Compilation:**
   - Requires build tools (gcc, make, python)
   - Install script should check/install these

4. **Network Failures:**
   - Update script should handle git fetch failures gracefully
   - Don't break service if update fails

5. **Breaking Changes:**
   - Updates could introduce breaking changes
   - Consider adding version pinning option

## Estimated Complexity

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1: Install Script | Medium | Low |
| Phase 2: Systemd Service | Low | Low |
| Phase 3: Auto-Update | Medium | Medium |
| Phase 4: Uninstall | Low | Low |
| Phase 5: Env Config | Low | Low |
| Phase 6: README | Low | Low |

**Total Estimated Time:** 2-3 hours

## File Summary

Files to create:
- `/home/gabrielolv/Documents/Projects/ter/agent/install.sh`
- `/home/gabrielolv/Documents/Projects/ter/agent/uninstall.sh`
- `/home/gabrielolv/Documents/Projects/ter/agent/update.sh`
- `/home/gabrielolv/Documents/Projects/ter/agent/bridge-agent.service`
- `/home/gabrielolv/Documents/Projects/ter/agent/bridge-agent-update.service`
- `/home/gabrielolv/Documents/Projects/ter/agent/bridge-agent-update.timer`
- `/home/gabrielolv/Documents/Projects/ter/agent/.env.example`

Files to modify:
- `/home/gabrielolv/Documents/Projects/ter/README.md`

## Implementation Notes

1. **User-Level vs System-Level Systemd:**
   Using `--user` systemd services because:
   - No root required for installation
   - Services run as the installing user
   - Simpler permission model
   - Requires: `loginctl enable-linger $USER`

2. **tsx vs Node:**
   The agent uses `tsx` (TypeScript executor). The service should call:
   ```
   /path/to/node_modules/.bin/tsx index.ts
   ```
   Not just `npm start` (avoids npm overhead).

3. **Git Pull Strategy:**
   Using `git pull` instead of `git reset --hard` to:
   - Preserve local changes (if any)
   - Fail safely if there are conflicts
   - Alert user if manual intervention needed

## Sources

- [Node.js Best Practices - GitHub](https://github.com/goldbergyoni/nodebestpractices)
- [Running Node.js as systemd service - r0b blog](https://blog.r0b.io/post/running-node-js-as-a-systemd-service/)
- [Systemd: Effective Deploy Node.js - Rio Chandra](https://riochndr.com/archive/2024/09/posts-2024-10-10-deploy-nodejs-on-linux/)
- [Auto-restart services - GitHub](https://github.com/phahulin/auto-restart)
- [Systemd auto-update - GitHub](https://github.com/noloader/auto-update)
