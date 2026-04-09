import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import PfNavigationMenu from './index.vue';
import type { PfNavigationMenuItem } from './index.vue';

function createTestRouter(initial = '/') {
  return createRouter({
    history: createMemoryHistory(initial),
    routes: [
      { path: '/', component: { render: () => h('div', 'home') } },
      { path: '/docs', component: { render: () => h('div', 'docs') } },
      {
        path: '/docs/getting-started',
        component: { render: () => h('div', 'gs') },
      },
    ],
  });
}

describe('PfNavigationMenu', () => {
  it('renders role=navigation', () => {
    const router = createTestRouter();
    const w = mount(PfNavigationMenu, {
      props: {
        items: [{ label: 'Home', to: '/' }],
      },
      global: { plugins: [router] },
    });
    expect(w.find('[role="navigation"]').exists()).toBe(true);
  });

  it('renders horizontal link items', () => {
    const router = createTestRouter();
    const items: PfNavigationMenuItem[] = [
      { label: 'Guide', to: '/docs/getting-started' },
      { label: 'GitHub', to: 'https://github.com', target: '_blank' },
    ];
    const w = mount(PfNavigationMenu, {
      props: { items, orientation: 'horizontal' },
      global: { plugins: [router] },
    });
    const links = w.findAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(w.text()).toContain('Guide');
    expect(w.text()).toContain('GitHub');
  });

  it('renders dropdown trigger for item with children', async () => {
    const router = createTestRouter();
    const items: PfNavigationMenuItem[] = [
      {
        label: 'Guide',
        icon: 'book',
        children: [
          { label: 'Intro', description: 'Hello', to: '/docs/getting-started' },
        ],
      },
    ];
    const w = mount(PfNavigationMenu, {
      props: { items, orientation: 'horizontal' },
      global: { plugins: [router] },
    });
    const btn = w.find('.pfNavigationMenu__trigger');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes('aria-expanded')).toBe('false');
    await btn.trigger('click');
    expect(btn.attributes('aria-expanded')).toBe('true');
    expect(w.find('.pfNavigationMenu__dropdown').exists()).toBe(true);
  });

  it('renders grouped items as separate groups', () => {
    const router = createTestRouter();
    const items: PfNavigationMenuItem[][] = [
      [{ label: 'A', to: '/docs' }],
      [{ label: 'B', to: '/docs/getting-started' }],
    ];
    const w = mount(PfNavigationMenu, {
      props: { items, orientation: 'horizontal' },
      global: { plugins: [router] },
    });
    expect(w.findAll('.pfNavigationMenu__group')).toHaveLength(2);
  });

  it('renders vertical section with collapsible children', async () => {
    const router = createTestRouter();
    const items: PfNavigationMenuItem[] = [
      {
        label: 'Guide',
        icon: 'book',
        children: [{ label: 'Intro', to: '/docs/getting-started' }],
      },
    ];
    const w = mount(PfNavigationMenu, {
      props: { items, orientation: 'vertical', type: 'single' },
      global: { plugins: [router] },
    });
    expect(w.find('.pfNavigationMenu__collapsible').exists()).toBe(true);
    const btn = w.find('button.pfNavigationMenu__trigger_vertical');
    expect(btn.attributes('aria-expanded')).toBe('false');
    await btn.trigger('click');
    await nextTick();
    expect(btn.attributes('aria-expanded')).toBe('true');
    const panel = w.find('.pfCollapsible__content');
    expect(panel.exists()).toBe(true);
    expect(panel.findAll('a').length).toBe(1);
    expect(panel.text()).toContain('Intro');
  });
});
