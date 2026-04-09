import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfContentSearchButton from './index.vue';
import { usePfContentSearch } from '../../../composables/usePfContentSearch';

describe('PfContentSearchButton', () => {
  it('opens shared content search state on click', async () => {
    const search = usePfContentSearch();
    search.close();

    const w = mount(PfContentSearchButton, {
      props: {
        collapsed: false,
      },
    });

    await w.find('button').trigger('click');
    expect(search.isOpen.value).toBe(true);
  });

  it('shows kbds when expanded', () => {
    const w = mount(PfContentSearchButton, {
      props: {
        collapsed: false,
        kbds: ['meta', 'k'],
      },
    });
    expect(w.find('.pfContentSearchButton__trailing').exists()).toBe(true);
  });
});
