import React from 'react';
import { View, StyleSheet, ViewProps, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { systemColors } from '@/lib/colors';

export function Screen({
  children,
  style,
  variant = 'default',
  ...props
}: ViewProps & { variant?: 'default' | 'terminal' }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: variant === 'terminal' ? '#0B0D0F' : systemColors.background },
      ]}
      edges={variant === 'terminal' ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
    >
      <StatusBar style={variant === 'terminal' ? 'light' : isDark ? 'light' : 'dark'} />
      <View
        style={[
          styles.content,
          variant === 'terminal' && styles.contentTerminal,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  contentTerminal: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
});
