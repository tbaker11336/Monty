/**
 * Small pure helpers behind the onboarding and settings screens.
 */
import { isValidClockTime } from './dates';
import type { ClockTime, Settings, TimeWindow } from './types';

export const DAILY_MINUTE_PRESETS = [10, 15, 20, 30, 60] as const;
export const MIN_DAILY_MINUTES = 5;
export const MAX_DAILY_MINUTES = 240;
export const DAILY_MINUTES_STEP = 5;

export function clampDailyMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 20;
  const stepped = Math.round(minutes / DAILY_MINUTES_STEP) * DAILY_MINUTES_STEP;
  return Math.min(MAX_DAILY_MINUTES, Math.max(MIN_DAILY_MINUTES, stepped));
}

/** "20 min", "1 hour", "1 hr 30 min". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h} hr ${m} min`;
}

/** "07:30" -> "7:30 am", "19:00" -> "7:00 pm", "00:15" -> "12:15 am". */
export function formatClockTime(time: ClockTime): string {
  if (!isValidClockTime(time)) return time;
  const [hStr, m] = time.split(':') as [string, string];
  const h = Number(hStr);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

export interface WindowInfo {
  label: string;
  hint: string;
  defaultStart: ClockTime;
  /** Earliest and latest start a person can pick, inclusive, in 30-minute steps. */
  earliest: ClockTime;
  latest: ClockTime;
}

export const TIME_WINDOW_ORDER: TimeWindow[] = ['morning', 'afternoon', 'evening', 'flexible'];

export const TIME_WINDOWS: Record<TimeWindow, WindowInfo> = {
  morning: { label: 'Morning', hint: 'Before the day gets busy', defaultStart: '08:00', earliest: '05:00', latest: '11:30' },
  afternoon: { label: 'Afternoon', hint: 'After lunch', defaultStart: '13:00', earliest: '12:00', latest: '16:30' },
  evening: { label: 'Evening', hint: 'Winding down', defaultStart: '19:00', earliest: '17:00', latest: '22:30' },
  flexible: { label: 'Flexible', hint: 'Let Monty choose', defaultStart: '09:00', earliest: '06:00', latest: '21:00' },
};

function toMinutesOfDay(t: ClockTime): number {
  const [h, m] = t.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

function fromMinutesOfDay(total: number): ClockTime {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Start times on offer for a window, every 30 minutes. */
export function startTimeOptions(window: TimeWindow): ClockTime[] {
  const { earliest, latest } = TIME_WINDOWS[window];
  const out: ClockTime[] = [];
  for (let t = toMinutesOfDay(earliest); t <= toMinutesOfDay(latest); t += 30) out.push(fromMinutesOfDay(t));
  return out;
}

/**
 * Turn a window on or off, keeping existing start times. At least one window
 * always stays chosen; removing the last one falls back to Flexible.
 */
export function toggleTimeWindow(
  current: Settings['timeWindows'],
  window: TimeWindow,
): Settings['timeWindows'] {
  const next = { ...current };
  if (next[window]) {
    delete next[window];
  } else {
    next[window] = TIME_WINDOWS[window].defaultStart;
  }
  if (Object.keys(next).length === 0) next.flexible = TIME_WINDOWS.flexible.defaultStart;
  return next;
}

export function chosenWindows(timeWindows: Settings['timeWindows']): TimeWindow[] {
  return TIME_WINDOW_ORDER.filter((w) => !!timeWindows[w]);
}

/** Summary used on the settings screen, e.g. "Morning 8:00 am, Evening 7:00 pm". */
export function describeTimeWindows(timeWindows: Settings['timeWindows']): string {
  return chosenWindows(timeWindows)
    .map((w) => (w === 'flexible' ? 'Flexible' : `${TIME_WINDOWS[w].label} ${formatClockTime(timeWindows[w]!)}`))
    .join(', ');
}

export function roundupTimeOptions(): ClockTime[] {
  const out: ClockTime[] = [];
  for (let t = 5 * 60; t <= 11 * 60; t += 30) out.push(fromMinutesOfDay(t));
  return out;
}

export function usesRoundup(style: Settings['reminderStyle']): boolean {
  return style === 'daily_roundup' || style === 'both';
}
