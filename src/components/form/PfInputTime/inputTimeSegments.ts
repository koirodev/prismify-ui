import type { PfInputDateLayoutToken } from '../PfInputDate/inputDateSegments';
import {
  CalendarDateTime,
  DateFormatter,
  Time,
  ZonedDateTime,
} from '@internationalized/date';

export type PfInputTimeLayoutToken = PfInputDateLayoutToken;

export type PfInputTimeGranularity = 'hour' | 'minute' | 'second';

export type PfInputTimeHourCycle = 'h11' | 'h12' | 'h23' | 'h24';

/** Time value for the field (Nuxt UI InputTime style). */
export type PfTimeValue = Time | CalendarDateTime | ZonedDateTime;

export type PfInputTimeRange = {
  start?: PfTimeValue | null;
  end?: PfTimeValue | null;
};

const EDITABLE = new Set<string>(['hour', 'minute', 'second', 'dayPeriod']);

/** Fixed date used only to parse Intl “time-only” segments. */
const REF_Y = 2000;
const REF_M = 1;
const REF_D = 1;

export function extractTime(v: PfTimeValue): Time {
  if (v instanceof Time) return v;
  return new Time(v.hour, v.minute, v.second, v.millisecond);
}

export function mergeTimeInto(
  prior: PfTimeValue | null,
  time: Time
): PfTimeValue {
  if (!prior || prior instanceof Time) {
    return new Time(time.hour, time.minute, time.second, time.millisecond);
  }
  if (prior instanceof ZonedDateTime) {
    return prior.set({
      hour: time.hour,
      minute: time.minute,
      second: time.second,
      millisecond: time.millisecond,
    });
  }
  return prior.set({
    hour: time.hour,
    minute: time.minute,
    second: time.second,
    millisecond: time.millisecond,
  });
}

export function timeValueToJsDate(value: PfTimeValue, timeZone: string): Date {
  if (value instanceof ZonedDateTime) {
    return value.toDate();
  }
  if (value instanceof Time) {
    return new CalendarDateTime(
      REF_Y,
      REF_M,
      REF_D,
      value.hour,
      value.minute,
      value.second,
      value.millisecond
    ).toDate(timeZone);
  }
  return value.toDate(timeZone);
}

export function buildIntlTimeOptions(
  granularity: PfInputTimeGranularity,
  hourCycle: PfInputTimeHourCycle | undefined,
  hideTimeZone: boolean
): Intl.DateTimeFormatOptions {
  const o: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
  };
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

export function inferTimeGranularity(
  value: PfTimeValue | null | undefined,
  explicit: PfInputTimeGranularity | undefined
): PfInputTimeGranularity {
  if (explicit) return explicit;
  if (value == null) return 'minute';
  if (value instanceof Time) return 'minute';
  return 'minute';
}

export function layoutAndTextsFromTime(
  formatter: DateFormatter,
  jsDate: Date
): {
  layout: PfInputTimeLayoutToken[];
  texts: Record<string, string>;
} {
  const parts = formatter.formatToParts(jsDate);
  const layout: PfInputTimeLayoutToken[] = [];
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

export type ComposeTimeResult = {
  value: PfTimeValue | null;
  segmentsComplete: boolean;
  valid: boolean;
};

export function tryComposeTimeFromTexts(
  layout: PfInputTimeLayoutToken[],
  texts: Record<string, string>,
  granularity: PfInputTimeGranularity,
  prior: PfTimeValue | null
): ComposeTimeResult {
  let hour = 0;
  let minute = 0;
  let second = 0;
  let dayPeriod: string | undefined;
  let hourStrFor12: string | undefined;
  const use12hHour = layout.some(
    (t) => t.kind === 'field' && t.partType === 'dayPeriod'
  );

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
    if (t.partType === 'hour') {
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

  const composed = new Time(hour, minute, second, 0);
  try {
    return {
      value: mergeTimeInto(prior, composed),
      segmentsComplete: true,
      valid: true,
    };
  } catch {
    return { value: null, segmentsComplete: true, valid: false };
  }
}

export function compareTimeOnly(a: PfTimeValue, b: PfTimeValue): number {
  return extractTime(a).compare(extractTime(b));
}

export function cmpTimeInBounds(
  v: PfTimeValue,
  min: PfTimeValue | null | undefined,
  max: PfTimeValue | null | undefined
): boolean {
  if (min != null && compareTimeOnly(v, min) < 0) return false;
  if (max != null && compareTimeOnly(v, max) > 0) return false;
  return true;
}

/**
 * Snap to `step` grid for the chosen granularity (like stepSnapping).
 */
export function snapTimeToStep(
  time: Time,
  granularity: PfInputTimeGranularity,
  step: number
): Time {
  const s = Math.max(1, Math.round(step));
  let { hour, minute, second, millisecond } = time;

  if (granularity === 'second') {
    const totalSec = hour * 3600 + minute * 60 + second;
    let snapped = Math.round(totalSec / s) * s;
    if (snapped < 0) snapped = 0;
    if (snapped >= 86400) snapped = 86399;
    const h = Math.floor(snapped / 3600);
    const m = Math.floor((snapped % 3600) / 60);
    const sec = snapped % 60;
    return new Time(h, m, sec, millisecond);
  }

  if (granularity === 'minute') {
    const totalMin = hour * 60 + minute;
    let snappedMin = Math.round(totalMin / s) * s;
    if (snappedMin < 0) snappedMin = 0;
    if (snappedMin >= 24 * 60) snappedMin = 24 * 60 - 1;
    const h = Math.floor(snappedMin / 60);
    const m = snappedMin % 60;
    return new Time(h, m, second, millisecond);
  }

  let snappedH = Math.round(hour / s) * s;
  snappedH = ((snappedH % 24) + 24) % 24;
  return new Time(snappedH, minute, second, millisecond);
}

export function nudgeTimeSegment(
  base: PfTimeValue,
  partType: string,
  direction: 1 | -1,
  options: { granularity: PfInputTimeGranularity; step: number }
): PfTimeValue | null {
  const step = Math.max(1, Math.round(options.step));
  const n = direction * step;

  if (partType === 'dayPeriod') {
    const t = extractTime(base);
    return mergeTimeInto(base, t.add({ hours: direction * 12 }));
  }

  if (partType !== 'hour' && partType !== 'minute' && partType !== 'second') {
    return null;
  }

  const t = extractTime(base);

  if (partType === 'hour') {
    return mergeTimeInto(base, t.add({ hours: n }));
  }
  if (partType === 'minute') {
    return mergeTimeInto(base, t.add({ minutes: n }));
  }
  return mergeTimeInto(base, t.add({ seconds: n }));
}
