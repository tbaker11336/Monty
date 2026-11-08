import { Redirect, Stack } from 'expo-router';
import { useSettings } from '@/state/SettingsContext';
import { colors } from '@/theme/tokens';

export default function OnboardingLayout() {
  const { settings } = useSettings();
  // Finishing onboarding flips this flag; the redirect then takes the person home.
  if (settings.onboarded) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
