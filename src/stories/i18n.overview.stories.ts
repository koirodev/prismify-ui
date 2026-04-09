import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'i18n/Overview',
  parameters: {
    docs: { disable: true },
  },
} satisfies Meta;

export default meta;

export const Reserved: StoryObj = {
  render: () => ({
    template:
      '<p style="font-family:var(--pf-font-sans);color:var(--pf-color-muted);max-width:28rem;text-align:center;margin:0"><strong>i18n</strong>: language selection, locale formatting — components will be added as the library grows.</p>',
  }),
};
