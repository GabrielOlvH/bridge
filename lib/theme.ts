import { DefaultTheme } from '@react-navigation/native';
import { systemColors, hostColors } from './colors';

/**
 * @deprecated Use systemColors from './colors' for native iOS feel.
 * Kept for backwards compatibility during migration.
 */
export const palette = {
  ink: '#1B1B1F',
  muted: '#6E6A62',
  line: '#E4DED5',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F1E8',
  surfaceSoft: '#F2ECE2',
  accent: '#2F6F66',
  accentStrong: '#1F524B',
  clay: '#C75B39',
  blue: '#4F6FA9',
  gold: '#D0A03A',
  mint: '#CFE7DF',
  blush: '#F4E2D6',
};

/**
 * @deprecated Use hostColors from './colors' for native iOS system colors.
 */
export const hostAccents = [palette.accent, palette.clay, palette.blue, palette.gold];

// Re-export new system colors for easy access
export { systemColors, hostColors } from './colors';

export const theme = {
  radii: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 36,
  },
  shadow: {
    card: {
      shadowColor: '#1B1B1F',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
  },
};

/**
 * Navigation theme for React Navigation.
 * Note: React Navigation's Theme type requires string colors,
 * so we use the palette fallbacks here. For components that support
 * PlatformColor, use systemColors directly.
 */
export const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.accent,
    background: '#F7F3EB',
    card: palette.surface,
    text: palette.ink,
    border: palette.line,
    notification: palette.clay,
  },
};
