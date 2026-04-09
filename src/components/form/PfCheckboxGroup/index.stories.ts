import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfCheckboxGroup from './index.vue';

const meta = {
  title: 'Form/PfCheckboxGroup',
  component: PfCheckboxGroup,
  tags: ['autodocs'],
  args: {
    legend: 'Theme',
    items: ['System', 'Light', 'Dark'],
    orientation: 'vertical',
    variant: 'list',
    size: 'md',
    disabled: false,
    required: false,
    color: 'primary',
    indicator: 'start',
  },
} satisfies Meta<typeof PfCheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfCheckboxGroup },
    setup() {
      const model = ref<string[]>([]);
      return { args, model };
    },
    template: '<PfCheckboxGroup v-bind="args" v-model="model" />',
  }),
};

export const Objects: Story = {
  args: {
    items: [
      { label: 'System', description: 'Match OS.', value: 'system' },
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark', disabled: true },
    ],
  },
  render: (args) => ({
    components: { PfCheckboxGroup },
    setup() {
      const model = ref<string[]>(['light']);
      return { args, model };
    },
    template: '<PfCheckboxGroup v-bind="args" v-model="model" />',
  }),
};

export const TableHorizontal: Story = {
  args: {
    variant: 'table',
    orientation: 'horizontal',
    legend: 'Mode',
    items: ['A', 'B', 'C'],
  },
  render: (args) => ({
    components: { PfCheckboxGroup },
    setup() {
      const model = ref<string[]>(['B']);
      return { args, model };
    },
    template: '<PfCheckboxGroup v-bind="args" v-model="model" />',
  }),
};

export const ValueKey: Story = {
  args: {
    valueKey: 'id',
    items: [
      { id: 'x', label: 'First' },
      { id: 'y', label: 'Second' },
    ],
  },
  render: (args) => ({
    components: { PfCheckboxGroup },
    setup() {
      const model = ref<string[]>(['x']);
      return { args, model };
    },
    template: '<PfCheckboxGroup v-bind="args" v-model="model" />',
  }),
};
