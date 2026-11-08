import { StyleSheet, View } from 'react-native';
import { addDays, toISODate } from '@monty/core';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/theme/tokens';

export default function WeekScreen() {
  const today = toISODate(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  return (
    <Screen title="Week" subtitle="A gentle look at the days ahead.">
      {days.map((date, i) => {
        const label = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        });
        return (
          <Card key={date} style={[styles.day, i === 0 && styles.today]}>
            <View style={styles.flex}>
              <AppText variant="heading">{i === 0 ? `Today · ${label}` : label}</AppText>
              <AppText variant="small">Nothing planned</AppText>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  day: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  today: { borderWidth: 2, borderColor: colors.primary },
  flex: { flex: 1, gap: 2 },
});
