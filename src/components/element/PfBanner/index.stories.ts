import type { Meta, StoryObj } from '@storybook/vue3';
import PfBanner from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;

const meta = {
  title: 'Element/PfBanner',
  component: PfBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    closeIcon: { control: 'text' },
  },
  args: {
    title: 'Important message for users.',
    color: 'primary',
  },
  decorators: [
    () => ({
      template: '<div style="width: 100%;"><story /></div>',
    }),
  ],
  render: (args: Record<string, unknown>) => ({
    components: { PfBanner },
    setup() {
      return { args };
    },
    template: '<PfBanner v-bind="args" />',
  }),
} satisfies Meta<typeof PfBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: 'info',
    title: 'Banner with icon.',
  },
};

export const Neutral: Story = {
  args: {
    color: 'neutral',
    icon: 'info',
    title: 'Neutral variant.',
  },
};

export const Closable: Story = {
  args: {
    close: true,
    title: 'Banner can be dismissed.',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Banner with actions.',
    actions: [
      { label: 'Details', variant: 'soft' },
      { label: 'Later', variant: 'ghost' },
    ],
  },
};

export const AsLink: Story = {
  args: {
    title: 'Go to site',
    color: 'primary',
    to: 'https://example.com/',
    target: '_blank',
  },
};

export const PersistDismiss: Story = {
  args: {
    id: 'story-banner-dismiss',
    close: true,
    title: 'After dismiss, state is stored in localStorage (id).',
  },
};
