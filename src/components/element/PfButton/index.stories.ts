import type { Meta, StoryObj } from '@storybook/vue3';
import { PF_ICON_NAMES } from '../PfIcon/paths';
import PfButton from './index.vue';

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;
const variants = [
  'solid',
  'outline',
  'soft',
  'subtle',
  'ghost',
  'link',
] as const;

const meta = {
  title: 'Element/PfButton',
  component: PfButton,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: [...colors] },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    leadingIcon: {
      control: 'select',
      options: [undefined, ...PF_ICON_NAMES],
    },
    trailingIcon: {
      control: 'select',
      options: [undefined, ...PF_ICON_NAMES],
    },
    icon: {
      control: 'select',
      options: [undefined, ...PF_ICON_NAMES],
    },
    loadingIcon: {
      control: 'select',
      options: [undefined, ...PF_ICON_NAMES],
    },
    iconOnly: { control: 'boolean' },
    square: { control: 'boolean' },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingAuto: { control: 'boolean' },
    active: { control: 'boolean' },
    trailing: { control: 'boolean' },
    leading: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    label: { control: 'text' },
    href: { control: 'text' },
    to: { control: 'text' },
  },
  args: {
    color: 'primary',
    variant: 'solid',
    size: 'md',
    disabled: false,
    type: 'button',
    iconOnly: false,
    square: false,
    block: false,
    loading: false,
    loadingAuto: false,
    active: false,
    label: 'Button',
  },
  render: (args: Record<string, unknown>) => ({
    components: { PfButton },
    setup() {
      return { args };
    },
    template: `
      <PfButton
        :label="args.label"
        :color="args.color"
        :variant="args.variant"
        :size="args.size"
        :leading-icon="args.leadingIcon"
        :trailing-icon="args.trailingIcon"
        :icon="args.icon"
        :leading="args.leading"
        :trailing="args.trailing"
        :avatar="args.avatar"
        :icon-only="args.iconOnly"
        :square="args.square"
        :block="args.block"
        :aria-label="args.ariaLabel"
        :disabled="args.disabled"
        :loading="args.loading"
        :loading-auto="args.loadingAuto"
        :loading-icon="args.loadingIcon"
        :type="args.type"
        :href="args.href"
        :to="args.to"
        :target="args.target"
        :active="args.active"
        :active-color="args.activeColor"
        :active-variant="args.activeVariant"
        :active-class="args.activeClass"
        :inactive-class="args.inactiveClass"
      />
    `,
  }),
} satisfies Meta<typeof PfButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Outline: Story = {
  args: { variant: 'outline', color: 'primary' },
};

export const LinkVariant: Story = {
  args: { variant: 'link', color: 'primary', label: 'Like a link' },
};

export const WithLeadingIcon: Story = {
  args: { leadingIcon: 'plus', label: 'Add' },
};

export const WithTrailingIcon: Story = {
  args: { trailingIcon: 'plus', label: 'Next' },
};

export const IconShorthand: Story = {
  args: { icon: 'search', label: 'Search' },
};

export const IconTrailing: Story = {
  args: { icon: 'arrowRight', trailing: true, label: 'Next' },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    leadingIcon: 'plus',
    ariaLabel: 'Done',
    label: '',
  },
};

export const IconOnlyFromIconProp: Story = {
  args: {
    iconOnly: true,
    icon: 'search',
    ariaLabel: 'Search',
    label: '',
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { PfButton },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
        <PfButton size="xs">XS</PfButton>
        <PfButton size="sm">Small</PfButton>
        <PfButton size="md">Medium</PfButton>
        <PfButton size="lg">Large</PfButton>
        <PfButton size="xl">XL</PfButton>
      </div>
    `,
  }),
};

export const SquareIcon: Story = {
  args: {
    square: true,
    iconOnly: true,
    icon: 'plus',
    ariaLabel: 'Plus',
    label: '',
  },
};

export const Block: Story = {
  args: { block: true, label: 'Full width', trailingIcon: 'arrowRight' },
};

export const WithAvatar: Story = {
  args: {
    label: 'Profile',
    variant: 'outline',
    color: 'neutral',
    avatar: { text: 'AB' },
  },
};

export const AsLink: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    label: 'External link',
    variant: 'outline',
    color: 'neutral',
  },
};

export const ActiveState: Story = {
  args: {
    active: true,
    color: 'neutral',
    variant: 'outline',
    activeColor: 'primary',
    activeVariant: 'solid',
    label: 'Active',
  },
};

export const Loading: Story = {
  args: { loading: true, label: 'Saving' },
};

export const LoadingTrailing: Story = {
  args: { loading: true, trailing: true, label: 'Saving' },
};

export const LoadingAuto: Story = {
  render: () => ({
    components: { PfButton },
    setup() {
      function onClick() {
        return new Promise<void>((r) => setTimeout(r, 1200));
      }
      return { onClick };
    },
    template: `
      <PfButton loading-auto label="Please wait…" @click="onClick" />
    `,
  }),
};

export const ColorsSolid: Story = {
  render: () => ({
    components: { PfButton },
    setup() {
      return { colors };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        <PfButton v-for="c in colors" :key="c" :color="c">{{ c }}</PfButton>
      </div>
    `,
  }),
};

export const VariantsMatrix: Story = {
  render: () => ({
    components: { PfButton },
    setup() {
      return { variants };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div v-for="v in variants" :key="v" style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
          <span style="width:5rem;font-size:0.75rem;color:var(--pf-color-muted)">{{ v }}</span>
          <PfButton :variant="v" color="primary">Primary</PfButton>
          <PfButton :variant="v" color="neutral">Neutral</PfButton>
        </div>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};
