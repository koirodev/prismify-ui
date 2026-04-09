import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPfKbdKey } from '../../../composables/usePfKbd';
import PfKbd from './index.vue';

describe('PfKbd', () => {
  it('renders default slot when value is omitted', () => {
    const w = mount(PfKbd, { slots: { default: 'K' } });
    expect(w.text()).toBe('K');
    expect(w.find('kbd').exists()).toBe(true);
  });

  it('renders resolved value when value prop is set', () => {
    const w = mount(PfKbd, { props: { value: 'escape' } });
    expect(w.text()).toBe('Esc');
  });

  it('applies color, variant, and size classes', () => {
    const w = mount(PfKbd, {
      props: { color: 'warning', variant: 'soft', size: 'lg' },
      slots: { default: 'X' },
    });
    const el = w.find('.pfKbd');
    expect(el.classes()).toContain('pfKbd_color_warning');
    expect(el.classes()).toContain('pfKbd_variant_soft');
    expect(el.classes()).toContain('pfKbd_size_lg');
  });

  it('renders custom tag via as', () => {
    const w = mount(PfKbd, {
      props: { as: 'span' },
      slots: { default: 'S' },
    });
    expect(w.find('span.pfKbd').exists()).toBe(true);
    expect(w.find('kbd').exists()).toBe(false);
  });

  it('merges ui.base and attrs class', () => {
    const w = mount(PfKbd, {
      props: { ui: { base: 'extra-base' } },
      attrs: { class: 'extra-attr' },
      slots: { default: 'x' },
    });
    const el = w.find('.pfKbd');
    expect(el.classes()).toContain('extra-base');
    expect(el.classes()).toContain('extra-attr');
  });
});

describe('getPfKbdKey', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps meta to Ctrl when not macOS', () => {
    vi.stubGlobal('navigator', { userAgent: 'Windows NT 10.0; Win64' });
    expect(getPfKbdKey('meta')).toBe('Ctrl');
  });

  it('maps meta to command symbol on macOS', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    expect(getPfKbdKey('meta')).toBe('⌘');
  });

  it('returns literal for unknown keys', () => {
    vi.stubGlobal('navigator', { userAgent: 'Windows NT 10.0' });
    expect(getPfKbdKey('Q')).toBe('Q');
  });
});
