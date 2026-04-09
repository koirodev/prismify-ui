import type { Meta, StoryObj } from '@storybook/vue3';
import PfContentSearchButton from './index.vue';

const meta: Meta<typeof PfContentSearchButton> = {
  title: 'Element/PfContentSearchButton',
  component: PfContentSearchButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    collapsed: false,
    kbds: ['meta', 'k'],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: {
    collapsed: true,
  },
};
