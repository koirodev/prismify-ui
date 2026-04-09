import type { DateValue } from '@internationalized/date';
import { isSameDay, toCalendarDate } from '@internationalized/date';

export type PfCalendarDateRange = {
  start?: DateValue | null;
  end?: DateValue | null;
};

export type PfCalendarMatcher = (date: DateValue) => boolean;

function orderedRange(a: DateValue, b: DateValue): [DateValue, DateValue] {
  const ca = toCalendarDate(a);
  const cb = toCalendarDate(b);
  return ca.compare(cb) <= 0 ? [ca, cb] : [cb, ca];
}

function daysInclusive(start: DateValue, end: DateValue): number {
  const [x, y] = orderedRange(start, end);
  let n = 0;
  let c = toCalendarDate(x);
  const yc = toCalendarDate(y);
  while (c.compare(yc) <= 0) {
    n++;
    c = c.add({ days: 1 });
  }
  return n;
}

function spanHasUnavailable(
  start: DateValue,
  end: DateValue,
  isUnavailable: PfCalendarMatcher | undefined,
  allowNonContiguous: boolean
): boolean {
  if (!isUnavailable || allowNonContiguous) return false;
  const [x, y] = orderedRange(start, end);
  let c = toCalendarDate(x);
  const yc = toCalendarDate(y);
  while (c.compare(yc) <= 0) {
    if (isUnavailable(c)) return true;
    c = c.add({ days: 1 });
  }
  return false;
}

export function applySingleClick(
  current: DateValue | null | undefined,
  day: DateValue,
  options: {
    preventDeselect: boolean;
    minValue?: DateValue | null;
    maxValue?: DateValue | null;
  }
): DateValue | null {
  const d = toCalendarDate(day);
  if (
    options.minValue != null &&
    d.compare(toCalendarDate(options.minValue)) < 0
  ) {
    return current ?? null;
  }
  if (
    options.maxValue != null &&
    d.compare(toCalendarDate(options.maxValue)) > 0
  ) {
    return current ?? null;
  }
  if (current != null && isSameDay(current, day) && !options.preventDeselect) {
    return null;
  }
  return d;
}

export function applyMultipleClick(
  list: DateValue[],
  day: DateValue,
  options: {
    minValue?: DateValue | null;
    maxValue?: DateValue | null;
  }
): DateValue[] {
  const d = toCalendarDate(day);
  if (
    options.minValue != null &&
    d.compare(toCalendarDate(options.minValue)) < 0
  ) {
    return list;
  }
  if (
    options.maxValue != null &&
    d.compare(toCalendarDate(options.maxValue)) > 0
  ) {
    return list;
  }
  const idx = list.findIndex((x) => isSameDay(x, day));
  if (idx >= 0) {
    return list.filter((_, i) => i !== idx);
  }
  return [...list, d];
}

export function applyRangeClick(
  range: PfCalendarDateRange,
  day: DateValue,
  options: {
    minValue?: DateValue | null;
    maxValue?: DateValue | null;
    maximumDays?: number | undefined;
    isDateUnavailable?: PfCalendarMatcher | undefined;
    allowNonContiguousRanges: boolean;
    preventDeselect: boolean;
    fixedDate?: 'start' | 'end';
  }
): PfCalendarDateRange {
  const d = toCalendarDate(day);
  if (
    options.minValue != null &&
    d.compare(toCalendarDate(options.minValue)) < 0
  ) {
    return { ...range };
  }
  if (
    options.maxValue != null &&
    d.compare(toCalendarDate(options.maxValue)) > 0
  ) {
    return { ...range };
  }

  const start = range.start ?? null;
  const end = range.end ?? null;

  if (options.fixedDate === 'start' && start != null && end != null) {
    const s = toCalendarDate(start);
    const newEnd = d.compare(s) < 0 ? s : d;
    if (
      options.maximumDays != null &&
      daysInclusive(s, newEnd) > options.maximumDays
    ) {
      return { ...range };
    }
    if (
      spanHasUnavailable(
        s,
        newEnd,
        options.isDateUnavailable,
        options.allowNonContiguousRanges
      )
    ) {
      return { ...range };
    }
    return { start: s, end: newEnd };
  }

  if (options.fixedDate === 'end' && start != null && end != null) {
    const e = toCalendarDate(end);
    const newStart = d.compare(e) > 0 ? e : d;
    if (
      options.maximumDays != null &&
      daysInclusive(newStart, e) > options.maximumDays
    ) {
      return { ...range };
    }
    if (
      spanHasUnavailable(
        newStart,
        e,
        options.isDateUnavailable,
        options.allowNonContiguousRanges
      )
    ) {
      return { ...range };
    }
    return { start: newStart, end: e };
  }

  if (
    start != null &&
    end != null &&
    isSameDay(start, day) &&
    isSameDay(end, day) &&
    !options.preventDeselect
  ) {
    return { start: null, end: null };
  }

  if (start == null || (start != null && end != null)) {
    return { start: d, end: null };
  }

  let a = toCalendarDate(start);
  let b = d;
  if (a.compare(b) > 0) {
    [a, b] = [b, a];
  }

  if (
    options.maximumDays != null &&
    daysInclusive(a, b) > options.maximumDays
  ) {
    return { start, end: null };
  }

  if (
    spanHasUnavailable(
      a,
      b,
      options.isDateUnavailable,
      options.allowNonContiguousRanges
    )
  ) {
    return { start, end: null };
  }

  return { start: a, end: b };
}

export function isDayInRange(
  day: DateValue,
  range: PfCalendarDateRange
): {
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
} {
  const start = range.start;
  const end = range.end;
  if (start == null) {
    return {
      selected: false,
      rangeStart: false,
      rangeEnd: false,
      inRange: false,
    };
  }
  if (end == null) {
    const sel = isSameDay(day, start);
    return {
      selected: sel,
      rangeStart: sel,
      rangeEnd: sel,
      inRange: sel,
    };
  }
  const [lo, hi] = orderedRange(start, end);
  const cd = toCalendarDate(day);
  const inR =
    cd.compare(toCalendarDate(lo)) >= 0 && cd.compare(toCalendarDate(hi)) <= 0;
  return {
    selected: inR,
    rangeStart: isSameDay(day, lo),
    rangeEnd: isSameDay(day, hi),
    inRange: inR,
  };
}
