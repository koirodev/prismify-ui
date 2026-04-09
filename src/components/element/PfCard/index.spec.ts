import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfCard from './index.vue';

describe('PfCard', () => {
  it('renders header, default, and footer slots', () => {
    const w = mount(PfCard, {
      slots: {
        header: 'H',
        default: 'B',
        footer: 'F',
      },
    });
    expect(w.text()).toContain('H');
    expect(w.text()).toContain('B');
    expect(w.text()).toContain('F');
  });

  it('applies variant and divided classes for outline', () => {
    const w = mount(PfCard, {
      props: { variant: 'outline' },
      slots: { default: 'x' },
    });
    const root = w.find('.pfCard');
    expect(root.classes()).toContain('pfCard_variant_outline');
    expect(root.classes()).toContain('pfCard_divided');
  });

  it('does not add divided class for solid', () => {
    const w = mount(PfCard, {
      props: { variant: 'solid' },
      slots: {
        header: 'h',
        default: 'b',
      },
    });
    const root = w.find('.pfCard');
    expect(root.classes()).toContain('pfCard_variant_solid');
    expect(root.classes()).not.toContain('pfCard_divided');
  });

  it('renders as custom element via as prop', () => {
    const w = mount(PfCard, {
      props: { as: 'article' },
      slots: { default: 'c' },
    });
    expect(w.find('article.pfCard').exists()).toBe(true);
  });

  it('merges ui slot classes', () => {
    const w = mount(PfCard, {
      props: {
        ui: {
          header: 'customHeader',
          body: 'customBody',
          footer: 'customFooter',
        },
      },
      slots: {
        header: 'h',
        default: 'b',
        footer: 'f',
      },
    });
    expect(w.find('.pfCard__header').classes()).toContain('customHeader');
    expect(w.find('.pfCard__body').classes()).toContain('customBody');
    expect(w.find('.pfCard__footer').classes()).toContain('customFooter');
  });
});
