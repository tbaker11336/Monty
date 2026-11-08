import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';

export function ProgressBar({ value, height = 8, label }: { value: number; height?: number; label: string }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, borderRadius: height / 2 }]}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%`, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.progressTrack, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.progress },
});
