import { ref } from 'vue';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfTextarea from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Form/PfTextarea',
  component: PfTextarea,
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
    variant: {
      control: 'select',
      options: ['outline', 'soft', 'subtle', 'ghost', 'none'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof PfTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { args, v };
    },
    template: '<PfTextarea v-bind="args" v-model="v" style="width: 20rem" />',
  }),
  args: {
    placeholder: 'Enter text…',
    rows: 3,
  },
};

export const Rows: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" :rows="8" placeholder="8 rows" style="width: 20rem" />',
  }),
};

export const Autoresize: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('Long text.\n'.repeat(4).trimEnd());
      return { v };
    },
    template:
      '<PfTextarea v-model="v" autoresize :rows="2" placeholder="Grows with content" style="width: 22rem" />',
  }),
};

export const AutoresizeMaxRows: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" autoresize :maxrows="4" :rows="2" style="width: 22rem" />',
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 20rem;">
        <PfTextarea v-model="v" variant="outline" placeholder="outline" :rows="2" />
        <PfTextarea v-model="v" variant="soft" placeholder="soft" :rows="2" />
        <PfTextarea v-model="v" variant="subtle" placeholder="subtle" :rows="2" />
        <PfTextarea v-model="v" variant="ghost" placeholder="ghost" :rows="2" />
        <PfTextarea v-model="v" variant="none" placeholder="none" :rows="2" />
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" icon="search" :rows="2" placeholder="Search…" style="width: 20rem" />',
  }),
};

export const TrailingIcon: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" trailing icon="mail" :rows="2" placeholder="Message" style="width: 20rem" />',
  }),
};

export const WithAvatar: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template: `
      <PfTextarea
        v-model="v"
        :rows="2"
        :avatar="{ text: 'AB' }"
        placeholder="Comment…"
        style="width: 22rem"
      />
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" loading :rows="2" placeholder="Loading…" style="width: 20rem" />',
  }),
};

export const Highlight: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" color="error" highlight :rows="2" placeholder="Validation error" style="width: 20rem" />',
  }),
};

export const AnimatedTextOff: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" :animated-text="false" :rows="3" placeholder="No character animation" style="width: 20rem" />',
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { PfTextarea },
    setup() {
      const v = ref('Read only');
      return { v };
    },
    template:
      '<PfTextarea v-model="v" disabled :rows="3" style="width: 20rem" />',
  }),
};

export const FieldGroupSize: Story = {
  render: () => ({
    components: { PfFieldGroup, PfTextarea },
    setup() {
      const v = ref('');
      return { v };
    },
    template: `
      <PfFieldGroup size="lg" style="width: 22rem;">
        <PfTextarea v-model="v" :rows="2" placeholder="Size from group" />
      </PfFieldGroup>
    `,
  }),
};
