import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import PfButton from './index.vue';

describe('PfButton', () => {
  it('renders slot content', () => {
    const w = mount(PfButton, { slots: { default: 'Save' } });
    expect(w.text()).toContain('Save');
  });

  it('applies color and variant classes', () => {
    const w = mount(PfButton, {
      props: { color: 'error', variant: 'outline' },
    });
    expect(w.find('button').classes()).toContain('pfButton_color_error');
    expect(w.find('button').classes()).toContain('pfButton_variant_outline');
  });

  it('applies size class', () => {
    const w = mount(PfButton, { props: { size: 'lg' } });
    expect(w.find('button').classes()).toContain('pfButton_size_lg');
  });

  it('renders leading icon from prop', () => {
    const w = mount(PfButton, {
      props: { leadingIcon: 'plus' },
      slots: { default: 'Add' },
    });
    expect(w.find('svg').exists()).toBe(true);
  });

  it('disables the native button', () => {
    const w = mount(PfButton, { props: { disabled: true } });
    expect(w.find('button').element.disabled).toBe(true);
  });

  it('sets aria-label when passed', () => {
    const w = mount(PfButton, {
      props: { iconOnly: true, leadingIcon: 'plus', ariaLabel: 'OK' },
    });
    expect(w.find('button').attributes('aria-label')).toBe('OK');
  });

  it('renders label prop', () => {
    const w = mount(PfButton, { props: { label: 'From prop' } });
    expect(w.text()).toContain('From prop');
  });

  it('renders anchor when href is set', () => {
    const w = mount(PfButton, {
      props: { href: 'https://example.com', label: 'Go' },
    });
    const a = w.find('a');
    expect(a.exists()).toBe(true);
    expect(a.attributes('href')).toBe('https://example.com');
  });

  it('uses to as href', () => {
    const w = mount(PfButton, {
      props: { to: '/path', label: 'Go' },
    });
    expect(w.find('a').attributes('href')).toBe('/path');
  });

  it('sets aria-busy when loading', () => {
    const w = mount(PfButton, {
      props: { loading: true, label: 'Wait' },
    });
    expect(w.find('button').attributes('aria-busy')).toBe('true');
    expect(w.find('.pfButton__iconSpin').exists()).toBe(true);
  });

  it('loadingAuto awaits promise from attrs onClick', async () => {
    vi.useFakeTimers();
    const w = mount(PfButton, {
      props: { loadingAuto: true, label: 'Go' },
      attrs: {
        onClick: () => new Promise<void>((r) => setTimeout(r, 100)),
      },
    });
    await w.find('button').trigger('click');
    expect(w.find('button').attributes('aria-busy')).toBe('true');
    await vi.advanceTimersByTimeAsync(100);
    expect(w.find('button').attributes('aria-busy')).toBeUndefined();
    vi.useRealTimers();
  });
});
