import type { Meta, StoryObj } from '@storybook/vue3';
import { PF_ICON_NAMES } from '../PfIcon/paths';
import PfBadge from './index.vue';

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
  title: 'Element/PfBadge',
  component: PfBadge,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
    square: { control: 'boolean' },
    icon: { control: 'select', options: [undefined, ...PF_ICON_NAMES] },
    leadingIcon: { control: 'select', options: [undefined, ...PF_ICON_NAMES] },
    trailingIcon: { control: 'select', options: [undefined, ...PF_ICON_NAMES] },
    leading: { control: 'boolean' },
    trailing: { control: 'boolean' },
    label: { control: 'text' },
    as: { control: 'text' },
  },
  args: {
    color: 'primary',
    variant: 'solid',
    size: 'md',
    square: false,
    leading: false,
    trailing: false,
    label: 'Badge',
  },
  render: (args: Record<string, unknown>) => ({
    components: { PfBadge },
    setup() {
      return { args };
    },
    template: `
      <PfBadge
        :as="args.as"
        :label="args.label"
        :color="args.color"
        :variant="args.variant"
        :size="args.size"
        :square="args.square"
        :icon="args.icon"
        :avatar="args.avatar"
        :leading="args.leading"
        :trailing="args.trailing"
        :leading-icon="args.leadingIcon"
        :trailing-icon="args.trailingIcon"
      >{{ args.label }}</PfBadge>
    `,
  }),
} satisfies Meta<typeof PfBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LabelProp: Story = {
  args: { label: '12' },
  render: (args) => ({
    components: { PfBadge },
    setup() {
      return { args };
    },
    template: '<PfBadge :label="args.label" color="primary" variant="solid" />',
  }),
};

export const WithIcon: Story = {
  args: {
    icon: 'starFill',
    color: 'primary',
    variant: 'solid',
    size: 'md',
    label: 'Badge',
  },
};

export const TrailingIcon: Story = {
  args: {
    trailing: true,
    trailingIcon: 'arrowRight',
    size: 'md',
    label: 'Badge',
  },
};

export const WithAvatar: Story = {
  args: {
    avatar: { text: 'JD' },
    color: 'neutral',
    variant: 'outline',
    size: 'md',
    label: 'Jane Doe',
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { PfBadge },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
        <PfBadge v-for="s in ['xs','sm','md','lg','xl']" :key="s" :size="s" color="neutral" variant="soft">
          {{ s }}
        </PfBadge>
      </div>
    `,
  }),
};

export const ColorsAndVariants: Story = {
  render: () => ({
    components: { PfBadge },
    setup() {
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
      return { colors, variants };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div v-for="v in variants" :key="v" style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
          <PfBadge v-for="c in colors" :key="c + v" :color="c" :variant="v" size="sm">
            {{ c }}
          </PfBadge>
        </div>
      </div>
    `,
  }),
};

export const Square: Story = {
  args: { square: true, size: 'md', label: '7' },
  render: (args) => ({
    components: { PfBadge },
    setup() {
      return { args };
    },
    template:
      '<PfBadge :square="args.square" :size="args.size" :label="args.label" color="primary" variant="solid" />',
  }),
};
