# Task 2: Token Storage + Remove Legacy Methods

## Status: COMPLETE

## Summary

Modified `agent/copilot.ts` to replace legacy multi-source token resolution with simple file-based token storage at `~/.ter/copilot-token`.

## Changes Made

### Removed

1. **`execFileSync` import** - No longer needed (was used for `gh auth token`)
2. **`CopilotHostEntry` type** - No longer needed (was used for parsing hosts.json)
3. **`resolveCopilotToken()` function** - Removed entirely. This function previously:
   - Checked `COPILOT_API_TOKEN` env var
   - Searched 4 config file locations (`~/.config/github-copilot/hosts.json`, etc.)
   - Parsed `~/.config/gh/hosts.yml` for oauth_token
   - Ran `gh auth token` CLI command

### Added

1. **Token path constants**:
   ```typescript
   const TOKEN_DIR = path.join(os.homedir(), '.ter');
   const TOKEN_FILE = path.join(TOKEN_DIR, 'copilot-token');
   ```

2. **`getStoredToken()`** - Reads token from file:
   ```typescript
   export function getStoredToken(): string | null {
     try {
       const token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
       return token || null;
     } catch {
       return null;
     }
   }
   ```

3. **`storeToken()`** - Writes token to file with secure permissions:
   ```typescript
   export async function storeToken(token: string): Promise<void> {
     await fs.promises.mkdir(TOKEN_DIR, { recursive: true });
     await fs.promises.writeFile(TOKEN_FILE, token, { mode: 0o600 });
   }
   ```

4. **`clearToken()`** - Deletes token file:
   ```typescript
   export async function clearToken(): Promise<void> {
     try {
       await fs.promises.unlink(TOKEN_FILE);
     } catch {}
   }
   ```

### Modified

- **`getCopilotStatus()`** - Now calls `getStoredToken()` instead of `resolveCopilotToken()`

## Exports Available for Task 3

The following functions are now exported from `agent/copilot.ts`:

| Function | Purpose |
|----------|---------|
| `getStoredToken()` | Check if user is authenticated |
| `storeToken(token)` | Store OAuth token after successful auth |
| `clearToken()` | Remove stored token (for logout) |
| `getCopilotStatus()` | Get Copilot usage status |

## Token File Location

- Directory: `~/.ter/`
- File: `~/.ter/copilot-token`
- Permissions: `0o600` (read/write only for owner)

## Verification

- TypeScript compilation: PASSED (`npx tsc --noEmit`)
- File reduced from ~100 lines to ~110 lines (cleaner, no complex token search logic)

## Dependencies for Next Task

Task 3 (CLI Commands) should import:
```typescript
import { getStoredToken, storeToken, clearToken, getCopilotStatus } from './copilot';
import { startDeviceFlow, completeDeviceFlow } from './copilot-oauth';
```

## Notes

- The `storeToken()` function creates `~/.ter/` directory if it doesn't exist
- Token file is created with `0o600` permissions for security
- `getStoredToken()` is synchronous (uses `fs.readFileSync`) for compatibility with existing `getCopilotStatus()` caching logic
- `storeToken()` and `clearToken()` are async (use `fs.promises`)
