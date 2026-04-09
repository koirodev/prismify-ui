import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfTimeline from './index.vue';
import type { PfTimelineItem } from './index.vue';

const meta: Meta<typeof PfTimeline> = {
  title: 'Data/PfTimeline',
  component: PfTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral',
      ],
    },
    size: {
      control: 'select',
      options: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleItems: PfTimelineItem[] = [
  {
    date: 'Mar 15, 2025',
    title: 'Project Kickoff',
    description:
      'Kicked off the project with team alignment. Set up milestones and allocated resources.',
    icon: 'rocket',
  },
  {
    date: 'Mar 22, 2025',
    title: 'Design Phase',
    description:
      'User research and design workshops. Wireframes and prototypes for user testing.',
    icon: 'palette',
  },
  {
    date: 'Mar 29, 2025',
    title: 'Development Sprint',
    description:
      'Frontend and backend development. Core features and API integration.',
    icon: 'layers',
  },
  {
    date: 'Apr 5, 2025',
    title: 'Testing & Deployment',
    description:
      'QA testing and performance optimization. Production deployment.',
    icon: 'check',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    style: 'max-width: 24rem',
  },
};

export const DefaultValue: Story = {
  args: {
    items: sampleItems,
    defaultValue: 2,
    style: 'max-width: 24rem',
  },
};

export const NeutralColor: Story = {
  args: {
    items: sampleItems,
    color: 'neutral',
    defaultValue: 2,
    style: 'max-width: 24rem',
  },
};

export const SizeXs: Story = {
  args: {
    items: sampleItems,
    size: 'xs',
    defaultValue: 2,
    style: 'max-width: 24rem',
  },
};

export const Horizontal: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    defaultValue: 2,
    style: 'width: 100%',
  },
};

export const WithValueKey: Story = {
  render: () => ({
    components: { PfTimeline },
    setup() {
      const items: PfTimelineItem[] = [
        {
          date: 'Mar 15, 2025',
          title: 'Kickoff',
          description: 'Start.',
          icon: 'rocket',
          value: 'kickoff',
        },
        {
          date: 'Mar 22, 2025',
          title: 'Design',
          description: 'Design work.',
          icon: 'palette',
          value: 'design',
        },
        {
          date: 'Mar 29, 2025',
          title: 'Build',
          description: 'Implementation.',
          icon: 'layers',
          value: 'build',
        },
      ];
      const active = ref<string | number>('design');
      return { items, active };
    },
    template: `
      <PfTimeline v-model="active" :items="items" style="max-width: 24rem" />
    `,
  }),
};

export const SelectSync: Story = {
  render: () => ({
    components: { PfTimeline },
    setup() {
      const items: PfTimelineItem[] = [
        {
          date: 'Mar 15, 2025',
          title: 'Kickoff',
          icon: 'rocket',
          value: 'kickoff',
        },
        {
          date: 'Mar 22, 2025',
          title: 'Design',
          icon: 'palette',
          value: 'design',
        },
      ];
      const active = ref<string | number>('kickoff');
      function onSelect(_e: Event, item: PfTimelineItem) {
        if (item.value !== undefined) {
          active.value = item.value;
        }
      }
      return { items, active, onSelect };
    },
    template: `
      <PfTimeline
        v-model="active"
        :items="items"
        style="max-width: 24rem"
        @select="onSelect"
      />
    `,
  }),
};
