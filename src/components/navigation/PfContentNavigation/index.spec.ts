import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfContentNavigation from './index.vue';

describe('PfContentNavigation', () => {
  const items = [
    {
      label: 'Group',
      children: [{ label: 'Child', to: '#child' }],
    },
  ];

  it('renders root navigation list', () => {
    const w = mount(PfContentNavigation, {
      props: { items },
    });
    expect(w.find('.pfContentNavigation').exists()).toBe(true);
    expect(w.findAll('.pfContentNavigation__item').length).toBe(2);
  });

  it('toggles item in uncontrolled mode', async () => {
    const w = mount(PfContentNavigation, {
      props: { items, defaultOpen: false },
    });
    const trigger = w.find('button.pfContentNavigation__trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');
  });

  it('emits update:modelValue in controlled mode', async () => {
    const w = mount(PfContentNavigation, {
      props: {
        items,
        modelValue: [],
        type: 'multiple',
        'onUpdate:modelValue': (value: string[] | string | undefined) =>
          w.setProps({ modelValue: value }),
      },
    });
    await w.find('button.pfContentNavigation__trigger').trigger('click');
    expect(w.emitted('update:modelValue')?.length).toBe(1);
  });
});
