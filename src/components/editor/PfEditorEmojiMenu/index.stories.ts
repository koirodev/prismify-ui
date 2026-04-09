import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { Emoji, gitHubEmojis } from '@tiptap/extension-emoji';
import PfEditor from '../PfEditor/index.vue';
import PfEditorEmojiMenu from './index.vue';
import type { PfEditorEmojiMenuItem } from '../utils/types';

const meta: Meta<typeof PfEditorEmojiMenu> = {
  title: 'Editor/PfEditorEmojiMenu',
  component: PfEditorEmojiMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: PfEditorEmojiMenuItem[] = gitHubEmojis.filter(
  (emoji) => !emoji.name.startsWith('regional_indicator_')
);

export const Default: Story = {
  render: () => ({
    components: { PfEditor, PfEditorEmojiMenu },
    setup() {
      const value = ref(`Type : to open emoji menu.`);
      return { value, items, extensions: [Emoji] };
    },
    template: `
      <PfEditor
        v-model="value"
        content-type="markdown"
        :extensions="extensions"
        placeholder="Type : for emoji..."
        style="max-width: 900px; width: 100%;"
      >
        <template #default="{ editor }">
          <PfEditorEmojiMenu :editor="editor" :items="items" />
        </template>
      </PfEditor>
    `,
  }),
};
