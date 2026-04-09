import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfRadio from './index.vue';

describe('PfRadio', () => {
  it('selects value via v-model', async () => {
    const w = mount({
      components: { PfRadio },
      template: `
        <div>
          <PfRadio v-model="m" value="a" label="A" />
          <PfRadio v-model="m" value="b" label="B" />
        </div>
      `,
      data: () => ({ m: undefined as string | undefined }),
    });
    const inputs = w.findAll('input[type="radio"]');
    const el0 = inputs[0].element as HTMLInputElement;
    el0.checked = true;
    await inputs[0].trigger('change');
    expect((w.vm as { m: string | undefined }).m).toBe('a');
    const el1 = inputs[1].element as HTMLInputElement;
    el1.checked = true;
    await inputs[1].trigger('change');
    expect((w.vm as { m: string | undefined }).m).toBe('b');
  });

  it('emits change on select', async () => {
    const w = mount(PfRadio, {
      props: {
        modelValue: undefined,
        value: 'x',
        label: 'X',
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    await w.find('input').setValue(true);
    expect(w.emitted('change')?.length).toBe(1);
  });

  it('exposes inputRef', () => {
    const w = mount(PfRadio, {
      props: { value: 1, label: 'n' },
    });
    const vm = w.vm as { inputRef: HTMLInputElement | null };
    expect(vm.inputRef).toBeInstanceOf(HTMLInputElement);
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfRadio },
      template:
        '<PfFieldGroup size="xl"><PfRadio value="v" label="L" /></PfFieldGroup>',
    });
    const r = w.findComponent(PfRadio);
    expect(r.classes()).toContain('pfRadio_size_xl');
  });
});
