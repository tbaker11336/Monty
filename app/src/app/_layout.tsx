import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrate } from '@/db/migrations';
import { SettingsProvider, useSettings } from '@/state/SettingsContext';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Keeps the splash screen up until fonts and settings are ready, so nothing flickers.
 * Font state lives here, inside the providers: SQLiteProvider does not re-render its
 * children when its parent re-renders, so state passed down from above would go stale.
 */
function AppStack() {
  const { loaded } = useSettings();
  // If the font fails or is slow to load, carry on with the system sans fallback.
  const [fontsLoaded, fontError] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold });
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  const ready = (fontsLoaded || !!fontError || fontTimedOut) && loaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings/[step]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="monty.db" onInit={migrate}>
          <SettingsProvider>
            <StatusBar style="dark" />
            <AppStack />
          </SettingsProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
