import { router } from 'expo-router';
import { WhenStep } from '@/features/setup/steps';

export default function When() {
  return <WhenStep mode="onboarding" onBack={() => router.back()} onDone={() => router.push('/onboarding/calendar')} />;
}
