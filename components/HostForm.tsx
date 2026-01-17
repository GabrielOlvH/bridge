import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Field } from '@/components/Field';
import { AppText } from '@/components/AppText';
import { HostConnectionSelector } from '@/components/HostFormSection';
import { HostDraft } from '@/lib/types';
import { theme } from '@/lib/theme';
import { ThemeColors, useTheme } from '@/lib/useTheme';

export function HostForm({
  initial,
  onSubmit,
  submitLabel = 'Save Host',
}: {
  initial?: Partial<HostDraft>;
  onSubmit: (draft: HostDraft) => void;
  submitLabel?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(initial?.name ?? '');
  const [baseUrl, setBaseUrl] = useState(initial?.baseUrl ?? '');
  const [authToken, setAuthToken] = useState(initial?.authToken ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [sshHost, setSshHost] = useState(initial?.sshHost ?? '');
  const [sshPort, setSshPort] = useState(initial?.sshPort ? String(initial?.sshPort) : '');
  const [identityFile, setIdentityFile] = useState(initial?.identityFile ?? '');
  const [connection, setConnection] = useState<HostDraft['connection']>(initial?.connection ?? 'ssh');

  const canSubmit = useMemo(() => name.trim().length > 0 && baseUrl.trim().length > 0, [name, baseUrl]);

  const portNumber = sshPort.trim() ? Number(sshPort) : undefined;
  const draft: HostDraft = {
    name: name.trim(),
    baseUrl: baseUrl.trim(),
    authToken: authToken.trim() || undefined,
    username: username.trim() || undefined,
    sshHost: sshHost.trim() || undefined,
    sshPort: Number.isFinite(portNumber) ? portNumber : undefined,
    identityFile: identityFile.trim() || undefined,
    connection,
    color: initial?.color,
  };

  return (
    <View style={styles.form}>
      <Field label="Host name" value={name} onChangeText={setName} placeholder="Studio, Pi, or Cloud" />
      <Field
        label="Agent URL"
        value={baseUrl}
        onChangeText={setBaseUrl}
        placeholder="http://192.168.1.12:4020"
        autoCapitalize="none"
        keyboardType="url"
      />
      <Field
        label="API token (optional)"
        value={authToken}
        onChangeText={setAuthToken}
        placeholder="Bearer token for the agent"
        autoCapitalize="none"
      />

      <HostConnectionSelector value={connection} onChange={setConnection} />

      <Field
        label="SSH username (optional)"
        value={username}
        onChangeText={setUsername}
        placeholder="ubuntu"
        autoCapitalize="none"
      />
      <Field
        label="SSH host override (optional)"
        value={sshHost}
        onChangeText={setSshHost}
        placeholder="if different from agent URL"
        autoCapitalize="none"
      />
      <Field
        label="SSH port (optional)"
        value={sshPort}
        onChangeText={setSshPort}
        placeholder="22"
        keyboardType="numeric"
      />
      <Field
        label="Identity file path (optional)"
        value={identityFile}
        onChangeText={setIdentityFile}
        placeholder="~/.ssh/id_ed25519"
        autoCapitalize="none"
      />

      <Pressable style={[styles.submit, !canSubmit && styles.submitDisabled]} disabled={!canSubmit} onPress={() => onSubmit(draft)}>
        <AppText variant="subtitle" style={styles.submitText}>
          {submitLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  form: {
    paddingBottom: theme.spacing.lg,
  },
  submit: {
    marginTop: theme.spacing.xs,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  submitDisabled: {
    backgroundColor: colors.cardPressed,
  },
  submitText: {
    color: colors.accentText,
  },
});
