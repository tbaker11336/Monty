import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GROWTH_STAGES, growthProgress, isResting, recordGrowth, toISODate } from '@monty/core';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Monty } from '@/components/Monty';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { useMontyData } from '@/hooks/useMontyData';
import { spacing } from '@/theme/tokens';

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { companion, openTasks, setCompanion } = useMontyData();
  const today = toISODate(new Date());
  const resting = isResting(companion, today);
  const progress = growthProgress(companion.growthPoints);
  const [talkNote, setTalkNote] = useState(false);

  // Developer-only preview so every growth stage can be checked on a real phone.
  const [preview, setPreview] = useState<{ level: number; resting: boolean } | null>(null);
  const shownLevel = preview?.level ?? progress.level;
  const shownResting = preview?.resting ?? resting;

  const growthLine =
    progress.pointsToNext === null
      ? 'Monty is in full bloom.'
      : `${progress.pointsToNext} more ${progress.pointsToNext === 1 ? 'point' : 'points'} until Monty grows`;

  return (
    <Screen
      title={greeting(new Date().getHours())}
      subtitle={shownResting ? 'Monty is napping. Do one small thing to wake it.' : 'Monty is ready to listen.'}
    >
      <View style={styles.hero}>
        <Monty level={shownLevel} resting={shownResting} size={150} />
        <View style={styles.growth}>
          <AppText variant="small" align="center">
            {growthLine}
          </AppText>
          <ProgressBar value={progress.fraction} height={10} label="Growth until Monty's next stage" />
        </View>
      </View>

      <Button
        label="Tap to talk to Monty"
        accessibilityHint="Record what is on your mind"
        onPress={() => setTalkNote(true)}
      />
      {talkNote ? (
        <AppText variant="small" align="center">
          Talking arrives in the next build. Monty is listening soon.
        </AppText>
      ) : null}

      <AppText variant="label" style={styles.sectionLabel}>
        Today&apos;s steps
      </AppText>
      {openTasks.length === 0 ? (
        <Card>
          <AppText variant="secondary">
            Nothing planned yet. Talk through what is on your mind and Monty will turn it into small steps.
          </AppText>
        </Card>
      ) : (
        openTasks.slice(0, 5).map((task) => (
          <Card key={task.id} style={styles.row}>
            <AppText style={styles.flex}>{task.title}</AppText>
            <AppText variant="small">{task.estimatedMinutes} min</AppText>
          </Card>
        ))
      )}

      {__DEV__ ? (
        <Card style={styles.dev}>
          <AppText variant="label">Developer preview</AppText>
          <AppText variant="small">
            Stage: {GROWTH_STAGES[shownLevel]} {shownResting ? '(napping)' : ''} · {companion.growthPoints} points
          </AppText>
          <View style={styles.devButtons}>
            <Button
              size="small"
              variant="secondary"
              label="Next stage"
              onPress={() => setPreview({ level: (shownLevel + 1) % GROWTH_STAGES.length, resting: shownResting })}
            />
            <Button
              size="small"
              variant="secondary"
              label={shownResting ? 'Wake' : 'Nap'}
              onPress={() => setPreview({ level: shownLevel, resting: !shownResting })}
            />
            <Button
              size="small"
              variant="secondary"
              label="+ Step done"
              onPress={() => {
                setPreview(null);
                setCompanion(recordGrowth(companion, 'step', today)).catch(console.warn);
              }}
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  growth: { width: 220, gap: 6 },
  sectionLabel: { marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  flex: { flex: 1 },
  dev: { gap: spacing.sm, marginTop: spacing.lg },
  devButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
