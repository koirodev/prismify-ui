import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfSelect from './index.vue';

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

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'pear', label: 'Pear' },
  { value: 'plum', label: 'Plum', disabled: true },
  { value: 'cherry', label: 'Cherry' },
] as const;

const meta = {
  title: 'Form/PfSelect',
  component: PfSelect,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template:
        '<div style="width: 250px; max-width: 100%; margin: 0 auto; box-sizing: border-box"><story /></div>',
    }),
  ],
  args: {
    color: 'primary',
    variant: 'outline',
    size: 'md',
    disabled: false,
    required: false,
    highlight: false,
    native: false,
    options: [...fruitOptions],
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
    native: { control: 'boolean' },
  },
} satisfies Meta<typeof PfSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref<string>('pear');
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const Placeholder: Story = {
  args: {
    placeholder: 'Select a value',
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref<string | undefined>(undefined);
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const NativeSelect: Story = {
  args: {
    native: true,
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('pear');
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const CustomIcons: Story = {
  args: {
    chevronIcon: 'angleSmallDown',
    selectedOptionIcon: 'check',
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('todo');
      const taskOpts = [
        { value: 'backlog', label: 'Backlog' },
        { value: 'todo', label: 'Todo' },
        { value: 'progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ];
      return { args, model, taskOpts };
    },
    template: '<PfSelect v-bind="args" v-model="model" :options="taskOpts" />',
  }),
};

export const NoSelectedIcon: Story = {
  args: {
    selectedOptionIcon: null,
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('pear');
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const SlotOptions: Story = {
  args: {
    native: true,
    options: undefined,
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('b');
      return { args, model };
    },
    template: `<PfSelect v-bind="args" v-model="model">
      <option value="a">Item A</option>
      <option value="b">Item B</option>
      <option value="c">Item C</option>
    </PfSelect>`,
  }),
};

export const Multiple: Story = {
  args: {
    multiple: true,
    placeholder: 'Select fruits',
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref<string[]>(['apple', 'cherry']);
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const GroupedOptions: Story = {
  args: {
    options: undefined,
    placeholder: 'Select a product',
    optionGroupLabels: ['Fruit', 'Vegetables'],
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref<string | undefined>(undefined);
      const optionGroups = [
        ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'],
        ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'],
      ] as const;
      return { args, model, optionGroups };
    },
    template:
      '<PfSelect v-bind="args" v-model="model" :option-groups="optionGroups" />',
  }),
};

export const LeadingIcon: Story = {
  args: {
    leadingIcon: 'search',
    placeholder: 'Search…',
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref<string | undefined>(undefined);
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
    placeholder: 'Loading…',
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('pear');
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const LoadingWithLeadingIcon: Story = {
  args: {
    leadingIcon: 'search',
    loading: true,
    placeholder: 'Updating…',
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('pear');
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const RichOptions: Story = {
  args: {
    leadingIcon: 'folder',
    placeholder: 'Task',
    options: undefined,
  },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('bug');
      const options = [
        { value: 'todo', label: 'Todo', icon: 'circle' as const },
        {
          value: 'bug',
          label: 'bug',
          chip: { color: 'error' as const },
        },
        { value: 'feat', label: 'Feature', icon: 'star' as const },
        {
          value: 'assignee',
          label: 'Assign',
          avatar: { text: 'PF', size: 'xs' as const },
        },
        {
          value: 'cover',
          label: 'Cover',
          imageSrc: 'https://picsum.photos/seed/prismify/64',
          imageAlt: '',
        },
      ];
      return { args, model, options };
    },
    template:
      '<PfSelect v-bind="args" v-model="model" :options="options" selected-option-icon="check" />',
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { PfSelect },
    setup() {
      const model = ref('apple');
      return { args, model };
    },
    template: '<PfSelect v-bind="args" v-model="model" />',
  }),
};

export const FieldGroupSize: Story = {
  render: () => ({
    components: { PfFieldGroup, PfSelect },
    setup() {
      const model = ref('cherry');
      const options = [...fruitOptions];
      return { model, options };
    },
    template:
      '<PfFieldGroup size="lg"><PfSelect v-model="model" :options="options" color="success" /></PfFieldGroup>',
  }),
};
