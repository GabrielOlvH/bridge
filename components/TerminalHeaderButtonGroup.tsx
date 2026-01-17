import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/useTheme';

type TerminalHeaderButtonGroupProps = {
  side: 'left' | 'right';
  children: React.ReactNode;
  borderColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function TerminalHeaderButtonGroup({
  children,
  side,
  borderColor,
  backgroundColor,
  style,
}: TerminalHeaderButtonGroupProps) {
  const { colors } = useTheme();
  const resolvedBorderColor = borderColor ?? colors.terminalBorder;
  const resolvedBackgroundColor = backgroundColor ?? colors.terminalBackground;
  const isLeft = side === 'left';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: resolvedBackgroundColor,
          borderBottomColor: resolvedBorderColor,
          borderRightColor: isLeft ? resolvedBorderColor : 'transparent',
          borderLeftColor: isLeft ? 'transparent' : resolvedBorderColor,
        },
        isLeft ? styles.left : styles.right,
        style,
      ]}
    >
      <View style={styles.row}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  left: {
    paddingLeft: 4,
    paddingRight: 8,
    borderRightWidth: 1,
  },
  right: {
    paddingRight: 4,
    paddingLeft: 8,
    borderLeftWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});
