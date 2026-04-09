import type { Meta, StoryObj } from '@storybook/vue3';
import PfContentNavigation from './index.vue';
import type { PfContentNavigationItem } from './index.vue';

const items: PfContentNavigationItem[] = [
  {
    label: 'Getting Started',
    to: '#getting-started',
    children: [
      { label: 'Installation', to: '#installation' },
      { label: 'Quickstart', to: '#quickstart' },
    ],
  },
  {
    label: 'Components',
    to: '#components',
    children: [
      { label: 'Button', to: '#button' },
      { label: 'Modal', to: '#modal' },
    ],
  },
  { label: 'Changelog', to: '#changelog', badge: 'new' },
];

const meta: Meta<typeof PfContentNavigation> = {
  title: 'Navigation/PfContentNavigation',
  component: PfContentNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    items,
    highlight: true,
    variant: 'pill',
    color: 'primary',
  },
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
    variant: { control: 'select', options: ['pill', 'link'] },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Single: Story = {
  args: {
    type: 'single',
    defaultOpen: undefined,
  },
};

export const LinkVariant: Story = {
  args: {
    variant: 'link',
    color: 'neutral',
    highlightColor: 'neutral',
  },
};
