import { useEffect } from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { navTheme } from '@/lib/theme';
import { StoreProvider } from '@/lib/store';
import { ProjectsProvider } from '@/lib/projects-store';
import { QueryProvider } from '@/lib/query';
import { LaunchSheetProvider, useLaunchSheet } from '@/lib/launch-sheet';
import { LaunchSheet } from '@/components/LaunchSheet';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <StoreProvider>
          <ProjectsProvider>
            <LaunchSheetProvider>
              <ThemeProvider value={navTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="session/[hostId]/[name]/terminal" />
                  <Stack.Screen name="hosts/[id]" />
                  <Stack.Screen name="hosts/new" />
                  <Stack.Screen name="hosts/[id]/edit" />
                  <Stack.Screen name="hosts/[id]/docker/[containerId]" />
                  <Stack.Screen name="projects" />
                  <Stack.Screen name="projects/new" />
                  <Stack.Screen name="projects/[id]/commands" />
                  <Stack.Screen name="ports" />
                  <Stack.Screen name="keybinds" />
                  <Stack.Screen name="session/[hostId]/[name]" />
                </Stack>
                <GlobalLaunchSheet />
              </ThemeProvider>
            </LaunchSheetProvider>
          </ProjectsProvider>
        </StoreProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

function GlobalLaunchSheet() {
  const { isOpen, close } = useLaunchSheet();
  return <LaunchSheet isOpen={isOpen} onClose={close} />;
}
