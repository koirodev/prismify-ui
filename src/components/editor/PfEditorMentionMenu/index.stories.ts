import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfEditor from '../PfEditor/index.vue';
import PfEditorMentionMenu from './index.vue';
import type { PfEditorMentionMenuItem } from '../utils/types';

const meta: Meta<typeof PfEditorMentionMenu> = {
  title: 'Editor/PfEditorMentionMenu',
  component: PfEditorMentionMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: PfEditorMentionMenuItem[] = [
  {
    label: 'koirodev',
    avatar: {
      src: 'https://github.com/koirodev.png',
      loading: 'lazy',
    },
  },
  {
    label: 'koirodev1',
    avatar: {
      src: 'https://github.com/koirodev.png',
      loading: 'lazy',
    },
  },
  {
    label: 'koirodev2',
    avatar: {
      src: 'https://github.com/koirodev.png',
      loading: 'lazy',
    },
  },
  {
    label: 'koirodev3',
    avatar: {
      src: 'https://github.com/koirodev.png',
      loading: 'lazy',
    },
  },
];

export const Default: Story = {
  render: () => ({
    components: { PfEditor, PfEditorMentionMenu },
    setup() {
      const value = ref(`Type @ to mention someone.`);
      return { value, items };
    },
    template: `
      <PfEditor v-model="value" content-type="markdown" placeholder="Type @ to mention..." style="max-width: 900px; width: 100%;">
        <template #default="{ editor }">
          <PfEditorMentionMenu :editor="editor" :items="items" />
        </template>
      </PfEditor>
    `,
  }),
};
