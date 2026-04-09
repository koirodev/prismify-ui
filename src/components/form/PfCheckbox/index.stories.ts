import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfCheckbox from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;
const variants = ['list', 'card'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const indicators = ['start', 'end', 'hidden'] as const;

const meta = {
  title: 'Form/PfCheckbox',
  component: PfCheckbox,
  tags: ['autodocs'],
  args: {
    label: 'Label',
    color: 'primary',
    variant: 'list',
    size: 'md',
    indicator: 'start',
    disabled: false,
    required: false,
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
    indicator: { control: 'select', options: [...indicators] },
    icon: { control: 'text' },
    indeterminateIcon: { control: 'text' },
  },
} satisfies Meta<typeof PfCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      const model = ref(false);
      return { args, model };
    },
    template: '<PfCheckbox v-bind="args" v-model="model" />',
  }),
};

export const Checked: Story = {
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      const model = ref(true);
      return { args, model };
    },
    template: '<PfCheckbox v-bind="args" v-model="model" />',
  }),
};

export const Indeterminate: Story = {
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      const model = ref<'indeterminate' | boolean>('indeterminate');
      return { args, model };
    },
    template: '<PfCheckbox v-bind="args" v-model="model" />',
  }),
};

export const WithDescription: Story = {
  args: {
    description: 'Short hint for the option.',
  },
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      const model = ref(false);
      return { args, model };
    },
    template: '<PfCheckbox v-bind="args" v-model="model" />',
  }),
};

export const CardVariant: Story = {
  args: {
    variant: 'card',
    label: 'Card variant',
  },
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      const model = ref(true);
      return { args, model };
    },
    template: '<PfCheckbox v-bind="args" v-model="model" />',
  }),
};

export const IndicatorEnd: Story = {
  args: {
    variant: 'card',
    indicator: 'end',
    label: 'Indicator on the right',
  },
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      const model = ref(false);
      return { args, model };
    },
    template: '<PfCheckbox v-bind="args" v-model="model" />',
  }),
};

export const CustomIcons: Story = {
  args: {
    icon: 'heart',
    indeterminateIcon: 'plus',
    defaultValue: 'indeterminate',
    label: 'Custom icons',
  },
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      return { args };
    },
    template: '<PfCheckbox v-bind="args" />',
  }),
};

export const UncontrolledDefault: Story = {
  args: {
    defaultValue: true,
    label: 'Without v-model (defaultValue)',
  },
  render: (args) => ({
    components: { PfCheckbox },
    setup() {
      return { args };
    },
    template: '<PfCheckbox v-bind="args" />',
  }),
};
