import { router } from 'expo-router';
import { CalendarStep } from '@/features/setup/steps';

export default function Calendar() {
  return (
    <CalendarStep mode="onboarding" onBack={() => router.back()} onDone={() => router.push('/onboarding/reminders')} />
  );
}
