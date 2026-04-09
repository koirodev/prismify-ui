import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardNavbar from './index.vue';

describe('PfDashboardNavbar', () => {
  it('renders title text', () => {
    const w = mount(PfDashboardNavbar, { props: { title: 'Inbox' } });
    expect(w.text()).toContain('Inbox');
  });
});
