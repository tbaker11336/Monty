import { router } from 'expo-router';
import { BubbleStep } from '@/features/setup/intro';

export default function Bubble() {
  return <BubbleStep mode="onboarding" onBack={() => router.back()} onDone={() => router.push('/onboarding/time')} />;
}
