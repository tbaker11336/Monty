import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Ordered schema migrations, tracked with PRAGMA user_version.
 * Never edit a shipped migration; append a new one.
 */
const MIGRATIONS: string[] = [
  // 1: initial schema (brief section 6)
  `
  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE captures (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL,
    raw_transcript_chunks TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed'))
  );

  CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('task', 'reminder', 'idea')),
    estimated_minutes INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    due_date TEXT,
    due_time TEXT,
    parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'dropped')),
    source_capture_id TEXT REFERENCES captures(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX tasks_status ON tasks(status);
  CREATE INDEX tasks_parent ON tasks(parent_task_id);

  CREATE TABLE habits (
    id TEXT PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    time_window TEXT NOT NULL CHECK (time_window IN ('morning', 'afternoon', 'evening')),
    frequency TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    paused INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE habit_logs (
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (habit_id, date)
  );

  CREATE TABLE plan_items (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    time_window TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'done', 'skipped')),
    is_one_win INTEGER NOT NULL DEFAULT 0,
    CHECK ((task_id IS NULL) <> (habit_id IS NULL))
  );
  CREATE INDEX plan_items_date ON plan_items(date);

  CREATE TABLE companion (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    growth_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    resting_until TEXT,
    last_active_date TEXT
  );
  INSERT INTO companion (id) VALUES (1);
  `,
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    const sql = MIGRATIONS[version]!;
    const next = version + 1;
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(sql);
      await txn.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
