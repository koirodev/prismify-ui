import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardSidebarToggle from './index.vue';

describe('PfDashboardSidebarToggle', () => {
  it('renders button', () => {
    const w = mount(PfDashboardSidebarToggle);
    expect(w.find('.pfButton').exists()).toBe(true);
  });
});
