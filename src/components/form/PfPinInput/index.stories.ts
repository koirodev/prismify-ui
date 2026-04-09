import { ref } from 'vue';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfPinInput from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Form/PfPinInput',
  component: PfPinInput,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral',
      ],
    },
    variant: {
      control: 'select',
      options: ['outline', 'soft', 'subtle', 'ghost', 'none'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    type: { control: 'text' },
  },
} satisfies Meta<typeof PfPinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfPinInput },
    setup() {
      const v = ref('');
      return { args, v };
    },
    template: '<PfPinInput v-bind="args" v-model="v" />',
  }),
  args: {
    length: 5,
    placeholder: '○',
  },
};

export const OtpNumeric: Story = {
  render: (args) => ({
    components: { PfPinInput },
    setup() {
      const v = ref('');
      return { args, v };
    },
    template: '<PfPinInput v-bind="args" v-model="v" />',
  }),
  args: {
    length: 6,
    type: 'number',
    otp: true,
    placeholder: '•',
  },
};

export const Mask: Story = {
  render: (args) => ({
    components: { PfPinInput },
    setup() {
      const v = ref('');
      return { args, v };
    },
    template: '<PfPinInput v-bind="args" v-model="v" />',
  }),
  args: {
    length: 4,
    mask: true,
    type: 'number',
    placeholder: '•',
  },
};

export const Highlight: Story = {
  render: (args) => ({
    components: { PfPinInput },
    setup() {
      const v = ref('12');
      return { args, v };
    },
    template: '<PfPinInput v-bind="args" v-model="v" />',
  }),
  args: {
    color: 'neutral',
    highlight: true,
    placeholder: '○',
  },
};

export const SubtleNeutral: Story = {
  render: (args) => ({
    components: { PfPinInput },
    setup() {
      const v = ref('');
      return { args, v };
    },
    template: '<PfPinInput v-bind="args" v-model="v" />',
  }),
  args: {
    color: 'neutral',
    variant: 'subtle',
    highlight: false,
    placeholder: '○',
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { PfPinInput },
    setup() {
      const v = ref('123');
      return { v };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <PfPinInput v-model="v" size="xs" placeholder="○" />
        <PfPinInput v-model="v" size="sm" placeholder="○" />
        <PfPinInput v-model="v" size="md" placeholder="○" />
        <PfPinInput v-model="v" size="lg" placeholder="○" />
        <PfPinInput v-model="v" size="xl" placeholder="○" />
      </div>
    `,
  }),
};

export const FieldGroupSize: Story = {
  render: () => ({
    components: { PfFieldGroup, PfPinInput },
    template:
      '<PfFieldGroup size="lg"><PfPinInput placeholder="○" /></PfFieldGroup>',
  }),
};
