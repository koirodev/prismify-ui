import PfButton from '../../element/PfButton/index.vue';
import PfFooter from './index.vue';
import PfSeparator from '../../element/PfSeparator/index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Layout/PfFooter',
  component: PfFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof PfFooter>;

export default meta;

export const Default: StoryObj<typeof PfFooter> = {
  render: () => ({
    components: { PfButton, PfFooter, PfSeparator },
    setup() {
      const year = new Date().getFullYear();
      return { year };
    },
    template: `
      <div style="width:100%;min-width:320px;max-width:100vw;background:var(--pf-color-surface);border:1px solid var(--pf-border-color);border-radius:var(--pf-radius-sm);overflow:hidden">
        <PfSeparator type="dashed" />
        <PfFooter>
          <template #left>
            <p style="margin:0;font-size:var(--pf-font-size-sm);color:var(--pf-color-muted);line-height:var(--pf-line-height-md)">
              Copyright © {{ year }}
            </p>
          </template>

          <nav style="display:flex;flex-wrap:wrap;gap:var(--pf-space-md);justify-content:center;font-size:var(--pf-font-size-sm)">
            <a href="https://example.com" style="color:var(--pf-color-muted);text-decoration:none">Figma Kit</a>
            <a href="https://example.com" style="color:var(--pf-color-muted);text-decoration:none">Playground</a>
            <a href="https://example.com" style="color:var(--pf-color-muted);text-decoration:none">Releases</a>
          </nav>

          <template #right>
            <PfButton variant="ghost" color="neutral" icon="link" icon-only aria-label="Link" />
            <PfButton variant="ghost" color="neutral" icon="share" icon-only aria-label="Share" />
          </template>
        </PfFooter>
      </div>
    `,
  }),
};

export const WithTopAndBottom: StoryObj<typeof PfFooter> = {
  render: () => ({
    components: { PfFooter },
    template: `
      <PfFooter>
        <template #top>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--pf-space-lg);font-size:var(--pf-font-size-sm);color:var(--pf-color-muted)">
            <div>
              <div style="font-weight:var(--pf-font-weight-medium);color:var(--pf-color-text);margin-bottom:var(--pf-space-sm)">Product</div>
              <div>Pricing</div>
              <div>Docs</div>
            </div>
            <div>
              <div style="font-weight:var(--pf-font-weight-medium);color:var(--pf-color-text);margin-bottom:var(--pf-space-sm)">Company</div>
              <div>About</div>
              <div>Blog</div>
            </div>
          </div>
        </template>
        <template #left>
          <span style="font-size:var(--pf-font-size-sm);color:var(--pf-color-muted)">© Prismify</span>
        </template>
        <template #default>
          <span style="font-size:var(--pf-font-size-sm);color:var(--pf-color-muted)">Center</span>
        </template>
        <template #bottom>
          <p style="margin:0;text-align:center;font-size:var(--pf-font-size-xs);color:var(--pf-color-muted)">
            Additional legal line in the bottom slot.
          </p>
        </template>
      </PfFooter>
    `,
  }),
};
