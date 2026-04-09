import { describe, expect, it } from 'vitest';
import { isQueryEqual, isQueryPartiallyEqual } from './pfLinkQuery';

describe('pfLinkQuery', () => {
  it('isQueryEqual matches order-insensitively', () => {
    expect(isQueryEqual({ a: '1', b: '2' }, { b: '2', a: '1' })).toBe(true);
    expect(isQueryEqual({ a: '1' }, { a: '2' })).toBe(false);
  });

  it('isQueryPartiallyEqual requires link keys to match current', () => {
    expect(isQueryPartiallyEqual({ tab: '1' }, { tab: '1', x: 'y' })).toBe(
      true
    );
    expect(
      isQueryPartiallyEqual({ tab: '1', x: 'z' }, { tab: '1', x: 'y' })
    ).toBe(false);
  });
});
