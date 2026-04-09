import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfAccordion from './index.vue';

const items = [
  { label: 'A', content: 'alpha' },
  { label: 'B', content: 'beta' },
];

describe('PfAccordion', () => {
  it('opens first panel on trigger click (single)', async () => {
    const w = mount(PfAccordion, {
      props: { items },
    });
    const triggers = w.findAll('.pfAccordion__trigger');
    const panels = w.findAll('.pfAccordion__panel');
    expect(triggers).toHaveLength(2);
    expect(panels[0].attributes('data-state')).toBe('closed');
    expect(panels[0].attributes('aria-hidden')).toBe('true');

    await triggers[0].trigger('click');
    expect(panels[0].attributes('data-state')).toBe('open');
    expect(panels[0].attributes('aria-hidden')).toBeUndefined();
    expect(triggers[0].attributes('aria-expanded')).toBe('true');
    expect(triggers[1].attributes('aria-expanded')).toBe('false');
  });

  it('closes open panel when collapsible (single)', async () => {
    const w = mount(PfAccordion, {
      props: { items, collapsible: true },
    });
    const t0 = w.findAll('.pfAccordion__trigger')[0];
    await t0.trigger('click');
    expect(t0.attributes('aria-expanded')).toBe('true');
    await t0.trigger('click');
    expect(t0.attributes('aria-expanded')).toBe('false');
    const firstPanel = w.findAll('.pfAccordion__panel')[0];
    expect(firstPanel.exists()).toBe(true);
    expect(firstPanel.attributes('data-state')).toBe('closed');
  });

  it('does not close when collapsible is false', async () => {
    const w = mount(PfAccordion, {
      props: { items, collapsible: false, defaultValue: '0' },
    });
    const t0 = w.findAll('.pfAccordion__trigger')[0];
    expect(t0.attributes('aria-expanded')).toBe('true');
    await t0.trigger('click');
    expect(t0.attributes('aria-expanded')).toBe('true');
  });

  it('allows multiple open panels when type is multiple', async () => {
    const w = mount(PfAccordion, {
      props: { items, type: 'multiple' },
    });
    const triggers = w.findAll('.pfAccordion__trigger');
    await triggers[0].trigger('click');
    await triggers[1].trigger('click');
    expect(triggers[0].attributes('aria-expanded')).toBe('true');
    expect(triggers[1].attributes('aria-expanded')).toBe('true');
    expect(w.text()).toContain('alpha');
    expect(w.text()).toContain('beta');
  });

  it('does not toggle when disabled', async () => {
    const w = mount(PfAccordion, {
      props: { items, disabled: true },
    });
    await w.find('.pfAccordion__trigger').trigger('click');
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('emits update:modelValue when controlled', async () => {
    const w = mount(PfAccordion, {
      props: {
        items,
        modelValue: undefined as string | undefined,
        'onUpdate:modelValue': () => {},
      },
    });
    await w.findAll('.pfAccordion__trigger')[0].trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['0']);
  });

  it('keeps panels mounted by default for smooth height animation', () => {
    const w = mount(PfAccordion, {
      props: { items, defaultValue: undefined },
    });
    expect(w.findAll('.pfAccordion__panel')).toHaveLength(2);
  });

  it('unmounts closed panels when unmountOnHide is true', () => {
    const w = mount(PfAccordion, {
      props: { items, unmountOnHide: true },
    });
    expect(w.find('.pfAccordion__panel').exists()).toBe(false);
  });
});
