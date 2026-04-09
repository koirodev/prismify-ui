import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardSidebar from './index.vue';
import PfDashboardGroup from '../PfDashboardGroup/index.vue';

describe('PfDashboardSidebar', () => {
  it('renders in dashboard group', () => {
    const w = mount(PfDashboardGroup, {
      slots: {
        default: '<PfDashboardSidebar>Body</PfDashboardSidebar>',
      },
      global: {
        components: { PfDashboardSidebar },
      },
    });
    expect(w.html()).toContain('pfDashboardSidebar');
  });
});
