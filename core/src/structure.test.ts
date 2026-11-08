import { describe, expect, it } from 'vitest';
import {
  MAX_ITEMS,
  MAX_ITEM_MINUTES,
  MAX_TITLE_LENGTH,
  StructureRequestSchema,
  normaliseItem,
  parseStructuredItems,
} from './structure';

const good = {
  title: 'Call dentist',
  kind: 'reminder',
  estimatedMinutes: 10,
  priority: 'high',
  dueDate: '2026-11-10',
  dueTime: '09:30',
  habitWindow: null,
  steps: [],
};

describe('parseStructuredItems', () => {
  it('accepts a well-formed reply object', () => {
    const r = parseStructuredItems({ items: [good] });
    expect(r).toEqual({ ok: true, dropped: 0, items: [good] });
  });

  it('accepts JSON text', () => {
    const r = parseStructuredItems(JSON.stringify({ items: [good] }));
    expect(r.ok && r.items).toHaveLength(1);
  });

  it('fails on non-JSON text', () => {
    expect(parseStructuredItems('Sure! Here are your tasks')).toEqual({
      ok: false,
      error: 'Reply was not valid JSON',
    });
  });

  it('fails when there is no items list', () => {
    expect(parseStructuredItems({ tasks: [] }).ok).toBe(false);
    expect(parseStructuredItems(null).ok).toBe(false);
    expect(parseStructuredItems([good]).ok).toBe(false);
  });

  it('treats an empty list as a valid "nothing to add"', () => {
    expect(parseStructuredItems({ items: [] })).toEqual({ ok: true, items: [], dropped: 0 });
  });

  it('drops bad items but keeps good ones', () => {
    const r = parseStructuredItems({ items: [good, { title: '   ' }, 42, 'text', { kind: 'task' }] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.items).toHaveLength(1);
    expect(r.dropped).toBe(4);
  });

  it('caps the number of items', () => {
    const items = Array.from({ length: MAX_ITEMS + 5 }, (_, i) => ({ ...good, title: `T${i}` }));
    const r = parseStructuredItems({ items });
    expect(r.ok && r.items.length).toBe(MAX_ITEMS);
    expect(r.ok && r.dropped).toBe(5);
  });
});

describe('normaliseItem', () => {
  it('fills defaults for a minimal item', () => {
    expect(normaliseItem({ title: 'Buy milk' })).toEqual({
      title: 'Buy milk',
      kind: 'task',
      estimatedMinutes: 15,
      priority: 'normal',
      dueDate: null,
      dueTime: null,
      habitWindow: null,
      steps: [],
    });
  });

  it('cleans whitespace and truncates long titles', () => {
    expect(normaliseItem({ title: '  Buy \n  milk  ' })?.title).toBe('Buy milk');
    const long = normaliseItem({ title: 'x'.repeat(500) })!.title;
    expect(long.length).toBe(MAX_TITLE_LENGTH);
    expect(long.endsWith('…')).toBe(true);
  });

  it('clamps and rounds minutes, and parses numeric strings', () => {
    expect(normaliseItem({ title: 'a', estimatedMinutes: 99999 })?.estimatedMinutes).toBe(MAX_ITEM_MINUTES);
    expect(normaliseItem({ title: 'a', estimatedMinutes: 7.6 })?.estimatedMinutes).toBe(8);
    expect(normaliseItem({ title: 'a', estimatedMinutes: '25' })?.estimatedMinutes).toBe(25);
    expect(normaliseItem({ title: 'a', estimatedMinutes: -3 })?.estimatedMinutes).toBe(15);
    expect(normaliseItem({ title: 'a', estimatedMinutes: 'soon' })?.estimatedMinutes).toBe(15);
  });

  it('gives ideas zero minutes and no steps', () => {
    const idea = normaliseItem({
      title: 'App for plants',
      kind: 'idea',
      estimatedMinutes: 30,
      steps: [{ title: 'a', estimatedMinutes: 5 }, { title: 'b', estimatedMinutes: 5 }],
    });
    expect(idea?.estimatedMinutes).toBe(0);
    expect(idea?.steps).toEqual([]);
  });

  it('maps unknown kinds and priorities to safe defaults', () => {
    const item = normaliseItem({ title: 'a', kind: 'chore', priority: 'URGENT!!' });
    expect(item?.kind).toBe('task');
    expect(item?.priority).toBe('normal');
    expect(normaliseItem({ title: 'a', kind: 'Reminder', priority: 'High' })).toMatchObject({
      kind: 'reminder',
      priority: 'high',
    });
  });

  it('rejects invalid dates and times instead of guessing', () => {
    const item = normaliseItem({ title: 'a', dueDate: '2026-02-30', dueTime: '25:00' });
    expect(item?.dueDate).toBeNull();
    expect(item?.dueTime).toBeNull();
    expect(normaliseItem({ title: 'a', dueDate: 'next Friday' })?.dueDate).toBeNull();
    expect(normaliseItem({ title: 'a', dueDate: '2028-02-29', dueTime: '07:05' })).toMatchObject({
      dueDate: '2028-02-29',
      dueTime: '07:05',
    });
  });

  it('keeps a real split and sums its minutes', () => {
    const item = normaliseItem({
      title: 'Write report',
      kind: 'task',
      estimatedMinutes: 120,
      steps: [
        { title: 'Outline', estimatedMinutes: 15 },
        { title: 'Draft intro', estimatedMinutes: 20 },
        { title: '', estimatedMinutes: 20 },
      ],
    });
    expect(item?.steps).toEqual([
      { title: 'Outline', estimatedMinutes: 15 },
      { title: 'Draft intro', estimatedMinutes: 20 },
    ]);
    expect(item?.estimatedMinutes).toBe(35);
  });

  it('ignores a one-step "split"', () => {
    const item = normaliseItem({ title: 'a', steps: [{ title: 'only', estimatedMinutes: 5 }] });
    expect(item?.steps).toEqual([]);
  });

  it('gives habits a window and drops it for other kinds', () => {
    expect(normaliseItem({ title: 'Stretch', kind: 'habit', habitWindow: 'evening' })).toMatchObject({
      habitWindow: 'evening',
      estimatedMinutes: 2,
    });
    expect(normaliseItem({ title: 'Stretch', kind: 'habit' })?.habitWindow).toBe('morning');
    expect(normaliseItem({ title: 'a', kind: 'task', habitWindow: 'evening' })?.habitWindow).toBeNull();
  });
});

describe('StructureRequestSchema', () => {
  it('accepts a valid request and defaults existing titles', () => {
    const r = StructureRequestSchema.parse({ transcript: ' hi ', today: '2026-11-08', dailyMinutes: 20 });
    expect(r).toEqual({ transcript: 'hi', today: '2026-11-08', dailyMinutes: 20, existingTaskTitles: [] });
  });

  it('rejects empty transcripts, bad dates and silly budgets', () => {
    expect(StructureRequestSchema.safeParse({ transcript: '  ', today: '2026-11-08', dailyMinutes: 20 }).success).toBe(false);
    expect(StructureRequestSchema.safeParse({ transcript: 'a', today: '08/11/2026', dailyMinutes: 20 }).success).toBe(false);
    expect(StructureRequestSchema.safeParse({ transcript: 'a', today: '2026-11-08', dailyMinutes: 0 }).success).toBe(false);
  });
});
