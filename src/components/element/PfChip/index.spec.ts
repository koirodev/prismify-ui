import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfChip from './index.vue';

describe('PfChip', () => {
  it('renders dot without default slot', () => {
    const w = mount(PfChip);
    expect(w.find('.pfChip_dotOnly').exists()).toBe(true);
    expect(w.find('.pfChip__base').exists()).toBe(true);
  });

  it('renders text prop in base', () => {
    const w = mount(PfChip, { props: { text: '9' } });
    expect(w.find('.pfChip__base').text()).toContain('9');
    expect(w.find('.pfChip__base_withText').exists()).toBe(true);
  });

  it('wraps default slot and overlays chip', () => {
    const w = mount(PfChip, {
      slots: { default: '<span class="inner">X</span>' },
    });
    expect(w.find('.pfChip_wrap').exists()).toBe(true);
    expect(w.find('.inner').exists()).toBe(true);
    expect(w.find('.pfChip__base_overlay').exists()).toBe(true);
  });

  it('applies color, size, and position classes', () => {
    const w = mount(PfChip, {
      props: {
        color: 'error',
        size: 'xl',
        position: 'bottom-left',
      },
      slots: { default: '<span />' },
    });
    const base = w.find('.pfChip__base');
    expect(base.classes()).toContain('pfChip__base_color_error');
    expect(base.classes()).toContain('pfChip__base_size_xl');
    expect(base.classes()).toContain('pfChip__base_position_bottom_left');
  });

  it('uses flow layout when standalone with slot', () => {
    const w = mount(PfChip, {
      props: { standalone: true },
      slots: { default: '<span class="c">c</span>' },
    });
    expect(w.find('.pfChip_wrap_standalone').exists()).toBe(true);
    expect(w.find('.pfChip__base_flow').exists()).toBe(true);
    expect(w.find('.pfChip__base_overlay').exists()).toBe(false);
  });

  it('toggles chip visibility with v-model:show', async () => {
    const w = mount(PfChip, {
      props: { show: true },
      slots: { default: '<span />' },
    });
    const chip = w.find('.pfChip__base');
    expect((chip.element as HTMLElement).style.display).not.toBe('none');
    await w.setProps({ show: false });
    expect((chip.element as HTMLElement).style.display).toBe('none');
  });

  it('hides dot-only root with show false', async () => {
    const w = mount(PfChip, { props: { show: true } });
    const root = w.find('.pfChip_dotOnly');
    expect((root.element as HTMLElement).style.display).not.toBe('none');
    await w.setProps({ show: false });
    expect((root.element as HTMLElement).style.display).toBe('none');
  });

  it('renders content slot instead of text', () => {
    const w = mount(PfChip, {
      props: { text: 'nope' },
      slots: { content: 'yes' },
    });
    expect(w.text()).toContain('yes');
    expect(w.text()).not.toContain('nope');
  });

  it('renders as custom root tag', () => {
    const w = mount(PfChip, {
      props: { as: 'div' },
      slots: { default: '<span />' },
    });
    expect(w.find('div.pfChip_wrap').exists()).toBe(true);
  });
});
