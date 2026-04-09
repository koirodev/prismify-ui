import { Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/vue3';
import { shallowRef } from 'vue';
import PfInputTime from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;
const variants = ['outline', 'soft', 'subtle', 'ghost', 'none'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'Form/PfInputTime',
  component: PfInputTime,
  tags: ['autodocs'],
  args: {
    locale: 'en-US',
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
    locale: { control: 'text' },
  },
} satisfies Meta<typeof PfInputTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => ({
    components: { PfInputTime },
    setup() {
      const modelValue = shallowRef(new Time(12, 30, 0));
      return { args, modelValue };
    },
    template: '<PfInputTime v-bind="args" v-model="modelValue" />',
  }),
};

export const Hour24: Story = {
  render: (args) => ({
    components: { PfInputTime },
    setup() {
      const modelValue = shallowRef(new Time(14, 15, 0));
      return { args, modelValue };
    },
    template:
      '<PfInputTime v-bind="args" v-model="modelValue" hour-cycle="h23" />',
  }),
};

export const Range: Story = {
  render: (args) => ({
    components: { PfInputTime },
    setup() {
      const modelValue = shallowRef({
        start: new Time(9, 0, 0),
        end: new Time(17, 30, 0),
      });
      return { args, modelValue };
    },
    template: '<PfInputTime v-bind="args" v-model="modelValue" range />',
  }),
};

export const WithTrailingIcon: Story = {
  render: (args) => ({
    components: { PfInputTime },
    setup() {
      const modelValue = shallowRef(new Time(10, 0, 0));
      return { args, modelValue };
    },
    template:
      '<PfInputTime v-bind="args" v-model="modelValue" trailing icon="clock" />',
  }),
};
