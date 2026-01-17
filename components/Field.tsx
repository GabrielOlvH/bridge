import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AppText } from '@/components/AppText';
import { palette, theme } from '@/lib/theme';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.container}>
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={palette.muted}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: palette.ink,
  },
});
