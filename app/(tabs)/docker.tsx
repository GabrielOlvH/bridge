import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
  type ColorValue,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Play, Square, Terminal, ChevronDown, ChevronRight } from 'lucide-react-native';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { FadeIn } from '@/components/FadeIn';
import { Card } from '@/components/Card';
import { PulsingDot } from '@/components/PulsingDot';
import { SkeletonList } from '@/components/Skeleton';
import { hostColors, systemColors } from '@/lib/colors';
import {
  useAllDocker,
  ContainerWithHost,
  isContainerRunning,
  formatBytes,
} from '@/lib/docker-hooks';
import { dockerContainerAction } from '@/lib/api';
import { theme } from '@/lib/theme';
import { ThemeColors, useTheme } from '@/lib/useTheme';
import { Host } from '@/lib/types';
import { useStore } from '@/lib/store';

type ComposeGroup = {
  key: string;
  title: string;
  hostName: string;
  hostColor: string | undefined;
  containers: ContainerWithHost[];
  running: number;
  stopped: number;
  isStandalone: boolean;
};

export default function DockerTabScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ hostId?: string }>();
  const { ready } = useStore();
  const isFocused = useIsFocused();
  const {
    containers,
    running,
    stopped,
    refreshAll,
    refreshHost,
    hosts,
    isLoading,
    hasDocker,
  } = useAllDocker({ enabled: isFocused });

  const [manualRefresh, setManualRefresh] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const styles = useMemo(() => createStyles(colors), [colors]);

  const hostsWithContainers = useMemo(() => {
    const hostIds = new Set(containers.map((c) => c.host.id));
    return hosts.filter((h) => hostIds.has(h.id));
  }, [hosts, containers]);

  const composeGroups = useMemo(() => {
    const groups = new Map<string, ComposeGroup>();
    containers.forEach((container, index) => {
      const project = container.composeProject?.trim();
      const isStandalone = !project;
      const key = `${container.host.id}:${project || 'standalone'}`;
      const title = project || 'Standalone';
      const existing = groups.get(key);
      const target =
        existing ||
        ({
          key,
          title,
          hostName: container.host.name,
          hostColor: container.host.color,
          containers: [],
          running: 0,
          stopped: 0,
          isStandalone,
        } as ComposeGroup);

      target.containers.push(container);
      if (isContainerRunning(container)) {
        target.running += 1;
      } else {
        target.stopped += 1;
      }

      if (!existing) {
        groups.set(key, target);
      }
    });

    const sorted = Array.from(groups.values()).sort((a, b) => {
      if (a.isStandalone !== b.isStandalone) {
        return a.isStandalone ? 1 : -1;
      }
      return a.title.localeCompare(b.title);
    });

    sorted.forEach((group) => {
      group.containers.sort((a, b) => {
        const runningDelta = Number(isContainerRunning(b)) - Number(isContainerRunning(a));
        if (runningDelta !== 0) return runningDelta;
        return a.name.localeCompare(b.name);
      });
    });

    return sorted;
  }, [containers]);

  const handleRefresh = useCallback(() => {
    setManualRefresh(true);
    refreshAll();
    setTimeout(() => setManualRefresh(false), 600);
  }, [refreshAll]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleContainerAction = useCallback(
    async (container: ContainerWithHost, action: 'start' | 'stop') => {
      const actionLabel = action === 'start' ? 'Start' : 'Stop';
      Alert.alert(
        `${actionLabel} Container`,
        `${actionLabel} "${container.name}" on ${container.host.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: actionLabel,
            style: action === 'stop' ? 'destructive' : 'default',
            onPress: async () => {
              setActionInProgress(container.id);
              try {
                await dockerContainerAction(container.host, container.id, action);
                refreshHost(container.host.id);
              } catch (err) {
                Alert.alert(
                  'Failed',
                  err instanceof Error ? err.message : `Could not ${action} container`
                );
              } finally {
                setActionInProgress(null);
              }
            },
          },
        ]
      );
    },
    [refreshHost]
  );

  const handleTerminal = useCallback(
    (container: ContainerWithHost) => {
      router.push(`/hosts/${container.host.id}/docker/${encodeURIComponent(container.id)}`);
    },
    [router]
  );

  const renderContainerRow = (container: ContainerWithHost, isLast: boolean) => {
    const isRunning = isContainerRunning(container);
    const isActionLoading = actionInProgress === container.id;

    return (
      <Pressable
        key={container.id}
        style={[styles.containerRow, !isLast && styles.containerRowBorder]}
        onPress={() => handleTerminal(container)}
      >
        <PulsingDot
          color={isRunning ? colors.accent : colors.textMuted}
          active={isRunning}
          size={8}
        />
        <View style={styles.containerRowInfo}>
          <AppText variant="body" numberOfLines={1}>
            {container.name}
          </AppText>
          <View style={styles.containerRowMeta}>
            {container.cpuPercent !== undefined && (
              <AppText variant="caps" tone="muted">
                {container.cpuPercent.toFixed(0)}%
              </AppText>
            )}
            {(container.memoryUsage || container.memoryUsedBytes) && (
              <AppText variant="caps" tone="muted">
                {container.memoryUsage || formatBytes(container.memoryUsedBytes)}
              </AppText>
            )}
            {container.ports && (
              <AppText variant="caps" tone="muted" numberOfLines={1}>
                {container.ports}
              </AppText>
            )}
          </View>
        </View>
        <View style={styles.containerRowActions}>
          <Pressable
            style={styles.rowActionButton}
            onPress={() => handleTerminal(container)}
            hitSlop={8}
          >
            <Terminal size={16} color={colors.accent} />
          </Pressable>
          {isActionLoading ? (
            <ActivityIndicator size="small" color={isRunning ? colors.red : colors.accent} />
          ) : isRunning ? (
            <Pressable
              style={styles.rowActionButton}
              onPress={() => handleContainerAction(container, 'stop')}
              hitSlop={8}
            >
              <Square size={14} color={colors.red} />
            </Pressable>
          ) : (
            <Pressable
              style={styles.rowActionButton}
              onPress={() => handleContainerAction(container, 'start')}
              hitSlop={8}
            >
              <Play size={14} color={colors.accent} />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const renderComposeGroup = (group: ComposeGroup, index: number) => {
    const isExpanded = expandedGroups.has(group.key);
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    const hostColor = group.hostColor || hostColors[index % hostColors.length];

    return (
      <FadeIn key={group.key}>
        <Card style={styles.groupCard}>
          <Pressable style={styles.groupHeader} onPress={() => toggleGroup(group.key)}>
            <ChevronIcon size={18} color={colors.textMuted} />
            <View style={styles.groupTitleContainer}>
              <AppText variant="body" numberOfLines={1}>
                {group.title}
              </AppText>
              <View style={styles.groupHostRow}>
                <View style={[styles.hostDot, { backgroundColor: hostColor }]} />
                <AppText variant="caps" style={styles.hostNameText}>
                  {group.hostName}
                </AppText>
              </View>
            </View>
            <View style={styles.groupStats}>
              {group.running > 0 && (
                <View style={styles.statWithDot}>
                  <View style={[styles.statDot, { backgroundColor: colors.green }]} />
                  <AppText variant="caps" style={{ color: colors.green }}>
                    {group.running}
                  </AppText>
                </View>
              )}
              {group.stopped > 0 && (
                <View style={styles.statWithDot}>
                  <View style={[styles.statDot, { backgroundColor: colors.textMuted }]} />
                  <AppText variant="caps" tone="muted">
                    {group.stopped}
                  </AppText>
                </View>
              )}
            </View>
          </Pressable>
          {isExpanded && (
            <View style={styles.groupContainers}>
              {group.containers.map((container, idx) =>
                renderContainerRow(container, idx === group.containers.length - 1)
              )}
            </View>
          )}
        </Card>
      </FadeIn>
    );
  };

  if (!ready) {
    return (
      <Screen>
        <FadeIn delay={100}>
          <SkeletonList type="container" count={4} />
        </FadeIn>
      </Screen>
    );
  }

  if (hosts.length === 0) {
    return (
      <Screen>
        <FadeIn delay={100}>
          <Card style={styles.emptyCard}>
            <AppText variant="subtitle">No hosts configured</AppText>
            <AppText variant="body" tone="muted" style={styles.emptyBody}>
              Add a host to view and manage Docker containers across your servers.
            </AppText>
            <Pressable style={styles.cta} onPress={() => router.push('/hosts/new')}>
              <AppText variant="subtitle" style={styles.ctaText}>
                Add Host
              </AppText>
            </Pressable>
          </Card>
        </FadeIn>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <FadeIn delay={100}>
          <SkeletonList type="container" count={4} />
        </FadeIn>
      </Screen>
    );
  }

  if (!hasDocker && containers.length === 0) {
    return (
      <Screen>
        <FadeIn delay={100}>
          <Card style={styles.emptyCard}>
            <AppText variant="subtitle">No Docker available</AppText>
            <AppText variant="body" tone="muted" style={styles.emptyBody}>
              Docker is not available on any of your connected hosts, or no containers exist.
            </AppText>
            <Pressable style={styles.ctaSecondary} onPress={handleRefresh}>
              <AppText variant="caps" style={styles.ctaSecondaryText}>
                Refresh
              </AppText>
            </Pressable>
          </Card>
        </FadeIn>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={manualRefresh}
            onRefresh={handleRefresh}
            tintColor={systemColors.blue as string}
          />
        }
      >
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <AppText variant="title" style={styles.summaryValue}>
              {running.length}
            </AppText>
            <AppText variant="caps" tone="muted">
              Running
            </AppText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <AppText variant="title" style={styles.summaryValue}>
              {stopped.length}
            </AppText>
            <AppText variant="caps" tone="muted">
              Stopped
            </AppText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <AppText variant="title" style={styles.summaryValue}>
              {hostsWithContainers.length}
            </AppText>
            <AppText variant="caps" tone="muted">
              Hosts
            </AppText>
          </View>
        </View>

        <View style={styles.groupList}>
          {composeGroups.map((group, index) => renderComposeGroup(group, index))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function withAlpha(color: ColorValue, alpha: number): ColorValue {
  if (typeof color !== 'string') return color;
  const trimmed = color.trim();
  const hex = trimmed.startsWith('#') ? trimmed.slice(1) : '';
  if (hex.length !== 3 && hex.length !== 6) return color;
  const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return color;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    summaryItem: {
      alignItems: 'center',
      gap: 2,
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: '600',
    },
    summaryDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.separator,
    },
    groupList: {
      gap: theme.spacing.sm,
    },
    groupCard: {
      padding: 0,
      overflow: 'hidden',
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.md,
    },
    groupTitleContainer: {
      flex: 1,
      gap: 2,
    },
    groupHostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    hostDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    hostNameText: {
      color: colors.textMuted,
      fontSize: 10,
    },
    groupStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statWithDot: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    groupContainers: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
    },
    containerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.md,
    },
    containerRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    containerRowInfo: {
      flex: 1,
      gap: 2,
    },
    containerRowMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    containerRowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowActionButton: {
      padding: 4,
    },
    emptyCard: {
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    emptyBody: {
      textAlign: 'center',
      maxWidth: 260,
    },
    cta: {
      backgroundColor: colors.accent,
      borderRadius: theme.radii.md,
      paddingVertical: 12,
      paddingHorizontal: 24,
      marginTop: theme.spacing.sm,
    },
    ctaText: {
      color: colors.accentText,
    },
    ctaSecondary: {
      backgroundColor: colors.cardPressed,
      borderRadius: theme.radii.md,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginTop: theme.spacing.sm,
    },
    ctaSecondaryText: {
      color: colors.accent,
    },
  });
