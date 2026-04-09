import type { DateValue } from '@internationalized/date';
import {
  CalendarDate,
  CalendarDateTime,
  DateFormatter,
  ZonedDateTime,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
} from '@internationalized/date';

export type PfInputDateGranularity = 'day' | 'hour' | 'minute' | 'second';

export type PfInputDateHourCycle = 'h11' | 'h12' | 'h23' | 'h24';

const EDITABLE = new Set<string>([
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'dayPeriod',
]);

export type PfInputDateLayoutToken =
  | { kind: 'literal'; text: string }
  | {
      kind: 'field';
      partType: Intl.DateTimeFormatPart['type'];
      key: string;
    };

export function buildIntlDateOptions(
  granularity: PfInputDateGranularity,
  hourCycle: PfInputDateHourCycle | undefined,
  hideTimeZone: boolean
): Intl.DateTimeFormatOptions {
  const o: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  if (granularity === 'day') {
    return o;
  }
  o.hour = '2-digit';
  if (hourCycle) {
    o.hourCycle = hourCycle;
  }
  if (granularity === 'hour') {
    if (!hideTimeZone) {
      o.timeZoneName = 'short';
    }
    return o;
  }
  o.minute = '2-digit';
  if (granularity === 'minute') {
    if (!hideTimeZone) {
      o.timeZoneName = 'short';
    }
    return o;
  }
  o.second = '2-digit';
  if (!hideTimeZone) {
    o.timeZoneName = 'short';
  }
  return o;
}

export function inferGranularity(
  value: DateValue | null | undefined,
  explicit: PfInputDateGranularity | undefined
): PfInputDateGranularity {
  if (explicit) return explicit;
  if (value == null) return 'day';
  if (value instanceof CalendarDate) return 'day';
  return 'minute';
}

export function dateValueToJsDate(value: DateValue, timeZone: string): Date {
  if (value instanceof ZonedDateTime) {
    return value.toDate();
  }
  return value.toDate(timeZone);
}

export function layoutAndTextsFromDate(
  formatter: DateFormatter,
  jsDate: Date
): {
  layout: PfInputDateLayoutToken[];
  texts: Record<string, string>;
} {
  const parts = formatter.formatToParts(jsDate);
  const layout: PfInputDateLayoutToken[] = [];
  const texts: Record<string, string> = {};
  const seen = new Map<string, number>();
  for (const p of parts) {
    if (p.type === 'literal') {
      layout.push({ kind: 'literal', text: p.value });
    } else if (EDITABLE.has(p.type)) {
      const n = (seen.get(p.type) ?? 0) + 1;
      seen.set(p.type, n);
      const key = `${String(p.type)}-${n}`;
      layout.push({
        kind: 'field',
        partType: p.type,
        key,
      });
      texts[key] = p.value;
    }
  }
  return { layout, texts };
}

function stripFieldDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

function hourFrom12h(hourStr: string, periodRaw: string | undefined): number {
  let h = Number.parseInt(stripFieldDigits(hourStr), 10);
  if (Number.isNaN(h)) return NaN;
  const p = (periodRaw ?? '').toUpperCase();
  const pm = p.includes('P');
  const am = p.includes('A');
  if (pm && h < 12) {
    h += 12;
  }
  if (am && h === 12) {
    h = 0;
  }
  return h;
}

export type ComposeResult = {
  value: DateValue | null;
  /** All editable fields filled (digits); value may still be invalid for the calendar. */
  segmentsComplete: boolean;
  /** Value assembled and passed constrain. */
  valid: boolean;
};

export function tryComposeFromTexts(
  layout: PfInputDateLayoutToken[],
  texts: Record<string, string>,
  granularity: PfInputDateGranularity,
  timeZone: string,
  priorZoned: ZonedDateTime | null
): ComposeResult {
  let year = NaN;
  let month = NaN;
  let day = NaN;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let dayPeriod: string | undefined;
  let hourStrFor12: string | undefined;
  const use12hHour =
    granularity !== 'day' &&
    layout.some((t) => t.kind === 'field' && t.partType === 'dayPeriod');

  for (const t of layout) {
    if (t.kind !== 'field') continue;
    const raw = (texts[t.key] ?? '').trim();
    if (t.partType === 'dayPeriod') {
      dayPeriod = raw;
      continue;
    }
    if (raw.length === 0) {
      return { value: null, segmentsComplete: false, valid: false };
    }
    if (t.partType === 'year') {
      year = Number.parseInt(stripFieldDigits(raw), 10);
    } else if (t.partType === 'month') {
      month = Number.parseInt(stripFieldDigits(raw), 10);
    } else if (t.partType === 'day') {
      day = Number.parseInt(stripFieldDigits(raw), 10);
    } else if (t.partType === 'hour') {
      if (use12hHour) {
        hourStrFor12 = raw;
      } else {
        hour = Number.parseInt(stripFieldDigits(raw), 10);
      }
    } else if (t.partType === 'minute') {
      minute = Number.parseInt(stripFieldDigits(raw), 10);
    } else if (t.partType === 'second') {
      second = Number.parseInt(stripFieldDigits(raw), 10);
    }
  }

  if (use12hHour) {
    if (!dayPeriod || !hourStrFor12) {
      return { value: null, segmentsComplete: false, valid: false };
    }
    hour = hourFrom12h(hourStrFor12, dayPeriod);
  }

  if ([year, month, day].some((n) => Number.isNaN(n))) {
    return { value: null, segmentsComplete: false, valid: false };
  }

  if (granularity !== 'day') {
    if (Number.isNaN(hour) || hour < 0 || hour > 23) {
      return { value: null, segmentsComplete: true, valid: false };
    }
    if (
      (granularity === 'minute' || granularity === 'second') &&
      (Number.isNaN(minute) || minute < 0 || minute > 59)
    ) {
      return { value: null, segmentsComplete: true, valid: false };
    }
    if (
      granularity === 'second' &&
      (Number.isNaN(second) || second < 0 || second > 59)
    ) {
      return { value: null, segmentsComplete: true, valid: false };
    }
  }

  try {
    if (granularity === 'day') {
      const d = new CalendarDate(year, month, day);
      return { value: d, segmentsComplete: true, valid: true };
    }
    const dt = new CalendarDateTime(year, month, day, hour, minute, second, 0);
    if (priorZoned) {
      return {
        value: toZoned(dt, priorZoned.timeZone),
        segmentsComplete: true,
        valid: true,
      };
    }
    return {
      value: dt,
      segmentsComplete: true,
      valid: true,
    };
  } catch {
    return { value: null, segmentsComplete: true, valid: false };
  }
}

export function toComparableCalendarDate(
  v: DateValue | null
): CalendarDate | null {
  if (v == null) return null;
  return toCalendarDate(v);
}

export function withSameTimeZone(
  next: DateValue,
  previous: DateValue | null
): DateValue {
  if (previous instanceof ZonedDateTime && !(next instanceof ZonedDateTime)) {
    const cdt = toCalendarDateTime(next);
    return toZoned(cdt, previous.timeZone);
  }
  return next;
}

/**
 * Shifts one date/time field (up/down arrows). Day/month/year — via `add`, not cycling within the month.
 */
export function nudgeDateSegment(
  base: DateValue,
  partType: string,
  direction: 1 | -1,
  options: { granularity: PfInputDateGranularity; step: number }
): DateValue | null {
  const step = Math.max(1, Math.round(options.step));
  const n = direction * step;

  if (partType === 'dayPeriod') {
    if (base instanceof CalendarDate) return null;
    if (base instanceof ZonedDateTime) {
      return base.add({ hours: direction * 12 });
    }
    return toCalendarDateTime(base).add({ hours: direction * 12 });
  }

  if (
    partType !== 'year' &&
    partType !== 'month' &&
    partType !== 'day' &&
    partType !== 'hour' &&
    partType !== 'minute' &&
    partType !== 'second'
  ) {
    return null;
  }

  if (options.granularity === 'day') {
    if (partType === 'hour' || partType === 'minute' || partType === 'second') {
      return null;
    }
  }

  if (base instanceof CalendarDate) {
    switch (partType) {
      case 'year':
        return base.add({ years: n });
      case 'month':
        return base.add({ months: n });
      case 'day':
        return base.add({ days: n });
      default:
        return null;
    }
  }

  if (base instanceof ZonedDateTime) {
    switch (partType) {
      case 'year':
        return base.add({ years: n });
      case 'month':
        return base.add({ months: n });
      case 'day':
        return base.add({ days: n });
      case 'hour':
        return base.add({ hours: n });
      case 'minute':
        return base.add({ minutes: n });
      case 'second':
        return base.add({ seconds: n });
      default:
        return null;
    }
  }

  const cdt = base as CalendarDateTime;
  switch (partType) {
    case 'year':
      return cdt.add({ years: n });
    case 'month':
      return cdt.add({ months: n });
    case 'day':
      return cdt.add({ days: n });
    case 'hour':
      return cdt.add({ hours: n });
    case 'minute':
      return cdt.add({ minutes: n });
    case 'second':
      return cdt.add({ seconds: n });
    default:
      return null;
  }
}

export function finalizeNudgedValue(
  next: DateValue,
  original: DateValue,
  granularity: PfInputDateGranularity
): DateValue {
  if (granularity === 'day') {
    return toCalendarDate(next);
  }
  if (original instanceof ZonedDateTime) {
    if (next instanceof ZonedDateTime) return next;
    return toZoned(toCalendarDateTime(next), original.timeZone);
  }
  if (next instanceof ZonedDateTime) {
    return toCalendarDateTime(next);
  }
  return next;
}
