import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { HostForm } from '@/components/HostForm';
import { useStore } from '@/lib/store';
import { theme } from '@/lib/theme';

export default function NewHostScreen() {
  const router = useRouter();
  const { upsertHost } = useStore();

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <AppText variant="subtitle">Back</AppText>
        </Pressable>
        <View>
          <AppText variant="caps" tone="muted">
            New Host
          </AppText>
          <AppText variant="title">Add a tmux agent</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  back: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
});
