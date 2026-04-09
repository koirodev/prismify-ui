import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfEditor from './index.vue';

const meta: Meta<typeof PfEditor> = {
  title: 'Editor/PfEditor',
  component: PfEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    contentType: {
      control: 'select',
      options: ['html', 'json', 'markdown'],
    },
    editable: { control: 'boolean' },
  },
  args: {
    contentType: 'markdown',
    editable: true,
    placeholder: "Write, type '/' for commands...",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfEditor },
    setup() {
      const value = ref(`# PfEditor

Type "/" for suggestion menu, "@" for mention menu and ":" for emoji menu.
`);
      return { args, value };
    },
    template: `
      <PfEditor
        v-bind="args"
        v-model="value"
        style="max-width: 900px; width: 100%;"
      />
    `,
  }),
};
