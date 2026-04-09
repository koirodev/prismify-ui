import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfInputMenu from './index.vue';

const items = ['Apple', 'Banana', 'Cherry'] as const;

describe('PfInputMenu', () => {
  it('filters options when typing in the input', async () => {
    const w = mount(PfInputMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        openOnFocus: true,
      },
    });
    const input = w.find('input');
    await input.trigger('focus');
    await w.vm.$nextTick();
    await input.setValue('Ban');
    await w.vm.$nextTick();
    const opts = document.body.querySelectorAll(
      '.pfSelect__option:not(.pfSelect__option_clear)'
    );
    expect(opts.length).toBe(1);
    expect(opts[0]?.textContent).toContain('Banana');
    w.unmount();
  });

  it('emits update:modelValue with primitive when using string items', async () => {
    const w = mount(PfInputMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        openOnFocus: true,
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    await input.trigger('focus');
    await w.vm.$nextTick();
    const rows = document.body.querySelectorAll(
      '.pfSelect__option:not(.pfSelect__option_clear)'
    );
    await (rows[2] as HTMLElement).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
    );
    await w.vm.$nextTick();
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('Cherry');
    w.unmount();
  });

  it('shows selected label in the input after single select (search cleared)', async () => {
    const w = mount(PfInputMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        openOnFocus: true,
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    const input = w.find('input');
    await input.trigger('focus');
    await w.vm.$nextTick();
    const rows = document.body.querySelectorAll(
      '.pfSelect__option:not(.pfSelect__option_clear)'
    );
    await (rows[2] as HTMLElement).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
    );
    await w.vm.$nextTick();
    await w.vm.$nextTick();
    expect((input.element as HTMLInputElement).value).toBe('Cherry');
    w.unmount();
  });

  it('disables input character animation when animatedText is false', async () => {
    const w = mount(PfInputMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        animatedText: false,
        openOnFocus: true,
      },
    });
    const input = w.find('input');
    await input.trigger('focus');
    await w.vm.$nextTick();
    expect(w.find('.pfInput__visual').exists()).toBe(false);
    w.unmount();
  });
});
