import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfTree from './index.vue';
import type { PfTreeItem } from './treeTypes';

const meta: Meta<typeof PfTree> = {
  title: 'Data/PfTree',
  component: PfTree,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
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
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    nested: { control: 'boolean' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const fileTree: PfTreeItem[] = [
  {
    label: 'app/',
    defaultExpanded: true,
    children: [
      {
        label: 'composables/',
        children: [
          { label: 'useAuth.ts', icon: 'file' },
          { label: 'useUser.ts', icon: 'file' },
        ],
      },
      {
        label: 'components/',
        defaultExpanded: true,
        children: [
          { label: 'Card.vue', icon: 'file' },
          { label: 'Button.vue', icon: 'file' },
        ],
      },
    ],
  },
  { label: 'app.vue', icon: 'file' },
  { label: 'nuxt.config.ts', icon: 'file' },
];

export const Default: Story = {
  args: {
    items: fileTree,
    style: 'min-width: 18rem',
  },
};

const sampleImageIcon =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#1493b8"/></svg>'
  );

export const WithImageIcons: Story = {
  args: {
    items: [
      { label: 'logo.png', iconSrc: sampleImageIcon, iconAlt: 'Logo' },
      { label: 'readme.md', icon: 'file' },
    ] satisfies PfTreeItem[],
    style: 'min-width: 18rem',
  },
};

export const NestedFalse: Story = {
  args: {
    items: fileTree,
    nested: false,
    style: 'min-width: 18rem',
  },
};

export const Multiple: Story = {
  args: {
    items: fileTree,
    multiple: true,
    style: 'min-width: 18rem',
  },
};

export const NeutralColor: Story = {
  args: {
    items: fileTree,
    color: 'neutral',
    style: 'min-width: 18rem',
  },
};

export const SizeXl: Story = {
  args: {
    items: fileTree,
    size: 'xl',
    style: 'min-width: 18rem',
  },
};

export const CustomTrailingIcons: Story = {
  args: {
    items: fileTree,
    trailingIcon: 'arrowSmallRight',
    expandedIcon: 'folderAdd',
    collapsedIcon: 'folder',
    style: 'min-width: 18rem',
  },
};

export const Disabled: Story = {
  args: {
    items: fileTree,
    disabled: true,
    style: 'min-width: 18rem',
  },
};

export const VirtualizeScroll: Story = {
  args: {
    items: fileTree,
    virtualize: true,
    style: 'min-width: 18rem; max-height: 12rem',
  },
};

export const ControlledSelection: Story = {
  render: () => ({
    components: { PfTree },
    setup() {
      const items = fileTree;
      const value = ref<string | undefined>();
      return { items, value };
    },
    template:
      '<PfTree v-model="value" :items="items" nested style="min-width: 18rem" />',
  }),
};

export const ControlledExpanded: Story = {
  render: () => ({
    components: { PfTree },
    setup() {
      const items: PfTreeItem[] = [
        {
          label: 'app/',
          id: 'app',
          children: [
            {
              label: 'lib/',
              id: 'app/lib',
              children: [{ label: 'mod.ts', id: 'app/lib/mod' }],
            },
          ],
        },
      ];
      const expanded = ref(['app']);
      function getKeyFromItem(item: PfTreeItem) {
        const r = item as Record<string, unknown>;
        return String(r.id ?? '');
      }
      return { items, expanded, getKeyFromItem };
    },
    template: `
      <PfTree
        v-model:expanded="expanded"
        :items="items"
        :get-key="getKeyFromItem"
        nested
        style="min-width: 18rem"
      />
    `,
  }),
};

export const CustomSlot: Story = {
  render: () => ({
    components: { PfTree },
    setup() {
      const items: PfTreeItem[] = [
        {
          label: 'app/',
          slot: 'app',
          defaultExpanded: true,
          children: [{ label: 'inner.ts', icon: 'file' }],
        },
        { label: 'readme.md', icon: 'file' },
      ];
      return { items };
    },
    template: `
      <PfTree :items="items" nested style="min-width: 18rem">
        <template #app="{ item }">
          <strong>{{ item.label }}</strong>
        </template>
      </PfTree>
    `,
  }),
};
