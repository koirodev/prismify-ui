<script setup lang="ts">
import PfApp from '@/components/layout/PfApp/index.vue';
import PfButton from '@/components/element/PfButton/index.vue';
import PfDashboardGroup from '@/components/dashboard/PfDashboardGroup/index.vue';
import PfDashboardNavbar from '@/components/dashboard/PfDashboardNavbar/index.vue';
import PfDashboardPanel from '@/components/dashboard/PfDashboardPanel/index.vue';
import PfDashboardSearch from '@/components/dashboard/PfDashboardSearch/index.vue';
import PfDashboardSearchButton from '@/components/dashboard/PfDashboardSearchButton/index.vue';
import PfDashboardSidebar from '@/components/dashboard/PfDashboardSidebar/index.vue';
import PfDashboardSidebarCollapse from '@/components/dashboard/PfDashboardSidebarCollapse/index.vue';
import PfDashboardSidebarToggle from '@/components/dashboard/PfDashboardSidebarToggle/index.vue';
import { usePfToast } from '@/composables/usePfToast';

const toast = usePfToast();

function showToast() {
  const eventDate = new Date(Date.now() + Math.random() * 31536000000);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  toast.add({
    title: 'Event added to calendar',
    description: `This event is scheduled for ${formattedDate}.`,
    icon: 'calendar',
    color: 'primary',
  });
}
</script>

<template>
  <PfApp :toaster="{ position: 'bottom-right', duration: 5000, max: 4 }">
    <PfDashboardGroup storage-key="prismify-playground" :persistent="false">
      <PfDashboardSidebar resizable collapsible>
        <template #header="{ collapsed }">
          <strong>{{ collapsed ? 'PF' : 'Prismify' }}</strong>
        </template>
        <template #default="{ collapsed }">
          <PfDashboardSearchButton :collapsed="collapsed" />
        </template>
      </PfDashboardSidebar>
      <PfDashboardPanel>
        <template #header>
          <PfDashboardNavbar title="Playground">
            <template #toggle>
              <PfDashboardSidebarToggle />
              <PfDashboardSidebarCollapse variant="outline" />
            </template>
          </PfDashboardNavbar>
        </template>
        <template #body>
          <div>
            <p class="playground__hint">
              Dashboard shell and
              <code>usePfToast()</code>
              for local debugging.
            </p>
            <PfButton
              label="Add to calendar"
              variant="outline"
              icon="plus"
              @click="showToast"
            />
          </div>
        </template>
      </PfDashboardPanel>
    </PfDashboardGroup>
    <PfDashboardSearch />
  </PfApp>
</template>

<style scoped lang="scss">
.playground__hint {
  margin: 0 0 1rem;

  color: var(--pf-color-muted);
  font-size: 0.875rem;
}
</style>
