/** Internal layout helpers for PfScrollArea (no external virtualizer dependency). */

export type PfMasonryItemLayout = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function buildLinearOffsets(
  sizes: readonly number[],
  gap: number,
  paddingStart: number,
  _axis: 'vertical' | 'horizontal'
): number[] {
  const n = sizes.length;
  const offsets = new Array<number>(n);
  let acc = paddingStart;
  for (let i = 0; i < n; i++) {
    offsets[i] = acc;
    acc += sizes[i]! + (i < n - 1 ? gap : 0);
  }
  return offsets;
}

export function linearTotalSize(
  offsets: readonly number[],
  sizes: readonly number[],
  paddingEnd: number
): number {
  const n = sizes.length;
  if (n === 0) {
    return paddingEnd;
  }
  return offsets[n - 1]! + sizes[n - 1]! + paddingEnd;
}

export function findVisibleRangeLinear(
  offsets: readonly number[],
  sizes: readonly number[],
  scrollStart: number,
  viewport: number,
  overscanPx: number
): { start: number; end: number } {
  const n = sizes.length;
  if (n === 0) {
    return { start: 0, end: -1 };
  }
  const view0 = scrollStart - overscanPx;
  const view1 = scrollStart + viewport + overscanPx;
  let start = n;
  let end = -1;
  for (let i = 0; i < n; i++) {
    const o = offsets[i]!;
    const s = sizes[i]!;
    if (o < view1 && o + s > view0) {
      if (start === n) {
        start = i;
      }
      end = i;
    }
  }
  if (start === n) {
    return { start: 0, end: -1 };
  }
  return { start, end };
}

export function computeMasonryLayouts(
  heights: readonly number[],
  lanes: number,
  containerInnerWidth: number,
  gap: number,
  paddingStart: number
): { layouts: PfMasonryItemLayout[]; totalHeight: number } {
  const n = heights.length;
  const L = Math.max(1, lanes);
  const layouts: PfMasonryItemLayout[] = new Array(n);
  if (n === 0) {
    return { layouts, totalHeight: paddingStart };
  }

  const laneWidth =
    L > 1 ? (containerInnerWidth - gap * (L - 1)) / L : containerInnerWidth;

  const columnBottoms = new Array<number>(L).fill(0);

  for (let i = 0; i < n; i++) {
    let lane = 0;
    let minBottom = columnBottoms[0]!;
    for (let l = 1; l < L; l++) {
      if (columnBottoms[l]! < minBottom) {
        minBottom = columnBottoms[l]!;
        lane = l;
      }
    }
    const innerTop =
      columnBottoms[lane]! + (columnBottoms[lane]! > 0 ? gap : 0);
    const top = paddingStart + innerTop;
    const left = lane * (laneWidth + gap);
    const height = heights[i]!;
    layouts[i] = { top, left, width: laneWidth, height };
    columnBottoms[lane] = innerTop + height;
  }

  const maxBottom = Math.max(...columnBottoms);
  const totalHeight = paddingStart + maxBottom;
  return { layouts, totalHeight };
}

export function findMasonryVisibleRange(
  layouts: readonly PfMasonryItemLayout[],
  scrollTop: number,
  viewport: number,
  overscanPx: number
): { start: number; end: number } {
  const n = layouts.length;
  if (n === 0) {
    return { start: 0, end: -1 };
  }
  const view0 = scrollTop - overscanPx;
  const view1 = scrollTop + viewport + overscanPx;
  let start = n;
  let end = -1;
  for (let i = 0; i < n; i++) {
    const L = layouts[i]!;
    if (L.top < view1 && L.top + L.height > view0) {
      if (start === n) {
        start = i;
      }
      end = i;
    }
  }
  if (start === n) {
    return { start: 0, end: -1 };
  }
  return { start, end };
}
