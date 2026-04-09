import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfPagination from './index.vue';

const meta: Meta<typeof PfPagination> = {
  title: 'Navigation/PfPagination',
  component: PfPagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    page: { control: 'number' },
    total: { control: 'number' },
    itemsPerPage: { control: 'number' },
    siblingCount: { control: 'number' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    page: 5,
    total: 100,
  },
};

export const ShowEdges: Story = {
  args: {
    page: 5,
    total: 100,
    showEdges: true,
    siblingCount: 1,
  },
};

export const NoControls: Story = {
  args: {
    page: 5,
    total: 100,
    showControls: false,
    showEdges: true,
    siblingCount: 1,
  },
};

export const Styled: Story = {
  args: {
    page: 5,
    total: 100,
    color: 'primary',
    variant: 'subtle',
    activeColor: 'neutral',
    activeVariant: 'subtle',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    page: 5,
    total: 100,
    disabled: true,
  },
};

export const WithLinks: Story = {
  render: () => ({
    components: { PfPagination },
    setup() {
      const page = ref(5);
      function to(p: number) {
        return {
          query: { page: String(p) },
          hash: '#with-links',
        };
      }
      return { page, to };
    },
    template:
      '<PfPagination v-model:page="page" :total="100" :to="to" :sibling-count="1" show-edges />',
  }),
};
