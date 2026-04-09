import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfSeparator from './index.vue';

describe('PfSeparator', () => {
  it('renders full line without middle content', () => {
    const w = mount(PfSeparator);
    expect(w.find('.pfSeparator__lineFull').exists()).toBe(true);
    expect(w.find('.pfSeparator__segment').exists()).toBe(false);
  });

  it('renders label between segments', () => {
    const w = mount(PfSeparator, { props: { label: 'Or' } });
    expect(w.find('.pfSeparator__label').text()).toBe('Or');
    expect(w.findAll('.pfSeparator__segment')).toHaveLength(2);
  });

  it('sets separator role and orientation when not decorative', () => {
    const w = mount(PfSeparator, { props: { orientation: 'vertical' } });
    const root = w.find('.pfSeparator');
    expect(root.attributes('role')).toBe('separator');
    expect(root.attributes('aria-orientation')).toBe('vertical');
  });

  it('uses presentation and aria-hidden when decorative', () => {
    const w = mount(PfSeparator, { props: { decorative: true } });
    const root = w.find('.pfSeparator');
    expect(root.attributes('role')).toBe('presentation');
    expect(root.attributes('aria-hidden')).toBe('true');
  });

  it('renders default slot in container', () => {
    const w = mount(PfSeparator, {
      slots: { default: '<span class="custom-mid">X</span>' },
    });
    expect(w.find('.custom-mid').exists()).toBe(true);
    expect(w.find('.pfSeparator__container').find('.custom-mid').exists()).toBe(
      true
    );
  });

  it('prefers slot over label prop', () => {
    const w = mount(PfSeparator, {
      props: { label: 'L' },
      slots: { default: 'S' },
    });
    expect(w.text()).toContain('S');
    expect(w.find('.pfSeparator__label').exists()).toBe(false);
  });
});
