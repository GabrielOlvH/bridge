import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { theme } from '@/lib/theme';

export default function NotFoundScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Missing' }} />
      <AppText variant="title">Lost in the panes</AppText>
      <AppText variant="body" tone="muted" style={styles.subtitle}>
        This route does not exist. Head back to the host dashboard.
      </AppText>
      <Link href="/" style={styles.link}>
        <AppText variant="subtitle" tone="accent">
          Go home
        </AppText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: theme.spacing.sm,
  },
  link: {
    marginTop: theme.spacing.lg,
  },
});
