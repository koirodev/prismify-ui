import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfMarquee from './index.vue';

describe('PfMarquee', () => {
  it('renders root with pfMarquee class', () => {
    const w = mount(PfMarquee, {
      slots: { default: '<span class="t">x</span>' },
    });
    const root = w.find('.pfMarquee');
    expect(root.exists()).toBe(true);
    expect(root.attributes('data-orientation')).toBe('horizontal');
  });

  it('renders repeat segments', () => {
    const w = mount(PfMarquee, {
      props: { repeat: 3 },
      slots: { default: '<span class="t">item</span>' },
    });
    expect(w.findAll('.pfMarquee__segment').length).toBe(3);
  });

  it('clamps repeat to at least 2', () => {
    const w = mount(PfMarquee, {
      props: { repeat: 1 },
      slots: { default: 'x' },
    });
    expect(w.findAll('.pfMarquee__segment').length).toBe(2);
  });

  it('applies orientation and overlay modifiers', () => {
    const w = mount(PfMarquee, {
      props: { orientation: 'vertical', overlay: true },
      slots: { default: 'x' },
    });
    expect(w.find('.pfMarquee_orientation_vertical').exists()).toBe(true);
    expect(w.find('.pfMarquee_overlay').exists()).toBe(true);
  });

  it('merges ui.root and attrs class', () => {
    const w = mount(PfMarquee, {
      props: { ui: { root: 'extraRoot' } },
      attrs: { class: 'fromAttrs' },
      slots: { default: 'x' },
    });
    const root = w.find('.pfMarquee');
    expect(root.classes()).toContain('extraRoot');
    expect(root.classes()).toContain('fromAttrs');
  });

  it('merges ui.content on track', () => {
    const w = mount(PfMarquee, {
      props: { ui: { content: 'extraTrack' } },
      slots: { default: 'x' },
    });
    expect(w.find('.pfMarquee__track').classes()).toContain('extraTrack');
  });

  it('renders custom root tag via as', () => {
    const w = mount(PfMarquee, {
      props: { as: 'section' },
      slots: { default: 'x' },
    });
    expect(w.find('section.pfMarquee').exists()).toBe(true);
  });
});
