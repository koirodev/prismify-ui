<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
} from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfChip from '../../element/PfChip/index.vue';
import type { PfBadgeAvatarProps } from '../../element/PfBadge/index.vue';
import type {
  PfChipColor,
  PfChipPosition,
  PfChipSize,
} from '../../element/PfChip/index.vue';

export type PfUserSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** `PfAvatar` props without `size` — size comes from `PfUser`. */
export type PfUserAvatarProps = Omit<PfBadgeAvatarProps, 'size'>;

/** `PfChip` props without `size` and `inset` — set from `PfUser`. */
export type PfUserChipProps = Partial<{
  as: string | Component;
  show: boolean;
  text: string | number;
  color: PfChipColor;
  position: PfChipPosition;
  standalone: boolean;
}>;

export type PfUserUi = Partial<{
  root: string;
  wrapper: string;
  name: string;
  description: string;
  avatar: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or component when not a link (empty `href` / `to`). */
    as?: string | Component;
    name?: string;
    description?: string;
    avatar?: PfUserAvatarProps;
    /** `PfChip` indicator over the avatar (or `avatar` slot content). */
    chip?: boolean | PfUserChipProps;
    size?: PfUserSize;
    orientation?: 'horizontal' | 'vertical';
    /** Link: same as `href` (`href` wins). */
    href?: string;
    to?: string;
    target?: '_blank' | '_parent' | '_self' | '_top' | string;
    rel?: string;
    download?: string | boolean;
    onClick?: (event: MouseEvent) => void | Promise<void>;
    ui?: PfUserUi;
  }>(),
  {
    size: 'md',
    orientation: 'horizontal',
  }
);

const attrs = useAttrs();
const slots = useSlots();

const isLink = computed(() => {
  const h = props.href ?? props.to;
  return typeof h === 'string' && h.length > 0;
});

const linkHref = computed(() => props.href ?? props.to ?? undefined);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  delete a.onClick;
  return a;
});

const attrsClass = computed(() => attrs.class);

const mergedClass = computed(() => [
  'pfUser',
  `pfUser_size_${props.size}`,
  `pfUser_orientation_${props.orientation}`,
  isLink.value && 'pfUser_link',
  attrsClass.value,
  props.ui?.root,
]);

const wrapperClass = computed(() => ['pfUser__wrapper', props.ui?.wrapper]);

const nameClass = computed(() => ['pfUser__name', props.ui?.name]);

const descriptionClass = computed(() => [
  'pfUser__description',
  props.ui?.description,
]);

const avatarWrapClass = computed(() => ['pfUser__avatar', props.ui?.avatar]);

const showChip = computed(() => props.chip != null && props.chip !== false);

const chipBindings = computed((): Record<string, unknown> | null => {
  if (!showChip.value) return null;
  const size = props.size as PfChipSize;
  const base = {
    size,
    inset: true,
    show: true,
  };
  if (props.chip === true) {
    return { ...base, color: 'success' as const };
  }
  return {
    ...(props.chip as PfUserChipProps),
    ...base,
    inset: true,
    size,
  };
});

const avatarBindings = computed(() => {
  const a = props.avatar;
  const size = props.size;
  if (a != null) {
    return { ...a, size };
  }
  if (props.name?.trim()) {
    return { alt: props.name, size };
  }
  return null;
});

const showAvatarBlock = computed(
  () => slots.avatar != null || avatarBindings.value != null
);

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
  handlers.forEach((fn) => fn(e));
}

function onRootClick(e: MouseEvent) {
  invokeClickHandlers(e);
}

const resolvedRootTag = computed(() => {
  if (isLink.value) return 'a';
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const linkRel = computed(() => {
  if (props.rel != null && props.rel !== '') return props.rel;
  if (props.target === '_blank') return 'noopener noreferrer';
  return undefined;
});
</script>

<template>
  <component
    :is="resolvedRootTag"
    :class="mergedClass"
    :href="isLink ? linkHref : undefined"
    :target="isLink ? target : undefined"
    :rel="isLink ? linkRel : undefined"
    :download="
      isLink ? (download === true ? '' : download || undefined) : undefined
    "
    v-bind="passthroughAttrs"
    @click="onRootClick"
  >
    <div v-if="showAvatarBlock" :class="avatarWrapClass">
      <PfChip
        v-if="showChip && chipBindings && slots.avatar"
        v-bind="chipBindings"
      >
        <slot name="avatar" />
      </PfChip>
      <slot v-else-if="slots.avatar" name="avatar" />
      <PfChip
        v-else-if="showChip && chipBindings && avatarBindings"
        v-bind="chipBindings"
      >
        <PfAvatar v-bind="avatarBindings" />
      </PfChip>
      <PfAvatar v-else-if="avatarBindings" v-bind="avatarBindings" />
    </div>

    <div :class="wrapperClass">
      <div v-if="slots.name || name" :class="nameClass">
        <slot name="name">{{ name }}</slot>
      </div>
      <div v-if="slots.description || description" :class="descriptionClass">
        <slot name="description">{{ description }}</slot>
      </div>
      <slot />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfUser {
  /* Gap between name and description (local to PfUser) */
  --pf-user-text-gap: 3px;

  position: relative;

  max-width: 100%;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  &_orientation_horizontal {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
  }

  &_orientation_vertical {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__avatar {
    flex-shrink: 0;
  }

  &__wrapper {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: var(--pf-user-text-gap);
  }

  &__name {
    max-width: 100%;

    color: var(--pf-color-text);
    font-weight: var(--pf-font-weight-medium);
    line-height: var(--pf-line-height-sm);
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__description {
    max-width: 100%;

    color: var(--pf-color-muted);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-line-height-md);
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &_link {
    text-decoration: none;

    outline: none;

    transition: color var(--pf-animation-duration) var(--pf-animation-easing);

    &:hover .pfUser__name,
    &:focus-visible .pfUser__name {
      color: var(--pf-color-primary);
    }

    &:hover .pfUser__description,
    &:focus-visible .pfUser__description {
      color: var(--pf-color-text);
    }

    &:hover .pfUser__avatar :deep(.pfAvatar),
    &:focus-visible .pfUser__avatar :deep(.pfAvatar) {
      transform: scale(1.05);
      transition: transform var(--pf-animation-duration)
        var(--pf-animation-easing);
    }
  }

  &_size_xs.pfUser_orientation_horizontal {
    gap: 0.375rem;
  }

  &_size_xs {
    --pf-user-text-gap: 1px;

    .pfUser__name {
      font-size: var(--pf-font-size-xs);
    }

    .pfUser__description {
      font-size: var(--pf-font-size-xs);
    }
  }

  &_size_sm.pfUser_orientation_horizontal {
    gap: var(--pf-space-sm);
  }

  &_size_sm {
    --pf-user-text-gap: 2px;

    .pfUser__name {
      font-size: var(--pf-font-size-xs);
    }

    .pfUser__description {
      font-size: var(--pf-font-size-xs);
    }
  }

  &_size_md.pfUser_orientation_horizontal {
    gap: var(--pf-space-sm);
  }

  &_size_md {
    --pf-user-text-gap: 3px;

    .pfUser__name {
      font-size: var(--pf-font-size-sm);
    }

    .pfUser__description {
      font-size: var(--pf-font-size-xs);
    }
  }

  &_size_lg.pfUser_orientation_horizontal {
    gap: var(--pf-space-sm);
  }

  &_size_lg {
    --pf-user-text-gap: 4px;

    .pfUser__name {
      font-size: var(--pf-font-size-sm);
    }

    .pfUser__description {
      font-size: var(--pf-font-size-sm);
    }
  }

  &_size_xl.pfUser_orientation_horizontal {
    gap: 0.625rem;
  }

  &_size_xl {
    --pf-user-text-gap: 5px;

    .pfUser__name {
      font-size: var(--pf-font-size-md);
    }

    .pfUser__description {
      font-size: var(--pf-font-size-sm);
    }
  }

  &_size_xs.pfUser_orientation_vertical {
    gap: 0.375rem;
  }

  &_size_sm.pfUser_orientation_vertical {
    gap: var(--pf-space-sm);
  }

  &_size_md.pfUser_orientation_vertical {
    gap: var(--pf-space-sm);
  }

  &_size_lg.pfUser_orientation_vertical {
    gap: var(--pf-space-sm);
  }

  &_size_xl.pfUser_orientation_vertical {
    gap: 0.625rem;
  }
}
</style>
