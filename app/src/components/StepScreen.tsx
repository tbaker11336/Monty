import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, touchTarget } from '@/theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';
import { Monty } from './Monty';

interface Props {
  /** e.g. "Step 1 of 4"; shows a little Monty beside it. */
  step?: string;
  title?: string;
  subtitle?: string;
  /** Centred hero content (welcome and permission screens). */
  centered?: boolean;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onBack?: () => void;
}

/** Layout shared by onboarding and settings steps: content scrolls, actions stay at the bottom. */
export function StepScreen({
  step,
  title,
  subtitle,
  centered,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
  onBack,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {onBack || step ? (
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable accessibilityRole="button" onPress={onBack} style={styles.back} hitSlop={8}>
              <AppText variant="secondary">‹ Back</AppText>
            </Pressable>
          ) : null}
          {step ? (
            <View style={styles.step}>
              <Monty level={2} size={28} />
              <AppText variant="small">{step}</AppText>
            </View>
          ) : null}
        </View>
      ) : null}
      <ScrollView contentContainerStyle={[styles.content, centered && styles.centered]}>
        {title ? (
          <AppText variant="title" accessibilityRole="header" align={centered ? 'center' : undefined}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="secondary" align={centered ? 'center' : undefined} style={centered && styles.centeredText}>
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} />
        {secondaryLabel && onSecondary ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSecondary}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
          >
            <AppText variant="secondary" align="center" style={styles.underline}>
              {secondaryLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  centered: { justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  centeredText: { maxWidth: 310 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  back: { minHeight: touchTarget, justifyContent: 'center', paddingRight: spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto' },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.xs },
  secondary: { minHeight: touchTarget, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
});
