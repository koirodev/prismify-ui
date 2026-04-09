import type { Meta, StoryObj } from '@storybook/vue3';
import { computed, ref } from 'vue';
import PfContextMenu from './index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfContextMenuItem } from './types';

/**
 * Storybook injects all component props into `args`; `open` is often
 * `false`, so in “controlled” mode the menu never opens on right-click.
 */
function menuArgsForStory(args: object) {
  return computed(() => {
    const {
      open: _o,
      defaultOpen: _d,
      items: _i,
      portal: _p,
      ...rest
    } = args as Record<string, unknown>;
    return rest;
  });
}

const defaultDemoItems: PfContextMenuItem[][] = [
  [
    {
      label: 'Appearance',
      children: [
        [
          { label: 'System', icon: 'laptop' },
          { label: 'Light', icon: 'sun' },
          { label: 'Dark', icon: 'moon' },
        ],
      ],
    },
  ],
  [
    {
      label: 'Show Sidebar',
      kbds: ['meta', 's'],
    },
    {
      label: 'Show Toolbar',
      kbds: ['shift', 'meta', 'd'],
    },
    {
      label: 'Collapse Pinned Tabs',
      disabled: true,
    },
  ],
  [
    { label: 'Refresh the Page' },
    { label: 'Clear Cookies and Refresh' },
    { label: 'Clear Cache and Refresh' },
    { type: 'separator' },
    {
      label: 'Developer',
      children: [
        [
          {
            label: 'View Source',
            kbds: ['meta', 'shift', 'u'],
          },
          {
            label: 'Developer Tools',
            kbds: ['option', 'meta', 'i'],
          },
          {
            label: 'Inspect Elements',
            kbds: ['option', 'meta', 'c'],
          },
        ],
        [
          {
            label: 'JavaScript Console',
            kbds: ['option', 'meta', 'j'],
          },
        ],
      ],
    },
  ],
];

const demoAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '16 / 9',
  width: '18rem',
  borderRadius: 'var(--pf-radius-md)',
  borderWidth: '1px',
  borderStyle: 'dashed',
  borderColor: 'var(--pf-input-border)',
  color: 'var(--pf-input-muted)',
  fontSize: 'var(--pf-font-size-sm)',
};

const meta: Meta<typeof PfContextMenu> = {
  title: 'Overlay/PfContextMenu',
  component: PfContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      exclude: ['open', 'defaultOpen', 'items', 'ui', 'portal'],
    },
    docs: {
      description: {
        component:
          'Right-click the dashed area to open the menu. If you do not see it in Canvas, open the **OpenedOnLoad** story (menu open on load) to verify layout only. Storybook preview often applies `transform` on the root; the overlay teleports to the iframe `document.body`. Do not set `open`/`portal` manually in Controls.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    modal: { control: 'boolean' },
    disabled: { control: 'boolean' },
    pressOpenDelay: {
      control: { type: 'number', min: 0, max: 500, step: 25 },
    },
    items: { control: false },
    ui: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    portal: { control: false },
    checkedIcon: { control: false },
    externalIcon: { control: false },
  },
  args: {
    size: 'md',
    modal: true,
    disabled: false,
    pressOpenDelay: 200,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const items = ref<PfContextMenuItem[][]>(
        JSON.parse(JSON.stringify(defaultDemoItems)) as PfContextMenuItem[][]
      );
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items">
        <div :style="demoAreaStyle">Right click here</div>
      </PfContextMenu>
    `,
  }),
};

/** Verifies the panel renders (no right-click). If visible here but not in Default — preview / RMB handling is interfering. */
export const OpenedOnLoad: Story = {
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const items = ref<PfContextMenuItem[][]>(
        JSON.parse(JSON.stringify(defaultDemoItems)) as PfContextMenuItem[][]
      );
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items" default-open>
        <div :style="demoAreaStyle">Menu already open; right-click sets a new position</div>
      </PfContextMenu>
    `,
  }),
};

export const SizeXl: Story = {
  args: {
    size: 'xl',
  },
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const items = ref<PfContextMenuItem[]>([
        { label: 'System', icon: 'laptop' },
        { label: 'Light', icon: 'sun' },
        { label: 'Dark', icon: 'moon' },
      ]);
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items">
        <div :style="demoAreaStyle">Right click here</div>
      </PfContextMenu>
    `,
  }),
};

export const ModalFalse: Story = {
  args: {
    modal: false,
  },
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const items = ref<PfContextMenuItem[]>([
        { label: 'System', icon: 'laptop' },
        { label: 'Light', icon: 'sun' },
        { label: 'Dark', icon: 'moon' },
      ]);
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items">
        <div :style="demoAreaStyle">Right click here</div>
      </PfContextMenu>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const items = ref<PfContextMenuItem[]>([
        { label: 'System', icon: 'laptop' },
        { label: 'Light', icon: 'sun' },
        { label: 'Dark', icon: 'moon' },
      ]);
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items">
        <div :style="demoAreaStyle">Right click here</div>
      </PfContextMenu>
    `,
  }),
};

export const CheckboxItems: Story = {
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const showSidebar = ref(true);
      const showToolbar = ref(false);
      const items = computed<PfContextMenuItem[]>(() => [
        { label: 'View', type: 'label' },
        { type: 'separator' },
        {
          label: 'Show Sidebar',
          type: 'checkbox',
          checked: showSidebar.value,
          onUpdateChecked(c: boolean) {
            showSidebar.value = c;
          },
          onSelect(e: Event) {
            e.preventDefault();
          },
        },
        {
          label: 'Show Toolbar',
          type: 'checkbox',
          checked: showToolbar.value,
          onUpdateChecked(c: boolean) {
            showToolbar.value = c;
          },
        },
        {
          label: 'Collapse Pinned Tabs',
          type: 'checkbox',
          disabled: true,
        },
      ]);
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items" :ui="{ content: 'pfStoryContextMenuNarrow' }">
        <div :style="demoAreaStyle">Right click here</div>
      </PfContextMenu>
    `,
  }),
};

export const ColorItems: Story = {
  render: (args) => ({
    components: { PfContextMenu },
    setup() {
      const items = ref<PfContextMenuItem[][]>([
        [
          { label: 'View', icon: 'eye' },
          { label: 'Copy', icon: 'copy' },
          { label: 'Edit', icon: 'pencil' },
        ],
        [{ label: 'Delete', color: 'error', icon: 'trash' }],
      ]);
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items" :ui="{ content: 'pfStoryContextMenuNarrow' }">
        <div :style="demoAreaStyle">Right click here</div>
      </PfContextMenu>
    `,
  }),
};

export const CustomSlot: Story = {
  render: (args) => ({
    components: { PfContextMenu, PfIcon },
    setup() {
      const loading = ref(true);
      const items = ref<PfContextMenuItem[]>([
        { label: 'Refresh the Page', slot: 'refresh' },
        { label: 'Clear Cookies and Refresh' },
        { label: 'Clear Cache and Refresh' },
      ]);
      const menuArgs = menuArgsForStory(args);
      return { menuArgs, loading, items, demoAreaStyle };
    },
    template: `
      <PfContextMenu v-bind="menuArgs" :items="items" :ui="{ content: 'pfStoryContextMenuNarrow' }">
        <div :style="demoAreaStyle">Right click here</div>
        <template #refresh-label>
          {{ loading ? 'Refreshing…' : 'Refresh the Page' }}
        </template>
        <template #refresh-trailing>
          <PfIcon v-if="loading" name="spinner" class="pfStoryContextMenuSpin" />
        </template>
      </PfContextMenu>
    `,
  }),
};
