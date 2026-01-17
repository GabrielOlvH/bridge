# Task 06: Native Components Update

## Status: COMPLETE

## Changes Made

### 1. components/Screen.tsx
- Removed LinearGradient and decorative shapes for cleaner native look
- Uses `systemColors.background` (PlatformColor on iOS, fallback on Android)
- StatusBar style adapts to color scheme (light/dark mode)
- Simplified styles, removed unused gradient/shape styles

### 2. components/AppText.tsx
- Uses system fonts on iOS (`System` for text, `Menlo` for mono)
- Keeps custom fonts on Android (SpaceGrotesk, JetBrainsMono)
- Uses `systemColors.label` and `systemColors.secondaryLabel` for text colors
- Maintains backward compatibility with old tones: `ink` -> `label`, `muted` -> `secondaryLabel`, `clay` -> `orange`
- New tones added: `primary`, `secondary`, `accent`, `success`, `error`, `warning`

### 3. components/Pill.tsx
- Uses `systemColors` for all colors
- Status-based colors:
  - `neutral`: secondaryBackground + label
  - `success`: systemGreen + white
  - `error`: systemRed + white
  - `warning`: systemOrange + white
  - `info`: systemBlue + white

### 4. components/SwipeableRow.tsx (NEW)
- Swipeable list row component using react-native-gesture-handler
- Right swipe: Delete action with red background + trash icon
- Left swipe: Custom action with blue background + label
- Haptic feedback on swipe and action press
- Auto-closes after action

## Files Modified
- `/home/gabrielolv/Documents/Projects/ter/components/Screen.tsx`
- `/home/gabrielolv/Documents/Projects/ter/components/AppText.tsx`
- `/home/gabrielolv/Documents/Projects/ter/components/Pill.tsx`

## Files Created
- `/home/gabrielolv/Documents/Projects/ter/components/SwipeableRow.tsx`

## Dependencies Used
- `react-native-gesture-handler` (already installed)
- `expo-haptics` (already installed)
- `@/lib/colors` (systemColors)

## Type Check
- Passed without errors

## Backwards Compatibility
- AppText supports both old (`ink`, `muted`, `clay`) and new (`primary`, `secondary`, etc.) tone values
- Pill adds `error` and `info` tones while keeping `neutral`, `success`, `warning`
