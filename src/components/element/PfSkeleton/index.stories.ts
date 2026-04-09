import type { Meta, StoryObj } from '@storybook/vue3';
import PfSkeleton from './index.vue';

const meta = {
  title: 'Element/PfSkeleton',
  component: PfSkeleton,
  tags: ['autodocs'],
  argTypes: {
    as: { control: 'text' },
  },
  args: {
    as: 'div',
  },
} satisfies Meta<typeof PfSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => ({
    components: { PfSkeleton },
    setup() {
      return { args };
    },
    template: `
      <PfSkeleton
        :as="args.as"
        :ui="args.ui"
        style="width: 12rem; height: 1rem;"
      />
    `,
  }),
};

/** Layout like the Nuxt UI example: “avatar” and two text lines. */
export const AvatarAndLines: Story = {
  render: () => ({
    components: { PfSkeleton },
    template: `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <PfSkeleton style="width: 3rem; height: 3rem; border-radius: 9999px;" />
        <div style="display: grid; gap: 0.5rem;">
          <PfSkeleton style="height: 1rem; width: 250px;" />
          <PfSkeleton style="height: 1rem; width: 200px;" />
        </div>
      </div>
    `,
  }),
};
