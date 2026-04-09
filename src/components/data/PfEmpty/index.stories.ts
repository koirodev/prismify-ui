import type { Component } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfAvatarGroup from '../../element/PfAvatarGroup/index.vue';
import PfCard from '../../element/PfCard/index.vue';
import PfSeparator from '../../element/PfSeparator/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfEmpty from './index.vue';
import type {
  PfEmptyActionProps,
  PfEmptyAvatarProps,
  PfEmptySize,
  PfEmptyUi,
  PfEmptyVariant,
} from './index.vue';

/** Props-only args so `actions` stays the prop array, not the slot type. */
type PfEmptyStoryArgs = {
  as?: string | Component;
  icon?: PfIconName;
  avatar?: PfEmptyAvatarProps;
  title?: string;
  description?: string;
  actions?: PfEmptyActionProps[];
  variant?: PfEmptyVariant;
  size?: PfEmptySize;
  ui?: PfEmptyUi;
};

const meta: Meta<PfEmptyStoryArgs> = {
  title: 'Data/PfEmpty',
  component: PfEmpty,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'solid', 'soft', 'subtle', 'naked'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;

type Story = StoryObj<PfEmptyStoryArgs>;

const defaultActions: PfEmptyActionProps[] = [
  { label: 'Create new', icon: 'plus', color: 'success' },
  {
    label: 'Refresh',
    icon: 'refresh',
    color: 'neutral',
    variant: 'subtle',
  },
];

export const Default: Story = {
  args: {
    icon: 'file',
    title: 'No projects found',
    description:
      "It looks like you haven't added any projects. Create one to get started.",
    actions: defaultActions,
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'No projects found',
  },
};

export const Naked: Story = {
  args: {
    variant: 'naked',
    icon: 'bell',
    title: 'No notifications',
    description: "You're all caught up. New notifications will appear here.",
  },
};

export const SizeXl: Story = {
  args: {
    size: 'xl',
    variant: 'outline',
    icon: 'bell',
    title: 'No notifications',
    description: "You're all caught up. New notifications will appear here.",
  },
};

export const Solid: Story = {
  args: {
    variant: 'solid',
    icon: 'file',
    title: 'No projects found',
    description: 'Create a project to see it here.',
    actions: [{ label: 'Create', icon: 'plus', color: 'success' }],
  },
};

export const WithAvatar: Story = {
  args: {
    title: 'No photo',
    description: 'Upload an image for your profile.',
    avatar: {
      icon: 'user',
      alt: 'User',
    },
  },
};

export const WithSlots: Story = {
  render: () => ({
    components: {
      PfEmpty,
      PfAvatar,
      PfAvatarGroup,
      PfSeparator,
      PfCard,
    },
    template: `
      <PfEmpty
        title="No team members"
        description="Invite your team to collaborate on this project."
        variant="naked"
        :actions="[{ label: 'Invite members', icon: 'userAdd', color: 'neutral' }]"
      >
        <template #leading>
          <PfAvatarGroup size="xl">
            <PfAvatar src="https://github.com/nuxt.png" alt="Nuxt" loading="lazy" />
            <PfAvatar src="https://github.com/unjs.png" alt="Unjs" loading="lazy" />
          </PfAvatarGroup>
        </template>
        <template #footer>
          <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;max-width:24rem;">
            <PfSeparator style="width:100%" />
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;width:100%;">
              <PfCard variant="outline">
                <span style="font-size:var(--pf-font-size-sm);">Example card A</span>
              </PfCard>
              <PfCard variant="outline">
                <span style="font-size:var(--pf-font-size-sm);">Example card B</span>
              </PfCard>
            </div>
          </div>
        </template>
      </PfEmpty>
    `,
  }),
};
