import { describe, expect, it } from 'vitest';
import {
  clampDailyMinutes,
  describeTimeWindows,
  formatClockTime,
  formatMinutes,
  roundupTimeOptions,
  startTimeOptions,
  toggleTimeWindow,
  usesRoundup,
} from './settings';

describe('daily minutes', () => {
  it('clamps to 5..240 in steps of 5', () => {
    expect(clampDailyMinutes(0)).toBe(5);
    expect(clampDailyMinutes(22)).toBe(20);
    expect(clampDailyMinutes(23)).toBe(25);
    expect(clampDailyMinutes(1000)).toBe(240);
    expect(clampDailyMinutes(Number.NaN)).toBe(20);
  });

  it('formats minutes for people', () => {
    expect(formatMinutes(20)).toBe('20 min');
    expect(formatMinutes(60)).toBe('1 hour');
    expect(formatMinutes(120)).toBe('2 hours');
    expect(formatMinutes(90)).toBe('1 hr 30 min');
  });
});

describe('clock times', () => {
  it('formats 24h times as 12h', () => {
    expect(formatClockTime('07:30')).toBe('7:30 am');
    expect(formatClockTime('19:00')).toBe('7:00 pm');
    expect(formatClockTime('12:00')).toBe('12:00 pm');
    expect(formatClockTime('00:15')).toBe('12:15 am');
    expect(formatClockTime('nope')).toBe('nope');
  });

  it('offers half-hour start times inside each window', () => {
    const evening = startTimeOptions('evening');
    expect(evening[0]).toBe('17:00');
    expect(evening.at(-1)).toBe('22:30');
    expect(evening).toContain('19:00');
    expect(startTimeOptions('morning')).toHaveLength(14);
    expect(roundupTimeOptions()).toContain('08:00');
  });
});

describe('time windows', () => {
  it('turns windows on with a default start and off again', () => {
    const on = toggleTimeWindow({ morning: '07:00' }, 'evening');
    expect(on).toEqual({ morning: '07:00', evening: '19:00' });
    expect(toggleTimeWindow(on, 'morning')).toEqual({ evening: '19:00' });
  });

  it('never leaves nothing chosen', () => {
    expect(toggleTimeWindow({ morning: '07:00' }, 'morning')).toEqual({ flexible: '09:00' });
  });

  it('describes the choice in a fixed order', () => {
    expect(describeTimeWindows({ evening: '19:00', morning: '07:30', flexible: '09:00' })).toBe(
      'Morning 7:30 am, Evening 7:00 pm, Flexible',
    );
  });
});

describe('reminders', () => {
  it('knows which styles need a roundup time', () => {
    expect(usesRoundup('daily_roundup')).toBe(true);
    expect(usesRoundup('both')).toBe(true);
    expect(usesRoundup('as_it_happens')).toBe(false);
    expect(usesRoundup('only_when_asked')).toBe(false);
  });
});
