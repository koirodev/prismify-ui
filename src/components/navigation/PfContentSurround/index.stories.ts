import type { Meta, StoryObj } from '@storybook/vue3';
import PfContentSurround from './index.vue';

const meta: Meta<typeof PfContentSurround> = {
  title: 'Navigation/PfContentSurround',
  component: PfContentSurround,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    items: [
      {
        title: 'Previous: Installation',
        description: 'Setup and package installation details.',
        to: '#installation',
      },
      {
        title: 'Next: Theming',
        description: 'Learn how to customize prismify with CSS variables.',
        to: '#theming',
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
