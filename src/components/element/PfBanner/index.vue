<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
  type Slots,
} from 'vue';
import PfButton from '../PfButton/index.vue';
import PfIcon from '../PfIcon/index.vue';
import type { PfIconSize } from '../PfIcon/iconSizes';
import type { PfIconName } from '../PfIcon/paths';
import type {
  PfAlertActionProps,
  PfAlertCloseButtonProps,
} from '../PfAlert/index.vue';

export type PfBannerColor =
  | 'error'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'neutral';

/** Button props for the `actions` prop (like `PfAlert`). */
export type PfBannerActionProps = PfAlertActionProps;

export type PfBannerCloseButtonProps = PfAlertCloseButtonProps;

export type PfBannerUi = Partial<{
  root: string;
  container: string;
  left: string;
  center: string;
  right: string;
  link: string;
  icon: string;
  title: string;
  actions: string;
  close: string;
}>;

const BANNER_STORAGE_PREFIX = 'banner-';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    /** Unique id: on close, written to `localStorage`; banner stays hidden after reload. */
    id?: string;
    title?: string;
    icon?: PfIconName;
    color?: PfBannerColor;
    actions?: PfBannerActionProps[];
    /** Link: `href` wins over `to` */
    href?: string;
    to?: string;
    target?: '_blank' | '_parent' | '_self' | '_top' | string;
    rel?: string;
    close?: boolean | PfBannerCloseButtonProps;
    closeIcon?: PfIconName;
    ui?: PfBannerUi;
  }>(),
  {
    color: 'primary',
  }
);

const emit = defineEmits<{
  close: [];
}>();

const attrs = useAttrs();
const slots: Slots = useSlots();

const visible = ref(true);

onMounted(() => {
  if (props.id != null && props.id !== '') {
    try {
      if (typeof window !== 'undefined') {
        const key = `${BANNER_STORAGE_PREFIX}${props.id}`;
        if (window.localStorage.getItem(key) != null) {
          visible.value = false;
        }
      }
    } catch {
      /* ignore quota / private mode */
    }
  }
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const linkHref = computed(() => props.href ?? props.to ?? undefined);

const isLink = computed(
  () => typeof linkHref.value === 'string' && linkHref.value.length > 0
);

const hasLeadingSlot = computed(() => slots.leading != null);
const showIcon = computed(() => props.icon != null && !hasLeadingSlot.value);

const hasTitleSlot = computed(() => slots.title != null);
const showTitle = computed(
  () => hasTitleSlot.value || (props.title != null && props.title !== '')
);

const showActionsProp = computed(
  () => props.actions != null && props.actions.length > 0
);
const hasActionsSlot = computed(() => slots.actions != null);
const showActions = computed(
  () => hasActionsSlot.value || showActionsProp.value
);

const showClose = computed(() => props.close != null && props.close !== false);

/** Whole bar is a link only when there are no other interactive controls (valid HTML). */
const linkAsRoot = computed(
  () => isLink.value && !showClose.value && !showActions.value
);

const rootTag = computed(() =>
  linkAsRoot.value ? resolveDynamicComponent('a') : resolvedTag.value
);

const rootClass = computed(() => [
  'pfBanner',
  `pfBanner_color_${props.color}`,
  linkAsRoot.value ? 'pfBanner_linkRoot' : null,
  attrs.class,
  props.ui?.root,
]);

const rootBind = computed(() => {
  if (linkAsRoot.value) {
    return {
      href: linkHref.value,
      target: props.target,
      rel: props.rel,
      ...passthroughAttrs.value,
    };
  }
  return passthroughAttrs.value;
});

const iconSize = computed((): PfIconSize => 'md');

const closeIconName = computed(
  (): PfIconName => props.closeIcon ?? 'crossSmall'
);

const closeButtonBind = computed(() => {
  const base = {
    size: 'md' as const,
    color: 'neutral' as const,
    variant: 'ghost' as const,
    iconOnly: true as const,
    icon: closeIconName.value,
    ariaLabel: 'Close',
    type: 'button' as const,
  };
  if (typeof props.close === 'object') {
    return {
      ...base,
      ...props.close,
      iconOnly: true as const,
      icon: closeIconName.value,
      ariaLabel: props.close.ariaLabel ?? base.ariaLabel,
    };
  }
  return base;
});

function resolveAction(action: PfBannerActionProps) {
  return {
    size: 'xs' as const,
    color: 'neutral' as const,
    ...action,
  };
}

function dismissBanner(ev?: Event) {
  ev?.preventDefault();
  ev?.stopPropagation();
  if (props.id != null && props.id !== '') {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`${BANNER_STORAGE_PREFIX}${props.id}`, '1');
      }
    } catch {
      /* ignore */
    }
  }
  visible.value = false;
  emit('close');
}

function onCloseButtonClick(ev: MouseEvent) {
  dismissBanner(ev);
}

const linkRel = computed(() => {
  if (props.rel != null) return props.rel;
  if (props.target === '_blank') return 'noopener noreferrer';
  return undefined;
});
</script>

<template>
  <component :is="rootTag" v-if="visible" :class="rootClass" v-bind="rootBind">
    <div class="pfBanner__container" :class="ui?.container">
      <div class="pfBanner__left" :class="ui?.left" aria-hidden="true" />

      <div class="pfBanner__center" :class="ui?.center">
        <a
          v-if="isLink && !linkAsRoot"
          class="pfBanner__link"
          :class="ui?.link"
          :href="linkHref"
          :target="target"
          :rel="linkRel"
        >
          <span v-if="hasLeadingSlot" class="pfBanner__leading">
            <slot name="leading" />
          </span>
          <span v-else-if="showIcon" class="pfBanner__icon" :class="ui?.icon">
            <PfIcon :name="icon!" :size="iconSize" />
          </span>
          <span v-if="showTitle" class="pfBanner__title" :class="ui?.title">
            <slot name="title">{{ title }}</slot>
          </span>
        </a>
        <template v-else>
          <span v-if="hasLeadingSlot" class="pfBanner__leading">
            <slot name="leading" />
          </span>
          <span v-else-if="showIcon" class="pfBanner__icon" :class="ui?.icon">
            <PfIcon :name="icon!" :size="iconSize" />
          </span>
          <span v-if="showTitle" class="pfBanner__title" :class="ui?.title">
            <slot name="title">{{ title }}</slot>
          </span>
        </template>
      </div>

      <div class="pfBanner__right" :class="ui?.right">
        <div v-if="showActions" class="pfBanner__actions" :class="ui?.actions">
          <slot name="actions">
            <PfButton
              v-for="(action, index) in actions"
              :key="index"
              v-bind="resolveAction(action)"
            />
          </slot>
        </div>
        <div v-if="showClose" class="pfBanner__close" :class="ui?.close">
          <slot name="close" :close="dismissBanner">
            <PfButton v-bind="closeButtonBind" @click="onCloseButtonClick" />
          </slot>
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfBanner {
  --pf-banner-accent: var(--pf-color-primary);
  --pf-banner-accent-hover: var(--pf-color-primary-hover);
  --pf-banner-fg: var(--pf-color-surface);

  position: relative;
  z-index: 50;

  width: 100%;
  display: block;
  box-sizing: border-box;

  color: var(--pf-banner-fg);
  font-family: var(--pf-font-sans);
  text-decoration: none;

  background-color: var(--pf-banner-accent);

  transition: background-color var(--pf-animation-duration)
    var(--pf-animation-easing);

  &_color_primary {
    --pf-banner-accent: var(--pf-color-primary);
    --pf-banner-accent-hover: var(--pf-color-primary-hover);
  }

  &_color_secondary {
    --pf-banner-accent: var(--pf-color-secondary);
    --pf-banner-accent-hover: var(--pf-color-secondary-hover);
  }

  &_color_success {
    --pf-banner-accent: var(--pf-color-success);
    --pf-banner-accent-hover: var(--pf-color-success-hover);
  }

  &_color_info {
    --pf-banner-accent: var(--pf-color-info);
    --pf-banner-accent-hover: var(--pf-color-info-hover);
  }

  &_color_warning {
    --pf-banner-accent: var(--pf-color-warning);
    --pf-banner-accent-hover: var(--pf-color-warning-hover);
  }

  &_color_error {
    --pf-banner-accent: var(--pf-color-error);
    --pf-banner-accent-hover: var(--pf-color-error-hover);
  }

  &_color_neutral {
    --pf-banner-accent: var(--pf-color-text);
    --pf-banner-accent-hover: color-mix(
      in srgb,
      var(--pf-color-text) 88%,
      var(--pf-color-surface)
    );
    --pf-banner-fg: var(--pf-color-surface);
  }

  &_linkRoot:hover {
    background-color: var(--pf-banner-accent-hover);
  }
}

.pfBanner__container {
  margin-inline: auto;

  padding-inline: var(--pf-space-lg);
  max-width: 100%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-space-md);
  box-sizing: border-box;
}

.pfBanner__left {
  min-width: 0;
  display: none;
  flex: 1 1 0;

  @media (min-width: 64rem) {
    display: flex;
    align-items: center;
  }
}

.pfBanner__center {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  gap: var(--pf-space-sm);

  @media (min-width: 64rem) {
    flex: 0 1 auto;
  }
}

.pfBanner__right {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 0;
  gap: var(--pf-space-sm);
}

.pfBanner__link {
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);

  color: inherit;
  text-decoration: none;

  &:hover {
    color: inherit;
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    border-radius: var(--pf-radius-sm);
    outline: none;
  }
}

.pfBanner__leading {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.pfBanner__icon {
  display: flex;
  flex-shrink: 0;

  color: inherit;

  pointer-events: none;

  :deep(.pfIcon__svg) {
    display: block;
  }
}

.pfBanner__title {
  color: inherit;
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfBanner__actions {
  isolation: isolate;

  display: flex;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: var(--pf-space-sm);

  :deep(.pfButton_color_neutral.pfButton_variant_ghost),
  :deep(.pfButton_color_neutral.pfButton_variant_link) {
    --pf-btn-accent: var(--pf-banner-fg);
    --pf-btn-accent-hover: var(--pf-banner-fg);
  }
}

.pfBanner__close {
  margin-inline-end: calc(-1 * var(--pf-space-xs));

  flex-shrink: 0;

  @media (min-width: 64rem) {
    margin-inline-end: 0;
  }

  :deep(.pfButton_color_neutral.pfButton_variant_ghost) {
    --pf-btn-accent: var(--pf-banner-fg);
    --pf-btn-accent-hover: var(--pf-banner-fg);
  }
}
</style>
