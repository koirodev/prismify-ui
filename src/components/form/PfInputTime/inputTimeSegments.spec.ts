import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import {
  extractTime,
  mergeTimeInto,
  nudgeTimeSegment,
  snapTimeToStep,
  tryComposeTimeFromTexts,
} from './inputTimeSegments';

describe('tryComposeTimeFromTexts', () => {
  it('composes Time from 24h segments', () => {
    const layout = [
      { kind: 'field' as const, partType: 'hour' as const, key: 'hour-1' },
      { kind: 'literal' as const, text: ':' },
      { kind: 'field' as const, partType: 'minute' as const, key: 'minute-1' },
    ];
    const texts = { 'hour-1': '14', 'minute-1': '05' };
    const r = tryComposeTimeFromTexts(layout, texts, 'minute', null);
    expect(r.valid).toBe(true);
    expect(r.value).toBeInstanceOf(Time);
    expect((r.value as Time).hour).toBe(14);
    expect((r.value as Time).minute).toBe(5);
  });
});

describe('nudgeTimeSegment', () => {
  it('steps minutes on Time model', () => {
    const base = new Time(10, 0, 0);
    const next = nudgeTimeSegment(base, 'minute', 1, {
      granularity: 'minute',
      step: 15,
    });
    expect(next).not.toBeNull();
    expect(extractTime(next!).minute).toBe(15);
  });
});

describe('snapTimeToStep', () => {
  it('snaps minutes to grid', () => {
    const t = new Time(10, 7, 0);
    const out = snapTimeToStep(t, 'minute', 15);
    expect(out.minute).toBe(0);
    expect(out.hour).toBe(10);
  });
});

describe('mergeTimeInto', () => {
  it('returns plain Time when prior is null', () => {
    const out = mergeTimeInto(null, new Time(1, 2, 3));
    expect(out).toBeInstanceOf(Time);
    expect((out as Time).hour).toBe(1);
  });
});
