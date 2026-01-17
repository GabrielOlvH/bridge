import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { palette } from '@/lib/theme';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: palette.ink,
  },
});
