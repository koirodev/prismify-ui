import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardNavbar from './index.vue';
import PfDashboardSidebarCollapse from '../PfDashboardSidebarCollapse/index.vue';

const meta = {
  title: 'Dashboard/PfDashboardNavbar',
  component: PfDashboardNavbar,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardNavbar>;

export default meta;

export const Default: StoryObj<typeof PfDashboardNavbar> = {
  render: () => ({
    components: { PfDashboardNavbar, PfDashboardSidebarCollapse },
    template: `
      <PfDashboardNavbar title="Inbox">
        <template #leading>
          <PfDashboardSidebarCollapse />
        </template>
        <template #right>
          <span>Actions</span>
        </template>
      </PfDashboardNavbar>
    `,
  }),
};
