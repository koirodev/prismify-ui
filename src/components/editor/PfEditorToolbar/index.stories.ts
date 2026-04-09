import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfEditor from '../PfEditor/index.vue';
import PfEditorToolbar from './index.vue';
import type { PfEditorToolbarItem } from '../utils/types';

const meta: Meta<typeof PfEditorToolbar> = {
  title: 'Editor/PfEditorToolbar',
  component: PfEditorToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: PfEditorToolbarItem[][] = [
  [
    { kind: 'undo', icon: 'undo', label: 'Undo' },
    { kind: 'redo', icon: 'redo', label: 'Redo' },
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'bold', label: 'Bold' },
    { kind: 'mark', mark: 'italic', icon: 'italic', label: 'Italic' },
    { kind: 'mark', mark: 'underline', icon: 'underline', label: 'Underline' },
  ],
];

export const Fixed: Story = {
  render: () => ({
    components: { PfEditor, PfEditorToolbar },
    setup() {
      const value = ref(`# Toolbar

Select text and use controls above.
`);
      return { value, items };
    },
    template: `
      <PfEditor v-model="value" content-type="markdown" style="max-width: 900px; width: 100%;">
        <template #default="{ editor }">
          <PfEditorToolbar :editor="editor" :items="items" />
        </template>
      </PfEditor>
    `,
  }),
};

export const Bubble: Story = {
  render: () => ({
    components: { PfEditor, PfEditorToolbar },
    setup() {
      const value = ref(`# Bubble toolbar

Select text to show bubble menu.
`);
      return { value, items };
    },
    template: `
      <PfEditor v-model="value" content-type="markdown" style="max-width: 900px; width: 100%;">
        <template #default="{ editor }">
          <PfEditorToolbar :editor="editor" :items="items" layout="bubble" />
        </template>
      </PfEditor>
    `,
  }),
};
