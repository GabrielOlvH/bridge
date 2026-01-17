# App Pages Refinement Plan: Liquid Glass + Native Components

## Overview
Refine the app pages (excluding terminal) with:
1. Remove previews from main page
2. Merge Launch button functionality (Projects + Blank Session modes)
3. Native iOS Liquid Glass effects
4. Native context menus everywhere

## Dependencies (INSTALLED)
```bash
npx expo install expo-glass-effect zeego @react-native-segmented-control/segmented-control
```

---

## File 1: `components/GlassCard.tsx` (NEW)

```tsx
import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { theme } from '@/lib/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glassStyle?: 'regular' | 'clear';
  isInteractive?: boolean;
  disabled?: boolean;
};

export function GlassCard({
  children,
  style,
  glassStyle = 'regular',
  isInteractive = false,
  disabled = false,
}: GlassCardProps) {
  const baseStyle = [styles.card, style];

  if (disabled) {
    return <View style={[baseStyle, styles.solidFallback]}>{children}</View>;
  }

  // iOS 26+ with Liquid Glass
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        style={baseStyle}
        glassEffectStyle={glassStyle}
        isInteractive={isInteractive}
      >
        {children}
      </GlassView>
    );
  }

  // iOS < 26: BlurView
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={60}
        tint="systemThinMaterialLight"
        style={[baseStyle, styles.blurFallback]}
      >
        {children}
      </BlurView>
    );
  }

  // Android fallback
  return <View style={[baseStyle, styles.androidFallback]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  solidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    ...theme.shadow.card,
  },
  blurFallback: {
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    ...theme.shadow.card,
  },
});
```

---

## File 2: `components/SessionContextMenu.tsx` (NEW)

```tsx
import React from 'react';
import * as ContextMenu from 'zeego/context-menu';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Host, Session } from '@/lib/types';
import { killSession } from '@/lib/api';

type SessionContextMenuProps = {
  children: React.ReactNode;
  session: Session;
  host: Host;
  onKill?: () => void;
  onRename?: () => void;
  onViewDetails?: () => void;
};

export function SessionContextMenu({
  children,
  session,
  host,
  onKill,
  onRename,
  onViewDetails,
}: SessionContextMenuProps) {
  const handleCopyAttach = async () => {
    const command = `ssh -t ${host.user}@${host.host} -p ${host.port} "tmux attach -t ${session.name}"`;
    await Clipboard.setStringAsync(command);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleKill = () => {
    Alert.alert(
      'Kill Session',
      `Are you sure you want to kill "${session.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Kill',
          style: 'destructive',
          onPress: async () => {
            try {
              await killSession(host, session.name);
              onKill?.();
            } catch (err) {
              Alert.alert('Error', 'Failed to kill session');
            }
          },
        },
      ]
    );
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        {onViewDetails && (
          <ContextMenu.Item key="details" onSelect={onViewDetails}>
            <ContextMenu.ItemTitle>View Details</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'info.circle' }} />
          </ContextMenu.Item>
        )}
        {onRename && (
          <ContextMenu.Item key="rename" onSelect={onRename}>
            <ContextMenu.ItemTitle>Rename</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'pencil' }} />
          </ContextMenu.Item>
        )}
        <ContextMenu.Item key="copy" onSelect={handleCopyAttach}>
          <ContextMenu.ItemTitle>Copy Attach Command</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'doc.on.doc' }} />
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item key="kill" onSelect={handleKill} destructive>
          <ContextMenu.ItemTitle>Kill Session</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'xmark.circle' }} />
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
```

---

## File 3: `components/HostContextMenu.tsx` (NEW)

```tsx
import React from 'react';
import * as ContextMenu from 'zeego/context-menu';
import { Alert } from 'react-native';
import { Host } from '@/lib/types';

type HostContextMenuProps = {
  children: React.ReactNode;
  host: Host;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewSessions?: () => void;
};

export function HostContextMenu({
  children,
  host,
  onEdit,
  onDelete,
  onViewSessions,
}: HostContextMenuProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Host',
      `Are you sure you want to delete "${host.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        {onViewSessions && (
          <ContextMenu.Item key="sessions" onSelect={onViewSessions}>
            <ContextMenu.ItemTitle>View Sessions</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'terminal' }} />
          </ContextMenu.Item>
        )}
        {onEdit && (
          <ContextMenu.Item key="edit" onSelect={onEdit}>
            <ContextMenu.ItemTitle>Edit Host</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'pencil' }} />
          </ContextMenu.Item>
        )}
        {onDelete && (
          <>
            <ContextMenu.Separator />
            <ContextMenu.Item key="delete" onSelect={handleDelete} destructive>
              <ContextMenu.ItemTitle>Delete Host</ContextMenu.ItemTitle>
              <ContextMenu.ItemIcon ios={{ name: 'trash' }} />
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
```

---

## File 4: `components/ProjectContextMenu.tsx` (NEW)

```tsx
import React from 'react';
import * as ContextMenu from 'zeego/context-menu';
import { Alert } from 'react-native';
import { Project } from '@/lib/types';

type ProjectContextMenuProps = {
  children: React.ReactNode;
  project: Project;
  onEditCommands?: () => void;
  onDelete?: () => void;
};

export function ProjectContextMenu({
  children,
  project,
  onEditCommands,
  onDelete,
}: ProjectContextMenuProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        {onEditCommands && (
          <ContextMenu.Item key="commands" onSelect={onEditCommands}>
            <ContextMenu.ItemTitle>Edit Commands</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'command' }} />
          </ContextMenu.Item>
        )}
        {onDelete && (
          <>
            <ContextMenu.Separator />
            <ContextMenu.Item key="delete" onSelect={handleDelete} destructive>
              <ContextMenu.ItemTitle>Delete Project</ContextMenu.ItemTitle>
              <ContextMenu.ItemIcon ios={{ name: 'trash' }} />
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
```

---

## File 5: `app/index.tsx` (MODIFY)

### Changes:

1. **Remove preview from API call** (line ~49):
```tsx
// BEFORE:
const hostSessions = await getSessions(host, { preview: true, previewLines: 6 });

// AFTER:
const hostSessions = await getSessions(host);
```

2. **Add imports** (top of file):
```tsx
import { GlassCard } from '@/components/GlassCard';
import { SessionContextMenu } from '@/components/SessionContextMenu';
```

3. **Remove `stripAnsi` import** (no longer needed)

4. **Replace session card rendering** (lines ~426-474):
```tsx
// BEFORE: Plain Pressable with previewBox
<Pressable
  key={session.name}
  onPress={() => router.push(`/session/${session.host.id}/${encodeURIComponent(session.name)}/terminal`)}
  style={({ pressed }) => [styles.sessionCard, pressed && styles.sessionCardPressed]}
>
  {/* ... session header ... */}
  {session.preview && session.preview.length > 0 && (
    <View style={styles.previewBox}>
      {/* preview lines */}
    </View>
  )}
</Pressable>

// AFTER: GlassCard + SessionContextMenu wrapper
<SessionContextMenu
  key={session.name}
  session={session}
  host={session.host}
  onKill={() => refetchSessions()}
  onViewDetails={() => router.push(`/session/${session.host.id}/${encodeURIComponent(session.name)}`)}
>
  <Pressable
    onPress={() => router.push(`/session/${session.host.id}/${encodeURIComponent(session.name)}/terminal`)}
  >
    <GlassCard style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View
          style={[
            styles.sessionIndicator,
            { backgroundColor: session.host.color || palette.accent },
            session.attached && styles.sessionIndicatorActive,
          ]}
        />
        <View style={styles.sessionInfo}>
          <AppText variant="subtitle" numberOfLines={1}>
            {session.name}
          </AppText>
          <View style={styles.sessionMeta}>
            <AppText variant="caps" tone={session.attached ? 'accent' : 'muted'}>
              {session.attached ? 'Live' : `${session.windows} windows`}
            </AppText>
          </View>
        </View>
      </View>
    </GlassCard>
  </Pressable>
</SessionContextMenu>
```

5. **Remove the "more" button** from session cards (context menu replaces it)

6. **Remove these styles**:
```tsx
// DELETE:
previewBox: { ... },
previewLine: { ... },
sessionMoreBtn: { ... },
```

7. **Update sessionCard style** (remove shadow since GlassCard handles it):
```tsx
sessionCard: {
  padding: 14,
  // Remove backgroundColor and shadow - GlassCard handles these
},
```

---

## File 6: `components/LaunchSheet.tsx` (MODIFY)

### Full replacement with mode toggle and blank session support:

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { useStore } from '@/lib/store';
import { useProjects } from '@/lib/projects-store';
import { createSession, fetchProjectScripts, sendText } from '@/lib/api';
import { Command, Host, PackageJsonScripts, Project } from '@/lib/types';
import { palette, theme, hostAccents } from '@/lib/theme';

type LaunchMode = 'projects' | 'blank';

type LaunchSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LaunchSheet({ isOpen, onClose }: LaunchSheetProps) {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { hosts } = useStore();
  const { projects, recentLaunches, addRecentLaunch, getProjectsByHost } = useProjects();

  // Mode state
  const [mode, setMode] = useState<LaunchMode>('projects');
  
  // Shared state
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  
  // Projects mode state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [packageScripts, setPackageScripts] = useState<PackageJsonScripts>({});
  const [loadingScripts, setLoadingScripts] = useState(false);
  
  // Blank session mode state
  const [sessionName, setSessionName] = useState('');

  const snapPoints = useMemo(() => ['55%', '85%'], []);

  const selectedHost = useMemo(
    () => hosts.find((h) => h.id === selectedHostId) || null,
    [hosts, selectedHostId]
  );

  const hostProjects = useMemo(
    () => (selectedHostId ? getProjectsByHost(selectedHostId) : []),
    [selectedHostId, getProjectsByHost]
  );

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  // Reset state when mode changes
  useEffect(() => {
    setSelectedProjectId(null);
    setSessionName('');
  }, [mode]);

  // Load scripts when project is selected
  useEffect(() => {
    if (!selectedHost || !selectedProject) {
      setPackageScripts({});
      return;
    }
    let cancelled = false;
    async function loadScripts() {
      setLoadingScripts(true);
      try {
        const result = await fetchProjectScripts(selectedHost!, selectedProject!.path);
        if (!cancelled) setPackageScripts(result.scripts);
      } catch {
        if (!cancelled) setPackageScripts({});
      } finally {
        if (!cancelled) setLoadingScripts(false);
      }
    }
    loadScripts();
    return () => { cancelled = true; };
  }, [selectedHost, selectedProject]);

  const allCommands = useMemo(() => {
    const commands: Command[] = [];
    Object.entries(packageScripts).forEach(([name]) => {
      commands.push({
        id: `npm-${name}`,
        label: name,
        command: `npm run ${name}`,
        icon: 'package',
      });
    });
    if (selectedProject?.customCommands) {
      commands.push(...selectedProject.customCommands);
    }
    return commands;
  }, [packageScripts, selectedProject]);

  // Launch with command (Projects mode)
  const handleLaunch = useCallback(
    async (command: Command) => {
      if (!selectedHost || !selectedProject || launching) return;
      setLaunching(true);
      try {
        const timestamp = Date.now().toString(36);
        const name = `${selectedProject.name}-${timestamp}`;
        await createSession(selectedHost, name);
        await sendText(selectedHost, name, `cd ${selectedProject.path}\n`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        await sendText(selectedHost, name, `${command.command}\n`);
        await addRecentLaunch({
          hostId: selectedHost.id,
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          hostName: selectedHost.name,
          command,
        });
        onClose();
        router.push(`/session/${selectedHost.id}/${encodeURIComponent(name)}/terminal`);
      } catch (err) {
        console.error('Failed to launch:', err);
      } finally {
        setLaunching(false);
      }
    },
    [selectedHost, selectedProject, launching, addRecentLaunch, onClose, router]
  );

  // Create blank session
  const handleCreateBlankSession = useCallback(async () => {
    if (!selectedHost || !sessionName.trim() || launching) return;
    setLaunching(true);
    try {
      const name = sessionName.trim();
      await createSession(selectedHost, name);
      onClose();
      router.push(`/session/${selectedHost.id}/${encodeURIComponent(name)}/terminal`);
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setLaunching(false);
    }
  }, [selectedHost, sessionName, launching, onClose, router]);

  // Re-launch recent
  const handleRecentLaunch = useCallback(
    async (launch: (typeof recentLaunches)[0]) => {
      const host = hosts.find((h) => h.id === launch.hostId);
      const project = projects.find((p) => p.id === launch.projectId);
      if (!host || !project) return;
      setLaunching(true);
      try {
        const timestamp = Date.now().toString(36);
        const name = `${project.name}-${timestamp}`;
        await createSession(host, name);
        await sendText(host, name, `cd ${project.path}\n`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        await sendText(host, name, `${launch.command.command}\n`);
        await addRecentLaunch({
          hostId: host.id,
          projectId: project.id,
          projectName: project.name,
          hostName: host.name,
          command: launch.command,
        });
        onClose();
        router.push(`/session/${host.id}/${encodeURIComponent(name)}/terminal`);
      } catch (err) {
        console.error('Failed to re-launch:', err);
      } finally {
        setLaunching(false);
      }
    },
    [hosts, projects, addRecentLaunch, onClose, router]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  // Glass background for sheet
  const renderBackground = useCallback(() => {
    if (isLiquidGlassAvailable()) {
      return <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />;
    }
    if (Platform.OS === 'ios') {
      return <BlurView intensity={80} tint="systemChromeMaterialLight" style={StyleSheet.absoluteFill} />;
    }
    return <View style={[StyleSheet.absoluteFill, styles.sheetBackground]} />;
  }, []);

  const canCreateBlank = selectedHost && sessionName.trim().length > 0;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundComponent={renderBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Launch Session
        </AppText>

        {/* Mode Toggle */}
        <View style={styles.modeSection}>
          <SegmentedControl
            values={['Projects', 'Blank Session']}
            selectedIndex={mode === 'projects' ? 0 : 1}
            onChange={(e) => setMode(e.nativeEvent.selectedSegmentIndex === 0 ? 'projects' : 'blank')}
            style={styles.segmentedControl}
          />
        </View>

        {/* Recent Launches (Projects mode only) */}
        {mode === 'projects' && recentLaunches.length > 0 && (
          <View style={styles.section}>
            <AppText variant="caps" tone="muted" style={styles.sectionLabel}>
              Recent
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {recentLaunches.slice(0, 5).map((launch) => (
                <Pressable
                  key={launch.id}
                  style={styles.recentCard}
                  onPress={() => handleRecentLaunch(launch)}
                  disabled={launching}
                >
                  <AppText variant="label" numberOfLines={1}>{launch.command.label}</AppText>
                  <AppText variant="caps" tone="muted" numberOfLines={1}>{launch.projectName}</AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Host Selection */}
        <View style={styles.section}>
          <AppText variant="caps" tone="muted" style={styles.sectionLabel}>
            Host
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {hosts.map((host, idx) => (
              <Pressable
                key={host.id}
                style={[styles.chip, selectedHostId === host.id && styles.chipSelected]}
                onPress={() => {
                  setSelectedHostId(selectedHostId === host.id ? null : host.id);
                  setSelectedProjectId(null);
                }}
              >
                <View style={[styles.chipDot, { backgroundColor: host.color || hostAccents[idx % hostAccents.length] }]} />
                <AppText variant="label" style={selectedHostId === host.id ? styles.chipTextSelected : undefined}>
                  {host.name}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Projects Mode Content */}
        {mode === 'projects' && selectedHostId && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="caps" tone="muted" style={styles.sectionLabel}>Project</AppText>
                <Pressable onPress={() => router.push('/projects/new')}>
                  <AppText variant="caps" style={styles.addLink}>+ Add</AppText>
                </Pressable>
              </View>
              {hostProjects.length === 0 ? (
                <View style={styles.emptyState}>
                  <AppText variant="body" tone="muted">No projects for this host</AppText>
                  <Pressable style={styles.addButton} onPress={() => router.push('/projects/new')}>
                    <AppText variant="label" style={styles.addButtonText}>Add Project</AppText>
                  </Pressable>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {hostProjects.map((project) => (
                    <Pressable
                      key={project.id}
                      style={[styles.chip, selectedProjectId === project.id && styles.chipSelected]}
                      onPress={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}
                    >
                      <AppText variant="label" style={selectedProjectId === project.id ? styles.chipTextSelected : undefined}>
                        {project.name}
                      </AppText>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            {selectedProject && (
              <View style={styles.section}>
                <AppText variant="caps" tone="muted" style={styles.sectionLabel}>Commands</AppText>
                {loadingScripts ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={palette.accent} />
                  </View>
                ) : allCommands.length === 0 ? (
                  <View style={styles.emptyState}>
                    <AppText variant="body" tone="muted">No commands available</AppText>
                  </View>
                ) : (
                  <View style={styles.commandsList}>
                    {allCommands.map((command) => (
                      <Pressable
                        key={command.id}
                        style={({ pressed }) => [styles.commandCard, pressed && styles.commandCardPressed]}
                        onPress={() => handleLaunch(command)}
                        disabled={launching}
                      >
                        <View style={styles.commandInfo}>
                          <AppText variant="subtitle">{command.label}</AppText>
                          <AppText variant="mono" tone="muted" numberOfLines={1}>{command.command}</AppText>
                        </View>
                        <View style={styles.launchIcon}>
                          <AppText variant="label" style={styles.launchIconText}>{launching ? '...' : '>'}</AppText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* Blank Session Mode Content */}
        {mode === 'blank' && selectedHostId && (
          <View style={styles.section}>
            <AppText variant="caps" tone="muted" style={styles.sectionLabel}>
              Session Name
            </AppText>
            <TextInput
              style={styles.sessionNameInput}
              value={sessionName}
              onChangeText={setSessionName}
              placeholder="my-session"
              placeholderTextColor={palette.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={[styles.createButton, !canCreateBlank && styles.createButtonDisabled]}
              onPress={handleCreateBlankSession}
              disabled={!canCreateBlank || launching}
            >
              <AppText variant="subtitle" style={styles.createButtonText}>
                {launching ? 'Creating...' : 'Create & Open'}
              </AppText>
            </Pressable>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  indicator: {
    backgroundColor: palette.line,
    width: 40,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  modeSection: {
    marginBottom: theme.spacing.lg,
  },
  segmentedControl: {
    height: 36,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    marginBottom: theme.spacing.sm,
  },
  addLink: {
    color: palette.accent,
  },
  recentRow: {
    gap: theme.spacing.sm,
  },
  recentCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    minWidth: 120,
    gap: 4,
  },
  chipRow: {
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    backgroundColor: palette.surfaceAlt,
  },
  chipSelected: {
    backgroundColor: palette.mint,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipTextSelected: {
    color: palette.accentStrong,
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: palette.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  addButtonText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  commandsList: {
    gap: theme.spacing.sm,
  },
  commandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  commandCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  commandInfo: {
    flex: 1,
    gap: 4,
  },
  launchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchIconText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sessionNameInput: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 16,
    color: palette.ink,
    marginBottom: theme.spacing.md,
  },
  createButton: {
    backgroundColor: palette.accent,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: palette.line,
  },
  createButtonText: {
    color: '#FFFFFF',
  },
});
```

---

## File 7: `app/hosts/index.tsx` (MODIFY)

### Changes:

1. **Add imports**:
```tsx
import { GlassCard } from '@/components/GlassCard';
import { HostContextMenu } from '@/components/HostContextMenu';
```

2. **Update HostCard rendering** to wrap with context menu and glass:
```tsx
// In hostCards useMemo:
hosts.map((host, index) => (
  <FadeIn key={host.id} delay={index * 50}>
    <HostContextMenu
      host={host}
      onEdit={() => router.push(`/hosts/${host.id}/edit`)}
      onDelete={() => removeHost(host.id)}
      onViewSessions={() => router.push(`/hosts/${host.id}`)}
    >
      <GlassCard>
        <HostCard
          host={host}
          status={statusMap[host.id]}
          onPress={() => router.push(`/hosts/${host.id}`)}
        />
      </GlassCard>
    </HostContextMenu>
  </FadeIn>
))
```

Note: The HostCard component may need style adjustments to work inside GlassCard (remove its own background/shadow).

---

## File 8: `app/projects/index.tsx` (MODIFY)

### Changes:

1. **Add imports**:
```tsx
import { GlassCard } from '@/components/GlassCard';
import { ProjectContextMenu } from '@/components/ProjectContextMenu';
```

2. **Replace project card rendering** - remove action buttons, use context menu:
```tsx
// Replace the projectCard section:
{hostProjects.map((project) => (
  <ProjectContextMenu
    key={project.id}
    project={project}
    onEditCommands={() => router.push(`/projects/${project.id}/commands`)}
    onDelete={() => removeProject(project.id)}
  >
    <GlassCard style={styles.projectCard}>
      <View style={styles.projectInfo}>
        <AppText variant="subtitle">{project.name}</AppText>
        <AppText variant="mono" tone="muted" numberOfLines={1}>
          {project.path}
        </AppText>
        {project.customCommands && project.customCommands.length > 0 && (
          <AppText variant="caps" tone="muted">
            {project.customCommands.length} custom command
            {project.customCommands.length !== 1 ? 's' : ''}
          </AppText>
        )}
      </View>
    </GlassCard>
  </ProjectContextMenu>
))}
```

3. **Remove action buttons and related styles**:
```tsx
// DELETE these styles:
projectActions: { ... },
actionButton: { ... },
actionButtonText: { ... },
deleteButton: { ... },
deleteButtonText: { ... },
```

4. **Update projectCard style** (remove background/shadow):
```tsx
projectCard: {
  padding: theme.spacing.md,
  // GlassCard handles background and radius
},
```

---

## File 9: `components/HostCard.tsx` (MODIFY - if needed)

The HostCard may need to be updated to not have its own background/shadow when used inside GlassCard. Check if it has these and optionally add a `transparent` prop or adjust styles.

---

## Testing Checklist

- [ ] Main page: Session cards show with glass effect, no previews
- [ ] Main page: Long-press session shows native context menu
- [ ] Main page: Context menu actions work (kill, copy, view details)
- [ ] Launch sheet: Mode toggle switches between Projects and Blank Session
- [ ] Launch sheet: Blank session mode creates and navigates correctly
- [ ] Launch sheet: Glass background visible on iOS 26+
- [ ] Hosts page: Glass cards with context menus
- [ ] Projects page: Glass cards with context menus (no action buttons)
- [ ] All pages: Fallback works on older iOS and Android

---

## Implementation Order

1. Create `components/GlassCard.tsx`
2. Create `components/SessionContextMenu.tsx`
3. Create `components/HostContextMenu.tsx`
4. Create `components/ProjectContextMenu.tsx`
5. Update `app/index.tsx` (remove previews, add glass + context menus)
6. Update `components/LaunchSheet.tsx` (mode toggle, blank session, glass bg)
7. Update `app/hosts/index.tsx` (glass + context menus)
8. Update `app/projects/index.tsx` (glass + context menus, remove buttons)
9. Test on iOS 26 simulator and older iOS
