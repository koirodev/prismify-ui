import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfContentSearch from './index.vue';

describe('PfContentSearch', () => {
  it('renders groups and filters items by search term', async () => {
    const w = mount(PfContentSearch, {
      attachTo: document.body,
      props: {
        open: true,
        links: [
          { label: 'Docs', to: '#docs' },
          { label: 'Components', to: '#components' },
        ],
      },
    });

    expect(document.body.textContent ?? '').toContain('Docs');
    const input = document.body.querySelector(
      'input'
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();
    input!.value = 'Comp';
    input!.dispatchEvent(new Event('input'));
    await w.vm.$nextTick();
    expect(document.body.textContent ?? '').toContain('Components');
    w.unmount();
  });

  it('emits update:searchTerm when typing', async () => {
    const w = mount(PfContentSearch, {
      attachTo: document.body,
      props: { open: true },
    });
    const input = document.body.querySelector(
      'input'
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();
    input!.value = 'abc';
    input!.dispatchEvent(new Event('input'));
    await w.vm.$nextTick();
    expect(w.emitted('update:searchTerm')?.at(-1)).toEqual(['abc']);
    w.unmount();
  });
});
