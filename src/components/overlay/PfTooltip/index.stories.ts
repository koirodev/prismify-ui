import type { Meta, StoryObj } from '@storybook/vue3';
import { computed, ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfTooltip from './index.vue';

const meta: Meta<typeof PfTooltip> = {
  title: 'Overlay/PfTooltip',
  component: PfTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    text: { control: 'text' },
    delayDuration: { control: { type: 'number', min: 0, max: 2000, step: 50 } },
    disabled: { control: 'boolean' },
    arrow: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    kbds: { control: false },
    content: { control: false },
    portal: { control: false },
    reference: { control: false },
    ui: { control: false },
    open: { control: false },
    disableHoverableContent: { control: 'boolean' },
    disableClosingTrigger: { control: 'boolean' },
    ignoreNonKeyboardFocus: { control: 'boolean' },
  },
  args: {
    text: 'Open on GitHub',
    delayDuration: 700,
    disabled: false,
    arrow: false,
    defaultOpen: false,
    disableHoverableContent: false,
    disableClosingTrigger: false,
    ignoreNonKeyboardFocus: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfTooltip, PfButton },
    setup: () => ({ args }),
    template: `
      <PfTooltip v-bind="args">
        <PfButton variant="subtle">Open</PfButton>
      </PfTooltip>
    `,
  }),
};

export const WithKbds: Story = {
  render: () => ({
    components: { PfTooltip, PfButton },
    template: `
      <PfTooltip text="Open on GitHub" :kbds="['meta', 'k']">
        <PfButton variant="subtle">Keyboard shortcut</PfButton>
      </PfTooltip>
    `,
  }),
};

export const WithArrow: Story = {
  args: { arrow: true },
  render: (args) => ({
    components: { PfTooltip, PfButton },
    setup: () => ({ args }),
    template: `
      <PfTooltip v-bind="args">
        <PfButton variant="subtle">Hover me</PfButton>
      </PfTooltip>
    `,
  }),
};

export const ControlledOpen: Story = {
  render: () => ({
    components: { PfTooltip, PfButton },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:var(--pf-space-sm);">
        <PfButton @click="open = !open">
          Toggle tooltip
        </PfButton>
        <PfTooltip v-model:open="open" text="Controlled tooltip">
          <PfButton variant="subtle">Target</PfButton>
        </PfTooltip>
      </div>
    `,
  }),
};

export const FollowCursor: Story = {
  render: () => ({
    components: { PfTooltip },
    setup() {
      const open = ref(false);
      const anchor = ref({ x: 0, y: 0 });

      const reference = computed(() => ({
        getBoundingClientRect: () =>
          ({
            width: 0,
            height: 0,
            left: anchor.value.x,
            right: anchor.value.x,
            top: anchor.value.y,
            bottom: anchor.value.y,
            x: anchor.value.x,
            y: anchor.value.y,
          }) as DOMRect,
      }));

      function onMove(ev: PointerEvent) {
        anchor.value = { x: ev.clientX, y: ev.clientY };
      }

      return { open, reference, onMove };
    },
    template: `
      <PfTooltip
        :open="open"
        :reference="reference"
        text="Cursor tooltip"
        :content="{ side: 'top', sideOffset: 14, updatePositionStrategy: 'always' }"
      >
        <div
          style="
            display:flex;
            align-items:center;
            justify-content:center;
            border:1px dashed var(--pf-border-color);
            color:var(--pf-color-muted);
            border-radius:var(--pf-radius-md);
            width:18rem;
            aspect-ratio:16 / 9;
          "
          @pointerenter="open = true"
          @pointerleave="open = false"
          @pointermove="onMove"
        >
          Hover me
        </div>
      </PfTooltip>
    `,
  }),
};
