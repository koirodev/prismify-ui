import { CalendarDate } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/vue3';
import { shallowRef } from 'vue';
import PfInputDate from './index.vue';

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
  title: 'Form/PfInputDate',
  component: PfInputDate,
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
} satisfies Meta<typeof PfInputDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => ({
    components: { PfInputDate },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 3, 15));
      return { args, modelValue };
    },
    template: '<PfInputDate v-bind="args" v-model="modelValue" />',
  }),
};

export const Range: Story = {
  render: (args) => ({
    components: { PfInputDate },
    setup() {
      const modelValue = shallowRef({
        start: new CalendarDate(2025, 3, 1),
        end: new CalendarDate(2025, 3, 9),
      });
      return { args, modelValue };
    },
    template: '<PfInputDate v-bind="args" v-model="modelValue" range />',
  }),
};

export const MinMax: Story = {
  render: (args) => ({
    components: { PfInputDate },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 3, 15));
      const minValue = new CalendarDate(2025, 3, 1);
      const maxValue = new CalendarDate(2025, 3, 31);
      return { args, modelValue, minValue, maxValue };
    },
    template:
      '<PfInputDate v-bind="args" v-model="modelValue" :min-value="minValue" :max-value="maxValue" />',
  }),
};

export const WithTrailingIcon: Story = {
  render: (args) => ({
    components: { PfInputDate },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 3, 15));
      return { args, modelValue };
    },
    template:
      '<PfInputDate v-bind="args" v-model="modelValue" trailing icon="calendar" />',
  }),
};
