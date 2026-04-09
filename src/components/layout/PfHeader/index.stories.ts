import PfButton from '../../element/PfButton/index.vue';
import PfApp from '../PfApp/index.vue';
import PfHeader from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const navStyle =
  'display:flex;gap:var(--pf-space-md);flex-wrap:wrap;align-items:center;font:var(--pf-font-sans);font-size:var(--pf-font-size-sm)';
const linkStyle =
  'color:var(--pf-color-muted);text-decoration:none;font-weight:var(--pf-font-weight-medium)';
const linkActiveStyle =
  'color:var(--pf-color-primary);text-decoration:none;font-weight:var(--pf-font-weight-bold)';
const mobileNavStyle =
  'display:flex;flex-direction:column;gap:var(--pf-space-sm);font:var(--pf-font-sans)';

const meta = {
  title: 'Layout/PfHeader',
  component: PfHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PfHeader>;

export default meta;

export const Default: StoryObj<typeof PfHeader> = {
  render: () => ({
    components: { PfApp, PfHeader, PfButton },
    setup: () => {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;background:var(--pf-color-surface)">
        <PfApp>
          <PfHeader title="Prismify UI" to="/" v-model:open="open">
            <template #default>
              <nav style="${navStyle}" aria-label="Primary">
                <a href="#" style="${linkActiveStyle}">Docs</a>
                <a href="#" style="${linkStyle}">Components</a>
                <a href="#" style="${linkStyle}">Releases</a>
              </nav>
            </template>
            <template #right>
              <PfButton variant="ghost" color="neutral" size="sm" href="#">GitHub</PfButton>
            </template>
            <template #body>
              <nav style="${mobileNavStyle}" aria-label="Mobile menu">
                <a href="#" style="${linkActiveStyle}">Docs</a>
                <a href="#" style="${linkStyle}">Components</a>
                <a href="#" style="${linkStyle}">Releases</a>
              </nav>
            </template>
          </PfHeader>
          <main style="padding:var(--pf-space-xl);font:var(--pf-font-sans);color:var(--pf-color-text)">
            <p style="margin:0">Page content below the sticky header.</p>
          </main>
        </PfApp>
      </div>
    `,
  }),
};

export const TitleSlot: StoryObj<typeof PfHeader> = {
  render: () => ({
    components: { PfApp, PfHeader, PfButton },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;background:var(--pf-color-surface)">
        <PfApp>
          <PfHeader title="Prismify UI" to="/" v-model:open="open">
            <template #title>
              <span style="font:var(--pf-font-sans);font-weight:var(--pf-font-weight-bold);font-size:var(--pf-font-size-lg);color:var(--pf-color-primary)">Logo</span>
            </template>
            <template #default>
              <nav style="${navStyle}"><a href="#" style="${linkStyle}">Section</a></nav>
            </template>
            <template #body>
              <nav style="${mobileNavStyle}"><a href="#" style="${linkStyle}">Section</a></nav>
            </template>
          </PfHeader>
        </PfApp>
      </div>
    `,
  }),
};

export const LeftSlot: StoryObj<typeof PfHeader> = {
  render: () => ({
    components: { PfApp, PfHeader },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;background:var(--pf-color-surface)">
        <PfApp>
          <PfHeader v-model:open="open">
            <template #left>
              <a href="/docs" style="font:var(--pf-font-sans);font-weight:var(--pf-font-weight-bold);text-decoration:none;color:var(--pf-color-text)">Custom brand</a>
            </template>
            <template #default>
              <nav style="${navStyle}"><a href="#" style="${linkStyle}">Item</a></nav>
            </template>
            <template #body>
              <nav style="${mobileNavStyle}"><a href="#" style="${linkStyle}">Item</a></nav>
            </template>
          </PfHeader>
        </PfApp>
      </div>
    `,
  }),
};

export const ToggleLeft: StoryObj<typeof PfHeader> = {
  render: () => ({
    components: { PfApp, PfHeader },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;background:var(--pf-color-surface)">
        <PfApp>
          <PfHeader toggle-side="left" v-model:open="open" title="Menu on the left" to="/">
            <template #default>
              <nav style="${navStyle}"><a href="#" style="${linkStyle}">Center</a></nav>
            </template>
            <template #body>
              <nav style="${mobileNavStyle}"><a href="#" style="${linkStyle}">Item</a></nav>
            </template>
          </PfHeader>
        </PfApp>
      </div>
    `,
  }),
};

export const CustomToggleButton: StoryObj<typeof PfHeader> = {
  render: () => ({
    components: { PfApp, PfHeader },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;background:var(--pf-color-surface)">
        <PfApp>
          <PfHeader
            v-model:open="open"
            title="Custom toggle"
            to="/"
            :toggle="{ color: 'primary', variant: 'soft', square: true }"
          >
            <template #default>
              <nav style="${navStyle}"><a href="#" style="${linkStyle}">Center</a></nav>
            </template>
            <template #body>
              <nav style="${mobileNavStyle}"><a href="#" style="${linkStyle}">Item</a></nav>
            </template>
          </PfHeader>
        </PfApp>
      </div>
    `,
  }),
};

export const ContentSlot: StoryObj<typeof PfHeader> = {
  render: () => ({
    components: { PfApp, PfHeader, PfButton },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="--pf-header-height:3.5rem;min-height:100vh;background:var(--pf-color-surface)">
        <PfApp>
          <PfHeader v-model:open="open" title="Full content slot" to="/">
            <template #default>
              <nav style="${navStyle}"><a href="#" style="${linkStyle}">Center</a></nav>
            </template>
            <template #content>
              <div style="display:flex;flex-direction:column;height:100%;padding:var(--pf-space-xl);gap:var(--pf-space-md);font:var(--pf-font-sans)">
                <p style="margin:0;color:var(--pf-color-muted)">The <code>content</code> slot replaces the panel chrome and <code>body</code>.</p>
                <PfButton variant="outline" color="neutral" @click="open = false">Close</PfButton>
              </div>
            </template>
          </PfHeader>
        </PfApp>
      </div>
    `,
  }),
};
