import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfButton from '../PfButton/index.vue';
import PfCollapsible from './index.vue';

const meta = {
  title: 'Element/PfCollapsible',
  component: PfCollapsible,
  tags: ['autodocs'],
  argTypes: {
    unmountOnHide: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    open: { control: 'boolean' },
  },
  args: {
    unmountOnHide: true,
    disabled: false,
    defaultOpen: false,
  },
  decorators: [
    () => ({
      template:
        '<div style="width: min(100%, 12rem); margin: 0 auto;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof PfCollapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

const panelStyle =
  'min-height: 8rem; padding: var(--pf-space-md); border-radius: var(--pf-radius-md); background: color-mix(in srgb, var(--pf-color-muted) 14%, var(--pf-color-surface)); font-size: var(--pf-font-size-sm);';

export const Default: Story = {
  render: (args) => ({
    components: { PfCollapsible, PfButton },
    setup() {
      return { args, panelStyle };
    },
    template: `
      <PfCollapsible
        v-bind="args"
        style="display: flex; flex-direction: column; gap: var(--pf-space-sm);"
      >
        <PfButton
          label="Open"
          color="neutral"
          variant="subtle"
          trailing
          trailing-icon="arrowSmallDown"
          block
        />
        <template #content>
          <div :style="panelStyle">Panel content</div>
        </template>
      </PfCollapsible>
    `,
  }),
};

export const KeepMounted: Story = {
  args: { unmountOnHide: false, defaultOpen: false },
  render: (args) => ({
    components: { PfCollapsible, PfButton },
    setup() {
      return { args, panelStyle };
    },
    template: `
      <PfCollapsible
        v-bind="args"
        style="display: flex; flex-direction: column; gap: var(--pf-space-sm);"
      >
        <PfButton
          label="Expand"
          color="neutral"
          variant="subtle"
          trailing
          trailing-icon="arrowSmallDown"
          block
        />
        <template #content>
          <div :style="panelStyle">Content stays in the DOM when collapsed</div>
        </template>
      </PfCollapsible>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { PfCollapsible, PfButton },
    setup() {
      return { args, panelStyle };
    },
    template: `
      <PfCollapsible
        v-bind="args"
        style="display: flex; flex-direction: column; gap: var(--pf-space-sm);"
      >
        <PfButton
          label="Unavailable"
          color="neutral"
          variant="subtle"
          trailing
          trailing-icon="arrowSmallDown"
          block
        />
        <template #content>
          <div :style="panelStyle">Will not open</div>
        </template>
      </PfCollapsible>
    `,
  }),
};

export const ControlledOpen: Story = {
  render: () => ({
    components: { PfCollapsible, PfButton },
    setup() {
      const open = ref(true);
      return { open, panelStyle };
    },
    template: `
      <PfCollapsible
        v-model:open="open"
        :unmount-on-hide="false"
        style="display: flex; flex-direction: column; gap: var(--pf-space-sm);"
      >
        <PfButton
          label="Toggle"
          color="neutral"
          variant="subtle"
          trailing
          trailing-icon="arrowSmallDown"
          block
        />
        <template #content>
          <div :style="panelStyle">State: {{ open ? 'open' : 'closed' }}</div>
        </template>
      </PfCollapsible>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The root has `data-state="open" | "closed"` — style children (e.g. a button icon) via an ancestor selector.',
      },
    },
  },
};
