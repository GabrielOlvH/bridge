import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/lib/useTheme';

const textStyles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'System',
      default: 'SpaceGrotesk_700Bold',
    }),
    fontWeight: '700',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'System',
      default: 'SpaceGrotesk_600SemiBold',
    }),
    fontWeight: '600',
    fontSize: 18,
  },
  body: {
    fontFamily: Platform.select({
      ios: 'System',
      default: 'SpaceGrotesk_400Regular',
    }),
    fontWeight: '400',
    fontSize: 15,
  },
  label: {
    fontFamily: Platform.select({
      ios: 'System',
      default: 'SpaceGrotesk_500Medium',
    }),
    fontWeight: '500',
    fontSize: 13,
    letterSpacing: 0.4,
  },
  mono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      default: 'JetBrainsMono_500Medium',
    }),
    fontWeight: '500',
    fontSize: 12,
  },
  caps: {
    fontFamily: Platform.select({
      ios: 'System',
      default: 'SpaceGrotesk_600SemiBold',
    }),
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});

export type AppTextProps = TextProps & {
  variant?: keyof typeof textStyles;
  tone?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'error'
    | 'warning'
    | 'ink'
    | 'muted'
    | 'clay';
};

export function AppText({ variant = 'body', tone = 'primary', style, ...props }: AppTextProps) {
  const { colors } = useTheme();

  const toneColor = {
    primary: colors.text,
    secondary: colors.textSecondary,
    accent: colors.blue,
    success: colors.green,
    error: colors.red,
    warning: colors.orange,
    ink: colors.text,
    muted: colors.textMuted,
    clay: colors.orange,
  }[tone];

  return (
    <Text
      {...props}
      style={[textStyles[variant], { color: toneColor }, style]}
    />
  );
}
