# Plan: Copilot OAuth Device Flow + Usage Display

## Goal

Add GitHub Copilot authentication via OAuth Device Flow and display usage metrics in the app. Currently, the app can only use Copilot if a token already exists (from VS Code extension or gh CLI). This plan adds the ability to authenticate new devices directly from the app.

## Technical Choices

- **OAuth Flow**: GitHub Device Flow (RFC 8628) - same as VS Code uses
- **Client ID**: `Iv1.b507a08c87ecfe98` (VS Code's public client ID)
- **Token Storage**: File-based in agent home directory (`~/.ter/copilot-token`)
- **Scope**: `read:user` (minimal scope for usage API access)
- **UI Pattern**: Bottom sheet with QR code + manual code entry option

## Current State Analysis

### What Exists:
- `agent/copilot.ts` - Fetches usage from `https://api.github.com/copilot_internal/user`, but has legacy token resolution methods (env vars, config files, gh CLI) that don't work and will be removed
- `agent/usage.ts` - Aggregates all provider usage (codex, claude, copilot, cursor)
- `lib/types.ts` - `ProviderUsage` and `SessionInsights` types already include copilot
- `components/SessionCard.tsx` - Shows agent state and git info, but NOT usage metrics

### Key Files:
- `agent/copilot.ts` - Token resolution and usage fetching
- `agent/server.ts` - Hono API endpoints
- `agent/state.ts` - OAuth cache management
- `lib/types.ts` - Type definitions
- `lib/storage.ts` - AsyncStorage helpers
- `components/SessionCard.tsx` - Session display component
- `app/(tabs)/more.tsx` - Settings/More screen

### Reference Implementation (CodexBar):
- `CopilotDeviceFlow.swift` - Device flow OAuth implementation
- `CopilotTokenStore.swift` - Keychain token storage
- `CopilotUsageFetcher.swift` - Usage API calls

## Tasks

### Task 1: Add Device Flow OAuth to Agent

Add GitHub OAuth Device Flow to the agent for authenticating new devices.

- [ ] Create `agent/copilot-oauth.ts` with device flow logic
- [ ] Implement `requestDeviceCode()` - POST to `/login/device/code`
- [ ] Implement `pollForToken()` - Poll `/login/oauth/access_token` with exponential backoff
- [ ] Handle error states: `authorization_pending`, `slow_down`, `expired_token`

**Files to create:**
- `agent/copilot-oauth.ts`

**Implementation details:**
```typescript
// Endpoints
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const CLIENT_ID = 'Iv1.b507a08c87ecfe98';
const SCOPE = 'read:user';

// DeviceCodeResponse
type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
};
```

### Task 2: Add Token Storage + Remove Legacy Methods

Store the OAuth token persistently and remove the non-working legacy token resolution methods.

- [ ] Create token file path: `~/.ter/copilot-token`
- [ ] Add `loadStoredToken()` function
- [ ] Add `storeToken()` function
- [ ] **Remove** `resolveCopilotToken()` function entirely
- [ ] **Remove** env var check (`COPILOT_API_TOKEN`)
- [ ] **Remove** config file checks (`~/.config/github-copilot/hosts.json`, etc.)
- [ ] **Remove** gh CLI token check (`gh auth token`)
- [ ] Replace with simple `getStoredToken()` that only reads from `~/.ter/copilot-token`

**Files to modify:**
- `agent/copilot.ts`

### Task 3: Add Server Endpoints for OAuth

Expose OAuth flow via HTTP endpoints that the app can call.

- [ ] `POST /copilot/auth/start` - Initiate device flow, return user_code + verification_uri
- [ ] `GET /copilot/auth/poll` - Poll for token completion status
- [ ] `DELETE /copilot/auth` - Remove stored token (logout)
- [ ] `GET /copilot/auth/status` - Check if authenticated

**Files to modify:**
- `agent/server.ts`

**Endpoint specs:**
```
POST /copilot/auth/start
Response: { userCode, verificationUri, expiresIn, interval }

GET /copilot/auth/poll
Response: { status: 'pending' | 'success' | 'expired', token?: string }

DELETE /copilot/auth
Response: { ok: true }

GET /copilot/auth/status
Response: { authenticated: boolean, error?: string }
```

### Task 4: Add API Client Methods

Add methods to the app's API client for OAuth operations.

- [ ] Add `startCopilotAuth()` method
- [ ] Add `pollCopilotAuth()` method
- [ ] Add `getCopilotAuthStatus()` method
- [ ] Add `logoutCopilot()` method

**Files to modify:**
- `lib/api.ts`

### Task 5: Create OAuth UI Screen

Create a screen for the Copilot authentication flow.

- [ ] Create `app/copilot/auth.tsx` screen
- [ ] Display user code prominently
- [ ] Show verification URL with "Open in Browser" button
- [ ] Poll for completion in background
- [ ] Show success state and redirect to settings

**Files to create:**
- `app/copilot/auth.tsx`

**UI Components:**
- Large user code display (e.g., "XXXX-XXXX")
- Verification URL link
- "Open GitHub" button (uses Linking.openURL)
- Loading spinner while polling
- Success/error feedback

### Task 6: Add Copilot Settings Section

Add Copilot section to the More/Settings screen.

- [ ] Add "Copilot" menu item to `more.tsx`
- [ ] Show authentication status (authenticated/not authenticated)
- [ ] Show usage metrics if authenticated (session %, weekly %)
- [ ] Add "Connect" button if not authenticated
- [ ] Add "Disconnect" button if authenticated

**Files to modify:**
- `app/(tabs)/more.tsx`

### Task 7: Display Usage in Session Insights

Show Copilot usage metrics alongside other session info.

- [ ] Add usage pills to `SessionCard.tsx` (optional, if screen space allows)
- [ ] Consider adding to session detail screen instead

**Files to modify:**
- `components/SessionCard.tsx` (optional)
- `app/session/[hostId]/[name]/index.tsx`

## Success Criteria

### Automated Verification:
- [ ] Type check: `pnpm typecheck`
- [ ] Lint: `pnpm lint`
- [ ] Build agent: `cd agent && pnpm build`

### Manual Verification:
- [ ] Can initiate OAuth flow from app
- [ ] User code displays correctly
- [ ] Browser opens to GitHub verification page
- [ ] Token stored after authorization
- [ ] Usage displays in settings
- [ ] Can logout and re-authenticate
- [ ] Works on fresh device (no existing tokens)

## Out of Scope

- **Token refresh** - GitHub OAuth tokens don't expire, so no refresh needed
- **Multiple accounts** - Single Copilot account per device
- **Copilot Chat integration** - Only usage display, not chat features
- **Keychain/Secure storage** - Using file storage for simplicity (can upgrade later)

## Risks (Pre-Mortem)

### Tigers:
- **VS Code client ID may be revoked** (LOW)
  - Mitigation: This is the public client ID used by many tools, unlikely to be revoked

- **GitHub API changes** (LOW)
  - Mitigation: Using same endpoints/headers as VS Code extension

### Elephants:
- **UX for device flow** (MEDIUM)
  - Users must switch to browser, may be confusing
  - Note: Consider adding QR code for easier mobile→desktop flow

## File Summary

| File | Action |
|------|--------|
| `agent/copilot-oauth.ts` | CREATE - Device flow implementation |
| `agent/copilot.ts` | MODIFY - Remove legacy token methods, add file-based storage |
| `agent/server.ts` | MODIFY - Add OAuth endpoints |
| `lib/api.ts` | MODIFY - Add OAuth client methods |
| `app/copilot/auth.tsx` | CREATE - OAuth UI screen |
| `app/(tabs)/more.tsx` | MODIFY - Add Copilot settings section |
| `components/SessionCard.tsx` | MODIFY (optional) - Add usage display |
