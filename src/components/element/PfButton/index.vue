<script setup lang="ts">
import { computed, inject, ref, useAttrs, useSlots, type Component } from 'vue';
import PfAvatar from '../PfAvatar/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../PfFieldGroup/injection';
import PfIcon from '../PfIcon/index.vue';
import type { PfAvatarChipProps } from '../PfAvatar/index.vue';
import type { PfIconSize } from '../PfIcon/iconSizes';
import type { PfIconName } from '../PfIcon/paths';

export type PfButtonAvatarProps = {
  as?: { img?: string | Component };
  src?: string;
  alt?: string;
  icon?: PfIconName;
  text?: string;
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  chip?: boolean | PfAvatarChipProps;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  referrerpolicy?: string;
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  decoding?: 'async' | 'auto' | 'sync';
  height?: number | string;
  sizes?: string;
  srcset?: string;
  usemap?: string;
  width?: number | string;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label?: string;
    color?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warning'
      | 'error'
      | 'neutral';
    /** When `active`, overrides `color` if set */
    activeColor?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warning'
      | 'error'
      | 'neutral';
    variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
    /** When `active`, overrides `variant` if set */
    activeVariant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
    /** In `PfFieldGroup`, inherits group `size` when no own `size` */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Equal padding on all sides */
    square?: boolean;
    /** Full width of container */
    block?: boolean;
    /** Single icon: position via `leading` / `trailing` (default — left) */
    icon?: PfIconName;
    /** Show `icon` on the left */
    leading?: boolean;
    leadingIcon?: PfIconName;
    /** Show `icon` on the right */
    trailing?: boolean;
    trailingIcon?: PfIconName;
    /** Avatar on the left (like PfAvatar) */
    avatar?: PfButtonAvatarProps;
    /** Square icon-only button; set `ariaLabel` for a11y */
    iconOnly?: boolean;
    ariaLabel?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    /** Show loading and block clicks */
    loading?: boolean;
    /** Icon when `loading` */
    loadingIcon?: PfIconName;
    /**
     * While `click` (`@click` or `onClick`) returns a Promise — show loading.
     */
    loadingAuto?: boolean;
    /** Treat button as active (`activeColor` / `activeVariant`, active/inactive classes) */
    active?: boolean;
    /** Link: render `<a>` (over `to`) */
    href?: string;
    /** `href` alias for RouterLink-style APIs */
    to?: string;
    target?: '_blank' | '_parent' | '_self' | '_top' | string;
    rel?: string;
    download?: string | boolean;
    /** Extra class when active */
    activeClass?: string;
    /** Extra class when inactive */
    inactiveClass?: string;
    /** Native handler (alternative to `@click` on the component) */
    onClick?: (event: MouseEvent) => void | Promise<void>;
  }>(),
  {
    color: 'primary',
    variant: 'solid',
    square: false,
    block: false,
    iconOnly: false,
    disabled: false,
    type: 'button',
    loading: false,
    loadingIcon: undefined,
    loadingAuto: false,
    active: false,
  }
);

const attrs = useAttrs();
const slots = useSlots();

const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' =>
    props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const loadingInternal = ref(false);

const isLoading = computed(() => props.loading || loadingInternal.value);

const isLink = computed(() => {
  const h = props.href ?? props.to;
  return typeof h === 'string' && h.length > 0;
});

const linkHref = computed(() => props.href ?? props.to ?? undefined);

const resolvedColor = computed(() =>
  props.active && props.activeColor != null ? props.activeColor : props.color
);

const resolvedVariant = computed(() =>
  props.active && props.activeVariant != null
    ? props.activeVariant
    : props.variant
);

const iconSizeForButton = computed((): PfIconSize => {
  switch (effectiveSize.value) {
    case 'xs':
      return '2xs';
    case 'sm':
      return 'sm';
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

const avatarEmbedSize = computed(() => {
  const map: Record<
    'xs' | 'sm' | 'md' | 'lg' | 'xl',
    PfButtonAvatarProps['size']
  > = {
    xs: '3xs',
    sm: '2xs',
    md: '2xs',
    lg: '2xs',
    xl: 'xs',
  };
  return map[effectiveSize.value];
});

const showLeadingFromIconProp = computed(() => {
  if (props.icon == null) return false;
  if (props.trailing === true) return false;
  return true;
});

const showTrailingFromIconProp = computed(() => {
  if (props.icon == null) return false;
  return props.trailing === true;
});

const resolvedLeadingIcon = computed((): PfIconName | undefined => {
  if (props.leadingIcon) return props.leadingIcon;
  if (showLeadingFromIconProp.value) return props.icon;
  return undefined;
});

const resolvedTrailingIcon = computed((): PfIconName | undefined => {
  if (props.trailingIcon) return props.trailingIcon;
  if (showTrailingFromIconProp.value) return props.icon;
  return undefined;
});

const loadingOnTrailing = computed(() => props.trailing === true);

const showLeadingSpinner = computed(
  () => isLoading.value && !loadingOnTrailing.value
);

const showTrailingSpinner = computed(
  () => isLoading.value && loadingOnTrailing.value
);

const effectiveLeadingIcon = computed(() =>
  showLeadingSpinner.value ? undefined : resolvedLeadingIcon.value
);

const effectiveTrailingIcon = computed(() =>
  showTrailingSpinner.value ? undefined : resolvedTrailingIcon.value
);

const spinnerIcon = computed((): PfIconName => props.loadingIcon ?? 'spinner');

const hasAvatar = computed(() => props.avatar != null);

const hasLeading = computed(
  () =>
    hasAvatar.value ||
    Boolean(effectiveLeadingIcon.value) ||
    showLeadingSpinner.value ||
    slots.leading != null
);

const hasTrailing = computed(
  () =>
    Boolean(effectiveTrailingIcon.value) ||
    showTrailingSpinner.value ||
    slots.trailing != null
);

const hasLabelText = computed(() => {
  if (props.label != null && String(props.label).length > 0) return true;
  return slots.default != null;
});

const showLabel = computed(() => !props.iconOnly && hasLabelText.value);

const isDisabled = computed(() => props.disabled || isLoading.value);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  delete a.onClick;
  return a;
});

const rootTag = computed(() => (isLink.value ? 'a' : 'button'));

const controlClass = computed(() => {
  const active = props.active;
  return [
    'pfButton',
    `pfButton_color_${resolvedColor.value}`,
    `pfButton_variant_${resolvedVariant.value}`,
    `pfButton_size_${effectiveSize.value}`,
    props.square && 'pfButton_square',
    props.block && 'pfButton_block',
    props.iconOnly && 'pfButton_iconOnly',
    isDisabled.value && 'pfButton_disabled',
    active && props.activeClass,
    !active && props.inactiveClass,
  ];
});

const mergedClass = computed(() => [controlClass.value, attrs.class]);

const avatarBindings = computed(() => {
  const a = props.avatar;
  if (!a) return {};
  return {
    ...a,
    size: a.size ?? avatarEmbedSize.value,
  };
});

function invokeClickHandlers(e: MouseEvent) {
  const fromAttrs = attrs.onClick as
    | ((ev: MouseEvent) => void | Promise<void>)
    | Array<(ev: MouseEvent) => void | Promise<void>>
    | undefined;
  const fromAttrsList =
    typeof fromAttrs === 'function' ? [fromAttrs] : (fromAttrs ?? []);
  const handlers = [
    ...fromAttrsList,
    ...(props.onClick ? [props.onClick] : []),
  ];
  return handlers.map((fn) => fn(e));
}

async function onControlClick(e: MouseEvent) {
  if (isDisabled.value) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (!props.loadingAuto) {
    invokeClickHandlers(e);
    return;
  }
  const results = invokeClickHandlers(e);
  for (const r of results) {
    if (r != null && typeof (r as Promise<void>).then === 'function') {
      loadingInternal.value = true;
      try {
        await r;
      } finally {
        loadingInternal.value = false;
      }
    }
  }
}
</script>

<template>
  <component
    :is="rootTag"
    :class="mergedClass"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : isDisabled ? true : undefined"
    :aria-disabled="isLink && isDisabled ? 'true' : undefined"
    :aria-busy="isLoading ? 'true' : undefined"
    :aria-label="ariaLabel"
    :href="isLink ? linkHref : undefined"
    :tabindex="isLink && isDisabled ? -1 : undefined"
    :target="isLink ? target : undefined"
    :rel="isLink ? rel : undefined"
    :download="
      isLink ? (download === true ? '' : download || undefined) : undefined
    "
    v-bind="passthroughAttrs"
    @click="onControlClick"
  >
    <span v-if="hasLeading" class="pfButton__leading">
      <slot name="leading">
        <PfAvatar
          v-if="avatar"
          class="pfButton__leadingAvatar"
          v-bind="avatarBindings"
        />
        <PfIcon
          v-if="showLeadingSpinner"
          class="pfButton__iconSpin"
          :name="spinnerIcon"
          :size="iconSizeForButton"
        />
        <PfIcon
          v-else-if="effectiveLeadingIcon"
          :name="effectiveLeadingIcon"
          :size="iconSizeForButton"
        />
      </slot>
    </span>
    <span v-if="showLabel" class="pfButton__label">
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="hasTrailing"
      class="pfButton__trailing"
      :class="{ pfButton__trailing_blockEnd: block && showLabel }"
    >
      <slot name="trailing">
        <PfIcon
          v-if="showTrailingSpinner"
          class="pfButton__iconSpin"
          :name="spinnerIcon"
          :size="iconSizeForButton"
        />
        <PfIcon
          v-else-if="effectiveTrailingIcon"
          :name="effectiveTrailingIcon"
          :size="iconSizeForButton"
        />
      </slot>
    </span>
  </component>
</template>

<style scoped lang="scss">
@keyframes pfButton-spin {
  to {
    transform: rotate(360deg);
  }
}

.pfButton {
  margin: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);
  font-weight: var(--pf-font-weight-bold);
  line-height: var(--pf-line-height-sm);
  text-decoration: none;

  border-width: var(--pf-stroke-width);
  border-style: solid;

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    color var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: pointer;
  user-select: none;

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    outline: none;
  }

  &_disabled,
  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.55;

    cursor: not-allowed;
  }

  &_block {
    width: 100%;
  }

  &_size_xs {
    padding: var(--pf-space-xs) var(--pf-space-sm);
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-xs);

    border-radius: var(--pf-radius-sm);
  }

  &_size_sm {
    padding: var(--pf-space-xs) var(--pf-space-sm);
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-sm);

    border-radius: var(--pf-radius-sm);
  }

  &_size_md {
    padding: var(--pf-space-sm) var(--pf-space-lg);
    gap: var(--pf-space-sm);

    font-size: var(--pf-font-size-sm);

    border-radius: var(--pf-radius-sm);
  }

  &_size_lg {
    padding: var(--pf-space-md) var(--pf-space-xl);
    gap: var(--pf-space-sm);

    font-size: var(--pf-font-size-md);
    line-height: var(--pf-line-height-md);

    border-radius: var(--pf-radius-md);
  }

  &_size_xl {
    padding: var(--pf-space-md) var(--pf-space-xl);
    gap: var(--pf-space-sm);

    font-size: var(--pf-font-size-lg);
    line-height: var(--pf-line-height-md);

    border-radius: var(--pf-radius-md);
  }

  &_square {
    &.pfButton_size_xs {
      padding: var(--pf-space-xs);
    }

    &.pfButton_size_sm {
      padding: var(--pf-space-sm);
    }

    &.pfButton_size_md {
      padding: var(--pf-space-sm);
    }

    &.pfButton_size_lg {
      padding: var(--pf-space-md);
    }

    &.pfButton_size_xl {
      padding: var(--pf-space-md);
    }
  }

  &_iconOnly {
    aspect-ratio: 1;

    &.pfButton_size_xs {
      padding: var(--pf-space-xs);
    }

    &.pfButton_size_sm {
      padding: var(--pf-space-xs);
    }

    &.pfButton_size_md {
      padding: var(--pf-space-sm);
    }

    &.pfButton_size_lg {
      padding: var(--pf-space-md);
    }

    &.pfButton_size_xl {
      padding: var(--pf-space-md);
    }
  }

  &_block.pfButton_hasTrailingPush {
    justify-content: flex-start;
  }

  &_color_primary {
    --pf-btn-accent: var(--pf-color-primary);
    --pf-btn-accent-hover: var(--pf-color-primary-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_color_secondary {
    --pf-btn-accent: var(--pf-color-secondary);
    --pf-btn-accent-hover: var(--pf-color-secondary-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_color_success {
    --pf-btn-accent: var(--pf-color-success);
    --pf-btn-accent-hover: var(--pf-color-success-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_color_info {
    --pf-btn-accent: var(--pf-color-info);
    --pf-btn-accent-hover: var(--pf-color-info-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_color_warning {
    --pf-btn-accent: var(--pf-color-warning);
    --pf-btn-accent-hover: var(--pf-color-warning-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_color_error {
    --pf-btn-accent: var(--pf-color-error);
    --pf-btn-accent-hover: var(--pf-color-error-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_color_neutral {
    --pf-btn-accent: var(--pf-color-neutral);
    --pf-btn-accent-hover: var(--pf-color-neutral-hover);
    --pf-btn-on-accent: var(--pf-color-surface);
  }

  &_variant_solid {
    color: var(--pf-btn-on-accent);

    background-color: var(--pf-btn-accent);
    border-color: var(--pf-btn-accent);

    &:hover:not(:disabled):not(.pfButton_disabled):not([aria-disabled='true']) {
      background-color: var(--pf-btn-accent-hover);
      border-color: var(--pf-btn-accent-hover);
    }
  }

  &_variant_outline {
    color: var(--pf-btn-accent);

    background-color: transparent;
    border-color: var(--pf-btn-accent);

    &:hover:not(:disabled):not(.pfButton_disabled):not([aria-disabled='true']) {
      background-color: color-mix(
        in srgb,
        var(--pf-btn-accent) 10%,
        transparent
      );
    }
  }

  &_variant_soft {
    color: var(--pf-btn-accent);

    background-color: color-mix(in srgb, var(--pf-btn-accent) 16%, transparent);
    border-color: transparent;

    &:hover:not(:disabled):not(.pfButton_disabled):not([aria-disabled='true']) {
      background-color: color-mix(
        in srgb,
        var(--pf-btn-accent) 24%,
        transparent
      );
    }
  }

  &_variant_subtle {
    color: var(--pf-btn-accent);

    background-color: color-mix(in srgb, var(--pf-btn-accent) 8%, transparent);
    border-color: transparent;

    &:hover:not(:disabled):not(.pfButton_disabled):not([aria-disabled='true']) {
      background-color: color-mix(
        in srgb,
        var(--pf-btn-accent) 14%,
        transparent
      );
    }
  }

  &_variant_ghost {
    color: var(--pf-btn-accent);

    background-color: transparent;
    border-color: transparent;

    &:hover:not(:disabled):not(.pfButton_disabled):not([aria-disabled='true']) {
      background-color: color-mix(
        in srgb,
        var(--pf-btn-accent) 10%,
        transparent
      );
    }
  }

  &_variant_link {
    padding-block: 0;
    padding-inline: var(--pf-space-xs);

    color: var(--pf-btn-accent);

    background-color: transparent;
    border-color: transparent;

    &:hover:not(:disabled):not(.pfButton_disabled):not([aria-disabled='true']) {
      color: var(--pf-btn-accent-hover);
      text-decoration: underline;
    }
  }
}

.pfButton__label {
  min-width: 0;
}

.pfButton__leading,
.pfButton__trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pfButton__leadingAvatar {
  flex-shrink: 0;
}

.pfButton_block .pfButton__trailing_blockEnd {
  margin-inline-start: auto;
}

.pfButton__iconSpin {
  animation: pfButton-spin 0.85s linear infinite;
}
</style>
