import type { Meta, StoryObj } from '@storybook/vue3';
import PfSeparator from './index.vue';

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

const types = ['solid', 'dashed', 'dotted'] as const;

const meta = {
  title: 'Element/PfSeparator',
  component: PfSeparator,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    size: { control: 'select', options: [...sizes] },
    type: { control: 'select', options: [...types] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
    label: { control: 'text' },
    icon: { control: 'text' },
    as: { control: 'text' },
  },
  args: {
    color: 'neutral',
    size: 'xs',
    type: 'solid',
    orientation: 'horizontal',
    decorative: false,
  },
} satisfies Meta<typeof PfSeparator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfSeparator },
    setup: () => ({ args }),
    template:
      '<div style="width: 320px; max-width: 100%;"><PfSeparator v-bind="args" /></div>',
  }),
};

export const WithLabel: Story = {
  args: { label: 'Hello World' },
  render: (args) => ({
    components: { PfSeparator },
    setup: () => ({ args }),
    template:
      '<div style="width: 320px; max-width: 100%;"><PfSeparator v-bind="args" /></div>',
  }),
};

export const WithIcon: Story = {
  args: { icon: 'star' },
  render: (args) => ({
    components: { PfSeparator },
    setup: () => ({ args }),
    template:
      '<div style="width: 320px; max-width: 100%;"><PfSeparator v-bind="args" /></div>',
  }),
};

export const WithAvatar: Story = {
  args: { avatar: { text: 'AB' } },
  render: (args) => ({
    components: { PfSeparator },
    setup: () => ({ args }),
    template:
      '<div style="width: 320px; max-width: 100%;"><PfSeparator v-bind="args" /></div>',
  }),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { PfSeparator },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; height: 12rem; gap: 0.5rem; align-items: stretch;">
        <span style="flex: 1;">Left</span>
        <PfSeparator v-bind="args" />
        <span style="flex: 1;">Right</span>
      </div>
    `,
  }),
};

export const TypesAndSizes: Story = {
  render: () => ({
    components: { PfSeparator },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 360px;">
        <PfSeparator type="solid" size="sm" />
        <PfSeparator type="dashed" size="md" />
        <PfSeparator type="dotted" size="lg" label="Dotted" />
      </div>
    `,
  }),
};

export const Colors: Story = {
  render: () => ({
    components: { PfSeparator },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 360px;">
        <PfSeparator color="primary" type="solid" />
        <PfSeparator color="success" type="solid" />
        <PfSeparator color="error" type="solid" />
        <PfSeparator color="neutral" type="solid" />
      </div>
    `,
  }),
};

export const CustomSlot: Story = {
  render: () => ({
    components: { PfSeparator },
    template: `
      <div style="width: 320px;">
        <PfSeparator>
          <span style="font-size: 0.75rem; color: var(--pf-color-muted);">Custom</span>
        </PfSeparator>
      </div>
    `,
  }),
};
