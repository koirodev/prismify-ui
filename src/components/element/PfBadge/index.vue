<script setup lang="ts">
import {
  computed,
  inject,
  resolveDynamicComponent,
  useSlots,
  type Component,
  type Slots,
} from 'vue';
import PfAvatar from '../PfAvatar/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../PfFieldGroup/injection';
import type { PfAvatarChipProps } from '../PfAvatar/index.vue';
import PfIcon from '../PfIcon/index.vue';
import type { PfIconSize } from '../PfIcon/iconSizes';
import type { PfIconName } from '../PfIcon/paths';

export type PfBadgeAvatarProps = {
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

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    label?: string | number;
    color?:
      | 'error'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warning'
      | 'neutral';
    variant?: 'solid' | 'outline' | 'soft' | 'subtle';
    /** In `PfFieldGroup`, inherits group `size` when no own `size` */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    square?: boolean;
    icon?: PfIconName;
    avatar?: PfBadgeAvatarProps;
    leading?: boolean;
    leadingIcon?: PfIconName;
    trailing?: boolean;
    trailingIcon?: PfIconName;
  }>(),
  {
    color: 'primary',
    variant: 'solid',
    square: false,
    leading: false,
    trailing: false,
  }
);

const slots: Slots = useSlots();

const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' =>
    props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const resolvedTag = computed(() => {
  const a = props.as ?? 'span';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const resolvedLeadingIcon = computed(
  () => props.leadingIcon ?? (props.trailing ? undefined : props.icon)
);
const resolvedTrailingIcon = computed(
  () => props.trailingIcon ?? (props.trailing ? props.icon : undefined)
);

const hasLeading = computed((): boolean => {
  return (
    slots.leading != null ||
    props.avatar != null ||
    resolvedLeadingIcon.value != null
  );
});
const hasTrailing = computed((): boolean => {
  return slots.trailing != null || resolvedTrailingIcon.value != null;
});

const defaultAvatarSize = computed(() => {
  switch (effectiveSize.value) {
    case 'lg':
    case 'xl':
      return '2xs' as const;
    default:
      return '3xs' as const;
  }
});

const avatarBind = computed(() => {
  if (props.avatar == null) return null;
  return {
    ...props.avatar,
    size: props.avatar.size ?? defaultAvatarSize.value,
  };
});

const iconSize = computed((): PfIconSize => {
  switch (props.size) {
    case 'xs':
      return 'xs';
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

const controlClass = computed(() => [
  'pfBadge',
  `pfBadge_color_${props.color}`,
  `pfBadge_variant_${props.variant}`,
  `pfBadge_size_${effectiveSize.value}`,
  props.square && 'pfBadge_square',
]);
</script>

<template>
  <component :is="resolvedTag" :class="controlClass">
    <span v-if="hasLeading" class="pfBadge__leading">
      <slot name="leading">
        <PfAvatar
          v-if="avatarBind"
          class="pfBadge__avatar"
          v-bind="avatarBind"
        />
        <PfIcon
          v-else-if="resolvedLeadingIcon"
          :name="resolvedLeadingIcon"
          :size="iconSize"
        />
      </slot>
    </span>
    <span class="pfBadge__label">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="hasTrailing" class="pfBadge__trailing">
      <slot name="trailing">
        <PfIcon
          v-if="resolvedTrailingIcon"
          :name="resolvedTrailingIcon"
          :size="iconSize"
        />
      </slot>
    </span>
  </component>
</template>

<style scoped lang="scss">
.pfBadge {
  margin: 0;

  max-width: 100%;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
  vertical-align: middle;

  border-width: 0;
  border-style: solid;

  user-select: none;

  &_color_primary {
    --pf-badge-accent: var(--pf-color-primary);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_color_secondary {
    --pf-badge-accent: var(--pf-color-secondary);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_color_success {
    --pf-badge-accent: var(--pf-color-success);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_color_info {
    --pf-badge-accent: var(--pf-color-info);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_color_warning {
    --pf-badge-accent: var(--pf-color-warning);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_color_error {
    --pf-badge-accent: var(--pf-color-error);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_color_neutral {
    --pf-badge-accent: var(--pf-color-neutral);
    --pf-badge-on-accent: var(--pf-color-surface);
  }

  &_variant_solid:not(&_color_neutral) {
    color: var(--pf-badge-on-accent);

    background-color: var(--pf-badge-accent);
    border-color: transparent;
  }

  &_variant_outline:not(&_color_neutral) {
    color: var(--pf-badge-accent);

    background-color: transparent;
    border-width: var(--pf-stroke-width);
    border-color: color-mix(in srgb, var(--pf-badge-accent) 50%, transparent);
  }

  &_variant_soft:not(&_color_neutral) {
    color: var(--pf-badge-accent);

    background-color: color-mix(
      in srgb,
      var(--pf-badge-accent) 10%,
      transparent
    );
    border-color: transparent;
  }

  &_variant_subtle:not(&_color_neutral) {
    color: var(--pf-badge-accent);

    background-color: color-mix(
      in srgb,
      var(--pf-badge-accent) 10%,
      transparent
    );
    border-width: var(--pf-stroke-width);
    border-color: color-mix(in srgb, var(--pf-badge-accent) 25%, transparent);
  }

  &_size_xs {
    padding: 0.125rem var(--pf-space-xs);
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-3xs);
    line-height: 0.75rem;

    border-radius: var(--pf-radius-sm);
  }

  &_size_sm {
    padding: var(--pf-space-xs) 0.375rem;
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-2xs);
    line-height: 0.75rem;

    border-radius: var(--pf-radius-sm);
  }

  &_size_md {
    padding: var(--pf-space-xs) var(--pf-space-sm);
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-xs);

    border-radius: var(--pf-radius-sm);
  }

  &_size_lg {
    padding: var(--pf-space-xs) var(--pf-space-sm);
    gap: 0.375rem;

    font-size: var(--pf-font-size-sm);

    border-radius: var(--pf-radius-md);
  }

  &_size_xl {
    padding: var(--pf-space-xs) 0.625rem;
    gap: 0.375rem;

    font-size: var(--pf-font-size-md);

    border-radius: var(--pf-radius-md);
  }
}

.pfBadge_square.pfBadge_size_xs {
  padding: 0.125rem;
}

.pfBadge_square.pfBadge_size_sm {
  padding: var(--pf-space-xs);
}

.pfBadge_square.pfBadge_size_md,
.pfBadge_square.pfBadge_size_lg,
.pfBadge_square.pfBadge_size_xl {
  padding: var(--pf-space-xs);
}

.pfBadge_color_neutral.pfBadge_variant_solid {
  color: var(--pf-color-surface);

  background-color: var(--pf-color-text);
  border-color: transparent;
}

.pfBadge_color_neutral.pfBadge_variant_outline {
  color: var(--pf-color-text);

  background-color: var(--pf-color-surface);
  border-width: var(--pf-stroke-width);
  border-color: var(--pf-border-color);
}

.pfBadge_color_neutral.pfBadge_variant_soft {
  color: var(--pf-color-text);

  background-color: color-mix(
    in srgb,
    var(--pf-color-muted) 12%,
    var(--pf-color-surface)
  );
  border-color: transparent;
}

.pfBadge_color_neutral.pfBadge_variant_subtle {
  color: var(--pf-color-text);

  background-color: color-mix(
    in srgb,
    var(--pf-color-muted) 12%,
    var(--pf-color-surface)
  );
  border-width: var(--pf-stroke-width);
  border-color: var(--pf-border-color);
}

.pfBadge__label {
  min-width: 0;

  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfBadge__leading,
.pfBadge__trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pfBadge__avatar {
  flex-shrink: 0;
}
</style>
