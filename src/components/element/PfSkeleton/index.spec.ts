import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfSkeleton from './index.vue';

describe('PfSkeleton', () => {
  it('renders div with pfSkeleton class by default', () => {
    const w = mount(PfSkeleton);
    const el = w.find('div.pfSkeleton');
    expect(el.exists()).toBe(true);
    expect(el.attributes('role')).toBe('presentation');
    expect(el.attributes('aria-hidden')).toBe('true');
  });

  it('renders custom root tag via as', () => {
    const w = mount(PfSkeleton, { props: { as: 'span' } });
    expect(w.find('span.pfSkeleton').exists()).toBe(true);
  });

  it('merges ui.base and attrs class', () => {
    const w = mount(PfSkeleton, {
      props: { ui: { base: 'extraUi' } },
      attrs: { class: 'fromAttrs' },
    });
    const el = w.find('.pfSkeleton');
    expect(el.classes()).toContain('extraUi');
    expect(el.classes()).toContain('fromAttrs');
  });

  it('renders default slot content', () => {
    const w = mount(PfSkeleton, { slots: { default: 'inner' } });
    expect(w.text()).toContain('inner');
  });
});
