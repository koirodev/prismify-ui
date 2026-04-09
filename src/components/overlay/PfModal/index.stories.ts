import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfModal from './index.vue';
import PfButton from '../../element/PfButton/index.vue';

const meta: Meta<typeof PfModal> = {
  title: 'Overlay/PfModal',
  component: PfModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    overlay: { control: 'boolean' },
    scrollable: { control: 'boolean' },
    transition: { control: 'boolean' },
    fullscreen: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    modal: { control: 'boolean' },
    close: { control: 'boolean' },
    portal: { control: false },
    ui: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
  },
  args: {
    title: 'Modal title',
    description: 'Modal description text.',
    overlay: true,
    scrollable: false,
    transition: true,
    fullscreen: false,
    dismissible: true,
    modal: true,
    close: true,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfModal, PfButton },
    setup() {
      return { args };
    },
    template: `
      <PfModal v-bind="args">
        <PfButton label="Open modal" color="neutral" variant="subtle" />
        <template #body>
          <div style="min-height: 10rem">Body content</div>
        </template>
        <template #footer="{ close }">
          <PfButton label="Cancel" color="neutral" variant="outline" @click="close" />
          <PfButton label="Confirm" />
        </template>
      </PfModal>
    `,
  }),
};

export const ContentSlot: Story = {
  render: (args) => ({
    components: { PfModal, PfButton },
    setup() {
      return { args };
    },
    template: `
      <PfModal v-bind="args" title="" description="">
        <PfButton label="Open custom content" color="neutral" variant="subtle" />
        <template #content="{ close }">
          <div style="padding: 1rem; min-width: 20rem;">
            <p style="margin: 0 0 0.75rem 0;">Custom content slot</p>
            <PfButton label="Close" size="sm" @click="close" />
          </div>
        </template>
      </PfModal>
    `,
  }),
};

export const ControlledOpen: Story = {
  render: (args) => ({
    components: { PfModal, PfButton },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <PfButton label="Toggle modal" color="neutral" variant="subtle" @click="open = !open" />
        <PfModal v-bind="args" v-model:open="open">
          <PfButton label="Open from trigger" />
          <template #body>
            <div style="min-height: 8rem;">Current state: {{ open ? 'open' : 'closed' }}</div>
          </template>
        </PfModal>
      </div>
    `,
  }),
};

export const NonDismissible: Story = {
  args: {
    dismissible: false,
  },
  render: (args) => ({
    components: { PfModal, PfButton },
    setup() {
      const preventedCount = ref(0);
      return { args, preventedCount };
    },
    template: `
      <PfModal v-bind="args" @close:prevent="preventedCount++">
        <PfButton label="Open non-dismissible" color="neutral" variant="subtle" />
        <template #body>
          <div style="min-height: 10rem;">
            Try click outside or press Escape.<br />
            close:prevent count: {{ preventedCount }}
          </div>
        </template>
        <template #footer="{ close }">
          <PfButton label="Force close" @click="close" />
        </template>
      </PfModal>
    `,
  }),
};
