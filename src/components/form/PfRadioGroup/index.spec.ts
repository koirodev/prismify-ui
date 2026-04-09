import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfRadioGroup from './index.vue';

describe('PfRadioGroup', () => {
  it('updates v-model to selected value', async () => {
    const w = mount(PfRadioGroup, {
      props: {
        items: ['a', 'b'],
        modelValue: undefined,
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    const inputs = w.findAll('input[type="radio"]');
    const el = inputs[1].element as HTMLInputElement;
    el.checked = true;
    await inputs[1].trigger('change');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('b');
  });

  it('uses valueKey for object items', async () => {
    const w = mount(PfRadioGroup, {
      props: {
        valueKey: 'id',
        items: [
          { id: 1, label: 'One' },
          { id: 2, label: 'Two' },
        ],
        modelValue: 1,
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    const inputs = w.findAll('input[type="radio"]');
    await inputs[1].setValue(true);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe(2);
  });
});
