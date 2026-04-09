import type { Meta, StoryObj } from '@storybook/vue3';
import PfNavigationMenu from './index.vue';
import type { PfNavigationMenuItem } from './index.vue';

const meta: Meta<typeof PfNavigationMenu> = {
  title: 'Navigation/PfNavigationMenu',
  component: PfNavigationMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const horizontalItems: PfNavigationMenuItem[] = [
  {
    label: 'Guide',
    icon: 'book',
    to: '/docs/getting-started',
    children: [
      {
        label: 'Introduction',
        description: 'Getting started materials.',
        icon: 'home',
        to: '/docs/getting-started',
      },
      {
        label: 'Installation',
        description: 'Installation and setup.',
        icon: 'cloud',
        to: '/docs',
      },
    ],
  },
  {
    label: 'Components',
    icon: 'box',
    to: '/docs/components',
    active: true,
    children: [
      {
        label: 'Link',
        description: 'Routable links.',
        to: '/docs/components/link',
      },
      {
        label: 'NavigationMenu',
        description: 'Navigation menu.',
        to: '/docs',
      },
    ],
  },
  {
    label: 'GitHub',
    icon: 'github',
    badge: '6k',
    to: 'https://github.com',
    target: '_blank',
  },
  { label: 'Help', icon: 'info', disabled: true },
];

export const Horizontal: Story = {
  render: () => ({
    components: { PfNavigationMenu },
    setup() {
      return { horizontalItems };
    },
    template:
      '<PfNavigationMenu :items="horizontalItems" style="width: 100%; max-width: 48rem" />',
  }),
};

export const HorizontalHighlight: Story = {
  render: () => ({
    components: { PfNavigationMenu },
    setup() {
      return { horizontalItems };
    },
    template: `
      <PfNavigationMenu
        :items="horizontalItems"
        highlight
        highlight-color="primary"
        variant="link"
        style="width: 100%; max-width: 48rem"
        style="border-bottom: 1px solid var(--pf-border-color)"
      />
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    components: { PfNavigationMenu },
    setup() {
      const items: PfNavigationMenuItem[][] = [
        [
          { label: 'Section', type: 'label' },
          {
            label: 'Guide',
            icon: 'book',
            defaultOpen: true,
            children: [
              {
                label: 'Introduction',
                description: 'Overview.',
                to: '/docs/getting-started',
              },
              {
                label: 'Installation',
                description: 'Installation.',
                to: '/docs',
              },
            ],
          },
          {
            label: 'GitHub',
            icon: 'github',
            to: 'https://github.com',
            target: '_blank',
          },
        ],
        [{ label: 'Help', icon: 'info', disabled: true }],
      ];
      return { items };
    },
    template:
      '<PfNavigationMenu orientation="vertical" :items="items" style="width: 12rem" />',
  }),
};

export const VerticalCollapsed: Story = {
  render: () => ({
    components: { PfNavigationMenu },
    setup() {
      const items: PfNavigationMenuItem[] = [
        { label: 'Home', icon: 'home', to: '/' },
        { label: 'Docs', icon: 'book', to: '/docs' },
      ];
      return { items };
    },
    template: `
      <PfNavigationMenu
        orientation="vertical"
        collapsed
        tooltip
        :items="items"
      />
    `,
  }),
};
