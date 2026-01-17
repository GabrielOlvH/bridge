# Task 6: Add Copilot Settings Section

## Status: COMPLETED

## Summary

Added GitHub Copilot settings section to the More tab screen (`app/(tabs)/more.tsx`). The section displays:
- Authentication status (Connected/Not connected)
- Usage metrics when authenticated (session % and weekly %)
- Connect/Disconnect button

## Changes Made

### File: `/home/gabrielolv/Documents/Projects/ter/app/(tabs)/more.tsx`

**Added imports:**
- `useState`, `useCallback` from React
- `ActivityIndicator`, `Alert` from React Native
- `useFocusEffect` from `@react-navigation/native`
- `useStore` from `@/lib/store`
- `getCopilotAuthStatus`, `logoutCopilot`, `getUsage` from `@/lib/api`
- `ProviderUsage` type from `@/lib/types`

**Added state:**
- `copilotLoading` - loading indicator state
- `copilotAuthenticated` - authentication status
- `copilotUsage` - usage metrics (ProviderUsage type)

**Added functions:**
- `fetchCopilotStatus()` - fetches auth status and usage from API
- `handleCopilotConnect()` - navigates to `/copilot/auth?hostId=...`
- `handleCopilotDisconnect()` - shows confirmation dialog, calls logout API

**Added UI:**
- New GlassCard section between the main menu and Settings
- Shows GitHub Copilot title
- Shows loading indicator during API calls
- Shows "Connected" with accent color when authenticated
- Shows usage metrics (Session: X% / Weekly: Y%) when available
- Shows "Not connected" when not authenticated
- Connect/Disconnect button (accent color for Connect, clay color for Disconnect)

**Added styles:**
- `copilotItem` - layout for the copilot section row
- `copilotButton` - padding for the button

## Implementation Details

### Screen Focus Behavior
Uses `useFocusEffect` from `@react-navigation/native` to refresh the Copilot status whenever the user navigates to the More tab. This ensures the status is updated after the user completes the OAuth flow on the auth screen.

### Host Selection
Currently uses `hosts[0]` as the default host. This aligns with the single-host flow in the auth screen.

### Error Handling
- API errors are caught and silently set status to not authenticated
- Disconnect errors show an Alert to the user
- Loading state prevents button spam

### Usage Display Format
```
Session: 75% / Weekly: 42%
```
Uses optional chaining with nullish coalescing to show "—" when data is unavailable.

## Dependencies

- Requires Task 4 (API client functions) to be completed
- Requires Task 5 (Auth screen at `/copilot/auth`) to be completed
- Uses existing `@react-navigation/native` package (already installed)

## Testing Checklist

- [ ] More tab loads without errors
- [ ] Shows "Not connected" when Copilot is not authenticated
- [ ] Connect button navigates to auth screen
- [ ] After auth, returning to More tab shows "Connected"
- [ ] Usage metrics display correctly when authenticated
- [ ] Disconnect button shows confirmation dialog
- [ ] Disconnect successfully logs out and updates status
- [ ] Loading indicator shows during API calls

## Notes

- TypeScript compilation shows pre-existing errors related to GlassCard module resolution, unrelated to these changes
- The implementation follows the existing code style and patterns in the codebase
