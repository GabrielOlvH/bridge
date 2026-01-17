import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { HostForm } from '@/components/HostForm';
import { useStore } from '@/lib/store';
import { theme } from '@/lib/theme';

export default function EditHostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { hosts, upsertHost } = useStore();
  const host = hosts.find((item) => item.id === params.id);

  if (!host) {
    return (
      <Screen>
        <AppText variant="title">Host not found</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <AppText variant="subtitle">Back</AppText>
        </Pressable>
        <View>
          <AppText variant="caps" tone="muted">
            Edit Host
          </AppText>
          <AppText variant="title">{host.name}</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HostForm
          initial={host}
          submitLabel="Update Host"
          onSubmit={async (draft) => {
            await upsertHost(draft, host.id);
            router.back();
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
