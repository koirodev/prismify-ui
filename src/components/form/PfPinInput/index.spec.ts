import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfPinInput from './index.vue';

describe('PfPinInput', () => {
  it('renders length inputs and binds v-model', async () => {
    const w = mount(PfPinInput, {
      props: {
        length: 4,
        modelValue: '12',
        'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      },
    });
    const inputs = w.findAll('input[type="text"]');
    expect(inputs).toHaveLength(4);
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('1');
    expect((inputs[1]!.element as HTMLInputElement).value).toBe('2');
    await inputs[2]!.setValue('3');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('123');
  });

  it('clears filled cell on Backspace when caret is before the character', async () => {
    const w = mount(PfPinInput, {
      props: {
        length: 3,
        modelValue: '12',
        'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      },
    });
    const inputs = w.findAll('input');
    const middle = inputs[1]!.element as HTMLInputElement;
    middle.focus();
    middle.setSelectionRange(0, 0);
    await inputs[1]!.trigger('keydown', { key: 'Backspace' });
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('1');
  });

  it('emits complete when last cell filled', async () => {
    const w = mount(PfPinInput, {
      props: {
        length: 3,
        modelValue: '12',
        'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      },
    });
    const inputs = w.findAll('input');
    await inputs[2]!.setValue('3');
    expect(w.emitted('complete')?.at(-1)?.[0]).toBe('123');
  });

  it('disables animated overlay when animatedText is false', () => {
    const w = mount(PfPinInput, {
      props: { animatedText: false, modelValue: 'x', length: 3 },
    });
    expect(w.find('.pfPinInput__visual').exists()).toBe(false);
    expect(w.classes()).not.toContain('pfPinInput_animated');
  });

  it('exposes inputsRef', () => {
    const w = mount(PfPinInput, { props: { length: 2 } });
    const vm = w.vm as { inputsRef: (HTMLInputElement | null)[] };
    expect(vm.inputsRef).toHaveLength(2);
    expect(vm.inputsRef[0]).toBeInstanceOf(HTMLInputElement);
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfPinInput },
      template: '<PfFieldGroup size="xl"><PfPinInput /></PfFieldGroup>',
    });
    const pin = w.findComponent(PfPinInput);
    expect(pin.classes()).toContain('pfPinInput_size_xl');
  });

  it('emits blur when focus leaves the group', async () => {
    const w = mount(PfPinInput, {
      props: { length: 2 },
      attachTo: document.body,
    });
    const root = w.get('.pfPinInput').element;
    const input = w.find('input').element as HTMLInputElement;
    input.focus();
    root.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.body,
      })
    );
    expect(w.emitted('blur')?.length).toBe(1);
    w.unmount();
  });
});
