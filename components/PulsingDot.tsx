import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

type PulsingDotProps = {
  color: string;
  active?: boolean;
  size?: number;
  style?: ViewStyle;
};

export function PulsingDot({
  color,
  active = false,
  size = 8,
  style,
}: PulsingDotProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withTiming(0.4, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      scale.value = withRepeat(
        withTiming(1.15, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [active, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  return (
    <Animated.View style={[styles.container, dotStyle, style, animatedStyle]} />
  );
}

type StatusDotProps = {
  status: 'online' | 'offline' | 'checking' | 'running' | 'idle' | 'stopped';
  size?: number;
  style?: ViewStyle;
  colors?: {
    online?: string;
    offline?: string;
    checking?: string;
    running?: string;
    idle?: string;
    stopped?: string;
  };
};

const defaultStatusColors = {
  online: '#34C759',
  running: '#34C759',
  offline: '#FF3B30',
  stopped: '#8E8E93',
  checking: '#FF9500',
  idle: '#FF9500',
};

export function StatusDot({
  status,
  size = 8,
  style,
  colors,
}: StatusDotProps) {
  const mergedColors = { ...defaultStatusColors, ...colors };
  const color = mergedColors[status] || mergedColors.checking;
  const isActive = status === 'online' || status === 'running' || status === 'checking';

  return (
    <PulsingDot
      color={color}
      active={isActive}
      size={size}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
});
