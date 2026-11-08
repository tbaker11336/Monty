/**
 * The contract between the app, the server and the AI for "structuring":
 * transcript text in, a list of tasks / reminders / ideas / habits out.
 *
 * The AI is asked for STRUCTURE_JSON_SCHEMA (strict). Its reply is still
 * treated as untrusted: parseStructuredItems() validates and normalises it,
 * dropping bad items rather than failing the whole capture. If the reply
 * cannot be used at all, callers keep the raw transcript for manual sorting.
 */
import { z } from 'zod';
import { isValidClockTime, isValidISODate } from './dates';
import type { Priority } from './types';

export const STRUCTURED_KINDS = ['task', 'reminder', 'idea', 'habit'] as const;
export type StructuredKind = (typeof STRUCTURED_KINDS)[number];
export const HABIT_WINDOWS = ['morning', 'afternoon', 'evening'] as const;
export type HabitWindow = (typeof HABIT_WINDOWS)[number];

export interface StructuredStep {
  title: string;
  estimatedMinutes: number;
}

export interface StructuredItem {
  title: string;
  kind: StructuredKind;
  /** 0 for ideas, otherwise 1..MAX_ITEM_MINUTES. */
  estimatedMinutes: number;
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  /** Only for habits. */
  habitWindow: HabitWindow | null;
  /** Suggested split into small steps (tasks only; empty when not split). */
  steps: StructuredStep[];
}

export const MAX_TITLE_LENGTH = 120;
export const MAX_ITEM_MINUTES = 600;
export const MAX_ITEMS = 30;
export const MAX_STEPS = 12;
export const MAX_TRANSCRIPT_CHARS = 20_000;

/** JSON Schema sent to the Claude API as the structured-output format. */
export const STRUCTURE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title',
          'kind',
          'estimatedMinutes',
          'priority',
          'dueDate',
          'dueTime',
          'habitWindow',
          'steps',
        ],
        properties: {
          title: { type: 'string' },
          kind: { type: 'string', enum: [...STRUCTURED_KINDS] },
          estimatedMinutes: { type: 'integer' },
          priority: { type: 'string', enum: ['low', 'normal', 'high'] },
          dueDate: { type: ['string', 'null'] },
          dueTime: { type: ['string', 'null'] },
          habitWindow: { type: ['string', 'null'], enum: [...HABIT_WINDOWS, null] },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['title', 'estimatedMinutes'],
              properties: {
                title: { type: 'string' },
                estimatedMinutes: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
} as const;

// Loose input schemas: accept what the model might plausibly send, then normalise.
const looseString = z.string().nullish();
const looseNumber = z.union([z.number(), z.string()]).nullish();

const RawStepSchema = z.object({ title: looseString, estimatedMinutes: looseNumber });

const RawItemSchema = z.object({
  title: looseString,
  kind: looseString,
  estimatedMinutes: looseNumber,
  priority: looseString,
  dueDate: looseString,
  dueTime: looseString,
  habitWindow: looseString,
  steps: z.array(z.unknown()).nullish(),
});

const RawReplySchema = z.object({ items: z.array(z.unknown()) });

export type ParseResult =
  | { ok: true; items: StructuredItem[]; dropped: number }
  | { ok: false; error: string };

function cleanTitle(value: string | null | undefined): string {
  const t = (value ?? '').replace(/\s+/g, ' ').trim();
  return t.length > MAX_TITLE_LENGTH ? `${t.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…` : t;
}

function toMinutes(value: number | string | null | undefined, fallback: number): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (n == null || !Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(MAX_ITEM_MINUTES, Math.max(1, Math.round(n)));
}

function toKind(value: string | null | undefined): StructuredKind {
  const k = (value ?? '').toLowerCase().trim();
  return (STRUCTURED_KINDS as readonly string[]).includes(k) ? (k as StructuredKind) : 'task';
}

function toPriority(value: string | null | undefined): Priority {
  const p = (value ?? '').toLowerCase().trim();
  return p === 'low' || p === 'high' ? p : 'normal';
}

function toHabitWindow(value: string | null | undefined): HabitWindow | null {
  const w = (value ?? '').toLowerCase().trim();
  return (HABIT_WINDOWS as readonly string[]).includes(w) ? (w as HabitWindow) : null;
}

const DEFAULT_MINUTES: Record<StructuredKind, number> = {
  task: 15,
  reminder: 5,
  idea: 0,
  habit: 2,
};

function normaliseSteps(raw: unknown[] | null | undefined): StructuredStep[] {
  if (!raw) return [];
  const steps: StructuredStep[] = [];
  for (const entry of raw.slice(0, MAX_STEPS)) {
    const parsed = RawStepSchema.safeParse(entry);
    if (!parsed.success) continue;
    const title = cleanTitle(parsed.data.title);
    if (!title) continue;
    steps.push({ title, estimatedMinutes: toMinutes(parsed.data.estimatedMinutes, 10) });
  }
  // A "split" into a single step is no split.
  return steps.length >= 2 ? steps : [];
}

export function normaliseItem(raw: unknown): StructuredItem | null {
  const parsed = RawItemSchema.safeParse(raw);
  if (!parsed.success) return null;
  const d = parsed.data;
  const title = cleanTitle(d.title);
  if (!title) return null;
  const kind = toKind(d.kind);
  const steps = kind === 'task' ? normaliseSteps(d.steps) : [];
  const estimatedMinutes =
    kind === 'idea'
      ? 0
      : steps.length > 0
        ? Math.min(
            MAX_ITEM_MINUTES,
            steps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
          )
        : toMinutes(d.estimatedMinutes, DEFAULT_MINUTES[kind]);
  const dueDate = d.dueDate && isValidISODate(d.dueDate.trim()) ? d.dueDate.trim() : null;
  const dueTime = d.dueTime && isValidClockTime(d.dueTime.trim()) ? d.dueTime.trim() : null;
  return {
    title,
    kind,
    estimatedMinutes,
    priority: toPriority(d.priority),
    dueDate,
    dueTime,
    habitWindow: kind === 'habit' ? (toHabitWindow(d.habitWindow) ?? 'morning') : null,
    steps,
  };
}

/**
 * Validate and normalise the AI's reply. Accepts the parsed object or raw JSON text.
 * Invalid individual items are dropped (counted in `dropped`); only an unusable
 * top-level shape returns ok:false.
 */
export function parseStructuredItems(input: unknown): ParseResult {
  let value = input;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return { ok: false, error: 'Reply was not valid JSON' };
    }
  }
  const top = RawReplySchema.safeParse(value);
  if (!top.success) return { ok: false, error: 'Reply did not contain an items list' };

  const items: StructuredItem[] = [];
  let dropped = 0;
  for (const raw of top.data.items) {
    if (items.length >= MAX_ITEMS) {
      dropped++;
      continue;
    }
    const item = normaliseItem(raw);
    if (item) items.push(item);
    else dropped++;
  }
  return { ok: true, items, dropped };
}

/** What the app sends to the server. */
export const StructureRequestSchema = z.object({
  transcript: z.string().trim().min(1).max(MAX_TRANSCRIPT_CHARS),
  /** The person's local date, so "tomorrow" and "Friday" resolve correctly. */
  today: z.string().refine(isValidISODate, 'today must be YYYY-MM-DD'),
  dailyMinutes: z.number().int().min(5).max(600),
  /** Titles of open tasks, so the AI can avoid duplicates. */
  existingTaskTitles: z.array(z.string().max(MAX_TITLE_LENGTH)).max(50).default([]),
});
export type StructureRequest = z.infer<typeof StructureRequestSchema>;

/** What the server returns. On failure the app keeps the raw transcript for manual sorting. */
export type StructureResponse =
  | { ok: true; items: StructuredItem[] }
  | { ok: false; error: string };
