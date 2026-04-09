import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardResizeHandle from './index.vue';

const meta = {
  title: 'Dashboard/PfDashboardResizeHandle',
  component: PfDashboardResizeHandle,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardResizeHandle>;

export default meta;

export const Default: StoryObj<typeof PfDashboardResizeHandle> = {
  render: () => ({
    components: { PfDashboardResizeHandle },
    template: `
      <div style="position:relative;height:5rem;border:1px solid var(--pf-border-color)">
        <PfDashboardResizeHandle />
      </div>
    `,
  }),
};
