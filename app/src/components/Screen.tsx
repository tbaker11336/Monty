import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** Small action shown to the right of the title, e.g. a settings button. */
  headerRight?: ReactNode;
}

/** Standard page: safe area, title block, scrolling content with generous spacing. */
export function Screen({ title, subtitle, children, headerRight }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <AppText variant="title" accessibilityRole="header">
              {title}
            </AppText>
            {subtitle ? <AppText variant="secondary">{subtitle}</AppText> : null}
          </View>
          {headerRight}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.xs },
  header: { flex: 1, gap: 2 },
});
