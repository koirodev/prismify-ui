import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Layout/Overview',
  parameters: {
    docs: { disable: true },
  },
} satisfies Meta;

export default meta;

export const Reserved: StoryObj = {
  render: () => ({
    template:
      '<p style="font-family:var(--pf-font-sans);color:var(--pf-color-muted);max-width:28rem;text-align:center;margin:0"><strong>Layout</strong>: <strong>PfApp</strong> (global context: locale, <code dir="ltr">dir</code>, portal, settings for future tooltips and toasts), <strong>PfContainer</strong> (centering and max content width via <code dir="ltr">--pf-container-*</code>); grids and the rest of the shell will follow as the library grows.</p>',
  }),
};
