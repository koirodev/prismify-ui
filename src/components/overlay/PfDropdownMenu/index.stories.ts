import type { Meta, StoryObj } from '@storybook/vue3';
import { computed, ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfDropdownMenu from './index.vue';
import type { PfDropdownMenuItem } from './types';

const meta: Meta<typeof PfDropdownMenu> = {
  title: 'Overlay/PfDropdownMenu',
  component: PfDropdownMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    modal: { control: 'boolean' },
    disabled: { control: 'boolean' },
    arrow: { control: 'boolean' },
    filter: { control: 'boolean' },
    content: { control: false },
    ui: { control: false },
  },
  args: {
    size: 'md',
    modal: true,
    disabled: false,
    arrow: false,
    filter: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: PfDropdownMenuItem[][] = [
  [
    {
      label: 'Koirodev',
      type: 'label',
      avatar: {
        src: 'https://github.com/koirodev.png',
        alt: 'Koirodev',
      },
    },
  ],
  [
    { label: 'Profile', icon: 'user' },
    { label: 'Billing', icon: 'creditCard' },
    { label: 'Settings', icon: 'settings', kbds: [','] },
  ],
  [
    {
      label: 'Team',
      icon: 'user',
      filter: { placeholder: 'Search members...' },
      children: [
        [
          { label: 'koirodev' },
          { label: 'Dexter Morgan' },
          { label: 'Harry Potter' },
          { label: 'Hermione Granger' },
        ],
      ],
    },
  ],
  [
    {
      label: 'GitHub',
      icon: 'github',
      to: 'https://github.com/koirodev/prismify-ui',
    },
    { label: 'Support', icon: 'lifeRing' },
    { label: 'API', icon: 'cloud', disabled: true },
  ],
];

export const Default: Story = {
  render: (args) => ({
    components: { PfDropdownMenu, PfButton },
    setup() {
      const items = ref<PfDropdownMenuItem[][]>(
        JSON.parse(JSON.stringify(defaultItems)) as PfDropdownMenuItem[][]
      );
      return { args, items };
    },
    template: `
      <PfDropdownMenu v-bind="args" :items="items">
        <PfButton label="Open menu" icon="menu" variant="outline" />
      </PfDropdownMenu>
    `,
  }),
};

export const WithFilter: Story = {
  args: {
    filter: true,
  },
  render: (args) => ({
    components: { PfDropdownMenu, PfButton },
    setup() {
      const items = ref<PfDropdownMenuItem[]>([
        { label: 'Profile', icon: 'user' },
        { label: 'Billing', icon: 'creditCard' },
        { label: 'Settings', icon: 'settings' },
        { label: 'Team', icon: 'user' },
      ]);
      return { args, items };
    },
    template: `
      <PfDropdownMenu v-bind="args" :items="items">
        <PfButton label="Open with filter" icon="search" variant="outline" />
      </PfDropdownMenu>
    `,
  }),
};

export const CheckboxItems: Story = {
  render: (args) => ({
    components: { PfDropdownMenu, PfButton },
    setup() {
      const bookmarks = ref(true);
      const history = ref(false);
      const items = computed<PfDropdownMenuItem[]>(() => [
        { label: 'Interface', type: 'label', icon: 'layoutFluid' },
        { type: 'separator' },
        {
          label: 'Show Bookmarks',
          icon: 'bookmark',
          type: 'checkbox',
          checked: bookmarks.value,
          onUpdateChecked: (value: boolean) => (bookmarks.value = value),
          onSelect: (e: Event) => e.preventDefault(),
        },
        {
          label: 'Show History',
          icon: 'clock',
          type: 'checkbox',
          checked: history.value,
          onUpdateChecked: (value: boolean) => (history.value = value),
        },
      ]);
      return { args, items };
    },
    template: `
      <PfDropdownMenu v-bind="args" :items="items">
        <PfButton label="Checkbox items" icon="menuDots" variant="outline" />
      </PfDropdownMenu>
    `,
  }),
};
