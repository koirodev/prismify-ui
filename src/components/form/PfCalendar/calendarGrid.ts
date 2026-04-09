import type { DateValue } from '@internationalized/date';
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  toCalendarDate,
} from '@internationalized/date';

/** Matches `@internationalized/date` week start names (not exported from the package). */
export type PfCalendarWeekStartsOn =
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat';

export type PfCalendarWeekRow = {
  /** ISO-like week number for the row (from first day of week). */
  weekNumber?: number;
  days: DateValue[];
};

function compareCalDay(a: DateValue, b: DateValue): number {
  return toCalendarDate(a).compare(toCalendarDate(b));
}

/** ISO 8601 week number for the calendar week containing `date`. */
export function getIsoWeekNumber(date: DateValue, timeZone: string): number {
  const d = toCalendarDate(date).toDate(timeZone);
  const dayNr = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNr + 3);
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
  return 1 + Math.floor(dayDiff / 7);
}

export function buildMonthGrid(
  visibleMonth: DateValue,
  locale: string,
  weekStartsOn: PfCalendarWeekStartsOn | undefined,
  fixedWeeks: boolean,
  includeWeekNumbers: boolean,
  timeZone: string
): PfCalendarWeekRow[] {
  const cal = toCalendarDate(visibleMonth);
  const monthStart = startOfMonth(cal);
  const monthEnd = endOfMonth(cal);
  const gridStart = startOfWeek(monthStart, locale, weekStartsOn);
  const gridEnd = endOfWeek(monthEnd, locale, weekStartsOn);

  const rows: PfCalendarWeekRow[] = [];
  let cursor = gridStart;

  while (compareCalDay(cursor, gridEnd) <= 0) {
    const days: DateValue[] = [];
    let c = cursor;
    for (let i = 0; i < 7; i++) {
      days.push(c);
      c = c.add({ days: 1 });
    }
    rows.push({
      days,
      weekNumber: includeWeekNumbers
        ? getIsoWeekNumber(days[0]!, timeZone)
        : undefined,
    });
    cursor = cursor.add({ days: 7 });
  }

  if (fixedWeeks) {
    while (rows.length < 6) {
      const days: DateValue[] = [];
      let c = cursor;
      for (let i = 0; i < 7; i++) {
        days.push(c);
        c = c.add({ days: 1 });
      }
      rows.push({
        days,
        weekNumber: includeWeekNumbers
          ? getIsoWeekNumber(days[0]!, timeZone)
          : undefined,
      });
      cursor = cursor.add({ days: 7 });
    }
  }

  return rows;
}

export function shiftVisibleMonth(
  anchor: DateValue,
  deltaMonths: number
): DateValue {
  return toCalendarDate(anchor).add({ months: deltaMonths });
}
