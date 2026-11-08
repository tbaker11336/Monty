import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme/tokens';
import { AppText } from './AppText';

/** Small outlined tag, e.g. "One win" or "Evening". */
export function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="label" color={colors.primary} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.chip,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: { textTransform: 'none', letterSpacing: 0 },
});
