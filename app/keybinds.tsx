import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { Field } from '@/components/Field';
import { FadeIn } from '@/components/FadeIn';
import { useStore } from '@/lib/store';
import { palette, theme } from '@/lib/theme';
import { systemColors } from '@/lib/colors';

function parseKeys(text: string): string[] {
  return text
    .split(/\s+/)
    .map((key) => key.trim())
    .filter(Boolean);
}

export default function KeybindsScreen() {
  const router = useRouter();
  const { keybinds, addKeybind, updateKeybind, removeKeybind } = useStore();
  const [label, setLabel] = useState('');
  const [keys, setKeys] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const formTitle = editingId ? 'Edit keybind' : 'Add keybind';

  const handleSubmit = async () => {
    if (!label.trim() || !keys.trim()) return;
    const parsed = parseKeys(keys);
    if (parsed.length === 0) return;

    if (editingId) {
      await updateKeybind(editingId, { label: label.trim(), keys: parsed });
      setEditingId(null);
    } else {
      await addKeybind(label.trim(), parsed);
    }

    setLabel('');
    setKeys('');
  };

  const cards = useMemo(
    () =>
      keybinds.map((bind, index) => (
        <FadeIn key={bind.id} delay={index * 40} style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <AppText variant="subtitle">{bind.label}</AppText>
                <View style={styles.keyRow}>
                  {bind.keys.map((key, idx) => (
                    <View key={`${bind.id}-${idx}`} style={styles.keyChip}>
                      <AppText variant="mono">{key}</AppText>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => {
                    setEditingId(bind.id);
                    setLabel(bind.label);
                    setKeys(bind.keys.join(' '));
                  }}
                >
                  <AppText variant="caps" tone="accent">
                    Edit
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Remove keybind', `Delete ${bind.label}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => removeKeybind(bind.id),
                      },
                    ])
                  }
                >
                  <AppText variant="caps" tone="clay">
                    Delete
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </FadeIn>
      )),
    [keybinds, removeKeybind]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Keybinds</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionHeader title={formTitle} />
        <View style={styles.formCard}>
          <Field label="Label" value={label} onChangeText={setLabel} placeholder="Split Vert" />
          <Field
            label="Keys (space-separated)"
            value={keys}
            onChangeText={setKeys}
            placeholder={'C-b "'}
            autoCapitalize="none"
          />
          <Pressable style={styles.submit} onPress={handleSubmit}>
            <AppText variant="subtitle" style={styles.submitText}>
              {editingId ? 'Update' : 'Add'}
            </AppText>
          </Pressable>
        </View>

        <SectionHeader title={`Saved (${keybinds.length})`} />
        {cards.length === 0 ? (
          <View style={styles.emptyCard}>
            <AppText variant="subtitle">No keybinds yet</AppText>
            <AppText variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
              Add a quick action to send keys straight into tmux.
            </AppText>
          </View>
        ) : (
          cards
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    ...theme.shadow.card,
  },
  submit: {
    backgroundColor: palette.accent,
    borderRadius: theme.radii.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
  },
  cardWrap: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    ...theme.shadow.card,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  keyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  keyChip: {
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  emptyCard: {
    backgroundColor: palette.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
});
