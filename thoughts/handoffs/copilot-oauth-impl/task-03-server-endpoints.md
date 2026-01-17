# Task 3: Add Server Endpoints for OAuth

## Status: COMPLETED

## Summary

Added 4 HTTP endpoints to `agent/server.ts` to expose the GitHub Copilot OAuth device flow via the ter API.

## Changes Made

### File: `/home/gabrielolv/Documents/Projects/ter/agent/server.ts`

**1. Added imports (line 12-13):**
```typescript
import { getStoredToken, storeToken, clearToken } from './copilot';
import { startDeviceFlow, pollForToken, type DeviceFlowSession } from './copilot-oauth';
```

**2. Added module-level session tracking (line 172):**
```typescript
let activeDeviceSession: DeviceFlowSession | null = null;
```

**3. Added 4 new endpoints (lines 549-627):**

### Endpoints Implemented

#### `POST /copilot/auth/start`
- Initiates the device flow by calling `startDeviceFlow()`
- Stores the session in `activeDeviceSession` for later polling
- Returns: `{ userCode, verificationUri, expiresIn, interval }`
- Error: `{ error: string }` with 400/500 status

#### `GET /copilot/auth/poll`
- Checks for active session, returns error if none
- Checks if session has expired
- Calls `pollForToken()` with remaining time
- On success: stores token via `storeToken()`, clears session, returns `{ status: 'success', token }`
- On pending: returns `{ status: 'pending' }`
- On error/expired: clears session, returns `{ status: 'expired', error }`

#### `DELETE /copilot/auth`
- Calls `clearToken()` to remove stored token
- Clears any active device session
- Returns: `{ ok: true }`

#### `GET /copilot/auth/status`
- Calls `getStoredToken()` to check if token exists
- Returns: `{ authenticated: boolean, error?: string }`

## API Response Formats

```typescript
// POST /copilot/auth/start
{ userCode: string, verificationUri: string, expiresIn: number, interval: number }

// GET /copilot/auth/poll
{ status: 'pending' | 'success' | 'expired', token?: string, error?: string }

// DELETE /copilot/auth
{ ok: true }

// GET /copilot/auth/status
{ authenticated: boolean, error?: string }
```

## Dependencies

- Uses `startDeviceFlow` and `pollForToken` from `./copilot-oauth` (Task 1)
- Uses `getStoredToken`, `storeToken`, `clearToken` from `./copilot` (Task 2)

## Verification

- Ran `npx tsx --eval "import './server'"` - imports successfully
- All endpoints follow existing patterns in server.ts (error handling, JSON responses)
- Module-level session tracking allows stateful device flow across poll requests

## Notes for Next Tasks

- The frontend (Task 5) can use these endpoints to implement the auth flow
- Poll endpoint does one poll attempt per call - frontend should call repeatedly with interval
- Session expires after GitHub's timeout (usually 900s) - tracked via `expiresAt`
