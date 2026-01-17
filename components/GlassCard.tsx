import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { theme } from '@/lib/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Glass effect style - 'regular' has more opacity, 'clear' is more transparent */
  glassStyle?: 'regular' | 'clear';
  /** Whether the glass should respond to touch (iOS 26+ only) */
  isInteractive?: boolean;
  /** Disable glass effect and render as regular View */
  disabled?: boolean;
};

/**
 * A card component that uses native iOS Liquid Glass effect on iOS 26+,
 * falls back to BlurView on older iOS, and semi-transparent on Android.
 */
export function GlassCard({
  children,
  style,
  glassStyle = 'regular',
  isInteractive = false,
  disabled = false,
}: GlassCardProps) {
  const baseStyle = [styles.card, style];

  // If disabled, render as regular View
  if (disabled) {
    return <View style={[baseStyle, styles.solidFallback]}>{children}</View>;
  }

  // iOS 26+ with Liquid Glass
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        style={baseStyle}
        glassEffectStyle={glassStyle}
        isInteractive={isInteractive}
      >
        {children}
      </GlassView>
    );
  }

  // iOS < 26: Use BlurView with light tint
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={60}
        tint="systemThinMaterialLight"
        style={[baseStyle, styles.blurFallback]}
      >
        {children}
      </BlurView>
    );
  }

  // Android: Semi-transparent with subtle background
  return (
    <View style={[baseStyle, styles.androidFallback]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  solidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    ...theme.shadow.card,
  },
  blurFallback: {
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    ...theme.shadow.card,
  },
});
