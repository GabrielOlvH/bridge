import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

import { useStore } from '@/lib/store';
import { getCopilotAuthStatus, logoutCopilot, getUsage } from '@/lib/api';
import type { ProviderUsage } from '@/lib/types';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { theme } from '@/lib/theme';
import { ThemeColors, useTheme } from '@/lib/useTheme';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  chevronColor: string;
}

function MenuItem({ title, subtitle, onPress, styles, chevronColor }: MenuItemProps) {
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
      <ChevronRight size={20} color={chevronColor} />
    </Pressable>
  );
}

interface ToggleItemProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}

function ToggleItem({ title, subtitle, value, onValueChange, styles, colors }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.menuItemContent}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle && (
          <AppText variant="label" tone="muted">
            {subtitle}
          </AppText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.separator, true: colors.accent }}
        thumbColor={colors.card}
        ios_backgroundColor={colors.separator}
      />
    </View>
  );
}

export default function MoreTabScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { hosts, preferences, updateUsageCardVisibility } = useStore();
  const host = hosts[0];

  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotAuthenticated, setCopilotAuthenticated] = useState(false);
  const [copilotUsage, setCopilotUsage] = useState<ProviderUsage | null>(null);

  const fetchCopilotStatus = useCallback(async () => {
    if (!host) return;
    setCopilotLoading(true);
    try {
      const [statusRes, usageRes] = await Promise.all([
        getCopilotAuthStatus(host),
        getUsage(host),
      ]);
      setCopilotAuthenticated(statusRes.authenticated);
      setCopilotUsage(usageRes.copilot ?? null);
    } catch {
      setCopilotAuthenticated(false);
      setCopilotUsage(null);
    } finally {
      setCopilotLoading(false);
    }
  }, [host]);

  useFocusEffect(
    useCallback(() => {
      fetchCopilotStatus();
    }, [fetchCopilotStatus])
  );

  const handleCopilotConnect = () => {
    if (!host) return;
    router.push(`/copilot/auth?hostId=${host.id}`);
  };

  const handleCopilotDisconnect = () => {
    if (!host) return;
    Alert.alert(
      'Disconnect Copilot',
      'Are you sure you want to disconnect GitHub Copilot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setCopilotLoading(true);
            try {
              await logoutCopilot(host);
              setCopilotAuthenticated(false);
              setCopilotUsage(null);
            } catch {
              Alert.alert('Error', 'Failed to disconnect Copilot');
            } finally {
              setCopilotLoading(false);
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <MenuItem
            title="Projects"
            subtitle="Quick-launch commands and agents"
            onPress={() => router.push('/projects')}
            styles={styles}
            chevronColor={colors.textSecondary}
          />
          <View style={styles.separator} />
          <MenuItem
            title="Ports"
            subtitle="View and manage active ports"
            onPress={() => router.push('/ports')}
            styles={styles}
            chevronColor={colors.textSecondary}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.copilotItem}>
            <View style={styles.menuItemContent}>
              <AppText variant="subtitle">GitHub Copilot</AppText>
              {copilotLoading ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : copilotAuthenticated ? (
                <>
                  <AppText variant="label" tone="accent">Connected</AppText>
                  {copilotUsage && (
                    <AppText variant="label" tone="muted">
                      Premium: {copilotUsage.session?.percentLeft ?? '—'}% • Chat: {copilotUsage.weekly?.percentLeft ?? '—'}%
                    </AppText>
                  )}
                </>
              ) : (
                <AppText variant="label" tone="muted">Not connected</AppText>
              )}
            </View>
            <Pressable
              onPress={copilotAuthenticated ? handleCopilotDisconnect : handleCopilotConnect}
              disabled={copilotLoading || !host}
              style={styles.copilotButton}
            >
              <AppText variant="caps" tone={copilotAuthenticated ? 'clay' : 'accent'}>
                {copilotAuthenticated ? 'Disconnect' : 'Connect'}
              </AppText>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle">Main page usage</AppText>
            <AppText variant="label" tone="muted">
              Choose which provider cards appear on the Sessions tab.
            </AppText>
          </View>
          <View style={styles.separator} />
          <ToggleItem
            title="Claude Code"
            subtitle="No setup required"
            value={preferences.usageCards.claude}
            onValueChange={(value) => updateUsageCardVisibility({ claude: value })}
            styles={styles}
            colors={colors}
          />
          <View style={styles.separator} />
          <ToggleItem
            title="Codex"
            subtitle="No setup required"
            value={preferences.usageCards.codex}
            onValueChange={(value) => updateUsageCardVisibility({ codex: value })}
            styles={styles}
            colors={colors}
          />
          <View style={styles.separator} />
          <ToggleItem
            title="GitHub Copilot"
            subtitle="Show usage card"
            value={preferences.usageCards.copilot}
            onValueChange={(value) => updateUsageCardVisibility({ copilot: value })}
            styles={styles}
            colors={colors}
          />
        </Card>

        <Card style={styles.card}>
          <MenuItem
            title="Settings"
            subtitle="App preferences"
            onPress={() => {
              // TODO: Navigate to settings when implemented
            }}
            styles={styles}
            chevronColor={colors.textSecondary}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    backgroundColor: colors.separator,
    marginHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    padding: theme.spacing.md,
    gap: 2,
  },
  copilotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  copilotButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
});
