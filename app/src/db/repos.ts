import type { SQLiteDatabase } from 'expo-sqlite';
import {
  DEFAULT_SETTINGS,
  type Companion,
  type Priority,
  type Settings,
  type Task,
  type TaskKind,
  type TaskStatus,
} from '@monty/core';

/** Local-only ids: time-ordered and random enough for one phone. */
export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- settings (key/value, JSON values) ----------

export async function loadSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const stored: Partial<Settings> = {};
  for (const { key, value } of rows) {
    if (key in DEFAULT_SETTINGS) {
      try {
        (stored as Record<string, unknown>)[key] = JSON.parse(value);
      } catch {
        // Ignore a corrupt value and fall back to the default.
      }
    }
  }
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(db: SQLiteDatabase, patch: Partial<Settings>): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const [key, value] of entries) {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        key,
        JSON.stringify(value),
      );
    }
  });
}

// ---------- companion ----------

interface CompanionRow {
  growth_points: number;
  level: number;
  resting_until: string | null;
  last_active_date: string | null;
}

export async function loadCompanion(db: SQLiteDatabase): Promise<Companion> {
  const row = await db.getFirstAsync<CompanionRow>(
    'SELECT growth_points, level, resting_until, last_active_date FROM companion WHERE id = 1',
  );
  return {
    growthPoints: row?.growth_points ?? 0,
    level: row?.level ?? 0,
    restingUntil: row?.resting_until ?? null,
    lastActiveDate: row?.last_active_date ?? null,
  };
}

export async function saveCompanion(db: SQLiteDatabase, c: Companion): Promise<void> {
  await db.runAsync(
    `INSERT INTO companion (id, growth_points, level, resting_until, last_active_date)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET growth_points = excluded.growth_points, level = excluded.level,
       resting_until = excluded.resting_until, last_active_date = excluded.last_active_date`,
    c.growthPoints,
    c.level,
    c.restingUntil,
    c.lastActiveDate,
  );
}

// ---------- tasks ----------

interface TaskRow {
  id: string;
  title: string;
  kind: TaskKind;
  estimated_minutes: number;
  priority: Priority;
  due_date: string | null;
  due_time: string | null;
  parent_task_id: string | null;
  status: TaskStatus;
  source_capture_id: string | null;
  created_at: string;
}

function toTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    kind: r.kind,
    estimatedMinutes: r.estimated_minutes,
    priority: r.priority,
    dueDate: r.due_date,
    dueTime: r.due_time,
    parentTaskId: r.parent_task_id,
    status: r.status,
    sourceCaptureId: r.source_capture_id,
    createdAt: r.created_at,
  };
}

export async function listOpenTasks(db: SQLiteDatabase): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE status = 'open' ORDER BY created_at",
  );
  return rows.map(toTask);
}

export async function insertTask(
  db: SQLiteDatabase,
  task: Omit<Task, 'id' | 'createdAt' | 'status'> & Partial<Pick<Task, 'id' | 'createdAt' | 'status'>>,
): Promise<Task> {
  const full: Task = {
    ...task,
    id: task.id ?? newId(),
    createdAt: task.createdAt ?? new Date().toISOString(),
    status: task.status ?? 'open',
  };
  await db.runAsync(
    `INSERT INTO tasks (id, title, kind, estimated_minutes, priority, due_date, due_time,
       parent_task_id, status, source_capture_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    full.id,
    full.title,
    full.kind,
    full.estimatedMinutes,
    full.priority,
    full.dueDate,
    full.dueTime,
    full.parentTaskId,
    full.status,
    full.sourceCaptureId,
    full.createdAt,
  );
  return full;
}

export async function setTaskStatus(db: SQLiteDatabase, id: string, status: TaskStatus): Promise<void> {
  await db.runAsync('UPDATE tasks SET status = ? WHERE id = ?', status, id);
}
