import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardSidebarCollapse from './index.vue';

describe('PfDashboardSidebarCollapse', () => {
  it('renders button', () => {
    const w = mount(PfDashboardSidebarCollapse);
    expect(w.find('.pfButton').exists()).toBe(true);
  });
});
