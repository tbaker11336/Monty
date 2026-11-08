import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { describeTimeWindows, formatClockTime, formatMinutes, usesRoundup, type Settings } from '@monty/core';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { hasMicrophone } from '@/lib/permissions';
import { useSettings } from '@/state/SettingsContext';
import { colors, radius, spacing, touchTarget } from '@/theme/tokens';

const CALENDAR_LABEL: Record<Settings['calendarChoices'][number], string> = {
  monty: 'Monty',
  phone: 'Phone calendar',
  google: 'Google Calendar',
  outlook: 'Outlook',
};

const REMINDER_LABEL: Record<Settings['reminderStyle'], string> = {
  as_it_happens: 'As it happens',
  daily_roundup: 'Daily roundup',
  both: 'Roundup and nudges',
  only_when_asked: 'Only when I ask',
};

function Row({ label, value, href }: { label: string; value: string; href: Href }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Change`}
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.flex}>
        <AppText variant="heading">{label}</AppText>
        <AppText variant="small">{value}</AppText>
      </View>
      <AppText variant="heading" color={colors.primary}>
        Change
      </AppText>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const [mic, setMic] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      hasMicrophone().then(setMic).catch(() => setMic(null));
    }, []),
  );

  const reminders = usesRoundup(settings.reminderStyle)
    ? `${REMINDER_LABEL[settings.reminderStyle]} at ${formatClockTime(settings.roundupTime)}`
    : REMINDER_LABEL[settings.reminderStyle];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <AppText variant="secondary">‹ Back</AppText>
        </Pressable>
        <AppText variant="title" accessibilityRole="header">
          Settings
        </AppText>

        <Row label="Time each day" value={formatMinutes(settings.dailyMinutes)} href="/settings/time" />
        <Row label="Best time" value={describeTimeWindows(settings.timeWindows)} href="/settings/when" />
        <Row
          label="Calendar"
          value={settings.calendarChoices.map((c) => CALENDAR_LABEL[c]).join(', ')}
          href="/settings/calendar"
        />
        <Row label="Reminders" value={reminders} href="/settings/reminders" />
        <Row label="Floating bubble" value={settings.bubbleEnabled ? 'On' : 'Off'} href="/settings/bubble" />
        <Row
          label="Microphone"
          value={mic === null ? 'Unknown' : mic ? 'Allowed' : 'Not allowed'}
          href="/settings/microphone"
        />

        <AppText variant="small" style={styles.privacy}>
          No account. Your plans stay on this phone. Only the text of what you say is sent to Monty&apos;s server to
          sort it, and it is not stored there.
        </AppText>

        {__DEV__ ? (
          <Button
            variant="secondary"
            size="small"
            label="Developer: run onboarding again"
            onPress={() => update({ onboarded: false }).then(() => router.replace('/onboarding'))}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { minHeight: touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  flex: { flex: 1, gap: 2 },
  privacy: { marginTop: spacing.sm },
});
