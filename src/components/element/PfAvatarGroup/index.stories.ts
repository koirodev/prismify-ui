import type { Meta, StoryObj } from '@storybook/vue3';
import PfAvatar from '../PfAvatar/index.vue';
import PfAvatarGroup from './index.vue';

const sizes = [
  '3xs',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
] as const;

const meta = {
  title: 'Element/PfAvatarGroup',
  component: PfAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: [...sizes] },
    max: { control: 'number' },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof PfAvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfAvatar, PfAvatarGroup },
    setup() {
      return { args };
    },
    template: `
      <PfAvatarGroup v-bind="args">
        <PfAvatar
          src="https://github.com/koirodev.png"
          alt="Vitaly Koiro"
          loading="lazy"
        />
        <PfAvatar
          src="https://github.com/HarryKirigwi.png"
          alt="Harrison Kirigwi"
          loading="lazy"
        />
        <PfAvatar
          src="https://github.com/Ta-lab.png"
          alt="Tamil Selvan"
          loading="lazy"
        />
      </PfAvatarGroup>
    `,
  }),
};

export const SizeXl: Story = {
  args: { size: 'xl' },
  render: Default.render,
};

export const MaxTwo: Story = {
  args: { max: 2 },
  render: Default.render,
};

export const WithChip: Story = {
  render: (args) => ({
    components: { PfAvatar, PfAvatarGroup },
    setup() {
      return { args };
    },
    template: `
      <PfAvatarGroup v-bind="args">
        <PfAvatar
          src="https://github.com/koirodev.png"
          alt="Vitaly Koiro"
          loading="lazy"
          :chip="{ color: 'success' }"
        />
        <PfAvatar
          src="https://github.com/HarryKirigwi.png"
          alt="Harrison Kirigwi"
          loading="lazy"
          :chip="{ color: 'warning' }"
        />
        <PfAvatar
          src="https://github.com/Ta-lab.png"
          alt="Tamil Selvan"
          loading="lazy"
          :chip="{ color: 'error' }"
        />
      </PfAvatarGroup>
    `,
  }),
};
