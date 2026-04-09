import type { Meta, StoryObj } from '@storybook/vue3';
import PfIcon from '../../element/PfIcon/index.vue';
import PfMarquee from './index.vue';

const meta: Meta<typeof PfMarquee> = {
  title: 'Data/PfMarquee',
  component: PfMarquee,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    repeat: { control: { type: 'number', min: 2, max: 16, step: 1 } },
    pauseOnHover: { control: 'boolean' },
    reverse: { control: 'boolean' },
    overlay: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfMarquee, PfIcon },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 100%; max-width: 48rem;">
        <PfMarquee v-bind="args">
          <PfIcon name="alarmClock" size="xl" style="flex-shrink: 0" />
          <PfIcon name="star" size="xl" style="flex-shrink: 0" />
          <PfIcon name="heart" size="xl" style="flex-shrink: 0" />
          <PfIcon name="bell" size="xl" style="flex-shrink: 0" />
          <PfIcon name="browser" size="xl" style="flex-shrink: 0" />
          <PfIcon name="camera" size="xl" style="flex-shrink: 0" />
        </PfMarquee>
      </div>
    `,
  }),
  args: {
    pauseOnHover: false,
    reverse: false,
    orientation: 'horizontal',
    repeat: 4,
    overlay: true,
  },
};

export const PauseOnHover: Story = {
  ...Default,
  args: {
    ...Default.args,
    pauseOnHover: true,
  },
};

export const Reverse: Story = {
  ...Default,
  args: {
    ...Default.args,
    reverse: true,
  },
};

export const Vertical: Story = {
  render: (args) => ({
    components: { PfMarquee, PfIcon },
    setup() {
      return { args };
    },
    template: `
      <div style="height: 240px; width: 12rem;">
        <PfMarquee v-bind="args">
          <PfIcon name="github" size="xl" style="flex-shrink: 0" />
          <PfIcon name="star" size="xl" style="flex-shrink: 0" />
          <PfIcon name="heart" size="xl" style="flex-shrink: 0" />
          <PfIcon name="bell" size="xl" style="flex-shrink: 0" />
          <PfIcon name="browser" size="xl" style="flex-shrink: 0" />
          <PfIcon name="camera" size="xl" style="flex-shrink: 0" />
        </PfMarquee>
      </div>
    `,
  }),
  args: {
    ...Default.args,
    orientation: 'vertical',
    overlay: false,
  },
};

export const RepeatSix: Story = {
  ...Default,
  args: {
    ...Default.args,
    repeat: 6,
  },
};

export const NoOverlay: Story = {
  ...Default,
  args: {
    ...Default.args,
    overlay: false,
  },
};

export const CustomDuration: Story = {
  render: (args) => ({
    components: { PfMarquee, PfIcon },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 100%; max-width: 48rem;">
        <PfMarquee v-bind="args" style="--pf-marquee-duration: 12s; --pf-marquee-gap: 1.5rem;">
          <PfIcon name="github" size="xl" style="flex-shrink: 0" />
          <PfIcon name="star" size="xl" style="flex-shrink: 0" />
          <PfIcon name="heart" size="xl" style="flex-shrink: 0" />
          <PfIcon name="bell" size="xl" style="flex-shrink: 0" />
          <PfIcon name="browser" size="xl" style="flex-shrink: 0" />
          <PfIcon name="camera" size="xl" style="flex-shrink: 0" />
        </PfMarquee>
      </div>
    `,
  }),
  args: {
    ...Default.args,
    overlay: false,
  },
};
