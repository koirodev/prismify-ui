import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardToolbar from './index.vue';

const meta = {
  title: 'Dashboard/PfDashboardToolbar',
  component: PfDashboardToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardToolbar>;

export default meta;

export const Default: StoryObj<typeof PfDashboardToolbar> = {
  render: () => ({
    components: { PfDashboardToolbar },
    template: `
      <PfDashboardToolbar>
        <template #left>Left</template>
        Center
        <template #right>Right</template>
      </PfDashboardToolbar>
    `,
  }),
};
