import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfInput from '../PfInput/index.vue';
import PfSelectMenu from './index.vue';

const items = ['Apple', 'Banana', 'Cherry'] as const;

describe('PfSelectMenu', () => {
  it('filters options by search term', async () => {
    const w = mount(PfSelectMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        searchTerm: 'Ban',
        'onUpdate:searchTerm': (q: string) => w.setProps({ searchTerm: q }),
      },
    });
    await w.find('button.pfSelect__trigger').trigger('click');
    await w.vm.$nextTick();
    const opts = document.body.querySelectorAll(
      '.pfSelect__option:not(.pfSelect__option_clear)'
    );
    expect(opts.length).toBe(1);
    expect(opts[0]?.textContent).toContain('Banana');
    w.unmount();
  });

  it('emits update:modelValue with primitive when using string items', async () => {
    const w = mount(PfSelectMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        searchInput: false,
        'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v }),
      },
    });
    await w.find('button.pfSelect__trigger').trigger('click');
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

  it('disables search input character animation when animatedInput is false', async () => {
    const w = mount(PfSelectMenu, {
      attachTo: document.body,
      props: {
        items: [...items],
        modelValue: 'Apple',
        animatedInput: false,
      },
    });
    await w.find('button.pfSelect__trigger').trigger('click');
    await w.vm.$nextTick();
    const searchInput = w.findComponent(PfInput);
    expect(searchInput.exists()).toBe(true);
    expect(searchInput.props('animatedText')).toBe(false);
    expect(searchInput.find('.pfInput__visual').exists()).toBe(false);
    w.unmount();
  });
});
