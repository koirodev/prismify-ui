import type { Meta, StoryObj } from '@storybook/vue3';
import { computed, ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfStepper from './index.vue';
import type { PfStepperItem } from './index.vue';

const meta: Meta<typeof PfStepper> = {
  title: 'Navigation/PfStepper',
  component: PfStepper,
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
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleItems: PfStepperItem[] = [
  {
    title: 'Address',
    description: 'Add your address here',
    icon: 'rocket',
  },
  {
    title: 'Shipping',
    description: 'Set your preferred shipping method',
    icon: 'palette',
  },
  {
    title: 'Checkout',
    description: 'Confirm your order',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    style: 'width: 100%; max-width: 42rem',
  },
};

export const NeutralColor: Story = {
  args: {
    items: sampleItems,
    color: 'neutral',
    style: 'width: 100%; max-width: 42rem',
  },
};

export const SizeXl: Story = {
  args: {
    items: sampleItems,
    size: 'xl',
    style: 'width: 100%; max-width: 42rem',
  },
};

export const Vertical: Story = {
  args: {
    items: sampleItems,
    orientation: 'vertical',
    style: 'max-width: 24rem',
  },
};

export const Disabled: Story = {
  args: {
    items: sampleItems,
    disabled: true,
    style: 'width: 100%; max-width: 42rem',
  },
};

export const NonLinear: Story = {
  args: {
    items: sampleItems,
    linear: false,
    defaultValue: 0,
    style: 'width: 100%; max-width: 42rem',
  },
};

export const WithControls: Story = {
  render: () => ({
    components: { PfStepper, PfButton },
    setup() {
      const items = sampleItems;
      const stepperRef = ref<InstanceType<typeof PfStepper> | null>(null);
      const canPrev = computed(() => {
        const s = stepperRef.value as unknown as {
          hasPrev?: { value: boolean };
        } | null;
        return s?.hasPrev?.value ?? false;
      });
      const canNext = computed(() => {
        const s = stepperRef.value as unknown as {
          hasNext?: { value: boolean };
        } | null;
        return s?.hasNext?.value ?? false;
      });
      function prev() {
        (stepperRef.value as unknown as { prev?: () => void } | null)?.prev?.();
      }
      function next() {
        (stepperRef.value as unknown as { next?: () => void } | null)?.next?.();
      }
      return { items, stepperRef, canPrev, canNext, prev, next };
    },
    template: `
      <div style="width:100%;max-width:42rem">
        <PfStepper ref="stepperRef" :items="items" :linear="true">
          <template #content="{ item }">
            <div
              style="
                display:flex;
                align-items:center;
                justify-content:center;
                min-height:8rem;
                border-radius:var(--pf-radius-md);
                border:1px dashed var(--pf-border-color);
                color:var(--pf-color-muted);
                font-family:var(--pf-font-sans);
              "
            >
              {{ item?.title }}
            </div>
          </template>
        </PfStepper>
        <div style="display:flex;justify-content:space-between;gap:var(--pf-space-sm);margin-top:var(--pf-space-md)">
          <PfButton
            variant="outline"
            :disabled="!canPrev"
            @click="prev"
          >
            Prev
          </PfButton>
          <PfButton
            variant="solid"
            :disabled="!canNext"
            @click="next"
          >
            Next
          </PfButton>
        </div>
      </div>
    `,
  }),
};

export const VModel: Story = {
  render: () => ({
    components: { PfStepper },
    setup() {
      const items = sampleItems;
      const active = ref(0);
      return { items, active };
    },
    template: `
      <PfStepper v-model="active" :items="items" style="width:100%;max-width:42rem">
        <template #content="{ item }">
          <div
            style="
              display:flex;
              align-items:center;
              justify-content:center;
              min-height:6rem;
              margin-top:var(--pf-space-md);
              color:var(--pf-color-muted);
              font-family:var(--pf-font-sans);
            "
          >
            Active step: {{ item?.title }} (model: {{ active }})
          </div>
        </template>
      </PfStepper>
    `,
  }),
};

export const CustomItemSlots: Story = {
  render: () => ({
    components: { PfStepper },
    setup() {
      const items: PfStepperItem[] = [
        {
          slot: 'address',
          title: 'Address',
          description: 'Add your address here',
          icon: 'rocket',
        },
        {
          slot: 'shipping',
          title: 'Shipping',
          description: 'Set your preferred shipping method',
          icon: 'palette',
        },
        {
          slot: 'checkout',
          title: 'Checkout',
          description: 'Confirm your order',
        },
      ];
      return { items };
    },
    template: `
      <PfStepper :items="items" style="width:100%;max-width:42rem">
        <template #address>
          <div style="min-height:6rem;padding:var(--pf-space-md);border:1px solid var(--pf-border-color);border-radius:var(--pf-radius-md)">Address panel</div>
        </template>
        <template #shipping>
          <div style="min-height:6rem;padding:var(--pf-space-md);border:1px solid var(--pf-border-color);border-radius:var(--pf-radius-md)">Shipping panel</div>
        </template>
        <template #checkout>
          <div style="min-height:6rem;padding:var(--pf-space-md);border:1px solid var(--pf-border-color);border-radius:var(--pf-radius-md)">Checkout panel</div>
        </template>
      </PfStepper>
    `,
  }),
};
