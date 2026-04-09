import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfCheckbox from './index.vue';

describe('PfCheckbox', () => {
  it('toggles v-model (boolean)', async () => {
    const w = mount(PfCheckbox, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input[type="checkbox"]');
    await input.setValue(true);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(true);
  });

  it('emits change on toggle', async () => {
    const w = mount(PfCheckbox, {
      props: { modelValue: false },
    });
    await w.find('input').setValue(true);
    expect(w.emitted('change')?.length).toBe(1);
  });

  it('uses trueValue and falseValue', async () => {
    const w = mount(PfCheckbox, {
      props: {
        modelValue: 'off',
        trueValue: 'on',
        falseValue: 'off',
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    await w.find('input').setValue(true);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('on');
    await w.find('input').setValue(false);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('off');
  });

  it('exposes inputRef', () => {
    const w = mount(PfCheckbox);
    const vm = w.vm as { inputRef: HTMLInputElement | null };
    expect(vm.inputRef).toBeInstanceOf(HTMLInputElement);
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfCheckbox },
      template: '<PfFieldGroup size="xl"><PfCheckbox /></PfFieldGroup>',
    });
    const box = w.findComponent(PfCheckbox);
    expect(box.classes()).toContain('pfCheckbox_size_xl');
  });

  it('sets indeterminate on the native input when model is indeterminate', async () => {
    const w = mount(PfCheckbox, {
      props: { modelValue: 'indeterminate' },
    });
    await w.vm.$nextTick();
    const el = w.find('input').element as HTMLInputElement;
    expect(el.indeterminate).toBe(true);
  });
});
