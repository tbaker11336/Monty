import { router } from 'expo-router';
import { MicrophoneStep } from '@/features/setup/intro';

export default function Microphone() {
  return <MicrophoneStep onBack={() => router.back()} onDone={() => router.push('/onboarding/bubble')} />;
}
