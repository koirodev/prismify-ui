import type { Meta, StoryObj } from '@storybook/vue3';
import { computed } from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfUser from './index.vue';

const meta = {
  title: 'Data/PfUser',
  component: PfUser,
  tags: ['autodocs'],
  args: {
    name: 'John Doe',
    description: 'Software Engineer',
    size: 'md',
    orientation: 'horizontal',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    target: {
      control: 'select',
      options: ['_blank', '_self', '_parent', '_top'],
    },
    'avatar.loading': {
      control: 'select',
      options: ['lazy', 'eager'],
    },
  },
} satisfies Meta<typeof PfUser>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfUser },
    setup() {
      return { args };
    },
    template: `
      <PfUser v-bind="args" />
    `,
  }),
};

export const WithAvatar: Story = {
  args: {
    avatar: {
      src: 'https://github.com/nuxt.png',
      alt: 'John Doe',
      loading: 'lazy',
    },
  },
  render: (args) => ({
    components: { PfUser },
    setup() {
      return { args };
    },
    template: `
      <PfUser v-bind="args" />
    `,
  }),
};

export const WithChip: Story = {
  args: {
    avatar: {
      src: 'https://github.com/nuxt.png',
      alt: 'John Doe',
      loading: 'lazy',
    },
    chip: true,
    size: 'xl',
  },
  render: (args) => ({
    components: { PfUser },
    setup() {
      return { args };
    },
    template: `
      <PfUser v-bind="args" />
    `,
  }),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    avatar: {
      src: 'https://github.com/nuxt.png',
      alt: 'John Doe',
      loading: 'lazy',
    },
  },
  render: (args) => ({
    components: { PfUser },
    setup() {
      return { args };
    },
    template: `
      <PfUser v-bind="args" />
    `,
  }),
};

export const Link: Story = {
  args: {
    to: 'https://github.com/nuxt',
    target: '_blank',
    name: 'Nuxt',
    description: 'The Intuitive Vue Framework',
    avatar: {
      src: 'https://github.com/nuxt.png',
      alt: 'Nuxt',
      loading: 'lazy',
    },
  },
  render: (args) => ({
    components: { PfUser },
    setup() {
      return { args };
    },
    template: `
      <PfUser v-bind="args" />
    `,
  }),
};

export const InitialsOnly: Story = {
  args: {
    name: 'Jane Smith',
    description: 'Designer',
  },
  render: (args) => ({
    components: { PfUser },
    setup() {
      return { args };
    },
    template: `
      <PfUser v-bind="args" />
    `,
  }),
};

const chipColorOptions = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;

export const CustomAvatarSlot: Story = {
  argTypes: {
    chipColor: {
      control: 'select',
      options: chipColorOptions,
    },
    chipText: { control: 'text' },
  },
  args: {
    name: 'Custom slot',
    description: 'Avatar from slot',
    chipColor: 'primary',
    chipText: '3',
    size: 'md',
  },
  render: (args) => ({
    components: { PfAvatar, PfUser },
    setup() {
      const a = args as typeof args & {
        chipColor: (typeof chipColorOptions)[number];
        chipText: string;
      };
      const userArgs = computed(() => ({
        name: a.name,
        description: a.description,
        size: a.size,
        orientation: a.orientation,
        chip: { color: a.chipColor, text: a.chipText },
      }));
      return { userArgs };
    },
    template: `
      <PfUser v-bind="userArgs">
        <template #avatar>
          <PfAvatar text="JS" :size="userArgs.size" />
        </template>
      </PfUser>
    `,
  }),
};
