import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardSidebar from './index.vue';
import PfDashboardGroup from '../PfDashboardGroup/index.vue';
import PfDashboardPanel from '../PfDashboardPanel/index.vue';
import PfDashboardNavbar from '../PfDashboardNavbar/index.vue';
import PfDashboardSearchButton from '../PfDashboardSearchButton/index.vue';

const meta = {
  title: 'Dashboard/PfDashboardSidebar',
  component: PfDashboardSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PfDashboardSidebar>;

export default meta;

export const Default: StoryObj<typeof PfDashboardSidebar> = {
  render: () => ({
    components: {
      PfDashboardGroup,
      PfDashboardSidebar,
      PfDashboardPanel,
      PfDashboardNavbar,
      PfDashboardSearchButton,
    },
    template: `
      <PfDashboardGroup>
        <PfDashboardSidebar resizable collapsible>
          <template #header="{ collapsed }">
            <strong>{{ collapsed ? 'PF' : 'Prismify' }}</strong>
          </template>
          <PfDashboardSearchButton :collapsed="false" />
        </PfDashboardSidebar>
        <PfDashboardPanel>
          <template #header>
            <PfDashboardNavbar title="Dashboard" />
          </template>
          <template #body>
            <div style="min-height:12rem">Content</div>
          </template>
        </PfDashboardPanel>
      </PfDashboardGroup>
    `,
  }),
};
