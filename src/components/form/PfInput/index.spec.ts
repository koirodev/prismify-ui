import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfInput from './index.vue';

describe('PfInput', () => {
  it('renders and binds v-model', async () => {
    const w = mount(PfInput, {
      props: {
        modelValue: 'a',
        'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    expect((input.element as HTMLInputElement).value).toBe('a');
    await input.setValue('ab');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('ab');
  });

  it('exposes inputRef', () => {
    const w = mount(PfInput);
    const vm = w.vm as { inputRef: HTMLInputElement | null };
    expect(vm.inputRef).toBeInstanceOf(HTMLInputElement);
  });

  it('disables animated overlay when animatedText is false', () => {
    const w = mount(PfInput, {
      props: { animatedText: false, modelValue: 'x' },
    });
    expect(w.find('.pfInput__visual').exists()).toBe(false);
    expect(w.classes()).not.toContain('pfInput_animated');
  });

  it('emits blur', async () => {
    const w = mount(PfInput);
    await w.find('input').trigger('blur');
    expect(w.emitted('blur')?.length).toBe(1);
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfInput },
      template: '<PfFieldGroup size="xl"><PfInput /></PfFieldGroup>',
    });
    const inputRoot = w.findComponent(PfInput);
    expect(inputRoot.classes()).toContain('pfInput_size_xl');
  });
});
