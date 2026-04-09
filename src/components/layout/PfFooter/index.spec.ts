import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFooter from './index.vue';

describe('PfFooter', () => {
  it('renders default slot in center column', () => {
    const w = mount(PfFooter, { slots: { default: 'center content' } });
    expect(w.text()).toContain('center content');
    expect(w.find('.pfFooter__center').text()).toContain('center content');
  });

  it('uses footer root by default', () => {
    const w = mount(PfFooter, { slots: { default: 'x' } });
    expect(w.find('footer.pfFooter').exists()).toBe(true);
  });

  it('renders as custom tag when as is set', () => {
    const w = mount(PfFooter, {
      props: { as: 'div' },
      slots: { default: 'x' },
    });
    expect(w.find('div.pfFooter').exists()).toBe(true);
  });

  it('renders named slots in expected regions', () => {
    const w = mount(PfFooter, {
      slots: {
        top: 'top block',
        left: 'left block',
        default: 'mid',
        right: 'right block',
        bottom: 'bottom block',
      },
    });
    expect(w.find('.pfFooter__top').text()).toContain('top block');
    expect(w.find('.pfFooter__left').text()).toContain('left block');
    expect(w.find('.pfFooter__center').text()).toContain('mid');
    expect(w.find('.pfFooter__right').text()).toContain('right block');
    expect(w.find('.pfFooter__bottom').text()).toContain('bottom block');
  });

  it('omits top and bottom wrappers when slots are absent', () => {
    const w = mount(PfFooter, { slots: { default: 'only center' } });
    expect(w.find('.pfFooter__top').exists()).toBe(false);
    expect(w.find('.pfFooter__bottom').exists()).toBe(false);
  });

  it('merges ui classes', () => {
    const w = mount(PfFooter, {
      props: {
        ui: {
          root: 'r',
          top: 't',
          bottom: 'b',
          container: 'c',
          left: 'l',
          center: 'm',
          right: 'ri',
        },
      },
      slots: {
        top: 'a',
        left: 'b',
        default: 'c',
        right: 'd',
        bottom: 'e',
      },
    });
    expect(w.find('footer').classes()).toEqual(
      expect.arrayContaining(['pfFooter', 'r'])
    );
    expect(w.find('.pfFooter__top.t').exists()).toBe(true);
    expect(w.find('.pfFooter__bottom.b').exists()).toBe(true);
    expect(w.find('.pfFooter__container.c').exists()).toBe(true);
    expect(w.find('.pfFooter__left.l').exists()).toBe(true);
    expect(w.find('.pfFooter__center.m').exists()).toBe(true);
    expect(w.find('.pfFooter__right.ri').exists()).toBe(true);
  });
});
