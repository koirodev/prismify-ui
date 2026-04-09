import PfCalendar from '../../form/PfCalendar/index.vue';
import PfApp from './index.vue';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta = {
  title: 'Layout/PfApp',
  component: PfApp,
  tags: ['autodocs'],
  args: {
    locale: 'en-US',
  },
  argTypes: {
    locale: { control: 'text' },
  },
} satisfies Meta<typeof PfApp>;

export default meta;

export const Default: StoryObj<typeof PfApp> = {
  render: (args) => ({
    components: { PfApp, PfCalendar },
    setup: () => ({ args }),
    template:
      '<PfApp v-bind="args"><div style="font:var(--pf-font-sans);color:var(--pf-color-fg)"><p style="margin:0 0 0.75rem">App content</p><PfCalendar /></div></PfApp>',
  }),
};

export const RtlLocale: StoryObj<typeof PfApp> = {
  render: (args) => ({
    components: { PfApp, PfCalendar },
    setup: () => ({ args }),
    template:
      '<PfApp v-bind="args"><div style="font:var(--pf-font-sans);color:var(--pf-color-fg)"><PfCalendar /></div></PfApp>',
  }),
  args: {
    dir: 'rtl',
    locale: 'ar-EG',
  },
};
