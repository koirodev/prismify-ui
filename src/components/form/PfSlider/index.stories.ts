import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfSlider from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'Form/PfSlider',
  component: PfSlider,
  tags: ['autodocs'],
  args: {
    min: 0,
    max: 100,
    step: 1,
    color: 'primary',
    size: 'md',
    orientation: 'horizontal',
    inverted: false,
    disabled: false,
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    size: { control: 'select', options: [...sizes] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof PfSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref(50);
      return { args, model };
    },
    template: '<PfSlider v-bind="args" v-model="model" style="width: 20rem" />',
  }),
};

export const UncontrolledDefault: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      return { args };
    },
    template:
      '<PfSlider v-bind="args" :default-value="50" style="width: 20rem" />',
  }),
};

export const MinMaxStep: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref(50);
      return { args, model };
    },
    template:
      '<PfSlider v-bind="args" v-model="model" :min="0" :max="50" :step="5" style="width: 20rem" />',
  }),
};

export const Range: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref<[number, number]>([25, 75]);
      return { args, model };
    },
    template: '<PfSlider v-bind="args" v-model="model" style="width: 20rem" />',
  }),
};

export const MinStepsBetweenThumbs: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref<[number, number]>([20, 80]);
      return { args, model };
    },
    template:
      '<PfSlider v-bind="args" v-model="model" :min-steps-between-thumbs="10" style="width: 20rem" />',
  }),
};

export const Vertical: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref(50);
      return { args, model };
    },
    template:
      '<PfSlider v-bind="args" v-model="model" orientation="vertical" style="height: 12rem" />',
  }),
};

export const Tooltip: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref(35);
      return { args, model };
    },
    template:
      '<PfSlider v-bind="args" v-model="model" tooltip style="width: 20rem" />',
  }),
};

export const Inverted: Story = {
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref(25);
      return { args, model };
    },
    template:
      '<PfSlider v-bind="args" v-model="model" inverted style="width: 20rem" />',
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { PfSlider },
    setup() {
      const model = ref(40);
      return { args, model };
    },
    template: '<PfSlider v-bind="args" v-model="model" style="width: 20rem" />',
  }),
};

export const FieldGroupSize: Story = {
  render: () => ({
    components: { PfFieldGroup, PfSlider },
    setup() {
      const model = ref(55);
      return { model };
    },
    template:
      '<PfFieldGroup size="lg"><PfSlider v-model="model" color="success" style="width: 20rem" /></PfFieldGroup>',
  }),
};
