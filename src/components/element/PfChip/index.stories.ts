import type { Meta, StoryObj } from '@storybook/vue3';
import PfAvatar from '../PfAvatar/index.vue';
import PfButton from '../PfButton/index.vue';
import PfChip from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;

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

const positions = [
  'top-right',
  'bottom-right',
  'top-left',
  'bottom-left',
] as const;

const meta = {
  title: 'Element/PfChip',
  component: PfChip,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    size: { control: 'select', options: [...sizes] },
    position: { control: 'select', options: [...positions] },
    inset: { control: 'boolean' },
    standalone: { control: 'boolean' },
    show: { control: 'boolean' },
    text: { control: 'text' },
    as: { control: 'text' },
  },
  args: {
    color: 'primary',
    size: 'md',
    position: 'top-right',
    inset: false,
    standalone: false,
    show: true,
    text: undefined as string | number | undefined,
  },
} satisfies Meta<typeof PfChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => ({
    components: { PfButton, PfChip },
    setup() {
      return { args };
    },
    template: `
      <PfChip
        :show="args.show"
        :as="args.as"
        :text="args.text"
        :color="args.color"
        :size="args.size"
        :position="args.position"
        :inset="args.inset"
        :standalone="args.standalone"
      >
        <PfButton icon="at" color="neutral" variant="subtle" aria-label="Email" />
      </PfChip>
    `,
  }),
};

export const OnAvatarInset: Story = {
  args: { inset: true, color: 'success', size: 'md' },
  render: (args) => ({
    components: { PfAvatar, PfChip },
    setup() {
      return { args };
    },
    template: `
      <PfChip
        :text="args.text"
        :color="args.color"
        :size="args.size"
        :position="args.position"
        :inset="args.inset"
        :standalone="args.standalone"
        :show="args.show"
      >
        <PfAvatar text="AB" size="lg" />
      </PfChip>
    `,
  }),
};

export const WithNumericText: Story = {
  args: { text: 5, size: '3xl', color: 'error' },
  render: (args) => ({
    components: { PfButton, PfChip },
    setup() {
      return { args };
    },
    template: `
      <PfChip
        :text="args.text"
        :color="args.color"
        :size="args.size"
        :position="args.position"
        :inset="args.inset"
        :standalone="args.standalone"
        :show="args.show"
      >
        <PfButton icon="at" color="neutral" variant="subtle" aria-label="Email" />
      </PfChip>
    `,
  }),
};

export const StandaloneInset: Story = {
  args: { standalone: true, inset: true, color: 'primary', size: 'md' },
  render: (args) => ({
    components: { PfChip },
    setup() {
      return { args };
    },
    template: `
      <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
        <span>Status:</span>
        <PfChip
          :standalone="args.standalone"
          :inset="args.inset"
          :color="args.color"
          :size="args.size"
          :show="args.show"
        />
      </span>
    `,
  }),
};

export const BottomLeft: Story = {
  args: { position: 'bottom-left', color: 'warning' },
  render: (args) => ({
    components: { PfButton, PfChip },
    setup() {
      return { args };
    },
    template: `
      <PfChip
        :text="args.text"
        :color="args.color"
        :size="args.size"
        :position="args.position"
        :inset="args.inset"
        :standalone="args.standalone"
        :show="args.show"
      >
        <PfButton label="Action" color="neutral" variant="outline" />
      </PfChip>
    `,
  }),
};
