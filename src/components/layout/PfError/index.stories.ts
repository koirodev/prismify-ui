import PfApp from '../PfApp/index.vue';
import PfError from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const sampleError = {
  statusCode: 404,
  statusMessage: 'Page not found',
  message: 'The page you are looking for does not exist.',
};

const meta = {
  title: 'Layout/PfError',
  component: PfError,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PfError>;

export default meta;

export const Default: StoryObj<typeof PfError> = {
  render: (args) => ({
    components: { PfError },
    setup: () => ({ args }),
    template: '<PfError v-bind="args" />',
  }),
  args: {
    error: sampleError,
  },
};

/** In Nuxt, call `clearError({ redirect })` from `#app` in the `@clear` handler. */
export const WithAppShell: StoryObj<typeof PfError> = {
  render: (args) => ({
    components: { PfApp, PfError },
    setup: () => ({ args }),
    template: `
      <PfApp>
        <header
          style="height:56px;display:flex;align-items:center;padding:0 1rem;border-bottom:1px solid var(--pf-border-color);font:var(--pf-font-sans);color:var(--pf-color-text)"
        >
          Header
        </header>
        <PfError v-bind="args" />
      </PfApp>
    `,
  }),
  args: {
    error: sampleError,
  },
  decorators: [
    () => ({
      template: '<div style="--pf-header-height:56px"><story /></div>',
    }),
  ],
};

export const ClearDisabled: StoryObj<typeof PfError> = {
  render: (args) => ({
    components: { PfError },
    setup: () => ({ args }),
    template: '<PfError v-bind="args" />',
  }),
  args: {
    error: sampleError,
    clear: false,
  },
};

export const CustomClearButton: StoryObj<typeof PfError> = {
  render: (args) => ({
    components: { PfError },
    setup: () => ({ args }),
    template: '<PfError v-bind="args" />',
  }),
  args: {
    error: sampleError,
    clear: {
      label: 'Home',
      variant: 'outline',
    },
    redirect: '/',
  },
};
