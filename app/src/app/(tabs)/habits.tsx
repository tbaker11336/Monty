import { StyleSheet, View } from 'react-native';
import { MAX_ACTIVE_HABITS } from '@monty/core';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/theme/tokens';

export default function HabitsScreen() {
  return (
    <Screen title="Habits" subtitle={`0 of ${MAX_ACTIVE_HABITS} slots in use.`}>
      {Array.from({ length: MAX_ACTIVE_HABITS }, (_, i) => (
        <View key={i} style={styles.emptySlot}>
          <AppText variant="heading" color={colors.primary}>
            Empty slot
          </AppText>
          <AppText variant="small">Tiny habits arrive in a later build.</AppText>
        </View>
      ))}
      <AppText variant="small">An empty dot is just a quiet day. Nothing resets.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptySlot: {
    minHeight: 72,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.hollowDot,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 2,
  },
});
