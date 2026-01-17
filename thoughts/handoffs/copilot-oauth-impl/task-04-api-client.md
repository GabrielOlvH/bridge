# Task 4: API Client Methods - Completed

## Summary

Added 4 API client methods to `lib/api.ts` for Copilot OAuth operations.

## Changes Made

### File Modified

`/home/gabrielolv/Documents/Projects/ter/lib/api.ts` (lines 204-236)

### Types Added

```typescript
export type CopilotAuthStartResponse = {
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
};

export type CopilotAuthPollResponse = {
  status: 'pending' | 'success' | 'expired';
  token?: string;
  error?: string;
};

export type CopilotAuthStatusResponse = {
  authenticated: boolean;
  error?: string;
};
```

### Functions Added

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `startCopilotAuth(host)` | POST | `/copilot/auth/start` | Initiates OAuth device flow |
| `pollCopilotAuth(host)` | GET | `/copilot/auth/poll` | Polls for auth completion |
| `getCopilotAuthStatus(host)` | GET | `/copilot/auth/status` | Checks if authenticated |
| `logoutCopilot(host)` | DELETE | `/copilot/auth` | Clears stored token |

## Verification

- TypeScript compilation: PASS (`npx tsc --noEmit`)
- Linting: PASS (oxlint shows 1 pre-existing warning unrelated to changes)

## Usage Example

```typescript
import {
  startCopilotAuth,
  pollCopilotAuth,
  getCopilotAuthStatus,
  logoutCopilot
} from '@/lib/api';

// Start auth
const { userCode, verificationUri } = await startCopilotAuth(host);
console.log(`Go to ${verificationUri} and enter: ${userCode}`);

// Poll for completion
const result = await pollCopilotAuth(host);
if (result.status === 'success') {
  console.log('Authenticated!');
}

// Check status
const status = await getCopilotAuthStatus(host);
console.log('Authenticated:', status.authenticated);

// Logout
await logoutCopilot(host);
```

## Dependencies

- Requires Task 3 (server endpoints) to be implemented for these to work
- No additional npm dependencies needed

## Next Steps

Task 5 can now implement the UI components using these API methods.
