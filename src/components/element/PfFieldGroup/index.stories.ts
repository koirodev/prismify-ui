import type { Meta, StoryObj } from '@storybook/vue3';
import PfBadge from '../PfBadge/index.vue';
import PfButton from '../PfButton/index.vue';
import PfFieldGroup from './index.vue';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const orientations = ['horizontal', 'vertical'] as const;

const meta = {
  title: 'Element/PfFieldGroup',
  component: PfFieldGroup,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: [...sizes] },
    orientation: { control: 'select', options: [...orientations] },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof PfFieldGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfBadge, PfButton, PfFieldGroup },
    setup() {
      return { args };
    },
    template: `
      <PfFieldGroup v-bind="args">
        <PfButton color="neutral" variant="outline" label="Button" />
        <PfButton color="neutral" variant="outline" icon="arrowSmallDown" icon-only trailing />
      </PfFieldGroup>
    `,
  }),
};

export const SizeXl: Story = {
  args: { size: 'xl' },
  render: Default.render,
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: Default.render,
};

export const WithBadge: Story = {
  render: (args) => ({
    components: { PfBadge, PfButton, PfFieldGroup },
    setup() {
      return { args };
    },
    template: `
      <PfFieldGroup v-bind="args">
        <PfBadge color="neutral" variant="outline" label="https://" />
        <PfButton color="neutral" variant="outline" label="www.example.com" />
      </PfFieldGroup>
    `,
  }),
};

export const MixedSizes: Story = {
  args: { size: 'lg' },
  render: (args) => ({
    components: { PfButton, PfFieldGroup },
    setup() {
      return { args };
    },
    template: `
      <PfFieldGroup v-bind="args">
        <PfButton color="neutral" variant="subtle" label="Large group" />
        <PfButton color="neutral" variant="outline" size="sm" icon="copy" trailing aria-label="Copy" icon-only />
      </PfFieldGroup>
    `,
  }),
};
