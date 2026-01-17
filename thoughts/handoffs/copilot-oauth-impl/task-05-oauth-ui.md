# Task 05: OAuth UI Screen - Completed

## Summary

Created the GitHub Copilot OAuth Device Flow authentication screen at `/home/gabrielolv/Documents/Projects/ter/app/copilot/auth.tsx`.

## Implementation Details

### File Created

- **Path**: `app/copilot/auth.tsx`
- **Route**: `/copilot/auth?hostId=<host-id>`

### State Machine

The screen uses a discriminated union type for auth state:

```typescript
type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'showing_code'; data: CopilotAuthStartResponse }
  | { status: 'polling'; data: CopilotAuthStartResponse }
  | { status: 'success' }
  | { status: 'error'; message: string };
```

### Flow

1. **On Mount**: Automatically calls `startCopilotAuth(host)` to initiate the OAuth flow
2. **Showing Code**: Displays the user code prominently with copy-to-clipboard functionality
3. **Open GitHub**: When user taps "Open GitHub", opens `verificationUri` in browser and starts polling
4. **Polling**: Polls at the interval specified by the server (minimum 5 seconds) for authorization status
5. **Success**: Shows success feedback and navigates back after 1.5 seconds
6. **Error/Expired**: Shows error message with retry option

### Features

- **Large User Code Display**: 32px monospace font with letter spacing for readability
- **Copy to Clipboard**: Tap the code box to copy (uses expo-clipboard)
- **Visual Feedback**: "Copied!" indicator on successful copy
- **Open in Browser**: Uses `Linking.openURL()` to open verification URL
- **Automatic Expiry**: Sets timeout based on `expiresIn` from server response
- **Loading States**: ActivityIndicator during initial load and polling
- **Error Handling**: Graceful error display with retry option

### Dependencies Used

- `expo-clipboard` - For copy functionality
- `expo-router` - For navigation (useLocalSearchParams, useRouter)
- `react-native` - Linking, ActivityIndicator, Pressable, etc.

### Navigation

To navigate to this screen:
```typescript
router.push(`/copilot/auth?hostId=${host.id}`);
```

### UI Components Used

- `Screen` - Wrapper component
- `AppText` - Typography (title, subtitle, body, label, caps, mono variants)
- Custom styled components following the app's design system

## Testing Notes

To test:
1. Navigate to a host settings page
2. Add a button/link that navigates to `/copilot/auth?hostId=<id>`
3. Verify the flow:
   - User code is displayed
   - Code can be copied
   - "Open GitHub" opens the browser
   - Polling starts and detects success/failure
   - Success navigates back

## Next Steps

- Task 6: Add Copilot auth status indicator and login button to Settings/Host detail screens
- Task 7: Wire up completions to terminal input if authenticated
