import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { h } from 'vue';
import PfLink from './index.vue';

function createTestRouter(initial = '/') {
  const router = createRouter({
    history: createMemoryHistory(initial),
    routes: [
      { path: '/', component: { render: () => h('div', 'home') } },
      { path: '/about', component: { render: () => h('div', 'about') } },
      {
        path: '/docs',
        component: { render: () => h('div', 'docs') },
      },
    ],
  });
  return router;
}

describe('PfLink', () => {
  it('renders button without to', () => {
    const router = createTestRouter();
    const w = mount(PfLink, {
      global: { plugins: [router] },
      slots: { default: 'Label' },
    });
    expect(w.find('button').exists()).toBe(true);
    expect(w.find('button').text()).toBe('Label');
  });

  it('renders RouterLink for internal path', async () => {
    const router = createTestRouter('/');
    const w = mount(PfLink, {
      props: { to: '/about' },
      global: { plugins: [router] },
      slots: { default: 'About' },
    });
    const a = w.find('a');
    expect(a.exists()).toBe(true);
    expect(a.attributes('href')).toContain('/about');
  });

  it('applies active class when active prop is true', () => {
    const router = createTestRouter('/');
    const w = mount(PfLink, {
      props: { to: '/about', active: true, raw: true, activeClass: 'is-on' },
      global: { plugins: [router] },
      slots: { default: 'X' },
    });
    expect(w.find('a').classes()).toContain('is-on');
  });

  it('exposes active in default slot props', () => {
    const router = createTestRouter();
    const w = mount(PfLink, {
      props: { to: '/about', active: true },
      global: { plugins: [router] },
      slots: {
        default: (props: { active: boolean }) => (props.active ? 'yes' : 'no'),
      },
    });
    expect(w.text()).toContain('yes');
  });
});
