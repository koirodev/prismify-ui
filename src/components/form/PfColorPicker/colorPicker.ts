/** Internal HSV (Nuxt UI ColorPicker style): h — degrees 0–360, s/v — percent 0–100. */
export interface PfColorPickerHsv {
  h: number;
  s: number;
  v: number;
}

export type PfColorPickerFormat = 'hex' | 'rgb' | 'hsl' | 'cmyk' | 'lab';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function clamp255(n: number): number {
  return Math.round(clamp(n, 0, 255));
}

/** HSL (H 0–360, S/L 0–100) → HSV (Nuxt-compatible formulas). */
export function hslToHsv(h: number, s: number, l: number): PfColorPickerHsv {
  const x = (s * (l < 50 ? l : 100 - l)) / 100;
  const v = l + x / 100;
  return {
    h,
    s: l === 0 ? s : v === 0 ? 0 : (2 * x) / v,
    v,
  };
}

/** HSV → HSL (Nuxt). */
export function hsvToHsl(hsv: PfColorPickerHsv): {
  h: number;
  s: number;
  l: number;
} {
  const { h, s, v } = hsv;
  const x = ((200 - s) * v) / 100;
  if (x === 0 || x === 200) {
    return { h, s: 0, l: x / 2 };
  }
  const denom = x <= 100 ? x : 200 - x;
  const sl = Math.round((s * v) / denom);
  return { h, s: sl, l: x / 2 };
}

export function rgbToHsv(r: number, g: number, b: number): PfColorPickerHsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let hh = 0;
  if (d > 1e-10) {
    if (max === rn) {
      hh = ((gn - bn) / d + (gn < bn ? 6 : 0)) % 6;
    } else if (max === gn) {
      hh = (bn - rn) / d + 2;
    } else {
      hh = (rn - gn) / d + 4;
    }
    hh *= 60;
  }
  const ss = max === 0 ? 0 : (d / max) * 100;
  const vv = max * 100;
  return { h: hh, s: ss, v: vv };
}

export function hsvToRgb(hsv: PfColorPickerHsv): Rgb {
  const { h, s, v } = hsv;
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const vv = clamp(v, 0, 100) / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hh < 60) {
    rp = c;
    gp = x;
  } else if (hh < 120) {
    rp = x;
    gp = c;
  } else if (hh < 180) {
    gp = c;
    bp = x;
  } else if (hh < 240) {
    gp = x;
    bp = c;
  } else if (hh < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: clamp255((rp + m) * 255),
    g: clamp255((gp + m) * 255),
    b: clamp255((bp + m) * 255),
  };
}

function linearSrgbChannel(u: number): number {
  const x = u / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function gammaSrgbChannel(u: number): number {
  return u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055;
}

/** sRGB 0–255 → XYZ (D65), Y scaled to 0–100 for Lab. */
export function rgbToXyz(
  r: number,
  g: number,
  b: number
): { x: number; y: number; z: number } {
  const R = linearSrgbChannel(r);
  const G = linearSrgbChannel(g);
  const B = linearSrgbChannel(b);
  const x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  return { x: x * 100, y: y * 100, z: z * 100 };
}

const XN = 95.047;
const YN = 100.0;
const ZN = 108.883;

function labF(t: number): number {
  const d = 6 / 29;
  return t > d ** 3 ? Math.cbrt(t) : t / (3 * d * d) + 4 / 29;
}

export function rgbToLab(
  r: number,
  g: number,
  b: number
): { l: number; a: number; b: number } {
  const { x, y, z } = rgbToXyz(r, g, b);
  const fx = labF(x / XN);
  const fy = labF(y / YN);
  const fz = labF(z / ZN);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function xyzFromLab(
  l: number,
  a: number,
  b: number
): { x: number; y: number; z: number } {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const d = 6 / 29;
  const xr = fx ** 3 > d ** 3 ? fx ** 3 : 3 * d * d * (fx - 4 / 29);
  const yr = fy ** 3 > d ** 3 ? fy ** 3 : 3 * d * d * (fy - 4 / 29);
  const zr = fz ** 3 > d ** 3 ? fz ** 3 : 3 * d * d * (fz - 4 / 29);
  return { x: xr * XN, y: yr * YN, z: zr * ZN };
}

export function labToRgb(l: number, a: number, b: number): Rgb {
  const { x, y, z } = xyzFromLab(l, a, b);
  const xn = x / 100;
  const yn = y / 100;
  const zn = z / 100;
  let r = xn * 3.2404542 + yn * -1.5371385 + zn * -0.4985314;
  let g = xn * -0.969266 + yn * 1.8760108 + zn * 0.041556;
  let bch = xn * 0.0556434 + yn * -0.2040259 + zn * 1.0572252;
  r = gammaSrgbChannel(r);
  g = gammaSrgbChannel(g);
  bch = gammaSrgbChannel(bch);
  return {
    r: clamp255(r * 255),
    g: clamp255(g * 255),
    b: clamp255(bch * 255),
  };
}

export function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 1 - 1e-8) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = ((1 - rn - k) / (1 - k)) * 100;
  const m = ((1 - gn - k) / (1 - k)) * 100;
  const y = ((1 - bn - k) / (1 - k)) * 100;
  return { c, m, y, k: k * 100 };
}

export function cmykToRgb(c: number, m: number, y: number, k: number): Rgb {
  const cc = clamp(c, 0, 100) / 100;
  const mm = clamp(m, 0, 100) / 100;
  const yy = clamp(y, 0, 100) / 100;
  const kk = clamp(k, 0, 100) / 100;
  return {
    r: clamp255(255 * (1 - cc) * (1 - kk)),
    g: clamp255(255 * (1 - mm) * (1 - kk)),
    b: clamp255(255 * (1 - yy) * (1 - kk)),
  };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hsl = hslToHsv(h, s, l);
  return hsvToRgb(hsl);
}

function parseHex(s: string): Rgb | null {
  const t = s.trim();
  if (!t.startsWith('#')) return null;
  const hex = t.slice(1);
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  if (/^[0-9a-fA-F]{8}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return null;
}

function parseNumList(inner: string): number[] {
  const parts = inner.split(/[,\s/]+/).filter(Boolean);
  const out: number[] = [];
  for (const p of parts) {
    const v = parseFloat(p.replace(/%/g, ''));
    if (!Number.isFinite(v)) return [];
    out.push(v);
  }
  return out;
}

function parseRgbLike(s: string): Rgb | null {
  const m = s.match(/^rgba?\(\s*([^)]+)\s*\)$/i);
  if (!m) return null;
  const nums = parseNumList(m[1]);
  if (nums.length < 3) return null;
  const a = nums.length >= 4 ? nums[3] : 1;
  if (a <= 0) return { r: 255, g: 255, b: 255 };
  return { r: clamp255(nums[0]), g: clamp255(nums[1]), b: clamp255(nums[2]) };
}

function parseHsl(s: string): Rgb | null {
  const m = s.match(/^hsla?\(\s*([^)]+)\s*\)$/i);
  if (!m) return null;
  const parts = m[1].split(/[,\s/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]);
  const s1 = parseFloat(parts[1].replace(/%/g, ''));
  const l1 = parseFloat(parts[2].replace(/%/g, ''));
  if (![h, s1, l1].every(Number.isFinite)) return null;
  return hslToRgb(h, s1, l1);
}

function parseCmyk(s: string): Rgb | null {
  const m = s.match(/^cmyk\(\s*([^)]+)\s*\)$/i);
  if (!m) return null;
  const nums = parseNumList(m[1]);
  if (nums.length < 4) return null;
  return cmykToRgb(nums[0], nums[1], nums[2], nums[3]);
}

function parseLab(s: string): Rgb | null {
  const m = s.match(/^lab\(\s*([^)]+)\s*\)$/i);
  if (!m) return null;
  const nums = parseNumList(m[1].replace(/,/g, ' '));
  if (nums.length < 3) return null;
  return labToRgb(nums[0], nums[1], nums[2]);
}

/** Parse a color string to sRGB 0–255; on error — `fallback`. */
export function parseColorToRgb(
  input: string | undefined,
  fallback: Rgb = WHITE
): Rgb {
  if (input == null || !String(input).trim()) return { ...fallback };
  const s = String(input).trim();
  try {
    let rgb: Rgb | null = parseHex(s);
    if (rgb) return rgb;
    rgb = parseRgbLike(s);
    if (rgb) return rgb;
    rgb = parseHsl(s);
    if (rgb) return rgb;
    rgb = parseCmyk(s);
    if (rgb) return rgb;
    rgb = parseLab(s);
    if (rgb) return rgb;
  } catch {
    /* ignore */
  }
  return { ...fallback };
}

function formatHex(rgb: Rgb): string {
  const h = (n: number) => clamp255(n).toString(16).padStart(2, '0');
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

function formatRgb(rgb: Rgb): string {
  return `rgb(${clamp255(rgb.r)}, ${clamp255(rgb.g)}, ${clamp255(rgb.b)})`;
}

function formatHsl(rgb: Rgb): string {
  const hsl = hsvToHsl(rgbToHsv(rgb.r, rgb.g, rgb.b));
  const h = Math.round(hsl.h * 10) / 10;
  const s = Math.round(hsl.s * 10) / 10;
  const l = Math.round(hsl.l * 10) / 10;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function formatCmyk(rgb: Rgb): string {
  const { c, m, y, k } = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const f = (n: number) => `${Math.round(n * 100) / 100}%`;
  return `cmyk(${f(c)}, ${f(m)}, ${f(y)}, ${f(k)})`;
}

function formatLab(rgb: Rgb): string {
  const { l, a, b } = rgbToLab(rgb.r, rgb.g, rgb.b);
  const f = (n: number) => `${Math.round(n * 100) / 100}%`;
  return `lab(${f(l)} ${f(a)} ${f(b)})`;
}

export function formatColorFromRgb(
  rgb: Rgb,
  format: PfColorPickerFormat
): string {
  switch (format) {
    case 'rgb':
      return formatRgb(rgb);
    case 'hsl':
      return formatHsl(rgb);
    case 'cmyk':
      return formatCmyk(rgb);
    case 'lab':
      return formatLab(rgb);
    case 'hex':
    default:
      return formatHex(rgb);
  }
}

export function colorStringToHsv(
  input: string | undefined,
  fallbackRgb: Rgb = WHITE
): PfColorPickerHsv {
  const rgb = parseColorToRgb(input, fallbackRgb);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToColorString(
  hsv: PfColorPickerHsv,
  format: PfColorPickerFormat
): string {
  const rgb = hsvToRgb(hsv);
  return formatColorFromRgb(rgb, format);
}
