import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfTabs from './index.vue';

const items = [
  { label: 'Account', content: 'Account body', value: 'a' },
  { label: 'Password', content: 'Password body', value: 'b' },
];

describe('PfTabs', () => {
  it('activates tab on click and shows matching panel', async () => {
    const w = mount(PfTabs, {
      props: { items },
    });
    const tabs = w.findAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]!.attributes('aria-selected')).toBe('true');
    expect(w.text()).toContain('Account body');
    expect(w.text()).not.toContain('Password body');

    await tabs[1]!.trigger('click');
    expect(tabs[1]!.attributes('aria-selected')).toBe('true');
    expect(w.text()).toContain('Password body');
  });

  it('emits update:modelValue when controlled', async () => {
    const w = mount(PfTabs, {
      props: {
        items,
        modelValue: 'a',
        'onUpdate:modelValue': () => {},
      },
    });
    const tabs = w.findAll('[role="tab"]');
    await tabs[1]!.trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });

  it('does not switch when disabled', async () => {
    const w = mount(PfTabs, {
      props: { items, disabled: true },
    });
    const tabs = w.findAll('[role="tab"]');
    await tabs[1]!.trigger('click');
    expect(tabs[0]!.attributes('aria-selected')).toBe('true');
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('hides panel region when content is false', () => {
    const w = mount(PfTabs, {
      props: { items, content: false },
    });
    expect(w.find('.pfTabs__panels').exists()).toBe(false);
  });
});
