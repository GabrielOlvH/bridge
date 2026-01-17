import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

export function FadeIn({
  children,
  delay = 0,
  style,
  skip = false,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  skip?: boolean;
}) {
  const skipOpacity = isLiquidGlassAvailable();
  const opacity = useRef(new Animated.Value(skip || skipOpacity ? 1 : 0)).current;
  const translate = useRef(new Animated.Value(skip ? 0 : 12)).current;

  useEffect(() => {
    if (skip) return;
    const animations = [
      Animated.spring(translate, {
        toValue: 0,
        speed: 12,
        bounciness: 4,
        delay,
        useNativeDriver: true,
      }),
    ];
    if (!skipOpacity) {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          delay,
          useNativeDriver: true,
        })
      );
    }
    Animated.parallel(animations).start();
  }, [delay, opacity, translate, skip, skipOpacity]);

  if (skip) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY: translate }] }]}>
      {children}
    </Animated.View>
  );
}
