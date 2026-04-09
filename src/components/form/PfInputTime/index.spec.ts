import { Time } from '@internationalized/date';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfInputTime from './index.vue';

describe('PfInputTime', () => {
  it('renders segment inputs for a Time value', () => {
    const wrapper = mount(PfInputTime, {
      props: {
        modelValue: new Time(12, 30, 0),
        locale: 'en-US',
      },
    });
    const segments = wrapper.findAll('.pfInputTime__segment');
    expect(segments.length).toBeGreaterThan(0);
  });

  it('exposes inputsRef as a list of native inputs', async () => {
    const wrapper = mount(PfInputTime, {
      props: {
        modelValue: new Time(8, 0, 0),
        locale: 'en-US',
      },
    });
    await wrapper.vm.$nextTick();
    const vm = wrapper.vm as unknown as {
      inputsRef: (HTMLInputElement | null)[];
    };
    expect(Array.isArray(vm.inputsRef)).toBe(true);
    expect(vm.inputsRef.some((el) => el instanceof HTMLInputElement)).toBe(
      true
    );
  });

  it('selects full segment text on focus', async () => {
    const wrapper = mount(PfInputTime, {
      props: {
        modelValue: new Time(12, 30, 0),
        locale: 'en-US',
      },
      attachTo: document.body,
    });

    const first = wrapper.findAll<HTMLInputElement>('.pfInputTime__segment')[0];
    await first.trigger('focus');

    const el = first.element;
    expect(el.selectionStart).toBe(0);
    expect(el.selectionEnd).toBe(el.value.length);
  });

  it('limits segment length and moves with ArrowRight', async () => {
    const wrapper = mount(PfInputTime, {
      props: {
        modelValue: new Time(12, 30, 0),
        locale: 'en-US',
      },
      attachTo: document.body,
    });

    const segments = wrapper.findAll<HTMLInputElement>('.pfInputTime__segment');
    const first = segments[0];
    const second = segments[1];

    await first.setValue('1234');
    expect(first.element.value.length).toBeLessThanOrEqual(2);

    await first.trigger('focus');
    await first.trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(second.element);
  });
});
