import type { Meta, StoryObj } from '@storybook/vue3';
import PfButton from '../../element/PfButton/index.vue';
import PfBreadcrumb from './index.vue';
import type { PfBreadcrumbItem } from './index.vue';

const meta: Meta<typeof PfBreadcrumb> = {
  title: 'Navigation/PfBreadcrumb',
  component: PfBreadcrumb,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const basicItems: PfBreadcrumbItem[] = [
  { label: 'Docs', icon: 'book', to: '/docs' },
  { label: 'Components', icon: 'box', to: '/docs' },
  {
    label: 'Breadcrumb',
    icon: 'browser',
    to: '/docs/components/link',
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
  render: (args) => ({
    components: { PfBreadcrumb },
    setup() {
      return { args };
    },
    template: '<PfBreadcrumb v-bind="args" />',
  }),
};

export const CurrentPageWithoutLink: Story = {
  render: () => ({
    components: { PfBreadcrumb },
    setup() {
      const items: PfBreadcrumbItem[] = [
        { label: 'Docs', to: '/docs' },
        { label: 'Breadcrumb' },
      ];
      return { items };
    },
    template: '<PfBreadcrumb :items="items" />',
  }),
};

export const SeparatorSlot: Story = {
  render: () => ({
    components: { PfBreadcrumb },
    setup() {
      const items: PfBreadcrumbItem[] = [
        { label: 'Docs', to: '/docs' },
        { label: 'Section', to: '/docs' },
        { label: 'Page' },
      ];
      return { items };
    },
    template: `
      <PfBreadcrumb :items="items">
        <template #separator>
          <span style="margin: 0 0.5rem; color: var(--pf-color-muted)">/</span>
        </template>
      </PfBreadcrumb>
    `,
  }),
};

export const CustomItemSlot: Story = {
  render: () => ({
    components: { PfBreadcrumb, PfButton },
    setup() {
      const items: PfBreadcrumbItem[] = [
        { label: 'Home', to: '/' },
        {
          slot: 'more',
          icon: 'apps',
          label: 'More',
          children: [
            { label: 'Documentation', to: '/docs' },
            { label: 'Themes' },
          ],
        },
        { label: 'Components', to: '/docs' },
        { label: 'Breadcrumb', to: '/docs/components/link' },
      ];
      return { items };
    },
    template: `
      <PfBreadcrumb :items="items">
        <template #more="{ item }">
          <PfButton variant="ghost" size="sm" :leading-icon="item.icon" icon-only aria-label="More" />
        </template>
      </PfBreadcrumb>
    `,
  }),
};
