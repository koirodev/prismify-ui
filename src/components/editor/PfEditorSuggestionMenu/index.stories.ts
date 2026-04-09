import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfEditor from '../PfEditor/index.vue';
import PfEditorSuggestionMenu from './index.vue';
import type { PfEditorSuggestionMenuItem } from '../utils/types';

const meta: Meta<typeof PfEditorSuggestionMenu> = {
  title: 'Editor/PfEditorSuggestionMenu',
  component: PfEditorSuggestionMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: PfEditorSuggestionMenuItem[][] = [
  [
    { type: 'label', label: 'Text' },
    { kind: 'paragraph', label: 'Paragraph', icon: 'text' },
    { kind: 'heading', level: 1, label: 'Heading 1', icon: 'heading1' },
    { kind: 'heading', level: 2, label: 'Heading 2', icon: 'heading2' },
  ],
  [
    { type: 'label', label: 'Blocks' },
    { kind: 'bulletList', label: 'Bullet list', icon: 'list' },
    { kind: 'orderedList', label: 'Numbered list', icon: 'listNumber' },
    { kind: 'blockquote', label: 'Blockquote', icon: 'quote' },
  ],
];

export const Default: Story = {
  render: () => ({
    components: { PfEditor, PfEditorSuggestionMenu },
    setup() {
      const value = ref(`Type / to open suggestion menu.`);
      return { value, items };
    },
    template: `
      <PfEditor v-model="value" content-type="markdown" placeholder="Type / for commands..." style="max-width: 900px; width: 100%;">
        <template #default="{ editor }">
          <PfEditorSuggestionMenu :editor="editor" :items="items" />
        </template>
      </PfEditor>
    `,
  }),
};
