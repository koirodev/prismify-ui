import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfCheckboxGroup from './index.vue';

describe('PfCheckboxGroup', () => {
  it('toggles selection in v-model array', async () => {
    const w = mount(PfCheckboxGroup, {
      props: {
        items: ['a', 'b'],
        modelValue: [],
        'onUpdate:modelValue': (v: unknown[]) => w.setProps({ modelValue: v }),
      },
    });
    const inputs = w.findAll('input[type="checkbox"]');
    await inputs[0].setValue(true);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['a']);
    await inputs[0].setValue(false);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([]);
  });

  it('uses valueKey for object items', async () => {
    const w = mount(PfCheckboxGroup, {
      props: {
        valueKey: 'id',
        items: [{ id: 1, label: 'One' }],
        modelValue: [],
        'onUpdate:modelValue': (v: unknown[]) => w.setProps({ modelValue: v }),
      },
    });
    await w.find('input').setValue(true);
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([1]);
  });
});
