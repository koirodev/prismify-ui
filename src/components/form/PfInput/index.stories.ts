import { ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfInput from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Form/PfInput',
  component: PfInput,
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
    type: { control: 'text' },
  },
} satisfies Meta<typeof PfInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfInput },
    setup() {
      const v = ref('');
      return { args, v };
    },
    template: '<PfInput v-bind="args" v-model="v" style="width: 16rem" />',
  }),
  args: {
    placeholder: 'Enter text…',
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { PfInput },
    setup() {
      const v = ref('Example');
      return { v };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 18rem;">
        <PfInput v-model="v" size="xs" placeholder="xs" />
        <PfInput v-model="v" size="sm" placeholder="sm" />
        <PfInput v-model="v" size="md" placeholder="md" />
        <PfInput v-model="v" size="lg" placeholder="lg" />
        <PfInput v-model="v" size="xl" placeholder="xl" />
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { PfInput },
    setup() {
      const v = ref('');
      return { v };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 18rem;">
        <PfInput v-model="v" variant="outline" placeholder="outline" />
        <PfInput v-model="v" variant="soft" placeholder="soft" />
        <PfInput v-model="v" variant="subtle" placeholder="subtle" />
        <PfInput v-model="v" variant="ghost" placeholder="ghost" />
        <PfInput v-model="v" variant="none" placeholder="none" />
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { PfInput },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfInput v-model="v" icon="search" placeholder="Search…" style="width: 18rem" />',
  }),
};

export const Highlight: Story = {
  render: () => ({
    components: { PfInput },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfInput v-model="v" color="error" highlight placeholder="Validation error" style="width: 18rem" />',
  }),
};

export const AnimatedTextOff: Story = {
  render: () => ({
    components: { PfInput },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfInput v-model="v" :animated-text="false" placeholder="No character animation" style="width: 18rem" />',
  }),
};

export const PasswordToggle: Story = {
  render: () => ({
    components: { PfInput, PfButton },
    setup() {
      const show = ref(false);
      const password = ref('');
      return { show, password };
    },
    template: `
      <PfInput
        v-model="password"
        placeholder="Password"
        :type="show ? 'text' : 'password'"
        :animated-text="show"
        style="width: 18rem"
      >
        <template #trailing>
          <PfButton
            color="neutral"
            variant="link"
            size="sm"
            :icon="show ? 'eyeCrossed' : 'eye'"
            :aria-label="show ? 'Hide password' : 'Show password'"
            icon-only
            @click="show = !show"
          />
        </template>
      </PfInput>
    `,
  }),
};

export const ClearButton: Story = {
  render: () => ({
    components: { PfInput, PfButton },
    setup() {
      const v = ref('Clear');
      return { v };
    },
    template: `
      <PfInput v-model="v" placeholder="Type…" style="width: 18rem">
        <template v-if="v.length" #trailing>
          <PfButton
            color="neutral"
            variant="link"
            size="sm"
            icon="ban"
            aria-label="Clear"
            icon-only
            @click="v = ''"
          />
        </template>
      </PfInput>
    `,
  }),
};

export const InFieldGroup: Story = {
  render: () => ({
    components: { PfFieldGroup, PfInput, PfButton },
    setup() {
      const domain = ref('');
      return { domain };
    },
    template: `
      <PfFieldGroup style="width: 22rem;">
        <PfInput v-model="domain" placeholder="subdomain" />
        <PfButton color="neutral" variant="outline" label=".example.com" />
      </PfFieldGroup>
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    components: { PfInput },
    setup() {
      const v = ref('');
      return { v };
    },
    template:
      '<PfInput v-model="v" loading :trailing="false" placeholder="Loading…" style="width: 18rem" />',
  }),
};
