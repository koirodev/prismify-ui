import type { Meta, StoryObj } from '@storybook/vue3';
import PfApp from '../../layout/PfApp/index.vue';
import PfButton from '../../element/PfButton/index.vue';
import { usePfToast } from '../../../composables/usePfToast';
import PfToast from './index.vue';

const meta = {
  title: 'Overlay/PfToast',
  component: PfToast,
  tags: ['autodocs'],
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
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
  args: {
    title: 'Event added to calendar',
    description: 'This event is scheduled for Apr 16, 2026.',
    icon: 'calendar',
    color: 'primary',
    orientation: 'vertical',
  },
} satisfies Meta<typeof PfToast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { PfToast },
    setup() {
      return { args };
    },
    template: `
      <div style="width: min(100%, 24rem);">
        <PfToast v-bind="args" />
      </div>
    `,
  }),
};

export const WithActions: Story = {
  args: {
    color: 'neutral',
    close: true,
    actions: [
      { label: 'Undo', variant: 'soft', color: 'neutral' },
      { label: 'Dismiss', variant: 'ghost', color: 'neutral' },
    ],
  },
};

export const ToasterUsage: Story = {
  render: () => ({
    components: { PfApp, PfButton },
    setup() {
      const toast = usePfToast();

      function showSuccess() {
        toast.add({
          title: 'Saved',
          description: 'Changes were applied successfully.',
          color: 'success',
          icon: 'check',
        });
      }

      function showError() {
        toast.add({
          title: 'Upload failed',
          description: 'Retry the request in a few seconds.',
          color: 'error',
          icon: 'warning',
          actions: [{ label: 'Retry', variant: 'outline', color: 'error' }],
        });
      }

      return { showSuccess, showError };
    },
    template: `
      <PfApp :toaster="{ position: 'bottom-right', duration: 5000, max: 4 }">
        <div style="display:flex;gap:var(--pf-space-sm);">
          <PfButton label="Show success toast" variant="outline" @click="showSuccess" />
          <PfButton label="Show error toast" variant="outline" @click="showError" />
        </div>
      </PfApp>
    `,
  }),
};
