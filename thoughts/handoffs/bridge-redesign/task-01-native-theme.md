# Task 1: Native Theme System

## Status: complete

## Changes Made
- Created `lib/colors.ts` - New native theme system using PlatformColor
- Modified `lib/theme.ts` - Added deprecation notices and re-exports

## Implementation Notes

### lib/colors.ts
New file providing iOS native system colors with Android fallbacks:
- `systemColors` - Background, label, separator, and semantic colors (green, red, orange, blue, teal, purple, pink, indigo)
- `hostColors` - Array of 6 system colors for host accent differentiation
- `statusColors` - Semantic mapping for app states (running, stopped, idle, etc.)

Uses `PlatformColor()` on iOS for automatic dark mode support and native feel.

### lib/theme.ts
Updated to:
1. Import and re-export `systemColors` and `hostColors` from colors.ts
2. Added `@deprecated` JSDoc comments to `palette` and `hostAccents`
3. Added documentation comment to `navTheme` explaining why it still uses string colors (React Navigation type requirements)

### Backwards Compatibility
All existing code continues to work unchanged. Components can gradually migrate from:
- `palette.accent` -> `systemColors.teal` or appropriate semantic color
- `hostAccents` -> `hostColors`

### Dark Mode
iOS components using `systemColors` will automatically adapt to dark mode through PlatformColor. Android fallback colors are light-mode only (can be extended later with `Appearance` API if needed).

## Next Task
Task 2: Convert to Tab-Based Navigation
