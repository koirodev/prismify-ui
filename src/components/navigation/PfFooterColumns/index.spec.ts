import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import PfFooterColumns from './index.vue';

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory('/'),
    routes: [{ path: '/', component: { render: () => h('div', 'home') } }],
  });
}

describe('PfFooterColumns', () => {
  it('renders nav with column headings and links', () => {
    const router = createTestRouter();
    const w = mount(PfFooterColumns, {
      props: {
        columns: [
          {
            label: 'Section',
            children: [{ label: 'Docs', to: '/docs' }],
          },
        ],
      },
      global: { plugins: [router] },
    });
    expect(w.find('nav').exists()).toBe(true);
    expect(w.text()).toContain('Section');
    expect(w.text()).toContain('Docs');
    const a = w.find('a');
    expect(a.exists()).toBe(true);
    expect(a.attributes('href')).toBe('/docs');
  });

  it('renders external icon for target _blank', () => {
    const router = createTestRouter();
    const w = mount(PfFooterColumns, {
      props: {
        columns: [
          {
            label: 'X',
            children: [
              { label: 'Out', to: 'https://example.com', target: '_blank' },
            ],
          },
        ],
      },
      global: { plugins: [router] },
    });
    expect(w.find('.pfFooterColumns__externalIcon').exists()).toBe(true);
  });
});
