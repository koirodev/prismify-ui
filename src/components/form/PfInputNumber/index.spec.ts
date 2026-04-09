import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfInputNumber from './index.vue';

describe('PfInputNumber', () => {
  it('binds v-model on input', async () => {
    const w = mount(PfInputNumber, {
      props: {
        modelValue: 5,
        locale: 'en-US',
        'onUpdate:modelValue': (v: number | null) =>
          w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('.pfInput__native');
    await input.setValue('7');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(7);
  });

  it('increments via button', async () => {
    const w = mount(PfInputNumber, {
      props: {
        modelValue: 5,
        step: 1,
        locale: 'en-US',
        'onUpdate:modelValue': (v: number | null) =>
          w.setProps({ modelValue: v }),
      },
    });
    const inc = w.find('.pfInputNumber__incr_horizontal button');
    expect(inc.exists()).toBe(true);
    await inc.trigger('click');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(6);
  });

  it('steps with ArrowUp and ArrowDown', async () => {
    const w = mount(PfInputNumber, {
      props: {
        modelValue: 5,
        step: 1,
        min: 0,
        max: 10,
        locale: 'en-US',
        'onUpdate:modelValue': (v: number | null) =>
          w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('.pfInput__native');
    await input.trigger('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(6);
    await input.trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' });
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(5);
  });

  it('exposes inputRef', () => {
    const w = mount(PfInputNumber, { props: { locale: 'en-US' } });
    const vm = w.vm as { inputRef: HTMLInputElement | null };
    expect(vm.inputRef).toBeInstanceOf(HTMLInputElement);
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfInputNumber },
      template:
        '<PfFieldGroup size="lg"><PfInputNumber locale="en-US" /></PfFieldGroup>',
    });
    const c = w.findComponent(PfInputNumber);
    expect(c.find('.pfInputNumber').classes()).toContain(
      'pfInputNumber_size_lg'
    );
  });
});
