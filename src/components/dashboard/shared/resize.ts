export type PfDashboardUnit = '%' | 'rem' | 'px';

export function clampSize(value: number, min: number, max?: number): number {
  const maxValue = max ?? Number.POSITIVE_INFINITY;
  return Math.max(min, Math.min(value, maxValue));
}

export function toUnit(value: number, unit: PfDashboardUnit): string {
  return `${value}${unit}`;
}

export function pxToUnit(
  px: number,
  unit: PfDashboardUnit,
  containerPx: number
): number {
  if (unit === 'px') return px;
  if (unit === 'rem') return px / rootFontSize();
  if (containerPx <= 0) return 0;
  return (px / containerPx) * 100;
}

export function unitToPx(
  value: number,
  unit: PfDashboardUnit,
  containerPx: number
): number {
  if (unit === 'px') return value;
  if (unit === 'rem') return value * rootFontSize();
  return (value / 100) * containerPx;
}

function rootFontSize(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 16;
  }
  const root = window.getComputedStyle(document.documentElement).fontSize;
  const parsed = Number.parseFloat(root);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}
