import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardSidebarCollapse from './index.vue';

const meta = {
  title: 'Dashboard/PfDashboardSidebarCollapse',
  component: PfDashboardSidebarCollapse,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardSidebarCollapse>;

export default meta;

export const Default: StoryObj<typeof PfDashboardSidebarCollapse> = {};
