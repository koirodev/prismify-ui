import PfFooter from '../PfFooter/index.vue';
import PfHeader from '../PfHeader/index.vue';
import PfMain from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Layout/PfMain',
  component: PfMain,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PfMain>;

export default meta;

export const Default: StoryObj<typeof PfMain> = {
  render: () => ({
    components: { PfMain },
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;display:flex;flex-direction:column;background:var(--pf-color-surface)">
        <PfMain>
          <div style="padding:var(--pf-space-lg);font:var(--pf-font-sans);color:var(--pf-color-text)">
            Content area: <code dir="ltr">min-height: calc(100vh - var(--pf-header-height))</code>
          </div>
        </PfMain>
      </div>
    `,
  }),
};

export const WithHeaderAndFooter: StoryObj<typeof PfMain> = {
  render: () => ({
    components: { PfHeader, PfMain, PfFooter },
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;display:flex;flex-direction:column;background:var(--pf-color-surface)">
        <PfHeader title="Example" />
        <PfMain style="flex:1">
          <div style="padding:var(--pf-space-lg);font:var(--pf-font-sans);color:var(--pf-color-text)">
            Between header and footer: main page content / <code dir="ltr">NuxtLayout</code> + <code dir="ltr">NuxtPage</code>
          </div>
        </PfMain>
        <PfFooter>
          <template #center>Footer</template>
        </PfFooter>
      </div>
    `,
  }),
};

export const AsDiv: StoryObj<typeof PfMain> = {
  render: () => ({
    components: { PfMain },
    template: `
      <div style="--pf-header-height:0px">
        <PfMain as="div">
          <p style="margin:0;font:var(--pf-font-sans);color:var(--pf-color-muted)">Root is <code dir="ltr">div</code> instead of <code dir="ltr">main</code></p>
        </PfMain>
      </div>
    `,
  }),
};
