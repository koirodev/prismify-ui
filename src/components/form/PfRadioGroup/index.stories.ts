import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfRadioGroup from './index.vue';

const meta = {
  title: 'Form/PfRadioGroup',
  component: PfRadioGroup,
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
} satisfies Meta<typeof PfRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfRadioGroup },
    setup() {
      const model = ref<string | undefined>(undefined);
      return { args, model };
    },
    template: '<PfRadioGroup v-bind="args" v-model="model" />',
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
    components: { PfRadioGroup },
    setup() {
      const model = ref<string>('light');
      return { args, model };
    },
    template: '<PfRadioGroup v-bind="args" v-model="model" />',
  }),
};

export const TableVertical: Story = {
  args: {
    variant: 'table',
    orientation: 'vertical',
    legend: 'Choice',
    items: ['A', 'B', 'C'],
  },
  render: (args) => ({
    components: { PfRadioGroup },
    setup() {
      const model = ref<string>('B');
      return { args, model };
    },
    template: '<PfRadioGroup v-bind="args" v-model="model" />',
  }),
};
