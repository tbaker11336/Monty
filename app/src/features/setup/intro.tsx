import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Monty } from '@/components/Monty';
import { StepScreen } from '@/components/StepScreen';
import { features } from '@/lib/features';
import { openOverlaySettings, requestMicrophone } from '@/lib/permissions';
import { useSettings } from '@/state/SettingsContext';
import { colors, radius } from '@/theme/tokens';

export function WelcomeStep({ onDone }: { onDone: () => void }) {
  return (
    <StepScreen centered primaryLabel="Get started" onPrimary={onDone}>
      <Monty level={2} size={180} />
      <AppText variant="display" align="center" accessibilityRole="header">
        Hi, I&apos;m Monty
      </AppText>
      <AppText variant="body" color={colors.muted} align="center" style={styles.lead}>
        Talk through your thoughts. I&apos;ll turn them into a plan.
      </AppText>
      <AppText variant="small" align="center" style={styles.note}>
        No sign-up. Your plans stay on your phone.
      </AppText>
    </StepScreen>
  );
}

export function MicIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityElementsHidden importantForAccessibility="no">
      <Rect x={14} y={5} width={12} height={20} rx={6} fill={colors.onPrimary} />
      <Path d="M9 19a11 11 0 0 0 22 0" stroke={colors.onPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M20 31v5" stroke={colors.onPrimary} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export function MicrophoneStep({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const [blocked, setBlocked] = useState(false);
  const allow = async () => {
    const result = await requestMicrophone();
    if (result === 'blocked') {
      // Android won't show the prompt again; say how to fix it, then let them carry on.
      setBlocked(true);
      return;
    }
    onDone();
  };

  return (
    <StepScreen
      centered
      onBack={onBack}
      primaryLabel={blocked ? 'Continue' : 'Allow microphone'}
      onPrimary={blocked ? onDone : allow}
      secondaryLabel={blocked ? undefined : 'Not now'}
      onSecondary={onDone}
    >
      <View style={styles.circle}>
        <MicIcon />
      </View>
      <AppText variant="title" align="center" accessibilityRole="header">
        Monty needs to hear you
      </AppText>
      <AppText variant="body" color={colors.muted} align="center" style={styles.lead}>
        Your voice is turned into text on your phone. Only that text is sent to Monty&apos;s server to sort it into
        tasks, and you review everything before it&apos;s saved.
      </AppText>
      {blocked ? (
        <Card>
          <AppText variant="secondary" color={colors.ink}>
            The microphone is turned off for Monty. You can turn it on in Android Settings, Apps, Monty, Permissions.
          </AppText>
        </Card>
      ) : null}
    </StepScreen>
  );
}

function BubbleIllustration() {
  return (
    <View style={styles.phone} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.line, { width: '100%' }]} />
      <View style={[styles.line, { width: '70%' }]} />
      <View style={[styles.line, { width: '85%' }]} />
      <View style={styles.bubble}>
        <Monty level={2} size={34} />
      </View>
    </View>
  );
}

export function BubbleStep({
  mode,
  onDone,
  onBack,
}: {
  mode: 'onboarding' | 'edit';
  onDone: () => void;
  onBack?: () => void;
}) {
  const { settings, update } = useSettings();

  const allow = async () => {
    await update({ bubbleEnabled: true });
    await openOverlaySettings().catch(() => {});
    onDone();
  };
  const skip = async () => {
    if (mode === 'edit') await update({ bubbleEnabled: false });
    onDone();
  };

  return (
    <StepScreen
      centered
      onBack={onBack}
      primaryLabel="Allow in settings"
      onPrimary={allow}
      secondaryLabel={
        mode === 'onboarding' ? "Skip, I'll talk inside Monty" : settings.bubbleEnabled ? 'Turn the bubble off' : 'Not now'
      }
      onSecondary={skip}
    >
      <BubbleIllustration />
      <AppText variant="title" align="center" accessibilityRole="header">
        Let Monty float above your apps
      </AppText>
      <AppText variant="body" color={colors.muted} align="center" style={styles.lead}>
        Tap the bubble from anywhere, say what&apos;s on your mind, and Monty saves it for later. Android will ask you
        to turn on Display over other apps.
      </AppText>
      {!features.bubble ? (
        <AppText variant="small" align="center" style={styles.note}>
          The bubble itself arrives in a later build. Your choice is saved for then.
        </AppText>
      ) : null}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  lead: { maxWidth: 310 },
  note: { maxWidth: 300 },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: 200,
    height: 150,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    gap: 10,
  },
  line: { height: 12, borderRadius: 6, backgroundColor: '#E1E8E4' },
  bubble: {
    position: 'absolute',
    right: -18,
    top: 50,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
