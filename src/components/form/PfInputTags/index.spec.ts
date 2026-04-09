import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfInputTags from './index.vue';

describe('PfInputTags', () => {
  it('adds a tag on Enter and clears draft', async () => {
    const w = mount(PfInputTags, {
      attachTo: document.body,
      props: {
        modelValue: [],
        'onUpdate:modelValue': (v: unknown[]) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    await input.setValue('alpha');
    await input.trigger('keydown', { key: 'Enter' });
    await w.vm.$nextTick();
    expect(w.props('modelValue')).toEqual(['alpha']);
    expect((input.element as HTMLInputElement).value).toBe('');
    w.unmount();
  });

  it('adds a tag on comma and clears draft', async () => {
    const w = mount(PfInputTags, {
      attachTo: document.body,
      props: {
        modelValue: [],
        'onUpdate:modelValue': (v: unknown[]) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    await input.setValue('beta');
    await input.trigger('keydown', { key: ',' });
    await w.vm.$nextTick();
    expect(w.props('modelValue')).toEqual(['beta']);
    expect((input.element as HTMLInputElement).value).toBe('');
    w.unmount();
  });

  it('removes last tag on Backspace when draft is empty', async () => {
    const w = mount(PfInputTags, {
      attachTo: document.body,
      props: {
        modelValue: ['a', 'b'],
        'onUpdate:modelValue': (v: unknown[]) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    await input.setValue('');
    await input.trigger('keydown', { key: 'Backspace' });
    await w.vm.$nextTick();
    expect(w.props('modelValue')).toEqual(['a']);
    w.unmount();
  });

  it('emits invalid when duplicate is disallowed', async () => {
    const w = mount(PfInputTags, {
      attachTo: document.body,
      props: {
        modelValue: ['x'],
        duplicate: false,
        'onUpdate:modelValue': (v: unknown[]) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    await input.setValue('x');
    await input.trigger('keydown', { key: 'Enter' });
    await w.vm.$nextTick();
    expect(w.props('modelValue')).toEqual(['x']);
    expect(w.emitted('invalid')?.[0]?.[0]).toBe('x');
    w.unmount();
  });
});
