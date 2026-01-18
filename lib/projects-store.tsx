import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, RecentLaunch } from '@/lib/types';
import { createId } from '@/lib/defaults';

const PROJECTS_KEY = 'tmux.projects.v1';
const RECENT_LAUNCHES_KEY = 'tmux.recent-launches.v1';
const MAX_RECENT_LAUNCHES = 10;

async function loadProjects(): Promise<Project[]> {
  const raw = await AsyncStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((project) => {
      const { customCommands: _customCommands, ...rest } = project as StoredProject;
      return rest as Project;
    });
  } catch {
    return [];
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

async function loadRecentLaunches(): Promise<RecentLaunch[]> {
  const raw = await AsyncStorage.getItem(RECENT_LAUNCHES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RecentLaunch[];
  } catch {
    return [];
  }
}

async function saveRecentLaunches(launches: RecentLaunch[]): Promise<void> {
  await AsyncStorage.setItem(RECENT_LAUNCHES_KEY, JSON.stringify(launches));
}

type ProjectDraft = Omit<Project, 'id'>;
type StoredProject = Project & { customCommands?: unknown };

const ProjectsContext = createContext<{
  projects: Project[];
  recentLaunches: RecentLaunch[];
  ready: boolean;
  addProject: (draft: ProjectDraft) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  addRecentLaunch: (launch: Omit<RecentLaunch, 'id' | 'timestamp'>) => Promise<void>;
  getProjectsByHost: (hostId: string) => Project[];
} | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentLaunches, setRecentLaunches] = useState<RecentLaunch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [storedProjects, storedLaunches] = await Promise.all([
        loadProjects(),
        loadRecentLaunches(),
      ]);
      if (!mounted) return;
      setProjects(storedProjects);
      setRecentLaunches(storedLaunches);
      setReady(true);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistProjects = useCallback(async (nextProjects: Project[]) => {
    setProjects(nextProjects);
    await saveProjects(nextProjects);
  }, []);

  const persistRecentLaunches = useCallback(async (nextLaunches: RecentLaunch[]) => {
    setRecentLaunches(nextLaunches);
    await saveRecentLaunches(nextLaunches);
  }, []);

  const addProject = useCallback(
    async (draft: ProjectDraft): Promise<Project> => {
      const project: Project = {
        ...draft,
        id: createId('project'),
      };
      await persistProjects([...projects, project]);
      return project;
    },
    [projects, persistProjects]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      const nextProjects = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
      await persistProjects(nextProjects);
    },
    [projects, persistProjects]
  );

  const removeProject = useCallback(
    async (id: string) => {
      const nextProjects = projects.filter((p) => p.id !== id);
      await persistProjects(nextProjects);
    },
    [projects, persistProjects]
  );

  const addRecentLaunch = useCallback(
    async (launch: Omit<RecentLaunch, 'id' | 'timestamp'>) => {
      const newLaunch: RecentLaunch = {
        ...launch,
        id: createId('launch'),
        timestamp: Date.now(),
      };
      const filtered = recentLaunches.filter(
        (l) => !(l.projectId === launch.projectId && l.command.command === launch.command.command)
      );
      const nextLaunches = [newLaunch, ...filtered].slice(0, MAX_RECENT_LAUNCHES);
      await persistRecentLaunches(nextLaunches);
    },
    [recentLaunches, persistRecentLaunches]
  );

  const getProjectsByHost = useCallback(
    (hostId: string) => projects.filter((p) => p.hostId === hostId),
    [projects]
  );

  const value = useMemo(
    () => ({
      projects,
      recentLaunches,
      ready,
      addProject,
      updateProject,
      removeProject,
      addRecentLaunch,
      getProjectsByHost,
    }),
    [
      projects,
      recentLaunches,
      ready,
      addProject,
      updateProject,
      removeProject,
      addRecentLaunch,
      getProjectsByHost,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
}
