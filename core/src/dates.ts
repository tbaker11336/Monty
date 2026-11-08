import type { ISODate } from './types';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidISODate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function isValidClockTime(value: string): boolean {
  return CLOCK.test(value);
}

/** Local calendar date of a Date, as YYYY-MM-DD. */
export function toISODate(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole days from `a` to `b` (b - a). Both YYYY-MM-DD. */
export function daysBetween(a: ISODate, b: ISODate): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
