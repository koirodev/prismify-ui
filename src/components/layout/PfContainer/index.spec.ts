import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfContainer from './index.vue';

describe('PfContainer', () => {
  it('renders default slot', () => {
    const w = mount(PfContainer, { slots: { default: 'inner' } });
    expect(w.text()).toContain('inner');
  });

  it('uses div root by default', () => {
    const w = mount(PfContainer, { slots: { default: 'x' } });
    expect(w.find('div.pfContainer').exists()).toBe(true);
  });

  it('renders as custom tag when as is set', () => {
    const w = mount(PfContainer, {
      props: { as: 'main' },
      slots: { default: 'x' },
    });
    expect(w.find('main.pfContainer').exists()).toBe(true);
  });

  it('merges ui.base class', () => {
    const w = mount(PfContainer, {
      props: { ui: { base: 'customUi' } },
      slots: { default: 'x' },
    });
    expect(w.find('.pfContainer.customUi').exists()).toBe(true);
  });
});
