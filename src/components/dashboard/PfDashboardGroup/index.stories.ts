import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardGroup from './index.vue';
import PfDashboardSidebar from '../PfDashboardSidebar/index.vue';
import PfDashboardPanel from '../PfDashboardPanel/index.vue';
import PfDashboardNavbar from '../PfDashboardNavbar/index.vue';

const meta = {
  title: 'Dashboard/PfDashboardGroup',
  component: PfDashboardGroup,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PfDashboardGroup>;

export default meta;

export const Default: StoryObj<typeof PfDashboardGroup> = {
  render: () => ({
    components: {
      PfDashboardGroup,
      PfDashboardSidebar,
      PfDashboardPanel,
      PfDashboardNavbar,
    },
    template: `
      <PfDashboardGroup>
        <PfDashboardSidebar>
          <template #header>Sidebar</template>
          Menu
        </PfDashboardSidebar>
        <PfDashboardPanel>
          <template #header>
            <PfDashboardNavbar title="Dashboard" />
          </template>
          <template #body>
            <div>Panel content</div>
          </template>
        </PfDashboardPanel>
      </PfDashboardGroup>
    `,
  }),
};
