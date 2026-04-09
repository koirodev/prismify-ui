import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import PfDashboardSidebarCollapse from './index.vue';
import { PF_DASHBOARD_GROUP_KEY } from '../shared/injection';

describe('PfDashboardSidebarCollapse', () => {
  it('renders button', () => {
    const w = mount(PfDashboardSidebarCollapse);
    expect(w.find('.pfButton').exists()).toBe(true);
  });

  it('calls sidebar setCollapsed when group provides a matching sidebar', async () => {
    const collapsed = ref(false);
    const setCollapsed = vi.fn((v: boolean) => {
      collapsed.value = v;
    });
    const w = mount(PfDashboardSidebarCollapse, {
      global: {
        provide: {
          [PF_DASHBOARD_GROUP_KEY as symbol]: {
            getSidebarBySide: () => ({
              side: 'left' as const,
              open: ref(false),
              collapsed,
              setOpen: vi.fn(),
              setCollapsed,
              toggleOpen: vi.fn(),
              toggleCollapsed: vi.fn(),
            }),
          },
        },
      },
    });
    await w.find('button').trigger('click');
    expect(setCollapsed).toHaveBeenCalledTimes(1);
    expect(setCollapsed).toHaveBeenCalledWith(true);
  });

  it('uses icon-only button class when there is no label', () => {
    const w = mount(PfDashboardSidebarCollapse);
    expect(w.find('.pfButton').classes()).toContain('pfButton_iconOnly');
  });
});
