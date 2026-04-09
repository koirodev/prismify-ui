import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfFileUpload from './index.vue';

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
  title: 'Form/PfFileUpload',
  component: PfFileUpload,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template:
        '<div style="width: 24rem; max-width: 100%; margin: 0 auto; box-sizing: border-box"><story /></div>',
    }),
  ],
  args: {
    color: 'primary',
    variant: 'area',
    size: 'md',
    layout: 'grid',
    position: 'outside',
    disabled: false,
    highlight: false,
    dropzone: true,
    interactive: true,
    multiple: false,
    preview: true,
    label: 'Drop your images here',
    description: 'SVG, PNG, JPG or GIF (max. 2MB)',
    accept: '*',
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    size: { control: 'select', options: [...sizes] },
    variant: { control: 'select', options: ['area', 'button'] },
    layout: { control: 'select', options: ['grid', 'list'] },
    position: { control: 'select', options: ['inside', 'outside'] },
  },
} satisfies Meta<typeof PfFileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AreaGrid: Story = {
  render: (args) => ({
    components: { PfFileUpload },
    setup() {
      const model = ref<File | null>(null);
      return { args, model };
    },
    template:
      '<PfFileUpload v-bind="args" v-model="model" style="min-height: 12rem" />',
  }),
};

export const ListOutside: Story = {
  args: {
    layout: 'list',
    position: 'outside',
    multiple: true,
  },
  render: (args) => ({
    components: { PfFileUpload },
    setup() {
      const model = ref<File[]>([]);
      return { args, model };
    },
    template:
      '<PfFileUpload v-bind="args" v-model="model" style="min-height: 12rem" />',
  }),
};

export const ListInside: Story = {
  args: {
    layout: 'list',
    position: 'inside',
    multiple: true,
  },
  render: (args) => ({
    components: { PfFileUpload },
    setup() {
      const model = ref<File[]>([]);
      return { args, model };
    },
    template:
      '<PfFileUpload v-bind="args" v-model="model" style="min-height: 12rem" />',
  }),
};

export const ButtonVariant: Story = {
  args: {
    variant: 'button',
    multiple: false,
    icon: 'picture',
    label: 'Upload image',
    description: '',
  },
  render: (args) => ({
    components: { PfFileUpload },
    setup() {
      const model = ref<File | null>(null);
      return { args, model };
    },
    template: '<PfFileUpload v-bind="args" v-model="model" />',
  }),
};

export const ActionsSlot: Story = {
  args: {
    layout: 'list',
    multiple: true,
    interactive: false,
    icon: 'picture',
  },
  render: (args) => ({
    components: { PfFileUpload, PfButton },
    setup() {
      const model = ref<File[]>([]);
      return { args, model };
    },
    template: `
      <PfFileUpload v-bind="args" v-model="model" style="min-height: 12rem">
        <template #actions="{ open }">
          <PfButton label="Select images" color="neutral" variant="outline" @click="open()" />
        </template>
      </PfFileUpload>
    `,
  }),
};

export const Highlight: Story = {
  args: {
    highlight: true,
    color: 'error',
  },
  render: (args) => ({
    components: { PfFileUpload },
    setup() {
      const model = ref<File | null>(null);
      return { args, model };
    },
    template:
      '<PfFileUpload v-bind="args" v-model="model" style="min-height: 12rem" />',
  }),
};
