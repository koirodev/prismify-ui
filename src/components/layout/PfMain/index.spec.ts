import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfMain from './index.vue';

describe('PfMain', () => {
  it('renders default slot', () => {
    const w = mount(PfMain, { slots: { default: 'inner' } });
    expect(w.text()).toContain('inner');
  });

  it('uses main root by default', () => {
    const w = mount(PfMain, { slots: { default: 'x' } });
    expect(w.find('main.pfMain').exists()).toBe(true);
  });

  it('renders as custom tag when as is set', () => {
    const w = mount(PfMain, {
      props: { as: 'div' },
      slots: { default: 'x' },
    });
    expect(w.find('div.pfMain').exists()).toBe(true);
  });

  it('merges ui.base class', () => {
    const w = mount(PfMain, {
      props: { ui: { base: 'customUi' } },
      slots: { default: 'x' },
    });
    expect(w.find('.pfMain.customUi').exists()).toBe(true);
  });
});
