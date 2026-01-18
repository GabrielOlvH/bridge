import { DefaultTheme } from '@react-navigation/native';
import { systemColors, hostColors } from './colors';

/**
 * @deprecated Use systemColors from './colors' for native iOS feel.
 * Kept for backwards compatibility during migration.
 */
export const palette = {
  ink: '#1A1A1A',
  muted: '#666666',
  line: '#E5E5E5',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  surfaceSoft: '#FAFAFA',
  accent: '#1A1A1A',
  accentStrong: '#000000',
  clay: '#FF3B30',
  blue: '#007AFF',
  gold: '#FF9500',
  mint: '#E8F5E9',
  blush: '#FFF3E0',
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
 * Returns theme colors based on dark mode state.
 */
export function getNavTheme(isDark: boolean) {
  return {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: isDark ? '#FFFFFF' : palette.accent,
      background: isDark ? '#000000' : '#F7F3EB',
      card: isDark ? '#1C1C1E' : palette.surface,
      text: isDark ? '#FFFFFF' : palette.ink,
      border: isDark ? '#38383A' : palette.line,
      notification: isDark ? '#0A84FF' : palette.blue,
    },
  };
}
