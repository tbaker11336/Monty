/**
 * Monty the plant (brief section 10). Growth only ever goes up. After a missed
 * day Monty naps; doing anything wakes it. No resets, no punishments.
 */
import { daysBetween } from './dates';
import type { Companion, ISODate } from './types';

export const GROWTH_STAGES = ['seed', 'sprout', 'leafy', 'bushy', 'flowering'] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];

/** Points needed to reach each stage (index = stage level). */
export const STAGE_THRESHOLDS = [0, 5, 15, 35, 70] as const;

export type GrowthEvent = 'talk' | 'step' | 'habit';
export const GROWTH_POINTS: Record<GrowthEvent, number> = { talk: 1, step: 2, habit: 2 };

export const NEW_COMPANION: Companion = {
  growthPoints: 0,
  level: 0,
  restingUntil: null,
  lastActiveDate: null,
};

export function levelForPoints(points: number): number {
  let level = 0;
  STAGE_THRESHOLDS.forEach((threshold, i) => {
    if (points >= threshold) level = i;
  });
  return level;
}

export function stageForLevel(level: number): GrowthStage {
  const clamped = Math.max(0, Math.min(GROWTH_STAGES.length - 1, Math.floor(level)));
  return GROWTH_STAGES[clamped]!;
}

export interface GrowthProgress {
  level: number;
  stage: GrowthStage;
  /** Points still needed for the next stage; null at the final stage. */
  pointsToNext: number | null;
  /** 0..1 progress through the current stage (1 at the final stage). */
  fraction: number;
}

export function growthProgress(points: number): GrowthProgress {
  const level = levelForPoints(points);
  const stage = stageForLevel(level);
  const current = STAGE_THRESHOLDS[level]!;
  const next = STAGE_THRESHOLDS[level + 1];
  if (next === undefined) return { level, stage, pointsToNext: null, fraction: 1 };
  return {
    level,
    stage,
    pointsToNext: next - points,
    fraction: (points - current) / (next - current),
  };
}

/** Monty naps when a whole day has passed with nothing done. */
export function isResting(companion: Companion, today: ISODate): boolean {
  if (!companion.lastActiveDate) return false;
  return daysBetween(companion.lastActiveDate, today) >= 2;
}

export function recordGrowth(companion: Companion, event: GrowthEvent, today: ISODate): Companion {
  const growthPoints = companion.growthPoints + GROWTH_POINTS[event];
  return {
    growthPoints,
    level: levelForPoints(growthPoints),
    restingUntil: null,
    lastActiveDate: today,
  };
}
