import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardSidebarToggle from './index.vue';

const meta = {
  title: 'Dashboard/PfDashboardSidebarToggle',
  component: PfDashboardSidebarToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardSidebarToggle>;

export default meta;

export const Default: StoryObj<typeof PfDashboardSidebarToggle> = {};
