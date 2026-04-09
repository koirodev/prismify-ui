import type { Meta, StoryObj } from '@storybook/vue3';
import { PF_ICON_NAMES } from '../PfIcon/paths';
import PfAvatar from './index.vue';

const sizes = [
  '3xs',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
] as const;

const meta = {
  title: 'Element/PfAvatar',
  component: PfAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: [...sizes] },
    icon: { control: 'select', options: [undefined, ...PF_ICON_NAMES] },
    chip: { control: 'boolean' },
    fetchPriority: {
      control: 'select',
      options: [undefined, 'high', 'low', 'auto'],
    },
  },
  args: {
    size: 'md',
    src: 'https://github.com/koirodev.png',
    alt: 'Vitaly Koiro',
    loading: 'lazy' as const,
  },
} satisfies Meta<typeof PfAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    components: { PfAvatar },
    setup() {
      return { sizes };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
        <PfAvatar
          v-for="s in sizes"
          :key="s"
          :size="s"
          src="https://github.com/koirodev.png"
          alt="User"
          loading="lazy"
        />
      </div>
    `,
  }),
};

export const IconFallback: Story = {
  args: {
    src: undefined,
    icon: 'picture',
    alt: undefined,
  },
};

export const TextFallback: Story = {
  args: {
    src: undefined,
    text: '+1',
    alt: undefined,
  },
};

export const InitialsFallback: Story = {
  args: {
    src: undefined,
    alt: 'Vitaly Koiro',
  },
};

export const WithChip: Story = {
  args: {
    chip: true,
  },
};

export const ChipSuccess: Story = {
  args: {
    chip: { color: 'success' },
  },
};

export const ImageErrorFallback: Story = {
  args: {
    src: 'https://example.invalid/no-image.png',
    alt: 'Jane Doe',
  },
};

const squircleMaskStyle = {
  maskImage: `url("data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M100 0C20 0 0 20 0 100s20 100 100 100 100-20 100-100S180 0 100 0Z'/%3e%3c/svg%3e")`,
  maskSize: 'contain',
  maskPosition: 'center',
  maskRepeat: 'no-repeat',
} as const;

export const SquircleMask: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/739984?v=4',
    alt: 'User',
    loading: 'lazy',
    style: { ...squircleMaskStyle },
  },
};
