import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfAccordion from './index.vue';
import type { PfAccordionItem } from './index.vue';

const meta: Meta<typeof PfAccordion> = {
  title: 'Data/PfAccordion',
  component: PfAccordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
    collapsible: { control: 'boolean' },
    unmountOnHide: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleItems: PfAccordionItem[] = [
  {
    label: 'Is prismify-ui free?',
    content:
      'Yes — an open package of components for Vue 3 and Nuxt 4. Import `style.css` and use the Pf prefix.',
  },
  {
    label: 'Do I need Nuxt?',
    content:
      'No: the library is a standard Vue plugin. For Nuxt, import styles and register the plugin.',
  },
  {
    label: 'Where is theming?',
    content:
      '`--pf-*` tokens on `:root`; override after loading `prismify-ui/style.css`.',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    style: 'max-width: 32rem',
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        label: 'Icons',
        icon: 'smile',
        content:
          'Leading icon is set with the `icon` field (`PfIcon` glyph name).',
      },
      {
        label: 'Colors',
        icon: 'palette',
        content: 'Theming via CSS variables.',
      },
      {
        label: 'Components',
        icon: 'box',
        content: 'Pf prefix and BEM in markup.',
      },
    ] satisfies PfAccordionItem[],
    style: 'max-width: 32rem',
  },
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    items: sampleItems,
    style: 'max-width: 32rem',
  },
};

export const NotCollapsible: Story = {
  args: {
    collapsible: false,
    defaultValue: '0',
    items: sampleItems,
    style: 'max-width: 32rem',
  },
};

/** Unmount content when collapsed (no height animation); default is smooth expand. */
export const UnmountWhenCollapsed: Story = {
  args: {
    unmountOnHide: true,
    items: sampleItems,
    style: 'max-width: 32rem',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    items: sampleItems,
    style: 'max-width: 32rem',
  },
};

export const ItemDisabled: Story = {
  args: {
    items: [
      sampleItems[0],
      { ...sampleItems[1], disabled: true },
      sampleItems[2],
    ],
    style: 'max-width: 32rem',
  },
};

export const TrailingIcon: Story = {
  args: {
    trailingIcon: 'arrowSmallRight',
    items: [
      {
        label: 'Custom item icon',
        content: 'Second item uses `trailingIcon: plus`.',
        trailingIcon: 'plus',
      },
      ...sampleItems.slice(1),
    ],
    style: 'max-width: 32rem',
  },
};

export const Controlled: Story = {
  render: () => ({
    components: { PfAccordion },
    setup() {
      const active = ref('0');
      const items = sampleItems;
      return { active, items };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--pf-space-md); max-width: 32rem;">
        <PfAccordion v-model="active" :items="items" />
        <span style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted);">
          Active value: {{ active }}
        </span>
      </div>
    `,
  }),
};

export const BodySlot: Story = {
  render: () => ({
    components: { PfAccordion },
    setup() {
      const items: PfAccordionItem[] = [
        { label: 'Section A' },
        { label: 'Section B' },
      ];
      return { items };
    },
    template: `
      <PfAccordion :items="items" style="max-width: 32rem;">
        <template #body="{ item }">
          Text for “{{ item.label }}” via the body slot.
        </template>
      </PfAccordion>
    `,
  }),
};

export const CustomItemSlot: Story = {
  render: () => ({
    components: { PfAccordion },
    setup() {
      const items = [
        {
          label: 'Default',
          content: 'String content.',
        },
        {
          label: 'Custom slot',
          slot: 'special' as const,
          content: 'Hidden when #special is provided',
        },
        {
          label: 'Third',
          content: 'Content again.',
        },
      ] satisfies PfAccordionItem[];
      return { items };
    },
    template: `
      <PfAccordion :items="items" style="max-width: 32rem;">
        <template #special="{ item }">
          <p style="margin: 0; font-size: var(--pf-font-size-sm); color: var(--pf-color-primary);">
            {{ item.content }}
          </p>
        </template>
      </PfAccordion>
    `,
  }),
};
