import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfAlert from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;
const variants = ['solid', 'outline', 'soft', 'subtle'] as const;

const meta = {
  title: 'Element/PfAlert',
  component: PfAlert,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    closeIcon: { control: 'text' },
  },
  args: {
    title: 'Heads up!',
    description: 'You can change the primary color in your app config.',
    color: 'primary',
    variant: 'solid',
    orientation: 'vertical',
  },
  decorators: [
    () => ({
      template:
        '<div style="width: min(100%, 28rem); margin: 0 auto;"><story /></div>',
    }),
  ],
  render: (args: Record<string, unknown>) => ({
    components: { PfAlert },
    setup() {
      return { args };
    },
    template: '<PfAlert v-bind="args" />',
  }),
} satisfies Meta<typeof PfAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: 'browser',
  },
};

export const NeutralOutline: Story = {
  args: {
    color: 'neutral',
    variant: 'outline',
    icon: 'browser',
  },
};

export const Subtle: Story = {
  args: {
    color: 'neutral',
    variant: 'subtle',
    icon: 'browser',
  },
};

export const WithClose: Story = {
  args: {
    color: 'neutral',
    variant: 'outline',
    close: true,
  },
};

export const CustomCloseIcon: Story = {
  args: {
    color: 'neutral',
    variant: 'outline',
    close: true,
    closeIcon: 'arrowRight',
  },
};

export const WithActions: Story = {
  args: {
    color: 'neutral',
    variant: 'outline',
    actions: [
      { label: 'Undo', variant: 'soft' },
      { label: 'Dismiss', variant: 'ghost' },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    color: 'neutral',
    variant: 'outline',
    orientation: 'horizontal',
    close: true,
    actions: [{ label: 'OK' }, { label: 'Later', variant: 'link' }],
  },
};

export const VModelOpen: Story = {
  render: () => ({
    components: { PfAlert },
    setup() {
      const open = ref(true);
      return { open };
    },
    template: `
      <div>
        <p style="margin-bottom: 8px; font-family: system-ui; font-size: 14px;">
          open = {{ open }}
          <button type="button" style="margin-left: 8px" @click="open = true">Show again</button>
        </p>
        <PfAlert
          v-model:open="open"
          title="Dismissible"
          description="Close sets open to false."
          color="neutral"
          variant="outline"
          :close="true"
        />
      </div>
    `,
  }),
};
