import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfDrawer from './index.vue';
import PfButton from '../../element/PfButton/index.vue';

const meta: Meta<typeof PfDrawer> = {
  title: 'Overlay/PfDrawer',
  component: PfDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    overlay: { control: 'boolean' },
    handle: { control: 'boolean' },
    handleOnly: { control: 'boolean' },
    inset: { control: 'boolean' },
    transition: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    modal: { control: 'boolean' },
    shouldScaleBackground: { control: 'boolean' },
    portal: { control: false },
    ui: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
  },
  args: {
    title: 'Drawer title',
    description: 'Short description for the drawer header.',
    direction: 'bottom',
    overlay: true,
    handle: true,
    handleOnly: false,
    inset: false,
    transition: true,
    dismissible: true,
    modal: true,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfDrawer, PfButton },
    setup() {
      return { args };
    },
    template: `
      <PfDrawer v-bind="args">
        <PfButton label="Open drawer" color="neutral" variant="subtle" />
        <template #body>
          <div style="min-height: 10rem">Body content</div>
        </template>
        <template #footer="{ close }">
          <PfButton label="Cancel" color="neutral" variant="outline" @click="close" />
          <PfButton label="Confirm" />
        </template>
      </PfDrawer>
    `,
  }),
};

export const ContentSlot: Story = {
  render: (args) => ({
    components: { PfDrawer, PfButton },
    setup() {
      return { args };
    },
    template: `
      <PfDrawer v-bind="args" title="" description="">
        <PfButton label="Open custom content" color="neutral" variant="subtle" />
        <template #content="{ close }">
          <div style="padding: 1rem; min-width: 16rem;">
            <p style="margin: 0 0 0.75rem 0;">Custom content slot</p>
            <PfButton label="Close" size="sm" @click="close" />
          </div>
        </template>
      </PfDrawer>
    `,
  }),
};

export const DirectionRight: Story = {
  args: {
    direction: 'right',
    title: 'Right drawer',
  },
  render: (args) => ({
    components: { PfDrawer, PfButton },
    setup() {
      return { args };
    },
    template: `
      <PfDrawer v-bind="args">
        <PfButton label="Open" color="neutral" variant="subtle" />
        <template #body>
          <div style="min-width: 12rem; min-height: 12rem;">Side panel</div>
        </template>
      </PfDrawer>
    `,
  }),
};

export const ControlledOpen: Story = {
  render: (args) => ({
    components: { PfDrawer, PfButton },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <PfButton label="Toggle" color="neutral" variant="subtle" @click="open = !open" />
        <PfDrawer v-bind="args" v-model:open="open">
          <PfButton label="Open from trigger" />
          <template #body>
            <div style="min-height: 8rem;">State: {{ open ? 'open' : 'closed' }}</div>
          </template>
        </PfDrawer>
      </div>
    `,
  }),
};

export const NonDismissible: Story = {
  args: {
    dismissible: false,
    handle: false,
  },
  render: (args) => ({
    components: { PfDrawer, PfButton },
    setup() {
      const preventedCount = ref(0);
      const open = ref(true);
      return { args, preventedCount, open };
    },
    template: `
      <PfDrawer v-bind="args" v-model:open="open" @close:prevent="preventedCount++">
        <PfButton label="Open" color="neutral" variant="subtle" />
        <template #body>
          <div style="min-height: 10rem;">
            Try overlay or Escape.<br />
            close:prevent: {{ preventedCount }}
          </div>
        </template>
        <template #footer>
          <PfButton label="Close" @click="open = false" />
        </template>
      </PfDrawer>
    `,
  }),
};
