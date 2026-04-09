import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfContentSearch from './index.vue';
import PfContentSearchButton from '../../element/PfContentSearchButton/index.vue';

const meta: Meta<typeof PfContentSearch> = {
  title: 'Overlay/PfContentSearch',
  component: PfContentSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: (args) => ({
    components: { PfContentSearch, PfContentSearchButton },
    setup() {
      const open = ref(false);
      return { args, open };
    },
    template: `
      <div>
        <PfContentSearchButton :collapsed="false" />
        <PfContentSearch v-bind="args" v-model:open="open" />
      </div>
    `,
  }),
  args: {
    links: [
      { label: 'Docs', to: '#docs', icon: 'book' },
      { label: 'Components', to: '#components', icon: 'box' },
    ],
    files: [
      { title: 'Getting Started', path: '/docs/getting-started' },
      { title: 'Theming', path: '/docs/theming' },
    ],
    groups: [
      {
        label: 'Actions',
        items: [{ label: 'Toggle Theme', icon: 'moon' }],
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
