import type { Meta, StoryObj } from '@storybook/vue3';
import { reactive, ref } from 'vue';
import PfInput from '../../form/PfInput/index.vue';
import PfTabs from './index.vue';
import type { PfTabsItem } from './index.vue';

const meta: Meta<typeof PfTabs> = {
  title: 'Navigation/PfTabs',
  component: PfTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const basicItems: PfTabsItem[] = [
  { label: 'Account', icon: 'user', content: 'Content for the “Account” tab.' },
  {
    label: 'Password',
    icon: 'lock',
    content: 'Content for the “Password” tab.',
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
    variant: 'pill',
    size: 'md',
  },
  render: (args) => ({
    components: { PfTabs },
    setup() {
      return { args };
    },
    template: '<PfTabs v-bind="args" style="min-width: 20rem" />',
  }),
};

export const LinkVariant: Story = {
  args: {
    items: basicItems,
    variant: 'link',
    color: 'primary',
    content: false,
  },
  render: (args) => ({
    components: { PfTabs },
    setup() {
      return { args };
    },
    template: '<PfTabs v-bind="args" style="min-width: 20rem" />',
  }),
};

export const Vertical: Story = {
  args: {
    items: basicItems,
    orientation: 'vertical',
    variant: 'pill',
  },
  render: (args) => ({
    components: { PfTabs },
    setup() {
      return { args };
    },
    template: '<PfTabs v-bind="args" style="min-width: 24rem" />',
  }),
};

export const WithBadgeAndSlots: Story = {
  render: () => ({
    components: { PfTabs, PfInput },
    setup() {
      const items = ref<PfTabsItem[]>([
        {
          label: 'Profile',
          icon: 'user',
          badge: '3',
          slot: 'profile',
        },
        {
          label: 'Notifications',
          icon: 'bell',
          badge: { label: '12', color: 'neutral', variant: 'soft' },
          slot: 'notify',
        },
      ]);
      const state = reactive({ name: 'Alex', email: 'alex@example.com' });
      return { items, state };
    },
    template: `
      <PfTabs :items="items" color="neutral" variant="pill">
        <template #profile>
          <div style="display:flex;flex-direction:column;gap:0.75rem;max-width:20rem">
            <PfInput v-model="state.name" placeholder="Name" />
            <PfInput v-model="state.email" placeholder="Email" />
          </div>
        </template>
        <template #notify>
          <p style="color: var(--pf-color-muted); margin: 0">No new notifications.</p>
        </template>
      </PfTabs>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { PfTabs },
    setup() {
      const active = ref('0');
      const items: PfTabsItem[] = [
        { label: 'One', content: 'First' },
        { label: 'Two', content: 'Second' },
      ];
      return { active, items };
    },
    template: `
      <div>
        <p style="margin-bottom: 0.5rem; font-size: var(--pf-font-size-sm)">model: {{ active }}</p>
        <PfTabs v-model="active" :items="items" :content="false" />
      </div>
    `,
  }),
};

export const ContentSlot: Story = {
  render: () => ({
    components: { PfTabs },
    setup() {
      const items: PfTabsItem[] = [
        { label: 'A', icon: 'star' },
        { label: 'B', icon: 'heart' },
      ];
      return { items };
    },
    template: `
      <PfTabs :items="items">
        <template #content="{ item }">
          <p style="margin:0">Custom content: <strong>{{ item.label }}</strong></p>
        </template>
      </PfTabs>
    `,
  }),
};
