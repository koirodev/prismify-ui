import type { Meta, StoryObj } from '@storybook/vue3';
import PfDashboardSearch from './index.vue';
import { ref } from 'vue';

const meta = {
  title: 'Dashboard/PfDashboardSearch',
  component: PfDashboardSearch,
  tags: ['autodocs'],
} satisfies Meta<typeof PfDashboardSearch>;

export default meta;

export const Default: StoryObj<typeof PfDashboardSearch> = {
  render: () => ({
    components: { PfDashboardSearch },
    setup() {
      const open = ref(true);
      return { open };
    },
    template: `
      <PfDashboardSearch
        v-model:open="open"
        :groups="[
          { label: 'General', items: [{ label: 'Open inbox' }, { label: 'Open calendar' }] }
        ]"
      />
    `,
  }),
};
