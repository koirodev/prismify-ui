import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import PfInput from '../PfInput/index.vue';
import PfFormField from './index.vue';

const meta = {
  title: 'Form/PfFormField',
  component: PfFormField,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
  args: {
    label: 'Email',
    description: "We'll never share your email with anyone else.",
    hint: 'Optional',
    help: 'Please enter a valid email address.',
    size: 'md',
    orientation: 'vertical',
  },
} satisfies Meta<typeof PfFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfFormField, PfInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <PfFormField v-bind="args" style="width: 20rem;">
        <PfInput v-model="value" placeholder="Enter your email" />
      </PfFormField>
    `,
  }),
};

export const Required: Story = {
  args: {
    required: true,
  },
  render: Default.render,
};

export const Error: Story = {
  args: {
    error: 'Please enter a valid email address.',
    help: 'This text is hidden while error exists.',
  },
  render: Default.render,
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    label: 'Email',
    description: undefined,
    hint: undefined,
    help: 'Please enter a valid email address.',
  },
  render: Default.render,
};
