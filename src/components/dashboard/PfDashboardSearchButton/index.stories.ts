import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardSearchButton from './index.vue';

const meta = {
  title: 'Dashboard/PfDashboardSearchButton',
  component: PfDashboardSearchButton,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardSearchButton>;

export default meta;

export const Default: StoryObj<typeof PfDashboardSearchButton> = {};

export const Collapsed: StoryObj<typeof PfDashboardSearchButton> = {
  args: {
    collapsed: true,
  },
};
