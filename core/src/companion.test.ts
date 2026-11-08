import { describe, expect, it } from 'vitest';
import {
  NEW_COMPANION,
  growthProgress,
  isResting,
  levelForPoints,
  recordGrowth,
  stageForLevel,
} from './companion';
import { addDays, daysBetween, isValidISODate } from './dates';

describe('growth', () => {
  it('maps points to stages', () => {
    expect(levelForPoints(0)).toBe(0);
    expect(levelForPoints(4)).toBe(0);
    expect(levelForPoints(5)).toBe(1);
    expect(levelForPoints(70)).toBe(4);
    expect(levelForPoints(10_000)).toBe(4);
    expect(stageForLevel(0)).toBe('seed');
    expect(stageForLevel(4)).toBe('flowering');
    expect(stageForLevel(99)).toBe('flowering');
  });

  it('reports progress to the next stage', () => {
    expect(growthProgress(10)).toEqual({ level: 1, stage: 'sprout', pointsToNext: 5, fraction: 0.5 });
    expect(growthProgress(80)).toEqual({ level: 4, stage: 'flowering', pointsToNext: null, fraction: 1 });
  });

  it('only ever grows, and wakes Monty up', () => {
    const resting = { ...NEW_COMPANION, growthPoints: 14, level: 1, lastActiveDate: '2026-11-01' };
    expect(isResting(resting, '2026-11-08')).toBe(true);
    const next = recordGrowth(resting, 'step', '2026-11-08');
    expect(next).toEqual({ growthPoints: 16, level: 2, restingUntil: null, lastActiveDate: '2026-11-08' });
    expect(isResting(next, '2026-11-08')).toBe(false);
  });
});

describe('resting', () => {
  it('is awake when new, today or the day after activity', () => {
    expect(isResting(NEW_COMPANION, '2026-11-08')).toBe(false);
    expect(isResting({ ...NEW_COMPANION, lastActiveDate: '2026-11-08' }, '2026-11-08')).toBe(false);
    expect(isResting({ ...NEW_COMPANION, lastActiveDate: '2026-11-07' }, '2026-11-08')).toBe(false);
  });

  it('naps after a whole missed day', () => {
    expect(isResting({ ...NEW_COMPANION, lastActiveDate: '2026-11-06' }, '2026-11-08')).toBe(true);
  });
});

describe('dates', () => {
  it('handles month and leap boundaries', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3);
    expect(isValidISODate('2027-02-29')).toBe(false);
  });
});
