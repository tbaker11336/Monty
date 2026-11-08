import { router } from 'expo-router';
import { RemindersStep } from '@/features/setup/steps';
import { useSettings } from '@/state/SettingsContext';

export default function Reminders() {
  const { update } = useSettings();
  // Marking onboarding done makes the onboarding layout redirect home.
  return <RemindersStep mode="onboarding" onBack={() => router.back()} onDone={() => update({ onboarded: true })} />;
}
