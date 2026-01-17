import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/AppText';
import { palette, theme } from '@/lib/theme';

export function HostConnectionSelector({
  value,
  onChange,
}: {
  value: 'ssh' | 'mosh';
  onChange: (value: 'ssh' | 'mosh') => void;
}) {
  return (
    <View style={styles.segment}>
      <AppText variant="label" style={styles.segmentLabel}>
        Connection
      </AppText>
      <View style={styles.segmentRow}>
        <Pressable
          onPress={() => onChange('ssh')}
          style={[styles.segmentButton, value === 'ssh' && styles.segmentActive]}
        >
          <AppText variant="caps" style={value === 'ssh' ? styles.segmentActiveText : styles.segmentText}>
            SSH
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => onChange('mosh')}
          style={[styles.segmentButton, value === 'mosh' && styles.segmentActive]}
        >
          <AppText variant="caps" style={value === 'mosh' ? styles.segmentActiveText : styles.segmentText}>
            MOSH
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    marginBottom: theme.spacing.sm,
  },
  segmentLabel: {
    marginBottom: 6,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    backgroundColor: palette.surface,
  },
  segmentActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accentStrong,
  },
  segmentText: {
    color: palette.muted,
  },
  segmentActiveText: {
    color: '#FFFFFF',
  },
});
