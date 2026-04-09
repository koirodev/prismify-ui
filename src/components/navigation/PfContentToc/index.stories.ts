import type { Meta, StoryObj } from '@storybook/vue3';
import PfContentToc from './index.vue';
import type { PfContentTocLink } from './index.vue';

const links: PfContentTocLink[] = [
  { id: 'overview', text: 'Overview' },
  {
    id: 'setup',
    text: 'Setup',
    children: [
      { id: 'install', text: 'Install' },
      { id: 'configuration', text: 'Configuration' },
    ],
  },
  { id: 'api', text: 'API' },
];

const meta: Meta<typeof PfContentToc> = {
  title: 'Navigation/PfContentToc',
  component: PfContentToc,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    title: 'On this page',
    links,
    highlight: true,
  },
  argTypes: {
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
    highlightVariant: { control: 'select', options: ['straight', 'circuit'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CircuitHighlight: Story = {
  args: {
    highlightVariant: 'circuit',
    highlightColor: 'neutral',
    color: 'neutral',
  },
};
