import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { NEW_COMPANION, type Companion, type Settings, type Task } from '@monty/core';
import { listOpenTasks, loadCompanion, saveCompanion } from '@/db/repos';
import { useSettings } from '@/state/SettingsContext';

interface MontyData {
  settings: Settings;
  companion: Companion;
  openTasks: Task[];
  loaded: boolean;
  setCompanion: (c: Companion) => Promise<void>;
  reload: () => Promise<void>;
}

/** Loads the basics for a screen and refreshes them whenever it comes into focus. */
export function useMontyData(): MontyData {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const [companion, setCompanionState] = useState<Companion>(NEW_COMPANION);
  const [openTasks, setOpenTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const [c, t] = await Promise.all([loadCompanion(db), listOpenTasks(db)]);
    setCompanionState(c);
    setOpenTasks(t);
    setLoaded(true);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.warn('Could not load Monty data', e));
    }, [reload]),
  );

  const setCompanion = useCallback(
    async (c: Companion) => {
      await saveCompanion(db, c);
      setCompanionState(c);
    },
    [db],
  );

  return { settings, companion, openTasks, loaded, setCompanion, reload };
}
