import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfSelectMenu from './index.vue';

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
  title: 'Form/PfSelectMenu',
  component: PfSelectMenu,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template:
        '<div style="width: 280px; max-width: 100%; margin: 0 auto; box-sizing: border-box"><story /></div>',
    }),
  ],
  args: {
    color: 'primary',
    variant: 'outline',
    size: 'md',
    disabled: false,
    placeholder: 'Select a value',
    items: ['Backlog', 'Todo', 'In Progress', 'Done'],
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
  },
} satisfies Meta<typeof PfSelectMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfSelectMenu },
    setup() {
      const model = ref<string>('Todo');
      return { args, model };
    },
    template: '<PfSelectMenu v-bind="args" v-model="model" />',
  }),
};

export const ValueKey: Story = {
  render: (args) => ({
    components: { PfSelectMenu },
    setup() {
      const items = ref([
        { label: 'Backlog', id: 'backlog' },
        { label: 'Todo', id: 'todo' },
        { label: 'Done', id: 'done' },
      ]);
      const model = ref('todo');
      return { args, items, model };
    },
    template:
      '<PfSelectMenu v-bind="args" v-model="model" value-key="id" label-key="label" :items="items" />',
  }),
};

export const Groups: Story = {
  render: (args) => ({
    components: { PfSelectMenu },
    setup() {
      const items = ref([
        ['Apple', 'Banana', 'Blueberry'],
        ['Carrot', 'Leek', 'Broccoli'],
      ]);
      const model = ref('Apple');
      return { args, items, model };
    },
    template: '<PfSelectMenu v-bind="args" v-model="model" :items="items" />',
  }),
};

export const Multiple: Story = {
  args: { multiple: true, placeholder: 'Statuses' },
  render: (args) => ({
    components: { PfSelectMenu },
    setup() {
      const model = ref<string[]>(['Todo', 'Done']);
      return { args, model };
    },
    template: '<PfSelectMenu v-bind="args" v-model="model" />',
  }),
};

export const NoSearch: Story = {
  args: { searchInput: false },
  render: (args) => ({
    components: { PfSelectMenu },
    setup() {
      const model = ref('Todo');
      return { args, model };
    },
    template: '<PfSelectMenu v-bind="args" v-model="model" />',
  }),
};
