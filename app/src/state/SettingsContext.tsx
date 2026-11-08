import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '@monty/core';
import { loadSettings, saveSettings } from '@/db/repos';

interface SettingsValue {
  settings: Settings;
  loaded: boolean;
  /** Saves to the database, then updates everyone reading settings. */
  update: (patch: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings(db)
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch((e) => console.warn('Could not load settings', e))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const update = useCallback(
    async (patch: Partial<Settings>) => {
      await saveSettings(db, patch);
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [db],
  );

  const value = useMemo(() => ({ settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
