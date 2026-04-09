import { CalendarDate } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref, shallowRef } from 'vue';
import PfCalendar from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;
const variants = ['solid', 'outline', 'soft', 'subtle'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'Form/PfCalendar',
  component: PfCalendar,
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
} satisfies Meta<typeof PfCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 3, 15));
      return { args, modelValue };
    },
    template: '<PfCalendar v-bind="args" v-model="modelValue" />',
  }),
};

export const Multiple: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef([
        new CalendarDate(2025, 3, 4),
        new CalendarDate(2025, 3, 6),
        new CalendarDate(2025, 3, 8),
      ]);
      return { args, modelValue };
    },
    template: '<PfCalendar v-bind="args" v-model="modelValue" multiple />',
  }),
};

export const Range: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef({
        start: new CalendarDate(2025, 3, 1),
        end: new CalendarDate(2025, 3, 9),
      });
      return { args, modelValue };
    },
    template: '<PfCalendar v-bind="args" v-model="modelValue" range />',
  }),
};

export const TwoMonths: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef({
        start: new CalendarDate(2025, 3, 20),
        end: new CalendarDate(2025, 4, 10),
      });
      return { args, modelValue };
    },
    template:
      '<PfCalendar v-bind="args" v-model="modelValue" range :number-of-months="2" />',
  }),
};

export const WeekNumbers: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 1, 10));
      return { args, modelValue };
    },
    template:
      '<PfCalendar v-bind="args" v-model="modelValue" week-numbers fixed-weeks />',
  }),
};

export const MinMax: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 9, 10));
      const minValue = new CalendarDate(2025, 9, 1);
      const maxValue = new CalendarDate(2025, 9, 30);
      return { args, modelValue, minValue, maxValue };
    },
    template:
      '<PfCalendar v-bind="args" v-model="modelValue" :min-value="minValue" :max-value="maxValue" />',
  }),
};

export const DisabledDates: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef({
        start: new CalendarDate(2025, 1, 1),
        end: new CalendarDate(2025, 1, 9),
      });
      const isDateDisabled = (d: { day: number }) => d.day >= 10 && d.day <= 16;
      return { args, modelValue, isDateDisabled };
    },
    template:
      '<PfCalendar v-bind="args" v-model="modelValue" range :is-date-disabled="isDateDisabled" />',
  }),
};

export const CustomDaySlot: Story = {
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = shallowRef(new CalendarDate(2025, 1, 10));
      return { args, modelValue };
    },
    template: `
      <PfCalendar v-bind="args" v-model="modelValue">
        <template #day="{ day }">
          <strong>{{ day.day }}</strong>
        </template>
      </PfCalendar>
    `,
  }),
};

export const NeutralOutline: Story = {
  args: {
    color: 'neutral',
    variant: 'outline',
  },
  render: (args) => ({
    components: { PfCalendar },
    setup() {
      const modelValue = ref(new CalendarDate(2025, 6, 1));
      return { args, modelValue };
    },
    template: '<PfCalendar v-bind="args" v-model="modelValue" />',
  }),
};
