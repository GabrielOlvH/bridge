import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type TerminalHeaderButtonGroupProps = {
  side: 'left' | 'right';
  children: React.ReactNode;
  borderColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_BORDER_COLOR = '#1E2226';
const DEFAULT_BG_COLOR = '#0B0D0F';

export function TerminalHeaderButtonGroup({
  children,
  side,
  borderColor = DEFAULT_BORDER_COLOR,
  backgroundColor = DEFAULT_BG_COLOR,
  style,
}: TerminalHeaderButtonGroupProps) {
  const isLeft = side === 'left';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor: borderColor,
          borderRightColor: isLeft ? borderColor : 'transparent',
          borderLeftColor: isLeft ? 'transparent' : borderColor,
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
