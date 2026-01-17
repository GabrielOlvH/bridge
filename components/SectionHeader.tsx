import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { ThemeColors, useTheme } from '@/lib/useTheme';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
  },
});
