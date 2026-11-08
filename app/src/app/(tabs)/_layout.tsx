import { Redirect, Tabs } from 'expo-router';
import { TabIcon, type TabIconName } from '@/components/TabIcon';
import { useSettings } from '@/state/SettingsContext';
import { colors, fonts } from '@/theme/tokens';

const TABS: { name: string; title: string; icon: TabIconName }[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'today', title: 'Today', icon: 'today' },
  { name: 'week', title: 'Week', icon: 'week' },
  { name: 'habits', title: 'Habits', icon: 'habits' },
];

export default function TabsLayout() {
  const { settings } = useSettings();
  if (!settings.onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 13 },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1.5,
          minHeight: 64,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => <TabIcon name={tab.icon} color={String(color ?? colors.muted)} filled={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
