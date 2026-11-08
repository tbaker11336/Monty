import { router } from 'expo-router';
import { TimeStep } from '@/features/setup/steps';

export default function Time() {
  return <TimeStep mode="onboarding" onBack={() => router.back()} onDone={() => router.push('/onboarding/when')} />;
}
