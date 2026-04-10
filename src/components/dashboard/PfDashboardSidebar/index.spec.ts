import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardSidebar from './index.vue';
import PfDashboardGroup from '../PfDashboardGroup/index.vue';
import PfDrawer from '../../overlay/PfDrawer/index.vue';

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

  it('uses bottom mobile menu orientation by default', () => {
    const w = mount(PfDashboardSidebar);
    expect(w.findComponent(PfDrawer).props('direction')).toBe('bottom');
  });

  it('accepts a custom mobile menu orientation', () => {
    const w = mount(PfDashboardSidebar, {
      props: {
        mobileMenuOrientation: 'right',
      },
    });
    expect(w.findComponent(PfDrawer).props('direction')).toBe('right');
  });
});
