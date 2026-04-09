<script setup lang="ts">
import {
  computed,
  inject,
  ref,
  resolveDynamicComponent,
  useAttrs,
  watch,
} from 'vue';
import type { Component } from 'vue';
import { PF_AVATAR_GROUP_INJECTION_KEY } from '../PfAvatarGroup/injection';
import PfIcon from '../PfIcon/index.vue';
import type { PfIconSize } from '../PfIcon/iconSizes';
import type { PfIconName } from '../PfIcon/paths';

export type PfAvatarChipColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfAvatarChipProps = {
  color?: PfAvatarChipColor;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /**
     * Override image tag/component: default `img`;
     * with Nuxt `@nuxt/image` usually `{ img: 'NuxtImg' }` (string from global registration).
     * Keep `<img>` explicitly: `{ img: 'img' }`. For a component object in `setup`, use `markRaw(Comp)`.
     */
    as?: { img?: string | Component };
    src?: string;
    alt?: string;
    icon?: PfIconName;
    text?: string;
    size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    /** Ring around the avatar; object sets ring color. */
    chip?: boolean | PfAvatarChipProps;
    loading?: 'lazy' | 'eager';
    /** See [fetchpriority](https://developer.mozilla.org/docs/Web/HTML/Element/img#fetchpriority) */
    fetchPriority?: 'high' | 'low' | 'auto';
    /** See [referrerpolicy](https://developer.mozilla.org/docs/Web/HTML/Element/img#referrerpolicy) */
    referrerpolicy?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    decoding?: 'async' | 'auto' | 'sync';
    height?: number | string;
    sizes?: string;
    srcset?: string;
    usemap?: string;
    width?: number | string;
  }>(),
  { size: 'md' }
);

const emit = defineEmits<{
  error: [event: Event];
}>();

const attrs = useAttrs();

const avatarGroupInjected = inject(PF_AVATAR_GROUP_INJECTION_KEY, null);

const resolvedSize = computed(
  () => avatarGroupInjected?.value.size ?? props.size
);

const imageError = ref(false);

watch(
  () => props.src,
  () => {
    imageError.value = false;
  }
);

function onImgError(e: Event) {
  imageError.value = true;
  emit('error', e);
}

const imageIs = computed(() => {
  const img = props.as?.img;
  if (img == null) return 'img';
  if (typeof img === 'string') {
    if (img === 'img') return 'img';
    return resolveDynamicComponent(img);
  }
  return img;
});

const showChip = computed(() => Boolean(props.chip));

const chipColorClass = computed(() => {
  if (!showChip.value) return null;
  const c =
    typeof props.chip === 'object' && props.chip.color != null
      ? props.chip.color
      : 'primary';
  return `pfAvatar_chipColor_${c}`;
});

const rootClass = computed(() => [
  'pfAvatar',
  `pfAvatar_size_${resolvedSize.value}`,
  showChip.value && 'pfAvatar_withChip',
  chipColorClass.value,
]);

const attrsClass = computed(() => attrs.class);
const attrsStyle = computed(() => attrs.style);

const passthroughToImg = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>;
  return rest;
});

const showImage = computed(() => Boolean(props.src) && !imageError.value);

const initials = computed(() => initialsFromAlt(props.alt));

const showFallback = computed(() => !showImage.value);

const effectiveAriaLabel = computed(() => {
  if (showImage.value) return undefined;
  return props.alt?.trim() || undefined;
});

const iconSize = computed((): PfIconSize => {
  switch (resolvedSize.value) {
    case '3xs':
      return '3xs';
    case '2xs':
      return '2xs';
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
    case '2xl':
      return '2xl';
    case '3xl':
      return '3xl';
    default:
      return 'md';
  }
});

const imgBind = computed(() => ({
  src: props.src,
  alt: props.alt,
  loading: props.loading,
  fetchPriority: props.fetchPriority,
  referrerpolicy: props.referrerpolicy,
  crossorigin: props.crossorigin,
  decoding: props.decoding,
  height: props.height,
  sizes: props.sizes,
  srcset: props.srcset,
  usemap: props.usemap,
  width: props.width,
  ...passthroughToImg.value,
  class: 'pfAvatar__image',
}));

function initialsFromAlt(alt: string | undefined): string {
  if (!alt?.trim()) return '';
  const parts = alt.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    const w = parts[0]!;
    return w.length > 1 ? w.slice(0, 2).toUpperCase() : w.toUpperCase();
  }
  const a = parts[0]![0];
  const b = parts[parts.length - 1]![0];
  return `${a}${b}`.toUpperCase();
}
</script>

<template>
  <span
    :class="[rootClass, attrsClass]"
    :style="attrsStyle"
    :role="showFallback && effectiveAriaLabel ? 'img' : undefined"
    :aria-label="showFallback ? effectiveAriaLabel : undefined"
    :aria-hidden="showFallback && !effectiveAriaLabel ? true : undefined"
  >
    <span class="pfAvatar__inner">
      <component
        :is="imageIs"
        v-if="showImage"
        v-bind="imgBind"
        @error="onImgError"
      />
      <span v-else class="pfAvatar__fallback">
        <span v-if="icon" class="pfAvatar__iconWrap">
          <PfIcon :name="icon" :size="iconSize" />
        </span>
        <span v-else-if="text" class="pfAvatar__text">{{ text }}</span>
        <span v-else-if="initials" class="pfAvatar__text">{{ initials }}</span>
      </span>
    </span>
  </span>
</template>

<style scoped lang="scss">
.pfAvatar {
  position: relative;
  margin: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;

  color: var(--pf-color-muted);
  font-family: var(--pf-font-sans);
  font-weight: var(--pf-font-weight-medium);
  line-height: 1;
  text-align: center;
  vertical-align: middle;

  background-color: color-mix(
    in srgb,
    var(--pf-color-muted) 12%,
    var(--pf-color-surface)
  );
  border-radius: 50%;
  overflow: hidden;

  user-select: none;

  &_size_3xs {
    width: var(--pf-avatar-size-3xs);
    height: var(--pf-avatar-size-3xs);

    font-size: var(--pf-avatar-text-3xs);
  }

  &_size_2xs {
    width: var(--pf-avatar-size-2xs);
    height: var(--pf-avatar-size-2xs);

    font-size: var(--pf-avatar-text-2xs);
  }

  &_size_xs {
    width: var(--pf-avatar-size-xs);
    height: var(--pf-avatar-size-xs);

    font-size: var(--pf-avatar-text-xs);
  }

  &_size_sm {
    width: var(--pf-avatar-size-sm);
    height: var(--pf-avatar-size-sm);

    font-size: var(--pf-avatar-text-sm);
  }

  &_size_md {
    width: var(--pf-avatar-size-md);
    height: var(--pf-avatar-size-md);

    font-size: var(--pf-avatar-text-md);
  }

  &_size_lg {
    width: var(--pf-avatar-size-lg);
    height: var(--pf-avatar-size-lg);

    font-size: var(--pf-avatar-text-lg);
  }

  &_size_xl {
    width: var(--pf-avatar-size-xl);
    height: var(--pf-avatar-size-xl);

    font-size: var(--pf-avatar-text-xl);
  }

  &_size_2xl {
    width: var(--pf-avatar-size-2xl);
    height: var(--pf-avatar-size-2xl);

    font-size: var(--pf-avatar-text-2xl);
  }

  &_size_3xl {
    width: var(--pf-avatar-size-3xl);
    height: var(--pf-avatar-size-3xl);

    font-size: var(--pf-avatar-text-3xl);
  }

  &_withChip {
    box-shadow:
      0 0 0 2px var(--pf-color-surface),
      0 0 0 4px var(--pf-avatar-chip-color);
  }

  &_chipColor_primary {
    --pf-avatar-chip-color: var(--pf-color-primary);
  }

  &_chipColor_secondary {
    --pf-avatar-chip-color: var(--pf-color-secondary);
  }

  &_chipColor_success {
    --pf-avatar-chip-color: var(--pf-color-success);
  }

  &_chipColor_info {
    --pf-avatar-chip-color: var(--pf-color-info);
  }

  &_chipColor_warning {
    --pf-avatar-chip-color: var(--pf-color-warning);
  }

  &_chipColor_error {
    --pf-avatar-chip-color: var(--pf-color-error);
  }

  &_chipColor_neutral {
    --pf-avatar-chip-color: var(--pf-color-neutral);
  }
}

.pfAvatar__inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: inherit;
}

.pfAvatar__image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;

  border-radius: inherit;
}

.pfAvatar__fallback {
  padding: 0 0.125em;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  line-height: 1;
}

.pfAvatar__text {
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfAvatar__iconWrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--pf-color-muted);
  line-height: 0;
}
</style>
