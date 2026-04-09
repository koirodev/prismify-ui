import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfEditor from '../PfEditor/index.vue';
import PfEditorDragHandle from './index.vue';

const meta: Meta<typeof PfEditorDragHandle> = {
  title: 'Editor/PfEditorDragHandle',
  component: PfEditorDragHandle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { PfEditor, PfEditorDragHandle, PfButton },
    setup() {
      const value = ref(`# Drag Handle

Hover near block start and drag to reorder.

Second paragraph block.

Third paragraph block.
`);
      return { value };
    },
    template: `
      <PfEditor v-model="value" content-type="markdown" style="max-width: 900px; width: 100%;">
        <template #default="{ editor }">
          <PfEditorDragHandle :editor="editor" />
        </template>
      </PfEditor>
    `,
  }),
};
