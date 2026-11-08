/**
 * Monty's data model (brief section 6). Dates are local calendar dates as
 * "YYYY-MM-DD" strings; timestamps are ISO-8601 strings. Everything lives on
 * the phone; only transcript text is sent to the server for structuring.
 */

export type ISODate = string; // "2026-11-08"
export type ISODateTime = string; // "2026-11-08T09:30:00.000Z"
export type ClockTime = string; // "07:30" (24h, local)

export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type CalendarChoice = 'monty' | 'google' | 'outlook' | 'phone';
export type ReminderStyle = 'as_it_happens' | 'daily_roundup' | 'both' | 'only_when_asked';

export interface Settings {
  onboarded: boolean;
  dailyMinutes: number;
  /** Chosen windows with their start times. At least one. */
  timeWindows: Partial<Record<TimeWindow, ClockTime>>;
  calendarChoices: CalendarChoice[];
  reminderStyle: ReminderStyle;
  roundupTime: ClockTime;
  bubbleEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  dailyMinutes: 20,
  timeWindows: { morning: '08:00' },
  calendarChoices: ['monty'],
  reminderStyle: 'daily_roundup',
  roundupTime: '08:00',
  bubbleEnabled: false,
};

export type CaptureStatus = 'new' | 'reviewed';

export interface Capture {
  id: string;
  createdAt: ISODateTime;
  rawTranscriptChunks: string[];
  status: CaptureStatus;
}

export type TaskKind = 'task' | 'reminder' | 'idea';
export type Priority = 'low' | 'normal' | 'high';
export type TaskStatus = 'open' | 'done' | 'dropped';

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  estimatedMinutes: number;
  priority: Priority;
  dueDate: ISODate | null;
  dueTime: ClockTime | null;
  /** Set on split steps; points at the big task they belong to. */
  parentTaskId: string | null;
  status: TaskStatus;
  sourceCaptureId: string | null;
  createdAt: ISODateTime;
}

export type PlanItemStatus = 'planned' | 'done' | 'skipped';

export interface PlanItem {
  id: string;
  taskId: string | null;
  habitId: string | null;
  date: ISODate;
  window: TimeWindow;
  orderIndex: number;
  status: PlanItemStatus;
  isOneWin: boolean;
}

export type HabitFrequency = 'daily' | 'weekdays' | { days: number[] /* 0=Sun..6=Sat */ };

export interface Habit {
  id: string;
  text: string;
  window: Exclude<TimeWindow, 'flexible'>;
  frequency: HabitFrequency;
  active: boolean;
  paused: boolean;
  createdAt: ISODateTime;
}

export interface HabitLog {
  habitId: string;
  date: ISODate;
  done: boolean;
}

export interface Companion {
  growthPoints: number;
  level: number;
  restingUntil: ISODate | null;
  lastActiveDate: ISODate | null;
}

export const MAX_ACTIVE_HABITS = 3;
