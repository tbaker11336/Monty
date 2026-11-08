import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatClockTime, type ClockTime } from '@monty/core';
import { colors, radius, spacing, touchTarget } from '@/theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  /** Row label, e.g. "Evening start". */
  label: string;
  value: ClockTime;
  options: ClockTime[];
  onChange: (value: ClockTime) => void;
}

/** A card row with the current time as a pill; tapping opens a simple sheet of half-hour choices. */
export function TimePicker({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.row}>
      <AppText style={styles.flex}>{label}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatClockTime(value)}. Change`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      >
        <AppText variant="heading" color={colors.primary}>
          {formatClockTime(value)}
        </AppText>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <AppText variant="heading" accessibilityRole="header">
            {label}
          </AppText>
          <ScrollView contentContainerStyle={styles.grid}>
            {options.map((t) => {
              const selected = t === value;
              return (
                <Pressable
                  key={t}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
                >
                  <AppText variant="heading" color={selected ? colors.onPrimary : colors.ink}>
                    {formatClockTime(t)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
          <Button label="Close" variant="quiet" onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: { flex: 1 },
  pill: {
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.button,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(35, 48, 43, 0.35)' },
  sheet: {
    maxHeight: '65%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    gap: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    minHeight: touchTarget,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
