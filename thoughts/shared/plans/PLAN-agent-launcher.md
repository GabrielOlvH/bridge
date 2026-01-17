# Plan: Agent Launcher Feature

## Goal
Add a way to launch any command (agent CLIs, npm scripts, custom commands) in tmux sessions from the home screen, with a bottom sheet UX showing recent launches and project/command selection.

## Technical Choices
- **State Management**: Extend existing store.tsx context pattern for projects/commands/recent launches
- **Bottom Sheet**: Use @gorhom/bottom-sheet (standard React Native choice)
- **Script Discovery**: On-demand fetch of package.json from host via new API endpoint
- **Storage**: AsyncStorage (same as hosts/keybinds) for projects, custom commands, and recent launches

## Data Model

### New Types (lib/types.ts)

```typescript
type Project = {
  id: string;
  hostId: string;           // Which host this project belongs to
  name: string;             // Display name (e.g., "ter", "my-api")
  path: string;             // Absolute path on host (e.g., "/home/user/projects/ter")
  customCommands?: Command[]; // User-defined commands beyond package.json
};

type Command = {
  id: string;
  label: string;            // Display name (e.g., "Claude Code", "Dev Server")
  command: string;          // Actual command (e.g., "claude", "pnpm dev")
  icon?: string;            // Optional icon identifier
};

type RecentLaunch = {
  id: string;
  hostId: string;
  projectId: string;
  projectName: string;      // Denormalized for display
  hostName: string;         // Denormalized for display
  command: Command;
  timestamp: number;
};

type PackageJsonScripts = {
  [key: string]: string;    // e.g., { "dev": "vite", "build": "tsc" }
};
```

## Current State Analysis

### Key Patterns to Follow:
- `lib/store.tsx` - Context pattern with AsyncStorage persistence (hosts, keybinds)
- `lib/api.ts` - Fetch wrapper with host baseUrl + authToken
- `app/hosts/new.tsx` - Form pattern for adding new entities
- `app/session/[hostId]/[name]/terminal.tsx` - Terminal attachment flow

### Existing Infrastructure:
- Hosts already have: id, baseUrl, authToken, sshHost (for terminal)
- Sessions created via: `POST /sessions` to host agent
- Terminal attachment: WebView + xterm.js via host's terminal endpoint

## Tasks

### Task 1: Add New Types
Add Project, Command, RecentLaunch types to the type system.

- [x] Add types to `lib/types.ts`

**Files to modify:**
- `lib/types.ts`

### Task 2: Create Projects/Launch Store
Create context for managing projects, custom commands, and recent launches.

- [x] Create `lib/projects-store.tsx` with:
  - `projects: Project[]` state
  - `recentLaunches: RecentLaunch[]` state (max 10)
  - CRUD operations for projects
  - `addRecentLaunch()` function
  - AsyncStorage persistence

**Files to create:**
- `lib/projects-store.tsx`

### Task 3: Add Agent API Endpoint (Backend)
Add endpoint to fetch package.json scripts from a project path.

- [x] Add `GET /project/scripts?path=<path>` endpoint to agent
- [x] Returns `{ scripts: { [name]: string }, hasPackageJson: boolean }`

**Files to modify:**
- `packages/agent/src/index.ts` (or wherever the Hono routes are)

### Task 4: Add Script Fetching to API Layer
Add function to fetch package.json scripts from host.

- [x] Add `fetchProjectScripts(host, projectPath)` to `lib/api.ts`

**Files to modify:**
- `lib/api.ts`

### Task 5: Install Bottom Sheet
Add @gorhom/bottom-sheet dependency.

- [x] `pnpm add @gorhom/bottom-sheet`
- [x] Add GestureHandlerRootView wrapper if not present

**Files to modify:**
- `package.json`
- `app/_layout.tsx` (if gesture handler wrapper needed)

### Task 6: Create Launch Bottom Sheet Component
Build the main bottom sheet UI with three sections:
1. Recent launches (tap to re-launch)
2. Host/Project picker
3. Command picker (package.json scripts + custom)

- [x] Create `components/LaunchSheet.tsx`
- [x] Section: Recent launches (horizontal scroll or list)
- [x] Section: Host dropdown → Project dropdown
- [x] Section: Commands list (from package.json + custom)
- [x] Launch button that creates tmux session and navigates to terminal

**Files to create:**
- `components/LaunchSheet.tsx`

### Task 7: Create Add Project Screen
Screen to add a new project to a host.

- [x] Create `app/projects/new.tsx`
- [x] Form: Select host, enter project name, enter path
- [x] Validate path exists on host (optional, nice-to-have)

**Files to create:**
- `app/projects/new.tsx`

### Task 8: Create Manage Projects Screen
List/edit/delete projects per host.

- [x] Create `app/projects/index.tsx`
- [x] Group projects by host
- [x] Swipe to delete or edit
- [x] Link to add custom commands

**Files to create:**
- `app/projects/index.tsx`

### Task 9: Create Custom Commands Editor
Screen to add/edit custom commands for a project.

- [x] Create `app/projects/[id]/commands.tsx`
- [x] List existing custom commands
- [x] Form to add new: label + command string
- [x] Delete functionality

**Files to create:**
- `app/projects/[id]/commands.tsx`

### Task 10: Add Launch Button to Home Screen
Add FAB or button on home that opens the launch sheet.

- [x] Add button/FAB to `app/index.tsx`
- [x] Opens LaunchSheet on press

**Files to modify:**
- `app/index.tsx`

### Task 11: Implement Launch Logic
When user taps launch:
1. Create tmux session with auto-generated name
2. Run the command in that session
3. Navigate to terminal view

- [x] Generate session name: `{projectName}-{timestamp}` or similar
- [x] Call existing session creation API
- [x] Send command to session
- [x] Navigate to terminal route
- [x] Add to recent launches

**Files to modify:**
- `components/LaunchSheet.tsx`
- `lib/api.ts` (if new API calls needed)

### Task 12: Add Projects Link to Settings/Navigation
Make projects management discoverable.

- [x] Add "Manage Projects" link somewhere accessible (settings, hosts screen, or tab)

**Files to modify:**
- TBD based on current nav structure

## Success Criteria

### Automated Verification:
- [x] Type check passes: `pnpm typecheck`
- [x] Lint passes: `pnpm lint`
- [x] App builds: `pnpm expo build` (or similar)

### Manual Verification:
- [x] Can add a project with host + path
- [x] Can add custom commands to a project
- [x] Bottom sheet shows recent launches
- [x] Selecting host filters projects
- [x] Selecting project shows package.json scripts (if available) + custom commands
- [x] Launching creates tmux session and attaches to terminal
- [x] Recent launches work for 1-tap re-launch

## UX Flow Summary

```
[Home Screen]
    |
    v
[Launch Agent Button] --> opens bottom sheet
    |
    v
[Bottom Sheet]
    ├── Recent Launches (horizontal list, tap to re-launch)
    |
    ├── Host Picker (dropdown)
    |       |
    |       v
    ├── Project Picker (dropdown, filtered by host)
    |       |
    |       v
    └── Commands List
            ├── package.json scripts (fetched on-demand)
            └── Custom commands (from store)
                    |
                    v
              [Launch] --> creates tmux session
                              |
                              v
                        [Terminal View]
```

## Out of Scope
- Scanning filesystem for projects (user manually configures paths)
- Favorites/pinned launches (only recent for now)
- Background agent monitoring (attach immediately for now)
- Multiple agent sessions per project
- Project path validation (trust user input)

## Risks (Pre-Mortem)

### Tigers:
- **Bottom sheet library compatibility** (MEDIUM)
  - Mitigation: @gorhom/bottom-sheet is well-maintained, but test on both iOS/Android

### Elephants:
- **package.json fetch latency** (LOW)
  - Note: On-demand fetch may feel slow on first project selection; consider caching
