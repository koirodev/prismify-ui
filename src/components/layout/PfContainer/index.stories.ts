import PfContainer from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Layout/PfContainer',
  component: PfContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof PfContainer>;

export default meta;

export const Default: StoryObj<typeof PfContainer> = {
  render: () => ({
    components: { PfContainer },
    template: `
      <div style="width:100%;min-width:320px;max-width:100vw;background:color-mix(in srgb,var(--pf-border-color) 35%,var(--pf-color-surface));padding:0">
        <PfContainer>
          <div style="min-height:8rem;border-radius:var(--pf-radius-sm);background:var(--pf-color-surface);border:1px solid var(--pf-border-color);display:flex;align-items:center;justify-content:center;font:var(--pf-font-sans);color:var(--pf-color-muted)">
            Content inside the container
          </div>
        </PfContainer>
      </div>
    `,
  }),
};

export const AsMain: StoryObj<typeof PfContainer> = {
  render: () => ({
    components: { PfContainer },
    template: `
      <PfContainer as="main">
        <p style="margin:0;font:var(--pf-font-sans);color:var(--pf-color-text)">Section in <code dir="ltr">main</code> tag</p>
      </PfContainer>
    `,
  }),
};
