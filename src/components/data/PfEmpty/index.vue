<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
  type Slots,
} from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfButton from '../../element/PfButton/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfBadgeAvatarProps } from '../../element/PfBadge/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfEmptyVariant = 'outline' | 'solid' | 'soft' | 'subtle' | 'naked';

export type PfEmptySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfEmptyButtonVariant =
  | 'solid'
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'link';

export type PfEmptyActionProps = Partial<{
  label: string;
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  variant: PfEmptyButtonVariant;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  square: boolean;
  block: boolean;
  icon: PfIconName;
  leading: boolean;
  leadingIcon: PfIconName;
  trailing: boolean;
  trailingIcon: PfIconName;
  iconOnly: boolean;
  ariaLabel: string;
  disabled: boolean;
  loading: boolean;
  loadingIcon: PfIconName;
  loadingAuto: boolean;
  type: 'button' | 'submit' | 'reset';
  href: string;
  to: string;
  target: string;
  rel: string;
  download: boolean | string;
  active: boolean;
  activeColor:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  activeVariant: PfEmptyButtonVariant;
}>;

export type PfEmptyAvatarProps = PfBadgeAvatarProps;

export type PfEmptyUi = Partial<{
  root: string;
  header: string;
  leading: string;
  avatar: string;
  title: string;
  description: string;
  body: string;
  actions: string;
  footer: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    icon?: PfIconName;
    avatar?: PfEmptyAvatarProps;
    title?: string;
    description?: string;
    actions?: PfEmptyActionProps[];
    variant?: PfEmptyVariant;
    size?: PfEmptySize;
    ui?: PfEmptyUi;
  }>(),
  {
    variant: 'outline',
    size: 'md',
  }
);

const attrs = useAttrs();
const slots: Slots = useSlots();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const rootClass = computed(() => [
  'pfEmpty',
  `pfEmpty_variant_${props.variant}`,
  `pfEmpty_size_${props.size}`,
  attrs.class,
  props.ui?.root,
]);

const hasLeadingSlot = computed(() => slots.leading != null);
const showIcon = computed(
  () => props.icon != null && props.avatar == null && !hasLeadingSlot.value
);
const showAvatar = computed(
  () => props.avatar != null && !hasLeadingSlot.value
);
const showLeading = computed(
  () => hasLeadingSlot.value || showIcon.value || showAvatar.value
);

const hasTitleSlot = computed(() => slots.title != null);
const hasDescSlot = computed(() => slots.description != null);
const hasHeaderSlot = computed(() => slots.header != null);

const showTitle = computed(
  () => hasTitleSlot.value || (props.title != null && props.title !== '')
);
const showDescription = computed(
  () =>
    hasDescSlot.value || (props.description != null && props.description !== '')
);

const showHeaderWrapper = computed(
  () => hasHeaderSlot.value || showTitle.value || showDescription.value
);

const hasBodySlot = computed(() => slots.body != null);
const hasFooterSlot = computed(() => slots.footer != null);

const showActionsProp = computed(
  () => props.actions != null && props.actions.length > 0
);
const hasActionsSlot = computed(() => slots.actions != null);
const showActions = computed(
  () => hasActionsSlot.value || showActionsProp.value
);

const avatarSizeForEmpty = computed((): PfBadgeAvatarProps['size'] => {
  const map: Record<PfEmptySize, PfBadgeAvatarProps['size']> = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  };
  return map[props.size];
});

const avatarBind = computed(() => {
  if (props.avatar == null) return null;
  return {
    ...props.avatar,
    size: props.avatar.size ?? avatarSizeForEmpty.value,
  };
});

const leadingIconSize = computed((): PfIconSize => {
  switch (props.size) {
    case 'xs':
      return 'sm';
    case 'sm':
      return 'md';
    case 'md':
      return 'md';
    case 'lg':
      return 'lg';
    case 'xl':
      return 'xl';
    default:
      return 'md';
  }
});

const actionSize = computed((): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'sm';
    case 'md':
      return 'md';
    case 'lg':
    case 'xl':
      return 'md';
    default:
      return 'md';
  }
});

function resolveAction(action: PfEmptyActionProps) {
  return {
    size: actionSize.value,
    ...action,
  };
}
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div v-if="showLeading" class="pfEmpty__leading" :class="ui?.leading">
      <slot name="leading">
        <PfAvatar
          v-if="avatarBind"
          class="pfEmpty__avatar"
          :class="ui?.avatar"
          v-bind="avatarBind"
        />
        <div
          v-else-if="showIcon"
          class="pfEmpty__iconBubble"
          :class="ui?.avatar"
        >
          <PfIcon :name="icon!" :size="leadingIconSize" />
        </div>
      </slot>
    </div>

    <div v-if="showHeaderWrapper" class="pfEmpty__header" :class="ui?.header">
      <slot name="header">
        <div v-if="showTitle" class="pfEmpty__title" :class="ui?.title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div
          v-if="showDescription"
          class="pfEmpty__description"
          :class="ui?.description"
        >
          <slot name="description">{{ description }}</slot>
        </div>
      </slot>
    </div>

    <div v-if="hasBodySlot" class="pfEmpty__body" :class="ui?.body">
      <slot name="body" />
    </div>

    <div v-if="showActions" class="pfEmpty__actions" :class="ui?.actions">
      <slot name="actions">
        <PfButton
          v-for="(action, index) in actions"
          :key="index"
          v-bind="resolveAction(action)"
        />
      </slot>
    </div>

    <div v-if="hasFooterSlot" class="pfEmpty__footer" :class="ui?.footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfEmpty {
  position: relative;

  padding: var(--pf-empty-pad-y) var(--pf-empty-pad-x);
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--pf-empty-gap);
  box-sizing: border-box;

  color: var(--pf-empty-fg, var(--pf-color-text));
  font-family: var(--pf-font-sans);

  border-radius: var(--pf-radius-md);

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
    color var(--pf-animation-duration) var(--pf-animation-easing);

  &_size_xs {
    --pf-empty-bubble: 2rem;
    --pf-empty-desc-font: var(--pf-font-size-xs);
    --pf-empty-pad-x: var(--pf-space-md);
    --pf-empty-pad-y: var(--pf-space-md);
    --pf-empty-title-font: var(--pf-font-size-sm);
    --pf-empty-title-weight: var(--pf-font-weight-medium);
  }

  &_size_sm {
    --pf-empty-bubble: 2.25rem;
    --pf-empty-desc-font: var(--pf-font-size-xs);
    --pf-empty-pad-x: var(--pf-space-lg);
    --pf-empty-pad-y: var(--pf-space-lg);
    --pf-empty-title-font: var(--pf-font-size-sm);
    --pf-empty-title-weight: var(--pf-font-weight-medium);
  }

  &_size_md {
    --pf-empty-bubble: 2.5rem;
    --pf-empty-desc-font: var(--pf-font-size-sm);
    --pf-empty-pad-x: var(--pf-space-lg);
    --pf-empty-pad-y: var(--pf-space-lg);
    --pf-empty-title-font: var(--pf-font-size-md);
    --pf-empty-title-weight: var(--pf-font-weight-medium);
  }

  &_size_lg {
    --pf-empty-bubble: 2.75rem;
    --pf-empty-desc-font: var(--pf-font-size-sm);
    --pf-empty-pad-x: var(--pf-space-xl);
    --pf-empty-pad-y: var(--pf-space-xl);
    --pf-empty-title-font: var(--pf-font-size-md);
    --pf-empty-title-weight: var(--pf-font-weight-medium);
  }

  &_size_xl {
    --pf-empty-bubble: 3rem;
    --pf-empty-desc-font: var(--pf-font-size-md);
    --pf-empty-pad-x: var(--pf-space-xl);
    --pf-empty-pad-y: 1.5rem;
    --pf-empty-title-font: var(--pf-font-size-lg);
    --pf-empty-title-weight: var(--pf-font-weight-medium);
  }

  @media (min-width: 640px) {
    &_size_md,
    &_size_lg,
    &_size_xl {
      --pf-empty-pad-x: 1.5rem;
      --pf-empty-pad-y: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    &_size_md,
    &_size_lg,
    &_size_xl {
      --pf-empty-pad-x: 2rem;
      --pf-empty-pad-y: 2rem;
    }
  }

  &_variant_outline {
    --pf-empty-description-fg: var(--pf-color-muted);
    --pf-empty-fg: var(--pf-color-text);

    box-shadow: 0 0 0 var(--pf-stroke-width) var(--pf-border-color);
    background-color: var(--pf-color-surface);
  }

  &_variant_soft {
    --pf-empty-description-fg: color-mix(
      in srgb,
      var(--pf-color-text) 72%,
      transparent
    );
    --pf-empty-fg: var(--pf-color-text);

    box-shadow: none;
    background-color: color-mix(
      in srgb,
      var(--pf-color-muted) 12%,
      var(--pf-color-surface)
    );
  }

  &_variant_subtle {
    --pf-empty-description-fg: color-mix(
      in srgb,
      var(--pf-color-text) 72%,
      transparent
    );
    --pf-empty-fg: var(--pf-color-text);

    box-shadow: 0 0 0 var(--pf-stroke-width) var(--pf-border-color);
    background-color: color-mix(
      in srgb,
      var(--pf-color-muted) 12%,
      var(--pf-color-surface)
    );
  }

  &_variant_solid {
    --pf-empty-description-fg: color-mix(
      in srgb,
      var(--pf-color-surface) 72%,
      transparent
    );
    --pf-empty-fg: var(--pf-color-surface);
    --pf-empty-icon-bubble-bg: color-mix(
      in srgb,
      var(--pf-color-surface) 16%,
      transparent
    );

    box-shadow: none;
    background-color: var(--pf-color-text);

    .pfEmpty__iconBubble {
      color: color-mix(in srgb, var(--pf-color-surface) 78%, transparent);
    }
  }

  &_variant_naked {
    --pf-empty-description-fg: var(--pf-color-muted);
    --pf-empty-fg: var(--pf-color-text);

    box-shadow: none;
    background-color: transparent;
  }
}

.pfEmpty__leading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pfEmpty__avatar {
  flex-shrink: 0;
}

.pfEmpty__iconBubble {
  width: var(--pf-empty-bubble);
  height: var(--pf-empty-bubble);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  color: var(--pf-color-muted);

  background-color: var(--pf-empty-icon-bubble-bg);
  border-radius: 50%;
}

.pfEmpty__header {
  max-width: min(var(--pf-empty-max-text-width), 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pf-empty-header-gap);

  text-align: center;
}

.pfEmpty__title {
  margin: 0;

  max-width: 100%;

  color: var(--pf-empty-fg, var(--pf-color-text));
  font-size: var(--pf-empty-title-font);
  font-weight: var(--pf-empty-title-weight);
  line-height: var(--pf-line-height-md);
  text-wrap: pretty;
}

.pfEmpty__description {
  margin: 0;

  max-width: 100%;

  color: var(--pf-empty-description-fg, var(--pf-color-muted));
  font-size: var(--pf-empty-desc-font);
  line-height: var(--pf-line-height-md);
  text-align: center;
  text-wrap: balance;
}

.pfEmpty__body {
  max-width: min(var(--pf-empty-max-text-width), 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pf-empty-gap);
}

.pfEmpty__actions {
  max-width: min(var(--pf-empty-max-text-width), 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: var(--pf-empty-actions-gap);
}

.pfEmpty__footer {
  max-width: min(var(--pf-empty-max-text-width), 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pf-empty-header-gap);
}
</style>
