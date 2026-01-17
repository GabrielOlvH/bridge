import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { palette, theme } from '@/lib/theme';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function MenuItem({ title, subtitle, onPress }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle && (
          <AppText variant="label" tone="muted">
            {subtitle}
          </AppText>
        )}
      </View>
      <ChevronRight size={20} color={palette.muted} />
    </Pressable>
  );
}

export default function MoreTabScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GlassCard style={styles.card}>
          <MenuItem
            title="Projects"
            subtitle="Quick-launch commands and agents"
            onPress={() => router.push('/projects')}
          />
          <View style={styles.separator} />
          <MenuItem
            title="Ports"
            subtitle="View and manage active ports"
            onPress={() => router.push('/ports')}
          />
          <View style={styles.separator} />
          <MenuItem
            title="Keybinds"
            subtitle="Terminal keyboard shortcuts"
            onPress={() => router.push('/keybinds')}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <MenuItem
            title="Settings"
            subtitle="App preferences"
            onPress={() => {
              // TODO: Navigate to settings when implemented
            }}
          />
        </GlassCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
    gap: 2,
  },
  separator: {
    height: 1,
    backgroundColor: palette.line,
    marginHorizontal: theme.spacing.md,
  },
});
