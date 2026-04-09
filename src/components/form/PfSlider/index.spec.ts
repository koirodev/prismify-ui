import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfSlider from './index.vue';

describe('PfSlider', () => {
  it('emits update:modelValue when moving with keyboard', async () => {
    const w = mount(PfSlider, {
      props: {
        modelValue: 50,
        min: 0,
        max: 100,
        step: 1,
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as number }),
      },
    });
    const thumb = w.find('[role="slider"]');
    await thumb.trigger('keydown', { key: 'ArrowRight' });
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(51);
  });

  it('updates range model', async () => {
    const w = mount(PfSlider, {
      props: {
        modelValue: [20, 80] as [number, number],
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as [number, number] }),
      },
    });
    const thumbs = w.findAll('[role="slider"]');
    expect(thumbs).toHaveLength(2);
    await thumbs[0]!.trigger('keydown', { key: 'ArrowRight' });
    const last = w.emitted('update:modelValue')?.at(-1)?.[0] as number[];
    expect(last[0]).toBe(21);
    expect(last[1]).toBe(80);
  });

  it('emits change after keyboard interaction', async () => {
    const w = mount(PfSlider, {
      props: { modelValue: 10 },
    });
    await w.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    expect(w.emitted('change')?.length).toBeGreaterThanOrEqual(1);
  });

  it('renders hidden inputs when name is set', () => {
    const w = mount(PfSlider, {
      props: { modelValue: 42, name: 'level' },
    });
    const hidden = w.find('input[type="hidden"]');
    expect(hidden.exists()).toBe(true);
    expect(hidden.attributes('name')).toBe('level');
    expect((hidden.element as HTMLInputElement).value).toBe('42');
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfSlider },
      template:
        '<PfFieldGroup size="xl"><PfSlider :model-value="30" /></PfFieldGroup>',
    });
    const slider = w.findComponent(PfSlider);
    expect(slider.classes()).toContain('pfSlider_size_xl');
  });
});
