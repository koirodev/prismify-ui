import type { Meta, StoryObj } from '@storybook/vue3';
import PfProgress from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;

const sizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

const animations = [
  'carousel',
  'carousel-inverse',
  'swing',
  'elastic',
] as const;

const meta = {
  title: 'Element/PfProgress',
  component: PfProgress,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    size: { control: 'select', options: [...sizes] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    animation: { control: 'select', options: [...animations] },
    modelValue: { control: 'number' },
    status: { control: 'boolean' },
    inverted: { control: 'boolean' },
  },
  args: {
    modelValue: 50,
    max: undefined as number | readonly string[] | undefined,
    status: false,
    inverted: false,
    size: 'md',
    color: 'primary',
    orientation: 'horizontal',
    animation: 'carousel',
  },
} satisfies Meta<typeof PfProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => ({
    components: { PfProgress },
    setup() {
      const setModelValue = (value: number | null) => {
        args.modelValue = value;
      };
      return { args, setModelValue };
    },
    template: `
      <div style="width: 320px; max-width: 100%;">
        <PfProgress
          v-bind="args"
          @update:modelValue="setModelValue"
        />
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  args: { modelValue: 62, status: true },
  render: (args) => ({
    components: { PfProgress },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 320px;">
        <PfProgress v-bind="args" />
      </div>
    `,
  }),
};

export const Steps: Story = {
  args: {
    modelValue: 2,
    max: ['Draft', 'Review', 'Publish', 'Live'],
    status: true,
  },
  render: (args) => ({
    components: { PfProgress },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 360px;">
        <PfProgress v-bind="args" />
      </div>
    `,
  }),
};

export const Indeterminate: Story = {
  args: { modelValue: null, animation: 'carousel' },
  render: (args) => ({
    components: { PfProgress },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 320px;">
        <PfProgress v-bind="args" />
      </div>
    `,
  }),
};

export const Vertical: Story = {
  args: { modelValue: 40, orientation: 'vertical' },
  render: (args) => ({
    components: { PfProgress },
    setup() {
      return { args };
    },
    template: `
      <div style="height: 12rem; display: flex;">
        <PfProgress v-bind="args" />
      </div>
    `,
  }),
};

export const Inverted: Story = {
  args: { modelValue: 35, inverted: true, status: true },
  render: (args) => ({
    components: { PfProgress },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 320px;">
        <PfProgress v-bind="args" />
      </div>
    `,
  }),
};
