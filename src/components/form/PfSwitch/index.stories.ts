import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfSwitch from './index.vue';

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
  title: 'Form/PfSwitch',
  component: PfSwitch,
  tags: ['autodocs'],
  args: {
    label: 'Notifications',
    color: 'primary',
    size: 'md',
    disabled: false,
    required: false,
    loading: false,
  },
  argTypes: {
    color: { control: 'select', options: [...colors] },
    size: { control: 'select', options: [...sizes] },
    checkedIcon: { control: 'text' },
    uncheckedIcon: { control: 'text' },
    loadingIcon: { control: 'text' },
  },
} satisfies Meta<typeof PfSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      const model = ref(false);
      return { args, model };
    },
    template: '<PfSwitch v-bind="args" v-model="model" />',
  }),
};

export const On: Story = {
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      const model = ref(true);
      return { args, model };
    },
    template: '<PfSwitch v-bind="args" v-model="model" />',
  }),
};

export const DefaultValue: Story = {
  args: {
    defaultValue: true,
  },
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      return { args };
    },
    template: '<PfSwitch v-bind="args" />',
  }),
};

export const WithDescription: Story = {
  args: {
    description: 'Receive emails about new events.',
  },
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      const model = ref(false);
      return { args, model };
    },
    template: '<PfSwitch v-bind="args" v-model="model" />',
  }),
};

export const WithIcons: Story = {
  args: {
    checkedIcon: 'check',
    uncheckedIcon: 'cross',
    defaultValue: true,
  },
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      return { args };
    },
    template: '<PfSwitch v-bind="args" />',
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
    defaultValue: true,
  },
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      return { args };
    },
    template: '<PfSwitch v-bind="args" />',
  }),
};

export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { PfSwitch },
    setup() {
      const model = ref(false);
      return { args, model };
    },
    template: '<PfSwitch v-bind="args" v-model="model" />',
  }),
};

export const Colors: Story = {
  render: () => ({
    components: { PfSwitch },
    setup() {
      const model = ref<Record<string, boolean>>({});
      colors.forEach((c) => {
        model.value[c] = c === 'primary';
      });
      return { colors, model };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;align-items:flex-start;">
        <PfSwitch
          v-for="c in colors"
          :key="c"
          v-model="model[c]"
          :color="c"
          :label="c"
        />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { PfSwitch },
    setup() {
      const model = ref(true);
      return { sizes, model };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;align-items:flex-start;">
        <PfSwitch
          v-for="s in sizes"
          :key="s"
          v-model="model"
          :size="s"
          :label="'Size ' + s"
        />
      </div>
    `,
  }),
};
