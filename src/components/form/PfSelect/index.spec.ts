import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfSelect from './index.vue';

const opts = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
] as const;

describe('PfSelect', () => {
  it('emits update:modelValue when option changes (native)', async () => {
    const w = mount(PfSelect, {
      props: {
        native: true,
        options: [...opts],
        modelValue: 'a',
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as string }),
      },
    });
    const sel = w.find('select.pfSelect__native');
    await sel.setValue('1');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('b');
  });

  it('emits change (native)', async () => {
    const w = mount(PfSelect, {
      props: { native: true, options: [...opts], modelValue: 'a' },
    });
    await w.find('select.pfSelect__native').setValue('1');
    expect(w.emitted('change')?.length).toBe(1);
  });

  it('uncontrolled defaultValue (native)', async () => {
    const w = mount(PfSelect, {
      props: {
        native: true,
        options: [...opts],
        defaultValue: 'a',
      },
    });
    await w.find('select.pfSelect__native').setValue('1');
    const sel = w.find('select.pfSelect__native').element as HTMLSelectElement;
    expect(sel.value).toBe('1');
  });

  it('inherits size from PfFieldGroup', () => {
    const w = mount({
      components: { PfFieldGroup, PfSelect },
      template:
        '<PfFieldGroup size="xl"><PfSelect :options="options" model-value="a" /></PfFieldGroup>',
      setup() {
        return { options: [...opts] };
      },
    });
    const c = w.findComponent(PfSelect);
    expect(c.classes()).toContain('pfSelect_size_xl');
  });

  it('exposes selectRef (hidden select in custom mode)', () => {
    const w = mount(PfSelect, { props: { options: [...opts] } });
    const vm = w.vm as { selectRef: HTMLSelectElement | null };
    expect(vm.selectRef).toBeInstanceOf(HTMLSelectElement);
  });

  it('optionGroups: divider between groups in panel', async () => {
    const w = mount(PfSelect, {
      attachTo: document.body,
      props: {
        optionGroups: [['a', 'b'], ['c']],
        modelValue: 'a',
      },
    });
    await w.find('button.pfSelect__trigger').trigger('click');
    await w.vm.$nextTick();
    expect(
      document.body.querySelectorAll('.pfSelect__groupDivider').length
    ).toBe(1);
    w.unmount();
  });

  it('custom: selects option via keyboard Enter', async () => {
    const w = mount(PfSelect, {
      attachTo: document.body,
      props: {
        options: [...opts],
        modelValue: 'a',
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as string }),
      },
    });
    const btn = w.find('button.pfSelect__trigger');
    await btn.trigger('keydown', { key: 'ArrowDown' });
    await btn.trigger('keydown', { key: 'ArrowDown' });
    await btn.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('b');
  });
});
