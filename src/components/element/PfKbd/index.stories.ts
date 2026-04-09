import type { Meta, StoryObj } from '@storybook/vue3';
import PfKbd from './index.vue';

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
const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Element/PfKbd',
  component: PfKbd,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes] },
    value: { control: 'text' },
    as: { control: 'text' },
    defaultSlot: { control: 'text', name: 'default slot' },
  },
  args: {
    color: 'neutral',
    variant: 'outline',
    size: 'md',
    defaultSlot: 'K',
  },
  render: (args: Record<string, unknown>) => ({
    components: { PfKbd },
    setup() {
      return { args };
    },
    template: `
      <PfKbd
        :as="args.as"
        :value="args.value"
        :color="args.color"
        :variant="args.variant"
        :size="args.size"
        :ui="args.ui"
      >{{ args.defaultSlot }}</PfKbd>
    `,
  }),
} satisfies Meta<typeof PfKbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ValueProp: Story = {
  args: {
    value: 'K',
    defaultSlot: '',
  },
  render: (args) => ({
    components: { PfKbd },
    setup() {
      return { args };
    },
    template: '<PfKbd :value="args.value" />',
  }),
};

export const MetaKey: Story = {
  args: {
    value: 'meta',
  },
  render: (args) => ({
    components: { PfKbd },
    setup() {
      return { args };
    },
    template: '<PfKbd :value="args.value" />',
  }),
};

export const SpecialKeys: Story = {
  render: () => ({
    components: { PfKbd },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
        <PfKbd value="shift" />
        <PfKbd value="alt" />
        <PfKbd value="ctrl" />
        <PfKbd value="enter" />
        <PfKbd value="escape" />
        <PfKbd value="arrowup" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { PfKbd },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
        <PfKbd v-for="s in ['sm','md','lg']" :key="s" :size="s" color="neutral" variant="outline">
          {{ s }}
        </PfKbd>
      </div>
    `,
  }),
};

export const ColorsAndVariants: Story = {
  render: () => ({
    components: { PfKbd },
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
          <PfKbd v-for="c in colors" :key="c + v" :color="c" :variant="v" size="sm">
            {{ c }}
          </PfKbd>
        </div>
      </div>
    `,
  }),
};

export const CustomClass: Story = {
  render: () => ({
    components: { PfKbd },
    template: `
      <div>
        <PfKbd variant="subtle" color="neutral" class="pfKbdStoryBold">K</PfKbd>
        <component is="style">.pfKbdStoryBold { font-weight: 700; border-radius: 9999px; }</component>
      </div>
    `,
  }),
};
