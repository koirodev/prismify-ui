import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import PfPagination from './index.vue';
import PfButton from '../../element/PfButton/index.vue';

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory('/'),
    routes: [{ path: '/', component: { render: () => h('div', 'x') } }],
  });
}

describe('PfPagination', () => {
  it('renders page buttons and emits update:page on click', async () => {
    const router = createTestRouter();
    const w = mount(PfPagination, {
      props: { total: 100, page: 5, itemsPerPage: 10 },
      global: { plugins: [router] },
    });
    const buttons = w.findAllComponents(PfButton);
    const pageThree = buttons.find(
      (b) => b.attributes('aria-label') === 'Page 3'
    );
    expect(pageThree).toBeDefined();
    await pageThree!.trigger('click');
    expect(w.emitted('update:page')?.[0]).toEqual([3]);
  });

  it('does not emit when disabled', async () => {
    const router = createTestRouter();
    const w = mount(PfPagination, {
      props: { total: 100, page: 5, disabled: true },
      global: { plugins: [router] },
    });
    const pageFour = w
      .findAllComponents(PfButton)
      .find((b) => b.attributes('aria-label') === 'Page 4');
    await pageFour!.trigger('click');
    expect(w.emitted('update:page')).toBeUndefined();
  });

  it('uses defaultPage when page is uncontrolled', async () => {
    const router = createTestRouter();
    const w = mount(PfPagination, {
      props: { total: 50, defaultPage: 2, itemsPerPage: 10 },
      global: { plugins: [router] },
    });
    const next = w
      .findAllComponents(PfButton)
      .find((b) => b.attributes('aria-label') === 'Next page');
    await next!.trigger('click');
    expect(w.emitted('update:page')).toBeUndefined();
    const pageThree = w
      .findAllComponents(PfButton)
      .find((b) => b.attributes('aria-label') === 'Page 3');
    expect(pageThree).toBeDefined();
  });
});
