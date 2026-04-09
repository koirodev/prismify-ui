import type { Meta, StoryObj } from '@storybook/vue3';
import PfLink from './index.vue';

const meta: Meta<typeof PfLink> = {
  title: 'Navigation/PfLink',
  component: PfLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    as: { control: 'text' },
    raw: { control: 'boolean' },
    exact: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: '/docs/components/link',
  },
  render: (args) => ({
    components: { PfLink },
    setup() {
      return { args };
    },
    template: '<PfLink v-bind="args">Documentation link</PfLink>',
  }),
};

export const NoTo_Button: Story = {
  args: {
    as: 'button',
    type: 'button',
  },
  render: (args) => ({
    components: { PfLink },
    setup() {
      return { args };
    },
    template: '<PfLink v-bind="args">Action</PfLink>',
  }),
};

export const External: Story = {
  args: {
    to: 'https://example.com',
    target: '_blank',
  },
  render: (args) => ({
    components: { PfLink },
    setup() {
      return { args };
    },
    template: '<PfLink v-bind="args">Example.com</PfLink>',
  }),
};

export const ActiveState: Story = {
  args: {
    to: '/docs/components/link',
    active: true,
  },
  render: (args) => ({
    components: { PfLink },
    setup() {
      return { args };
    },
    template: '<PfLink v-bind="args">Forced active</PfLink>',
  }),
};
