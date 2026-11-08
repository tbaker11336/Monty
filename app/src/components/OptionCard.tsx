import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  /** checkbox = pick several, radio = pick one */
  kind: 'checkbox' | 'radio';
  disabled?: boolean;
}

/**
 * A large selectable row. Selection is shown by the filled mark and a thicker
 * green border as well as colour, so it never relies on colour alone.
 */
export function OptionCard({ label, hint, selected, onPress, kind, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      accessibilityHint={hint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.mark, kind === 'radio' ? styles.round : styles.square]}>
        {selected ? <View style={[styles.markFill, kind === 'radio' ? styles.round : styles.squareInner]} /> : null}
      </View>
      <View style={styles.text}>
        <AppText variant="heading">{label}</AppText>
        {hint ? <AppText variant="small">{hint}</AppText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.softGreen },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
  mark: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  square: { borderRadius: 6 },
  squareInner: { borderRadius: 3 },
  round: { borderRadius: 12 },
  markFill: { width: 12, height: 12, backgroundColor: colors.primary },
  text: { flex: 1, gap: 2 },
});
