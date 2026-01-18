import React, { useMemo, useRef } from 'react';
import { StyleSheet, Pressable, Animated, ColorValue } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/components/AppText';
import { systemColors } from '@/lib/colors';
import { ThemeColors, useTheme } from '@/lib/useTheme';
import { Trash2 } from 'lucide-react-native';

type SwipeableRowProps = {
  children: React.ReactNode;
  onLeftAction?: () => void;
  onRightAction?: () => void;
  leftActionLabel?: string;
  rightActionLabel?: string;
  leftActionIcon?: React.ReactNode;
  rightActionIcon?: React.ReactNode;
  leftActionColor?: ColorValue;
  rightActionColor?: ColorValue;
  triggerOnSwipe?: boolean;
};

export function SwipeableRow({
  children,
  onLeftAction,
  onRightAction,
  leftActionLabel = 'Action',
  rightActionLabel,
  leftActionIcon,
  rightActionIcon,
  leftActionColor = systemColors.blue,
  rightActionColor = systemColors.red,
  triggerOnSwipe = false,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const swipeableRef = useRef<Swipeable>(null);

  const handleRightAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onRightAction?.();
  };

  const handleLeftAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    onLeftAction?.();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onRightAction) return null;

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [96, 0],
    });

    return (
      <Animated.View style={[styles.rightAction, { transform: [{ translateX }] }]}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: rightActionColor }]}
          onPress={handleRightAction}
        >
          {rightActionIcon ||
            (rightActionLabel ? (
              <AppText variant="label" style={styles.actionText}>
                {rightActionLabel}
              </AppText>
            ) : (
              <Trash2 size={20} color={colors.accentText} />
            ))}
        </Pressable>
      </Animated.View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onLeftAction) return null;

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-96, 0],
    });

    return (
      <Animated.View style={[styles.leftAction, { transform: [{ translateX }] }]}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: leftActionColor }]}
          onPress={handleLeftAction}
        >
          {leftActionIcon || (
            <AppText variant="label" style={styles.actionText}>
              {leftActionLabel}
            </AppText>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
      renderRightActions={onRightAction ? renderRightActions : undefined}
      renderLeftActions={onLeftAction ? renderLeftActions : undefined}
      onSwipeableWillOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onSwipeableOpen={(direction) => {
        if (!triggerOnSwipe) return;
        if (direction === 'left') {
          handleRightAction();
        } else if (direction === 'right') {
          handleLeftAction();
        }
      }}
    >
      {children}
    </Swipeable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  actionButton: {
    width: 96,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: colors.accentText,
    fontWeight: '600',
  },
});
