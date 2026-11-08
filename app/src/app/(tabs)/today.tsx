import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

export default function TodayScreen() {
  return (
    <Screen title="Today" subtitle="Your steps, in time order.">
      <Card>
        <AppText variant="secondary">
          Your day plan will appear here once Monty has something to plan. Unfinished steps never pile up.
        </AppText>
      </Card>
    </Screen>
  );
}
