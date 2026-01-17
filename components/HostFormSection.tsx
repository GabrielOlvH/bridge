import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/AppText';
import { theme } from '@/lib/theme';
import { ThemeColors, useTheme } from '@/lib/useTheme';

export function HostConnectionSelector({
  value,
  onChange,
}: {
  value: 'ssh' | 'mosh';
  onChange: (value: 'ssh' | 'mosh') => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  segmentActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  segmentText: {
    color: colors.textMuted,
  },
  segmentActiveText: {
    color: colors.accentText,
  },
});
