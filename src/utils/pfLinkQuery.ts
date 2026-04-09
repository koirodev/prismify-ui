import type { LocationQuery, LocationQueryValue } from 'vue-router';

function isQueryValueEqual(
  a: LocationQueryValue | LocationQueryValue[] | undefined | null,
  b: LocationQueryValue | LocationQueryValue[] | undefined | null
): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }
  return String(a) === String(b);
}

/** Full query match (like Nuxt UI Link with `exactQuery: true`). */
export function isQueryEqual(a: LocationQuery, b: LocationQuery): boolean {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  if (keysA.some((k, i) => k !== keysB[i])) return false;
  return keysA.every((k) => isQueryValueEqual(a[k], b[k]));
}

/**
 * Each parameter from `linkQuery` must match the current route
 * (`exactQuery: 'partial'` — extra keys in the current query are allowed).
 */
export function isQueryPartiallyEqual(
  linkQuery: LocationQuery,
  currentQuery: LocationQuery
): boolean {
  for (const key of Object.keys(linkQuery)) {
    if (!isQueryValueEqual(linkQuery[key], currentQuery[key])) {
      return false;
    }
  }
  return true;
}
