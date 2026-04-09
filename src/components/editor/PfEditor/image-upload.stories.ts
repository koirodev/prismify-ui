import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import PfEditor from './index.vue';
import PfEditorToolbar from '../PfEditorToolbar/index.vue';
import { PfEditorImageUpload } from './imageUploadExtension';
import type {
  PfEditorCustomHandlers,
  PfEditorToolbarItem,
} from '../utils/types';

const meta: Meta<typeof PfEditor> = {
  title: 'Editor/PfEditorImageUpload',
  component: PfEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const handlers: PfEditorCustomHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) =>
      editor.can().chain().focus().insertContent({ type: 'imageUpload' }).run(),
    execute: (editor: Editor) =>
      editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
  },
};

const items: PfEditorToolbarItem[][] = [
  [{ kind: 'imageUpload', icon: 'image', label: 'Upload image' }],
  [
    { kind: 'mark', mark: 'bold', icon: 'bold' },
    { kind: 'mark', mark: 'italic', icon: 'italic' },
  ],
];

export const Default: Story = {
  render: () => ({
    components: { PfEditor, PfEditorToolbar },
    setup() {
      const value = ref(`# Image Upload

Use toolbar button to insert upload node.
`);
      return { value, handlers, items, extensions: [PfEditorImageUpload] };
    },
    template: `
      <PfEditor
        v-model="value"
        content-type="markdown"
        :handlers="handlers"
        :extensions="extensions"
        style="max-width: 900px; width: 100%;"
      >
        <template #default="{ editor }">
          <PfEditorToolbar :editor="editor" :handlers="handlers" :items="items" />
        </template>
      </PfEditor>
    `,
  }),
};
