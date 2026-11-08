import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  DAILY_MINUTE_PRESETS,
  DAILY_MINUTES_STEP,
  MAX_DAILY_MINUTES,
  MIN_DAILY_MINUTES,
  TIME_WINDOWS,
  TIME_WINDOW_ORDER,
  chosenWindows,
  clampDailyMinutes,
  formatMinutes,
  roundupTimeOptions,
  startTimeOptions,
  toggleTimeWindow,
  usesRoundup,
  type CalendarChoice,
  type ReminderStyle,
} from '@monty/core';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { OptionCard } from '@/components/OptionCard';
import { StepScreen } from '@/components/StepScreen';
import { TimePicker } from '@/components/TimePicker';
import { features } from '@/lib/features';
import { useSettings } from '@/state/SettingsContext';
import { colors, radius, spacing, touchTarget } from '@/theme/tokens';

/**
 * The four preference steps. Each is used twice: in onboarding ("Step n of 4",
 * Next) and from Settings (Save, then back). Choices are saved when the person
 * moves on, so nothing is lost if the app closes halfway.
 */
export interface StepProps {
  mode: 'onboarding' | 'edit';
  onDone: () => void;
  onBack?: () => void;
}

const stepLabel = (mode: StepProps['mode'], n: number) => (mode === 'onboarding' ? `Step ${n} of 4` : undefined);

// ---------- 1. Time per day ----------

export function TimeStep({ mode, onDone, onBack }: StepProps) {
  const { settings, update } = useSettings();
  const [minutes, setMinutes] = useState(settings.dailyMinutes);
  const isPreset = (DAILY_MINUTE_PRESETS as readonly number[]).includes(minutes);
  const [custom, setCustom] = useState(!isPreset);

  const save = async () => {
    await update({ dailyMinutes: clampDailyMinutes(minutes) });
    onDone();
  };

  return (
    <StepScreen
      step={stepLabel(mode, 1)}
      onBack={onBack}
      title="How much time can you give each day?"
      subtitle="Monty fits small steps into this. You can change it any time."
      primaryLabel={mode === 'onboarding' ? 'Next' : 'Save'}
      onPrimary={save}
      secondaryLabel={mode === 'onboarding' ? 'Decide later' : undefined}
      onSecondary={onDone}
    >
      <View style={styles.grid}>
        {DAILY_MINUTE_PRESETS.map((m) => (
          <Tile
            key={m}
            label={formatMinutes(m)}
            selected={!custom && minutes === m}
            onPress={() => {
              setCustom(false);
              setMinutes(m);
            }}
          />
        ))}
        <Tile label="Custom" selected={custom} onPress={() => setCustom(true)} />
      </View>

      {custom ? (
        <Card style={styles.stepper}>
          <StepperButton
            label="−"
            accessibilityLabel="Five minutes less"
            disabled={minutes <= MIN_DAILY_MINUTES}
            onPress={() => setMinutes((m) => clampDailyMinutes(m - DAILY_MINUTES_STEP))}
          />
          <AppText variant="title" align="center" style={styles.flex} accessibilityLiveRegion="polite">
            {formatMinutes(minutes)}
          </AppText>
          <StepperButton
            label="+"
            accessibilityLabel="Five minutes more"
            disabled={minutes >= MAX_DAILY_MINUTES}
            onPress={() => setMinutes((m) => clampDailyMinutes(m + DAILY_MINUTES_STEP))}
          />
        </Card>
      ) : null}

      <Card>
        <AppText variant="secondary" color={colors.ink}>
          With {formatMinutes(minutes)} a day, Monty breaks big tasks into small steps that fit. Nothing piles up.
        </AppText>
      </Card>
    </StepScreen>
  );
}

function Tile({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, selected && styles.tileSelected, pressed && styles.pressed]}
    >
      <AppText variant="heading" color={selected ? colors.onPrimary : colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

function StepperButton({
  label,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed, disabled && { opacity: 0.4 }]}
    >
      <AppText variant="title" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

// ---------- 2. Best time ----------

export function WhenStep({ mode, onDone, onBack }: StepProps) {
  const { settings, update } = useSettings();
  const [windows, setWindows] = useState(settings.timeWindows);
  const chosen = chosenWindows(windows);

  const save = async () => {
    await update({ timeWindows: windows });
    onDone();
  };

  return (
    <StepScreen
      step={stepLabel(mode, 2)}
      onBack={onBack}
      title="When works best for your tasks?"
      subtitle="Pick one or more. Monty schedules around these."
      primaryLabel={mode === 'onboarding' ? 'Next' : 'Save'}
      onPrimary={save}
    >
      {TIME_WINDOW_ORDER.map((w) => (
        <OptionCard
          key={w}
          kind="checkbox"
          label={TIME_WINDOWS[w].label}
          hint={TIME_WINDOWS[w].hint}
          selected={!!windows[w]}
          onPress={() => setWindows((cur) => toggleTimeWindow(cur, w))}
        />
      ))}
      {chosen
        .filter((w) => w !== 'flexible')
        .map((w) => (
          <TimePicker
            key={w}
            label={`${TIME_WINDOWS[w].label} start`}
            value={windows[w]!}
            options={startTimeOptions(w)}
            onChange={(t) => setWindows((cur) => ({ ...cur, [w]: t }))}
          />
        ))}
    </StepScreen>
  );
}

// ---------- 3. Calendar ----------

const CALENDAR_OPTIONS: { value: CalendarChoice; label: string; hint: string; later?: boolean }[] = [
  { value: 'monty', label: 'Monty is my calendar', hint: 'Nothing to connect' },
  { value: 'phone', label: 'Phone calendar', hint: 'Whatever is already on this phone' },
  { value: 'google', label: 'Google Calendar', hint: 'Sign in with Google', later: true },
  { value: 'outlook', label: 'Microsoft Outlook', hint: 'Sign in with Microsoft', later: true },
];

export function CalendarStep({ mode, onDone, onBack }: StepProps) {
  const { settings, update } = useSettings();
  const [choices, setChoices] = useState<CalendarChoice[]>(settings.calendarChoices);

  const toggle = (value: CalendarChoice) =>
    setChoices((cur) => (cur.includes(value) ? cur.filter((c) => c !== value) : [...cur, value]));

  const save = async () => {
    // With nothing ticked, Monty is the calendar.
    await update({ calendarChoices: choices.length > 0 ? choices : ['monty'] });
    onDone();
  };

  return (
    <StepScreen
      step={stepLabel(mode, 3)}
      onBack={onBack}
      title="Where should your plans live?"
      subtitle="Pick one or more. You can change this any time."
      primaryLabel={mode === 'onboarding' ? 'Continue' : 'Save'}
      onPrimary={save}
      secondaryLabel={mode === 'onboarding' ? 'Not now' : undefined}
      onSecondary={onDone}
    >
      {CALENDAR_OPTIONS.map((o) => {
        const unavailable = !!o.later && !features.cloudCalendars;
        return (
          <OptionCard
            key={o.value}
            kind="checkbox"
            label={o.label}
            hint={unavailable ? 'Coming in a later version' : o.hint}
            selected={!unavailable && choices.includes(o.value)}
            disabled={unavailable}
            onPress={() => toggle(o.value)}
          />
        );
      })}
      <AppText variant="small">Connecting is optional. Monty only sees what you allow.</AppText>
    </StepScreen>
  );
}

// ---------- 4. Reminders ----------

const REMINDER_OPTIONS: { value: ReminderStyle; label: string; hint: string }[] = [
  { value: 'as_it_happens', label: 'As it happens', hint: 'A gentle nudge when something is due' },
  { value: 'daily_roundup', label: 'Daily roundup', hint: 'One summary each morning' },
  { value: 'both', label: 'Both', hint: 'A morning roundup plus nudges' },
  { value: 'only_when_asked', label: 'Only when I ask', hint: 'No notifications from Monty' },
];

export function RemindersStep({ mode, onDone, onBack }: StepProps) {
  const { settings, update } = useSettings();
  const [style, setStyle] = useState<ReminderStyle>(settings.reminderStyle);
  const [roundupTime, setRoundupTime] = useState(settings.roundupTime);

  const save = async () => {
    await update({ reminderStyle: style, roundupTime });
    onDone();
  };

  return (
    <StepScreen
      step={stepLabel(mode, 4)}
      onBack={onBack}
      title="How should Monty remind you?"
      subtitle="Choose what feels helpful, not nagging."
      primaryLabel={mode === 'onboarding' ? 'Done' : 'Save'}
      onPrimary={save}
    >
      {REMINDER_OPTIONS.map((o) => (
        <OptionCard
          key={o.value}
          kind="radio"
          label={o.label}
          hint={o.hint}
          selected={style === o.value}
          onPress={() => setStyle(o.value)}
        />
      ))}
      {usesRoundup(style) ? (
        <TimePicker
          label="Roundup time"
          value={roundupTime}
          options={roundupTimeOptions()}
          onChange={setRoundupTime}
        />
      ) : null}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.sm },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 64,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.85 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperButton: {
    width: touchTarget + 8,
    height: touchTarget + 8,
    borderRadius: radius.button,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
});
