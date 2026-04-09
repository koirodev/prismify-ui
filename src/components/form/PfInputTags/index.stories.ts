import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfInputTags from './index.vue';

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
  title: 'Form/PfInputTags',
  component: PfInputTags,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template:
        '<div style="width: 22rem; max-width: 100%; margin: 0 auto; box-sizing: border-box"><story /></div>',
    }),
  ],
  args: {
    color: 'primary',
    variant: 'outline',
    size: 'md',
    disabled: false,
    highlight: false,
    placeholder: 'Type a tag and press Enter…',
    addOnPaste: false,
    addOnTab: false,
    addOnBlur: false,
    duplicate: false,
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
  },
} satisfies Meta<typeof PfInputTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfInputTags },
    setup() {
      const model = ref<string[]>(['Vue', 'Nuxt']);
      return { args, model };
    },
    template: '<PfInputTags v-bind="args" v-model="model" />',
  }),
};

export const AddOnBlurPaste: Story = {
  args: {
    addOnBlur: true,
    addOnPaste: true,
    placeholder: 'Blur or paste comma-separated',
  },
  render: (args) => ({
    components: { PfInputTags },
    setup() {
      const model = ref<string[]>([]);
      return { args, model };
    },
    template: '<PfInputTags v-bind="args" v-model="model" />',
  }),
};

export const MaxAndLength: Story = {
  args: {
    max: 3,
    maxlength: 6,
    placeholder: 'Up to 3 tags, 6 characters each',
  },
  render: (args) => ({
    components: { PfInputTags },
    setup() {
      const model = ref<string[]>(['abc']);
      return { args, model };
    },
    template: '<PfInputTags v-bind="args" v-model="model" />',
  }),
};

export const Highlight: Story = {
  args: {
    highlight: true,
    color: 'error',
    variant: 'outline',
  },
  render: (args) => ({
    components: { PfInputTags },
    setup() {
      const model = ref<string[]>(['error']);
      return { args, model };
    },
    template: '<PfInputTags v-bind="args" v-model="model" />',
  }),
};
