import { describe, expect, it } from 'vitest';
import {
  formatColorFromRgb,
  hsvToColorString,
  hsvToRgb,
  parseColorToRgb,
  rgbToHsv,
} from './colorPicker';

describe('colorPicker', () => {
  it('round-trips hex', () => {
    const rgb = parseColorToRgb('#00C16A');
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(193);
    expect(rgb.b).toBe(106);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const back = hsvToRgb(hsv);
    expect(back.r).toBe(0);
    expect(back.g).toBe(193);
    expect(back.b).toBe(106);
  });

  it('formats rgb string', () => {
    const rgb = parseColorToRgb('rgb(0, 193, 106)');
    expect(formatColorFromRgb(rgb, 'rgb')).toBe('rgb(0, 193, 106)');
  });

  it('parses hsl and formats hex', () => {
    const rgb = parseColorToRgb('hsl(153, 100%, 37.8%)');
    expect(formatColorFromRgb(rgb, 'hex')).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('hsvToColorString respects format', () => {
    const hsv = rgbToHsv(0, 193, 106);
    expect(hsvToColorString(hsv, 'hex').toLowerCase()).toBe('#00c16a');
    expect(hsvToColorString(hsv, 'rgb')).toBe('rgb(0, 193, 106)');
  });

  it('parses cmyk example', () => {
    const rgb = parseColorToRgb('cmyk(100%, 0%, 45.08%, 24.31%)');
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
  });

  it('parses lab example', () => {
    const rgb = parseColorToRgb('lab(68.88% -60.41% 32.55%)');
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
  });
});
