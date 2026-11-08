import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
});
