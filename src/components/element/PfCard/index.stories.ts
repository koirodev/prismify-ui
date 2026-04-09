import type { Meta, StoryObj } from '@storybook/vue3';
import PfButton from '../PfButton/index.vue';
import PfCard from './index.vue';

const variants = ['solid', 'outline', 'soft', 'subtle'] as const;

const meta = {
  title: 'Element/PfCard',
  component: PfCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: [...variants] },
  },
  args: {
    variant: 'outline',
  },
  decorators: [
    () => ({
      template:
        '<div style="width: min(100%, 26rem); margin: 0 auto;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof PfCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const bodyTextStyle =
  'margin: 0; font-size: var(--pf-font-size-sm); line-height: var(--pf-line-height-md); opacity: 0.88;';

function renderSalesReportCard(args: Record<string, unknown>) {
  return {
    components: { PfCard, PfButton },
    setup() {
      return { args, bodyTextStyle };
    },
    template: `
      <PfCard v-bind="args">
        <template #header>
          <div style="display: flex; flex-direction: column; gap: var(--pf-space-xs);">
            <span style="font-size: var(--pf-font-size-sm); font-weight: var(--pf-font-weight-medium);">
              Sales report
            </span>
            <span style="font-size: var(--pf-font-size-xs); opacity: 0.8;">
              Period: Mar 1–28, 2026 · updated today, 09:41
            </span>
          </div>
        </template>
        <div>
          <p :style="bodyTextStyle">
            <strong>1,247</strong> orders were placed for a total of
            <strong>$4.18M</strong>. Versus last month — up 12&nbsp;%;
            average order value $3,350 (−3&nbsp;% vs February).
          </p>
          <ul
            style="margin: var(--pf-space-md) 0 0; padding-left: 1.15rem; font-size: var(--pf-font-size-xs); line-height: var(--pf-line-height-md); opacity: 0.85;"
          >
            <li>Top category: electronics (38&nbsp;% of revenue)</li>
            <li>Visit → order conversion: 3.1&nbsp;%</li>
            <li>Returns: 2.4&nbsp;% of order count</li>
          </ul>
        </div>
        <template #footer>
          <div
            style="display: flex; flex-wrap: wrap; gap: var(--pf-space-sm); justify-content: flex-end; align-items: center;"
          >
            <PfButton variant="ghost" size="sm">All reports</PfButton>
            <PfButton variant="outline" size="sm">Email preferences</PfButton>
            <PfButton size="sm">Download PDF</PfButton>
          </div>
        </template>
      </PfCard>
    `,
  };
}

export const Default: Story = {
  render: renderSalesReportCard,
};

export const BodyOnly: Story = {
  render: (args) => ({
    components: { PfCard },
    setup() {
      const secondParagraphStyle = `${bodyTextStyle} margin-top: var(--pf-space-md);`;
      return { args, bodyTextStyle, secondParagraphStyle };
    },
    template: `
      <PfCard v-bind="args">
        <div>
          <p style="margin: 0 0 var(--pf-space-sm); font-size: var(--pf-font-size-sm); font-weight: var(--pf-font-weight-medium);">
            Notifications for project “Warehouse #4”
          </p>
          <p :style="bodyTextStyle">
            When stock changes or a delivery is overdue, emails go to
            <span style="text-decoration: underline;">logistics@example.com</span>
            and the channel Telegram bot.
          </p>
          <p :style="secondParagraphStyle">
            Last ERP sync: <strong>Mar 28, 2026, 08:00</strong> (success, 1,420 SKUs).
          </p>
        </div>
      </PfCard>
    `,
  }),
};

export const Subtle: Story = {
  args: { variant: 'subtle' },
  render: renderSalesReportCard,
};

const variantDemos = [
  {
    variant: 'outline' as const,
    title: 'Invoice #INV-2026-0312',
    meta: 'Acme LLC · VAT included',
    badge: 'Awaiting payment',
    body: 'Invoice total $182,400; due April 5, 2026. After payment clears, API access opens automatically.',
  },
  {
    variant: 'soft' as const,
    title: 'Team invitation',
    meta: 'Role: editor · Analytics project',
    badge: '3 days',
    body: 'Alex I. invited you from you@company.test. Accept to see dashboards and department reports.',
  },
  {
    variant: 'subtle' as const,
    title: 'API key (production)',
    meta: 'Created Mar 12, 2026 · 10k req/day limit',
    badge: 'Secret',
    body: 'Keep the key out of the repo. If leaked, revoke it under Integrations and issue a new one.',
  },
  {
    variant: 'solid' as const,
    title: 'Action required',
    meta: 'Account security',
    badge: 'Important',
    body: 'Enable two-factor authentication by Apr 2, 2026, or sign-in from new devices will be blocked.',
  },
];

export const AllVariants: Story = {
  decorators: [
    () => ({
      template:
        '<div style="width: min(100%, 48rem); margin: 0 auto;"><story /></div>',
    }),
  ],
  render: () => ({
    components: { PfCard, PfButton },
    setup() {
      return { variantDemos, bodyTextStyle };
    },
    template: `
      <div style="display: grid; gap: var(--pf-space-xl);">
        <PfCard
          v-for="item in variantDemos"
          :key="item.variant"
          :variant="item.variant"
        >
          <template #header>
            <div
              style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--pf-space-md); flex-wrap: wrap;"
            >
              <div style="min-width: 0;">
                <div style="font-weight: var(--pf-font-weight-medium); font-size: var(--pf-font-size-sm);">
                  {{ item.title }}
                </div>
                <div
                  style="font-size: var(--pf-font-size-xs); opacity: 0.8; margin-top: var(--pf-space-xs);"
                >
                  {{ item.meta }}
                </div>
              </div>
              <span
                style="font-size: var(--pf-font-size-xs); font-weight: var(--pf-font-weight-medium); white-space: nowrap;"
              >
                {{ item.badge }}
              </span>
            </div>
          </template>
          <p :style="bodyTextStyle">{{ item.body }}</p>
          <template #footer>
            <div
              style="display: flex; flex-wrap: wrap; gap: var(--pf-space-sm); justify-content: flex-end;"
            >
              <PfButton variant="ghost" size="sm">Details</PfButton>
              <PfButton size="sm">Done</PfButton>
            </div>
          </template>
        </PfCard>
      </div>
    `,
  }),
};
