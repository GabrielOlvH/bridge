import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Field } from '@/components/Field';
import { DirectoryBrowser } from '@/components/DirectoryBrowser';
import { useStore } from '@/lib/store';
import { useProjects } from '@/lib/projects-store';
import { theme } from '@/lib/theme';
import { hostColors } from '@/lib/colors';
import { ThemeColors, useTheme } from '@/lib/useTheme';

export default function NewProjectScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { hosts } = useStore();
  const { addProject } = useProjects();

  const [selectedHostId, setSelectedHostId] = useState<string | null>(
    hosts.length === 1 ? hosts[0].id : null
  );
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);

  const selectedHost = useMemo(
    () => hosts.find((h) => h.id === selectedHostId) || null,
    [hosts, selectedHostId]
  );

  const canSubmit = selectedHostId && name.trim() && path.trim();

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      await addProject({
        hostId: selectedHostId!,
        name: name.trim(),
        path: path.trim(),
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrowseSelect = (selectedPath: string, selectedName: string) => {
    setPath(selectedPath);
    if (!name.trim()) {
      setName(selectedName);
    }
    setShowBrowser(false);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <AppText variant="subtitle">Back</AppText>
        </Pressable>
        <View>
          <AppText variant="caps" tone="muted">
            New Project
          </AppText>
          <AppText variant="title">Add a project</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <AppText variant="caps" tone="muted" style={styles.sectionLabel}>
            Select Host
          </AppText>
          <View style={styles.hostGrid}>
            {hosts.map((host, idx) => (
              <Pressable
                key={host.id}
                style={[
                  styles.hostCard,
                  selectedHostId === host.id && styles.hostCardSelected,
                ]}
                onPress={() => setSelectedHostId(host.id)}
              >
                <View
                  style={[
                    styles.hostDot,
                    { backgroundColor: host.color || hostColors[idx % hostColors.length] },
                  ]}
                />
                <AppText
                  variant="label"
                  style={selectedHostId === host.id ? styles.hostTextSelected : undefined}
                >
                  {host.name}
                </AppText>
              </Pressable>
            ))}
          </View>
          {hosts.length === 0 && (
            <View style={styles.emptyState}>
              <AppText variant="body" tone="muted">
                No hosts configured
              </AppText>
              <Pressable style={styles.addHostButton} onPress={() => router.push('/hosts/new')}>
                <AppText variant="label" style={styles.addHostButtonText}>
                  Add Host First
                </AppText>
              </Pressable>
            </View>
          )}
        </View>

        <Field
          label="Project Name"
          placeholder="e.g., my-app"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.pathSection}>
          <AppText variant="label" style={styles.pathLabel}>
            Path on Host
          </AppText>
          <View style={styles.pathRow}>
            <View style={styles.pathInputWrapper}>
              <Field
                label=""
                placeholder="e.g., /home/user/projects/my-app"
                value={path}
                onChangeText={setPath}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Pressable
              style={[styles.browseButton, !selectedHostId && styles.browseButtonDisabled]}
              onPress={() => setShowBrowser(true)}
              disabled={!selectedHostId}
            >
              <AppText
                variant="label"
                style={selectedHostId ? styles.browseButtonText : styles.browseButtonTextDisabled}
              >
                Browse
              </AppText>
            </Pressable>
          </View>
        </View>

        <AppText variant="body" tone="muted" style={styles.hint}>
          Select a host to browse directories, or enter the path manually.
        </AppText>

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <AppText variant="subtitle" style={styles.submitButtonText}>
            {submitting ? 'Adding...' : 'Add Project'}
          </AppText>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showBrowser}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBrowser(false)}
      >
        <View style={styles.browserModal}>
          {selectedHost && (
            <DirectoryBrowser
              host={selectedHost}
              onSelect={handleBrowseSelect}
              onClose={() => setShowBrowser(false)}
            />
          )}
        </View>
      </Modal>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    marginBottom: theme.spacing.sm,
  },
  hostGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    backgroundColor: colors.cardPressed,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hostCardSelected: {
    backgroundColor: colors.barBg,
    borderColor: colors.accent,
  },
  hostDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hostTextSelected: {
    color: colors.text,
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  addHostButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  addHostButtonText: {
    color: colors.accentText,
  },
  pathSection: {
    marginBottom: theme.spacing.sm,
  },
  pathLabel: {
    marginBottom: 6,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  pathInputWrapper: {
    flex: 1,
  },
  browseButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    marginTop: 1,
  },
  browseButtonDisabled: {
    backgroundColor: colors.separator,
  },
  browseButtonText: {
    color: colors.accentText,
  },
  browseButtonTextDisabled: {
    color: colors.textMuted,
  },
  hint: {
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.separator,
  },
  submitButtonText: {
    color: colors.accentText,
  },
  browserModal: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: theme.spacing.md,
  },
});
