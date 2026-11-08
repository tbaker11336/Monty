import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, touchTarget } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  /** primary = filled green, secondary = outlined, quiet = text only */
  variant?: 'primary' | 'secondary' | 'quiet';
  size?: 'large' | 'small';
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', size = 'large', style, disabled, ...rest }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        size === 'large' ? styles.large : styles.small,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        variant={size === 'large' ? 'button' : 'heading'}
        color={isPrimary ? colors.onPrimary : colors.primary}
        align="center"
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { paddingVertical: 18, paddingHorizontal: spacing.xl },
  small: { paddingVertical: 10, paddingHorizontal: 18 },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 2, borderColor: colors.primary, backgroundColor: 'transparent' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
