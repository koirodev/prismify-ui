import { ref } from 'vue';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfInputNumber from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Form/PfInputNumber',
  component: PfInputNumber,
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
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof PfInputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfInputNumber },
    setup() {
      const v = ref<number | null>(5);
      return { args, v };
    },
    template:
      '<PfInputNumber v-bind="args" v-model="v" style="width: 12rem" />',
  }),
  args: {
    locale: 'en-US',
    min: 0,
    max: 100,
    step: 1,
  },
};

export const MinMaxStep: Story = {
  render: (args) => ({
    components: { PfInputNumber },
    setup() {
      const v = ref<number | null>(10);
      return { args, v };
    },
    template:
      '<PfInputNumber v-bind="args" v-model="v" style="width: 12rem" />',
  }),
  args: {
    locale: 'en-US',
    min: 0,
    max: 20,
    step: 2,
  },
};

export const Vertical: Story = {
  render: (args) => ({
    components: { PfInputNumber },
    setup() {
      const v = ref<number | null>(3);
      return { args, v };
    },
    template:
      '<PfInputNumber v-bind="args" v-model="v" style="width: 12rem" />',
  }),
  args: {
    locale: 'en-US',
    orientation: 'vertical',
    min: 0,
    max: 10,
  },
};

export const Percent: Story = {
  render: (args) => ({
    components: { PfInputNumber },
    setup() {
      const v = ref<number | null>(0.05);
      return { args, v };
    },
    template:
      '<PfInputNumber v-bind="args" v-model="v" style="width: 14rem" />',
  }),
  args: {
    locale: 'en-US',
    step: 0.01,
    formatOptions: { style: 'percent', maximumFractionDigits: 2 },
  },
};

export const WithoutButtons: Story = {
  render: (args) => ({
    components: { PfInputNumber },
    setup() {
      const v = ref<number | null>(5);
      return { args, v };
    },
    template:
      '<PfInputNumber v-bind="args" v-model="v" style="width: 12rem" />',
  }),
  args: {
    locale: 'en-US',
    increment: false,
    decrement: false,
  },
};

export const HighlightNeutral: Story = {
  render: (args) => ({
    components: { PfInputNumber },
    setup() {
      const v = ref<number | null>(12);
      return { args, v };
    },
    template:
      '<PfInputNumber v-bind="args" v-model="v" style="width: 12rem" />',
  }),
  args: {
    locale: 'en-US',
    color: 'neutral',
    variant: 'subtle',
    highlight: true,
  },
};

export const FieldGroup: Story = {
  render: () => ({
    components: { PfFieldGroup, PfInputNumber },
    setup() {
      const v = ref<number | null>(1);
      return { v };
    },
    template: `
      <PfFieldGroup size="md">
        <PfInputNumber v-model="v" locale="en-US" style="width: 12rem" />
      </PfFieldGroup>
    `,
  }),
};
