import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { systemColors } from '@/lib/colors';

type PillTone = 'neutral' | 'success' | 'error' | 'warning' | 'info';

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  const colors = {
    neutral: {
      background: systemColors.secondaryBackground,
      text: systemColors.label,
    },
    success: {
      background: systemColors.green,
      text: systemColors.label,
    },
    error: {
      background: systemColors.red,
      text: systemColors.label,
    },
    warning: {
      background: systemColors.orange,
      text: systemColors.label,
    },
    info: {
      background: systemColors.blue,
      text: systemColors.label,
    },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: colors.background }]}>
      <AppText variant="caps" style={{ color: colors.text }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
