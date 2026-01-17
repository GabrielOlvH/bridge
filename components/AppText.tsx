import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { systemColors } from '@/lib/colors';

const styles = StyleSheet.create({
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
  variant?: keyof typeof styles;
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
  const toneColor = {
    primary: systemColors.label,
    secondary: systemColors.secondaryLabel,
    accent: systemColors.blue,
    success: systemColors.green,
    error: systemColors.red,
    warning: systemColors.orange,
    ink: systemColors.label,
    muted: systemColors.secondaryLabel,
    clay: systemColors.orange,
  }[tone];

  return (
    <Text
      {...props}
      style={[styles[variant], { color: toneColor }, style]}
    />
  );
}
