import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { fetchDirectoryListing } from '@/lib/api';
import { DirectoryItem, Host } from '@/lib/types';
import { theme } from '@/lib/theme';
import { ThemeColors, useTheme } from '@/lib/useTheme';

type DirectoryBrowserProps = {
  host: Host;
  onSelect: (path: string, name: string) => void;
  onClose: () => void;
};

export function DirectoryBrowser({ host, onSelect, onClose }: DirectoryBrowserProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = useCallback(async (path?: string) => {
    setLoading(true);
    setError(null);
    try {
      const listing = await fetchDirectoryListing(host, path);
      setCurrentPath(listing.path);
      setParentPath(listing.parent);
      setItems(listing.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  }, [host]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const handleNavigate = (path: string) => {
    loadDirectory(path);
  };

  const handleSelect = (item: DirectoryItem) => {
    onSelect(item.path, item.name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <AppText variant="label">Cancel</AppText>
        </Pressable>
        <View style={styles.headerTitle}>
          <AppText variant="caps" tone="muted">
            Browse on {host.name}
          </AppText>
          <AppText variant="label" numberOfLines={1} style={styles.pathText}>
            {currentPath || '...'}
          </AppText>
        </View>
      </View>

      {parentPath && (
        <Pressable style={styles.parentRow} onPress={() => handleNavigate(parentPath)}>
          <AppText variant="label" style={styles.parentText}>
            ..
          </AppText>
          <AppText variant="caps" tone="muted">
            Go up
          </AppText>
        </Pressable>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AppText variant="body" tone="muted">
            {error}
          </AppText>
          <Pressable style={styles.retryButton} onPress={() => loadDirectory(currentPath ?? undefined)}>
            <AppText variant="label" style={styles.retryButtonText}>
              Retry
            </AppText>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <AppText variant="body" tone="muted">
                No subdirectories
              </AppText>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.path} style={styles.itemRow}>
                <Pressable
                  style={styles.itemContent}
                  onPress={() => handleNavigate(item.path)}
                >
                  <AppText variant="subtitle">{item.name}</AppText>
                  {item.hasPackageJson && (
                    <View style={styles.badge}>
                      <AppText variant="caps" style={styles.badgeText}>
                        npm
                      </AppText>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.selectButton, item.hasPackageJson && styles.selectButtonHighlight]}
                  onPress={() => handleSelect(item)}
                >
                  <AppText
                    variant="caps"
                    style={item.hasPackageJson ? styles.selectButtonTextHighlight : styles.selectButtonText}
                  >
                    Select
                  </AppText>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    marginBottom: theme.spacing.sm,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  headerTitle: {
    flex: 1,
  },
  pathText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    color: colors.textMuted,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: colors.cardPressed,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.sm,
  },
  parentText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  retryButtonText: {
    color: colors.accentText,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: colors.barBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 9,
  },
  selectButton: {
    backgroundColor: colors.cardPressed,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
  },
  selectButtonHighlight: {
    backgroundColor: colors.accent,
  },
  selectButtonText: {
    color: colors.textMuted,
  },
  selectButtonTextHighlight: {
    color: colors.accentText,
  },
});
