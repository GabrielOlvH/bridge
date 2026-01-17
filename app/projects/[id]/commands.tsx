import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Field } from '@/components/Field';
import { FadeIn } from '@/components/FadeIn';
import { useProjects } from '@/lib/projects-store';
import { palette, theme } from '@/lib/theme';

export default function ProjectCommandsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, addCustomCommand, removeCustomCommand } = useProjects();

  const project = projects.find((p) => p.id === id);
  const commands = project?.customCommands || [];

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [command, setCommand] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = label.trim() && command.trim();

  const handleAddCommand = async () => {
    if (!canSubmit || !id || submitting) return;

    setSubmitting(true);
    try {
      await addCustomCommand(id, label.trim(), command.trim());
      setLabel('');
      setCommand('');
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add command');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commandId: string, commandLabel: string) => {
    if (!id) return;

    Alert.alert(
      'Delete Command',
      `Are you sure you want to delete "${commandLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeCustomCommand(id, commandId),
        },
      ]
    );
  };

  if (!project) {
    return (
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <AppText variant="subtitle">Back</AppText>
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <AppText variant="subtitle" tone="muted">
            Project not found
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <AppText variant="subtitle">Back</AppText>
        </Pressable>
        <View style={styles.headerInfo}>
          <AppText variant="caps" tone="muted">
            {project.name}
          </AppText>
          <AppText variant="title">Custom Commands</AppText>
        </View>
        {!showForm && (
          <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
            <AppText variant="subtitle" style={styles.addButtonText}>
              +
            </AppText>
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showForm && (
          <FadeIn>
            <View style={styles.formCard}>
              <AppText variant="subtitle" style={styles.formTitle}>
                New Command
              </AppText>

              <Field
                label="Label"
                placeholder="e.g., Dev Server"
                value={label}
                onChangeText={setLabel}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Field
                label="Command"
                placeholder="e.g., pnpm dev"
                value={command}
                onChangeText={setCommand}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.formActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowForm(false);
                    setLabel('');
                    setCommand('');
                  }}
                >
                  <AppText variant="label">Cancel</AppText>
                </Pressable>
                <Pressable
                  style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
                  onPress={handleAddCommand}
                  disabled={!canSubmit || submitting}
                >
                  <AppText variant="label" style={styles.saveButtonText}>
                    {submitting ? 'Adding...' : 'Add Command'}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </FadeIn>
        )}

        {commands.length === 0 && !showForm ? (
          <FadeIn style={styles.empty}>
            <AppText variant="subtitle">No custom commands</AppText>
            <AppText variant="body" tone="muted" style={styles.emptyBody}>
              Add custom commands to quickly launch common tasks.
            </AppText>
            <Pressable style={styles.cta} onPress={() => setShowForm(true)}>
              <AppText variant="subtitle" style={styles.ctaText}>
                Add Command
              </AppText>
            </Pressable>
          </FadeIn>
        ) : (
          <View style={styles.commandsList}>
            {commands.map((cmd, idx) => (
              <FadeIn key={cmd.id} delay={idx * 50}>
                <View style={styles.commandCard}>
                  <View style={styles.commandInfo}>
                    <AppText variant="subtitle">{cmd.label}</AppText>
                    <AppText variant="mono" tone="muted">
                      {cmd.command}
                    </AppText>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(cmd.id, cmd.label)}
                  >
                    <AppText variant="caps" style={styles.deleteButtonText}>
                      Delete
                    </AppText>
                  </Pressable>
                </View>
              </FadeIn>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  back: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerInfo: {
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: -2,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  formTitle: {
    marginBottom: theme.spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: palette.surfaceAlt,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: palette.accent,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: palette.line,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  empty: {
    backgroundColor: palette.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadow.card,
  },
  emptyBody: {
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  cta: {
    backgroundColor: palette.accent,
    borderRadius: theme.radii.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: '#FFFFFF',
  },
  commandsList: {
    gap: theme.spacing.sm,
  },
  commandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  commandInfo: {
    flex: 1,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: palette.blush,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
  },
  deleteButtonText: {
    color: palette.clay,
  },
});
