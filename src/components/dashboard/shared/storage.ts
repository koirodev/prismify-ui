export type PfDashboardStorage = 'cookie' | 'local';

export interface PfDashboardStateBucket {
  [id: string]: Partial<{
    size: number;
    open: boolean;
    collapsed: boolean;
  }>;
}

function canUseWindow(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function parseJson(input: string | null | undefined): PfDashboardStateBucket {
  if (!input) return {};
  try {
    const parsed = JSON.parse(input) as unknown;
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as PfDashboardStateBucket;
    }
    return {};
  } catch {
    return {};
  }
}

function parseCookie(cookieValue: string): string {
  return decodeURIComponent(cookieValue);
}

function readCookie(name: string): string | null {
  if (!canUseWindow()) return null;
  const encodedName = encodeURIComponent(name);
  const chunks = document.cookie ? document.cookie.split('; ') : [];
  for (const chunk of chunks) {
    if (!chunk.startsWith(`${encodedName}=`)) continue;
    return parseCookie(chunk.slice(encodedName.length + 1));
  }
  return null;
}

function writeCookie(name: string, value: string): void {
  if (!canUseWindow()) return;
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  document.cookie = `${encodedName}=${encodedValue}; path=/; max-age=31536000; SameSite=Lax`;
}

function readLocal(name: string): string | null {
  if (!canUseWindow()) return null;
  try {
    return window.localStorage.getItem(name);
  } catch {
    return null;
  }
}

function writeLocal(name: string, value: string): void {
  if (!canUseWindow()) return;
  try {
    window.localStorage.setItem(name, value);
  } catch {
    // ignore quota and privacy mode failures
  }
}

export function readDashboardBucket(
  storage: PfDashboardStorage,
  storageKey: string,
  persistent: boolean
): PfDashboardStateBucket {
  if (!persistent) return {};
  const raw =
    storage === 'local' ? readLocal(storageKey) : readCookie(storageKey);
  return parseJson(raw);
}

export function writeDashboardBucket(
  storage: PfDashboardStorage,
  storageKey: string,
  persistent: boolean,
  bucket: PfDashboardStateBucket
): void {
  if (!persistent) return;
  const next = JSON.stringify(bucket);
  if (storage === 'local') {
    writeLocal(storageKey, next);
    return;
  }
  writeCookie(storageKey, next);
}
