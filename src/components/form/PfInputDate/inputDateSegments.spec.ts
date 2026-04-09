import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { finalizeNudgedValue, nudgeDateSegment } from './inputDateSegments';

describe('nudgeDateSegment', () => {
  it('increments day across month boundary', () => {
    const base = new CalendarDate(2025, 1, 31);
    const next = nudgeDateSegment(base, 'day', 1, {
      granularity: 'day',
      step: 1,
    });
    expect(next).toBeInstanceOf(CalendarDate);
    expect((next as CalendarDate).month).toBe(2);
    expect((next as CalendarDate).day).toBe(1);
  });

  it('respects step for minutes on CalendarDateTime model', () => {
    const base = new CalendarDateTime(2025, 6, 10, 12, 0, 0);
    const next = nudgeDateSegment(base, 'minute', 1, {
      granularity: 'minute',
      step: 15,
    });
    expect(next).not.toBeNull();
    expect((next as CalendarDateTime).minute).toBe(15);
  });
});

describe('finalizeNudgedValue', () => {
  it('strips time for day granularity', () => {
    const cdt = new CalendarDateTime(2025, 3, 5, 14, 30, 0);
    const out = finalizeNudgedValue(cdt, cdt, 'day');
    expect(out).toBeInstanceOf(CalendarDate);
    expect((out as CalendarDate).day).toBe(5);
  });
});
