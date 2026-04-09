import type { Meta, StoryObj } from '@storybook/vue3';
import { PF_ICON_SIZES } from './iconSizes';
import { PF_ICON_NAMES } from './paths';
import PfIcon from './index.vue';

const meta = {
  title: 'Element/PfIcon',
  component: PfIcon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: [...PF_ICON_NAMES] },
    size: { control: 'select', options: [...PF_ICON_SIZES] },
  },
  args: {
    name: 'plus',
    size: 'md',
  },
  render: (args: { name: string; size: string }) => ({
    components: { PfIcon },
    setup() {
      return { args };
    },
    template: '<PfIcon :name="args.name" :size="args.size" />',
  }),
} satisfies Meta<typeof PfIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Gallery: Story = {
  render: () => ({
    components: { PfIcon },
    setup() {
      return { names: PF_ICON_NAMES };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;color:var(--pf-color-text)">
        <PfIcon v-for="n in names" :key="n" :name="n" size="lg" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { PfIcon },
    setup() {
      return { sizes: PF_ICON_SIZES };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;color:var(--pf-color-text)">
        <PfIcon v-for="s in sizes" :key="s" name="plus" :size="s" />
      </div>
    `,
  }),
};
