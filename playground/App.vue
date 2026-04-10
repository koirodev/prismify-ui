<script setup lang="ts">
import PfApp from '@/components/layout/PfApp/index.vue';
import PfAvatar from '@/components/element/PfAvatar/index.vue';
import PfDashboardGroup from '@/components/dashboard/PfDashboardGroup/index.vue';
import PfDashboardNavbar from '@/components/dashboard/PfDashboardNavbar/index.vue';
import PfDashboardPanel from '@/components/dashboard/PfDashboardPanel/index.vue';
import PfDashboardSidebar from '@/components/dashboard/PfDashboardSidebar/index.vue';
import PfDashboardSidebarCollapse from '@/components/dashboard/PfDashboardSidebarCollapse/index.vue';
import PfDashboardSidebarToggle from '@/components/dashboard/PfDashboardSidebarToggle/index.vue';
import PfContainer from '@/components/layout/PfContainer/index.vue';
import PfDropdownMenu from '@/components/overlay/PfDropdownMenu/index.vue';
import PfNavigationMenu from '@/components/navigation/PfNavigationMenu/index.vue';
import PfUser from '@/components/data/PfUser/index.vue';
import type { PfDropdownMenuItemsInput } from '@/components/overlay/PfDropdownMenu/types';
import type { PfNavigationMenuItemsInput } from '@/components/navigation/PfNavigationMenu/index.vue';

const adminUser = {
  name: 'Alex Mason',
  email: 'alex@prismify.dev',
  avatarUrl: 'https://i.pravatar.cc/120?img=12',
};

const adminNavItems: PfNavigationMenuItemsInput = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    to: '#',
  },
  {
    label: 'Catalog',
    icon: 'box',
    to: '#',
    children: [
      { label: 'Products', to: '#', icon: 'box' },
      { label: 'Categories', to: '#', icon: 'folder' },
      { label: 'Attributes', to: '#', icon: 'settingsSliders' },
      { label: 'Inventory', to: '#', icon: 'inbox' },
    ],
  },
  {
    label: 'Orders',
    icon: 'car',
    to: '#',
  },
  {
    label: 'Customers',
    icon: 'user',
    to: '#',
  },
];

const adminNavItemsCollapsed: PfNavigationMenuItemsInput = adminNavItems.map((item) => {
  const { children: _children, trailingIcon: _trailingIcon, ...rest } = item;
  return {
    ...rest,
    label: '',
  };
});

const accountMenuItems: PfDropdownMenuItemsInput = [
  { type: 'separator' },
  { icon: 'moon', label: 'Toggle dark mode', onSelect: () => undefined },
  { color: 'error', icon: 'signOut', label: 'Sign out', onSelect: () => undefined },
];
</script>

<template>
  <PfApp class="playgroundAdmin" dir="ltr" locale="en-US">
    <PfDashboardGroup storage-key="prismify-playground" :persistent="false">
      <PfDashboardSidebar
        id="playground-admin-sidebar"
        side="left"
        mobile-menu-orientation="bottom"
        resizable
        collapsible
        :min-size="12"
        :max-size="30"
        :default-size="18"
        :collapsed-size="0"
        toggle-side="left"
      >
        <template #header="{ collapsed }">
          <div
            class="playgroundAdmin__sidebarHeader"
            :class="{ playgroundAdmin__sidebarHeader_collapsed: collapsed }"
          >
            <span
              class="playgroundAdmin__brand"
              :class="{ playgroundAdmin__brand_collapsed: collapsed }"
            >
              {{ collapsed ? 'PF' : 'Prismify Admin' }}
            </span>
            <PfDashboardSidebarCollapse
              color="neutral"
              side="left"
              square
              type="button"
              variant="ghost"
            />
          </div>
        </template>
        <template #default="{ collapsed }">
          <PfNavigationMenu
            class="playgroundAdmin__menu"
            color="neutral"
            :collapsed="collapsed"
            collapsed-square
            highlight
            highlight-color="primary"
            :items="collapsed ? adminNavItemsCollapsed : adminNavItems"
            :ui="{
              childList: 'playgroundAdmin__menuChildList',
              childLink: 'playgroundAdmin__menuChildLink',
              childLinkLabel: 'playgroundAdmin__menuChildLabel',
            }"
            orientation="vertical"
            variant="link"
          />
        </template>
      </PfDashboardSidebar>
      <PfDashboardPanel>
        <template #header>
          <PfDashboardNavbar title="Admin Dashboard" toggle-side="left">
            <template #toggle>
              <PfDashboardSidebarToggle />
            </template>
            <template #right>
              <PfDropdownMenu
                :items="accountMenuItems"
                :content="{ side: 'bottom', align: 'end', sideOffset: 6 }"
                :toggle-props="{ icon: 'arrowSmallDown' }"
              >
                <template #content-top>
                  <PfUser
                    class="playgroundAdmin__userCard"
                    :name="adminUser.name"
                    :description="adminUser.email"
                    size="sm"
                    :avatar="{
                      src: adminUser.avatarUrl,
                      alt: adminUser.email,
                      loading: 'lazy',
                    }"
                  />
                </template>
                <PfAvatar
                  class="playgroundAdmin__avatar"
                  :alt="adminUser.email"
                  :aria-label="`Account menu: ${adminUser.email}`"
                  loading="lazy"
                  :src="adminUser.avatarUrl"
                />
              </PfDropdownMenu>
            </template>
          </PfDashboardNavbar>
        </template>
        <template #body>
          <div class="playgroundAdmin__body">
            <PfContainer class="playgroundAdmin__container">
              <h2 class="playgroundAdmin__title">Overview</h2>
              <p class="playgroundAdmin__hint">
                Playground layout based on your admin shell: sidebar navigation,
                top navbar, and content area.
              </p>
            </PfContainer>
          </div>
        </template>
      </PfDashboardPanel>
    </PfDashboardGroup>
  </PfApp>
</template>

<style scoped lang="scss">
.playgroundAdmin {
  min-height: 100dvh;
}

.playgroundAdmin__sidebarHeader {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.playgroundAdmin__sidebarHeader_collapsed {
  justify-content: center;
}

.playgroundAdmin__brand {
  min-width: 0;
  color: var(--pf-color-text);
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playgroundAdmin__brand_collapsed {
  display: none;
}

.playgroundAdmin__menu {
  width: 100%;
}

:deep(.playgroundAdmin__menuChildList) {
  gap: 0.25rem;
}

:deep(.playgroundAdmin__menuChildLink),
:deep(.playgroundAdmin__menuChildLabel) {
  color: var(--pf-color-muted);
}

.playgroundAdmin__userCard {
  padding: 0.5rem;
  min-width: 16rem;
}

.playgroundAdmin__avatar {
  cursor: pointer;
  user-select: none;
}

.playgroundAdmin__body {
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}

.playgroundAdmin__container {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.playgroundAdmin__title {
  margin: 0 0 0.5rem;
  color: var(--pf-color-text);
  font-size: var(--pf-font-size-xl);
}

.playgroundAdmin__hint {
  margin: 0;

  color: var(--pf-color-muted);
  font-size: 0.875rem;
}
</style>
