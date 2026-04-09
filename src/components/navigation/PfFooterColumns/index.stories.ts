import PfContainer from '../../layout/PfContainer/index.vue';
import PfFooter from '../../layout/PfFooter/index.vue';
import PfFooterColumns from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { PfFooterColumn } from './index.vue';

const meta = {
  title: 'Navigation/PfFooterColumns',
  component: PfFooterColumns,
  tags: ['autodocs'],
} satisfies Meta<typeof PfFooterColumns>;

export default meta;

const columns: PfFooterColumn[] = [
  {
    label: 'Community',
    children: [
      {
        label: 'Nuxters',
        to: 'https://nuxters.nuxt.com',
        target: '_blank',
      },
      {
        label: 'Video Courses',
        to: 'https://masteringnuxt.com/nuxt3?ref=nuxt',
        target: '_blank',
      },
      {
        label: 'Nuxt on GitHub',
        to: 'https://github.com/nuxt',
        target: '_blank',
      },
    ],
  },
  {
    label: 'Solutions',
    children: [
      {
        label: 'Nuxt Content',
        to: 'https://content.nuxt.com/',
        target: '_blank',
      },
      {
        label: 'Nuxt DevTools',
        to: 'https://devtools.nuxt.com/',
        target: '_blank',
      },
      {
        label: 'Nuxt Image',
        to: 'https://image.nuxt.com/',
        target: '_blank',
      },
      {
        label: 'Nuxt UI',
        to: 'https://ui.nuxt.com/',
        target: '_blank',
      },
    ],
  },
];

export const Default: StoryObj<typeof PfFooterColumns> = {
  render: () => ({
    components: { PfContainer, PfFooter, PfFooterColumns },
    setup() {
      return { columns };
    },
    template: `
      <PfFooter>
        <template #top>
          <PfContainer>
            <PfFooterColumns :columns="columns" />
          </PfContainer>
        </template>
        <template #left>
          <span style="font-size:var(--pf-font-size-sm);color:var(--pf-color-muted)">© Example</span>
        </template>
      </PfFooter>
    `,
  }),
};

export const WithRightSlot: StoryObj<typeof PfFooterColumns> = {
  render: () => ({
    components: { PfContainer, PfFooter, PfFooterColumns },
    setup() {
      return { columns };
    },
    template: `
      <PfFooter>
        <template #top>
          <PfContainer>
            <PfFooterColumns :columns="columns">
              <template #right>
                <div style="font-size:var(--pf-font-size-sm);color:var(--pf-color-muted);max-width:20rem">
                  Subscribe to our newsletter (right slot).
                </div>
              </template>
            </PfFooterColumns>
          </PfContainer>
        </template>
      </PfFooter>
    `,
  }),
};
