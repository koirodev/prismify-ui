import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfBadge from './index.vue';

describe('PfBadge', () => {
  it('renders default slot', () => {
    const w = mount(PfBadge, { slots: { default: 'Beta' } });
    expect(w.text()).toContain('Beta');
  });

  it('renders label prop when default slot empty', () => {
    const w = mount(PfBadge, { props: { label: '3' } });
    expect(w.text()).toContain('3');
  });

  it('applies color, variant, and size classes', () => {
    const w = mount(PfBadge, {
      props: { color: 'warning', variant: 'outline', size: 'lg' },
      slots: { default: 'X' },
    });
    const el = w.find('.pfBadge');
    expect(el.classes()).toContain('pfBadge_color_warning');
    expect(el.classes()).toContain('pfBadge_variant_outline');
    expect(el.classes()).toContain('pfBadge_size_lg');
  });

  it('applies square class', () => {
    const w = mount(PfBadge, {
      props: { square: true },
      slots: { default: '1' },
    });
    expect(w.find('.pfBadge').classes()).toContain('pfBadge_square');
  });

  it('renders leading icon from icon prop', () => {
    const w = mount(PfBadge, {
      props: { icon: 'plus' },
      slots: { default: 'Add' },
    });
    expect(w.find('.pfBadge__leading svg').exists()).toBe(true);
  });

  it('renders trailing icon when trailing and icon set', () => {
    const w = mount(PfBadge, {
      props: { icon: 'arrowRight', trailing: true },
      slots: { default: 'Next' },
    });
    expect(w.find('.pfBadge__trailing svg').exists()).toBe(true);
    expect(w.find('.pfBadge__leading svg').exists()).toBe(false);
  });

  it('renders leadingIcon over generic icon on the left', () => {
    const w = mount(PfBadge, {
      props: { icon: 'plus', leadingIcon: 'check' },
      slots: { default: 'OK' },
    });
    expect(w.findAll('.pfBadge__leading svg')).toHaveLength(1);
  });

  it('renders as custom root tag', () => {
    const w = mount(PfBadge, {
      props: { as: 'a' },
      slots: { default: 'Link' },
    });
    expect(w.find('a.pfBadge').exists()).toBe(true);
  });

  it('renders avatar when avatar prop set', () => {
    const w = mount(PfBadge, {
      props: { avatar: { text: 'AB' } },
      slots: { default: 'User' },
    });
    expect(w.find('.pfBadge__avatar').exists()).toBe(true);
  });
});
