import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardPanel from './index.vue';
import PfDashboardNavbar from '../PfDashboardNavbar/index.vue';

const meta = {
  title: 'Dashboard/PfDashboardPanel',
  component: PfDashboardPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PfDashboardPanel>;

export default meta;

export const Default: StoryObj<typeof PfDashboardPanel> = {
  render: () => ({
    components: { PfDashboardPanel, PfDashboardNavbar },
    template: `
      <PfDashboardPanel>
        <template #header>
          <PfDashboardNavbar title="Panel" />
        </template>
        <template #body>
          <div style="min-height:12rem">Panel body</div>
        </template>
      </PfDashboardPanel>
    `,
  }),
};
