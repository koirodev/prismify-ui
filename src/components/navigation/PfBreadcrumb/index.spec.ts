import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import PfBreadcrumb from './index.vue';

function createTestRouter(initial = '/') {
  return createRouter({
    history: createMemoryHistory(initial),
    routes: [
      { path: '/', component: { render: () => h('div', 'home') } },
      { path: '/docs', component: { render: () => h('div', 'docs') } },
      {
        path: '/docs/components',
        component: { render: () => h('div', 'components') },
      },
    ],
  });
}

describe('PfBreadcrumb', () => {
  it('renders nav with ordered list', () => {
    const router = createTestRouter();
    const w = mount(PfBreadcrumb, {
      props: {
        items: [{ label: 'Home', to: '/' }],
      },
      global: { plugins: [router] },
    });
    expect(w.find('nav').exists()).toBe(true);
    expect(w.find('ol').exists()).toBe(true);
  });

  it('renders anchor for item with to', () => {
    const router = createTestRouter();
    const w = mount(PfBreadcrumb, {
      props: {
        items: [{ label: 'Docs', to: '/docs' }],
      },
      global: { plugins: [router] },
    });
    const a = w.find('a');
    expect(a.exists()).toBe(true);
    expect(a.text()).toContain('Docs');
  });

  it('renders span without link when to is omitted', () => {
    const router = createTestRouter();
    const w = mount(PfBreadcrumb, {
      props: {
        items: [{ label: 'Current' }],
      },
      global: { plugins: [router] },
    });
    expect(w.find('a').exists()).toBe(false);
    expect(w.find('.pfBreadcrumb__text').exists()).toBe(true);
    expect(w.find('.pfBreadcrumb__text').text()).toContain('Current');
  });

  it('inserts separators between items', () => {
    const router = createTestRouter();
    const w = mount(PfBreadcrumb, {
      props: {
        items: [
          { label: 'A', to: '/docs' },
          { label: 'B', to: '/docs/components' },
        ],
      },
      global: { plugins: [router] },
    });
    expect(w.findAll('.pfBreadcrumb__separator')).toHaveLength(1);
  });

  it('sets aria-current on last text-only item', () => {
    const router = createTestRouter();
    const w = mount(PfBreadcrumb, {
      props: {
        items: [{ label: 'Docs', to: '/docs' }, { label: 'Here' }],
      },
      global: { plugins: [router] },
    });
    const last = w.find('.pfBreadcrumb__text');
    expect(last.attributes('aria-current')).toBe('page');
  });
});
