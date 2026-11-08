import { router, useLocalSearchParams } from 'expo-router';
import { BubbleStep, MicrophoneStep } from '@/features/setup/intro';
import { CalendarStep, RemindersStep, TimeStep, WhenStep } from '@/features/setup/steps';

/** Edit one setting using the same screen as onboarding. */
export default function EditSetting() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const done = () => router.back();
  const props = { mode: 'edit' as const, onDone: done, onBack: done };
  switch (step) {
    case 'time':
      return <TimeStep {...props} />;
    case 'when':
      return <WhenStep {...props} />;
    case 'calendar':
      return <CalendarStep {...props} />;
    case 'reminders':
      return <RemindersStep {...props} />;
    case 'bubble':
      return <BubbleStep {...props} />;
    case 'microphone':
      return <MicrophoneStep onDone={done} onBack={done} />;
    default:
      return <TimeStep {...props} />;
  }
}
