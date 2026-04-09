import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfRadio from './index.vue';

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
  title: 'Form/PfRadio',
  component: PfRadio,
  tags: ['autodocs'],
  args: {
    label: 'Option A',
    value: 'a',
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
  },
} satisfies Meta<typeof PfRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfRadio },
    setup() {
      const model = ref<string | undefined>(undefined);
      return { args, model };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <PfRadio v-bind="args" v-model="model" value="a" />
        <PfRadio v-bind="{ ...args, label: 'Option B' }" v-model="model" value="b" />
      </div>
    `,
  }),
};

export const CardVariant: Story = {
  args: {
    variant: 'card',
    label: 'Card',
    value: 'x',
  },
  render: (args) => ({
    components: { PfRadio },
    setup() {
      const model = ref('x');
      return { args, model };
    },
    template: '<PfRadio v-bind="args" v-model="model" />',
  }),
};

export const UncontrolledDefault: Story = {
  args: {
    defaultValue: 'a',
    label: 'Without v-model',
    value: 'a',
  },
  render: (args) => ({
    components: { PfRadio },
    setup() {
      return { args };
    },
    template: '<PfRadio v-bind="args" />',
  }),
};
