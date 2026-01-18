import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { HostForm } from '@/components/HostForm';
import { useStore } from '@/lib/store';
import { theme } from '@/lib/theme';
import { ThemeColors, useTheme } from '@/lib/useTheme';

export default function NewHostScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { upsertHost } = useStore();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="label" style={styles.backText}>Cancel</AppText>
        </Pressable>
        <AppText variant="subtitle" style={styles.headerTitle}>New Host</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HostForm
          onSubmit={async (draft) => {
            const host = await upsertHost(draft);
            router.replace(`/hosts/${host.id}`);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: theme.spacing.sm,
  },
  backText: {
    color: colors.blue,
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
});
