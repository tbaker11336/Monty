import { router } from 'expo-router';
import { WelcomeStep } from '@/features/setup/intro';

export default function Welcome() {
  return <WelcomeStep onDone={() => router.push('/onboarding/microphone')} />;
}
