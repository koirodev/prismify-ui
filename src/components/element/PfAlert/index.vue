<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
  type Slots,
} from 'vue';
import PfAvatar from '../PfAvatar/index.vue';
import PfButton from '../PfButton/index.vue';
import PfIcon from '../PfIcon/index.vue';
import type { PfIconSize } from '../PfIcon/iconSizes';
import type { PfIconName } from '../PfIcon/paths';
import type { PfBadgeAvatarProps } from '../PfBadge/index.vue';

export type PfAlertAvatarProps = PfBadgeAvatarProps;

export type PfAlertColor =
  | 'error'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'neutral';

export type PfAlertVariant = 'solid' | 'outline' | 'soft' | 'subtle';

export type PfAlertButtonVariant =
  | 'solid'
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'link';

export type PfAlertActionProps = Partial<{
  label: string;
  color: PfAlertColor;
  variant: PfAlertButtonVariant;
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
  activeColor: PfAlertColor;
  activeVariant: PfAlertButtonVariant;
}>;

export type PfAlertCloseButtonProps = Omit<
  PfAlertActionProps,
  'href' | 'to' | 'target' | 'rel' | 'download'
>;

export type PfAlertUi = Partial<{
  root: string;
  leading: string;
  wrapper: string;
  title: string;
  description: string;
  icon: string;
  avatar: string;
  actions: string;
  end: string;
  close: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    title?: string;
    description?: string;
    icon?: PfIconName;
    avatar?: PfAlertAvatarProps;
    color?: PfAlertColor;
    variant?: PfAlertVariant;
    orientation?: 'vertical' | 'horizontal';
    actions?: PfAlertActionProps[];
    close?: boolean | PfAlertCloseButtonProps;
    closeIcon?: PfIconName;
    ui?: PfAlertUi;
  }>(),
  {
    color: 'primary',
    variant: 'solid',
    orientation: 'vertical',
  }
);

const open = defineModel<boolean>('open', { default: true });

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
  'pfAlert',
  `pfAlert_color_${props.color}`,
  `pfAlert_variant_${props.variant}`,
  `pfAlert_orientation_${props.orientation}`,
  attrs.class,
  props.ui?.root,
]);

const hasTitleSlot = computed(() => slots.title != null);
const hasDescSlot = computed(() => slots.description != null);
const showTitle = computed(
  () => hasTitleSlot.value || (props.title != null && props.title !== '')
);
const showDescription = computed(
  () =>
    hasDescSlot.value || (props.description != null && props.description !== '')
);

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

const defaultAvatarSize = '2xl' as const;

const avatarBind = computed(() => {
  if (props.avatar == null) return null;
  return {
    ...props.avatar,
    size: props.avatar.size ?? defaultAvatarSize,
  };
});

const leadingIconSize = computed((): PfIconSize => 'lg');

const showActionsProp = computed(
  () => props.actions != null && props.actions.length > 0
);
const hasActionsSlot = computed(() => slots.actions != null);
const showActionsVertical = computed(
  () =>
    props.orientation === 'vertical' &&
    (hasActionsSlot.value || showActionsProp.value)
);
const showActionsHorizontal = computed(
  () =>
    props.orientation === 'horizontal' &&
    (hasActionsSlot.value || showActionsProp.value)
);

const showClose = computed(() => props.close != null && props.close !== false);

const closeIconName = computed(
  (): PfIconName => props.closeIcon ?? 'crossSmall'
);

const closeButtonBind = computed(() => {
  const base = {
    size: 'md' as const,
    color: 'neutral' as const,
    variant: 'link' as const,
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

function resolveAction(action: PfAlertActionProps) {
  return {
    size: 'xs' as const,
    ...action,
  };
}

function onCloseClick() {
  open.value = false;
}

const titleDescGapClass = computed(() =>
  showTitle.value && showDescription.value
    ? 'pfAlert__description_afterTitle'
    : null
);
</script>

<template>
  <component
    :is="resolvedTag"
    v-if="open"
    :class="rootClass"
    role="alert"
    v-bind="passthroughAttrs"
  >
    <span v-if="showLeading" class="pfAlert__leading" :class="ui?.leading">
      <slot name="leading">
        <PfAvatar
          v-if="avatarBind"
          class="pfAlert__avatar"
          :class="ui?.avatar"
          v-bind="avatarBind"
        />
        <span v-else-if="showIcon" class="pfAlert__icon" :class="ui?.icon">
          <PfIcon :name="icon!" :size="leadingIconSize" />
        </span>
      </slot>
    </span>

    <div class="pfAlert__wrapper" :class="ui?.wrapper">
      <div v-if="showTitle" class="pfAlert__title" :class="ui?.title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div
        v-if="showDescription"
        class="pfAlert__description"
        :class="[titleDescGapClass, ui?.description]"
      >
        <slot name="description">{{ description }}</slot>
      </div>
      <div
        v-if="showActionsVertical"
        class="pfAlert__actions pfAlert__actions_vertical"
        :class="ui?.actions"
      >
        <slot name="actions">
          <PfButton
            v-for="(action, index) in actions"
            :key="index"
            v-bind="resolveAction(action)"
          />
        </slot>
      </div>
    </div>

    <div
      v-if="showClose || showActionsHorizontal"
      class="pfAlert__end"
      :class="ui?.end"
    >
      <div
        v-if="showActionsHorizontal"
        class="pfAlert__actions pfAlert__actions_horizontal"
        :class="ui?.actions"
      >
        <slot name="actions">
          <PfButton
            v-for="(action, index) in actions"
            :key="index"
            v-bind="resolveAction(action)"
          />
        </slot>
      </div>
      <div v-if="showClose" class="pfAlert__close" :class="ui?.close">
        <slot name="close" :close="onCloseClick">
          <PfButton v-bind="closeButtonBind" @click="onCloseClick" />
        </slot>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfAlert {
  position: relative;

  padding: var(--pf-space-lg);
  width: 100%;
  display: flex;
  gap: var(--pf-space-md);
  box-sizing: border-box;

  color: var(--pf-alert-fg, var(--pf-color-text));
  font-family: var(--pf-font-sans);

  border-width: 0;
  border-style: solid;
  border-radius: var(--pf-radius-md);

  &_orientation_vertical {
    align-items: flex-start;
  }

  &_orientation_horizontal {
    align-items: center;
  }

  &_color_primary {
    --pf-alert-accent: var(--pf-color-primary);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_color_secondary {
    --pf-alert-accent: var(--pf-color-secondary);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_color_success {
    --pf-alert-accent: var(--pf-color-success);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_color_info {
    --pf-alert-accent: var(--pf-color-info);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_color_warning {
    --pf-alert-accent: var(--pf-color-warning);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_color_error {
    --pf-alert-accent: var(--pf-color-error);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_color_neutral {
    --pf-alert-accent: var(--pf-color-neutral);
    --pf-alert-on-accent: var(--pf-color-surface);
  }

  &_variant_solid:not(&_color_neutral) {
    --pf-alert-fg: var(--pf-alert-on-accent);

    background-color: var(--pf-alert-accent);
    border-color: transparent;
  }

  &_variant_outline:not(&_color_neutral) {
    --pf-alert-fg: var(--pf-alert-accent);

    background-color: transparent;
    border-width: var(--pf-stroke-width);
    border-color: color-mix(in srgb, var(--pf-alert-accent) 25%, transparent);
  }

  &_variant_soft:not(&_color_neutral) {
    --pf-alert-fg: var(--pf-alert-accent);

    background-color: color-mix(
      in srgb,
      var(--pf-alert-accent) 10%,
      transparent
    );
    border-color: transparent;
  }

  &_variant_subtle:not(&_color_neutral) {
    --pf-alert-fg: var(--pf-alert-accent);

    background-color: color-mix(
      in srgb,
      var(--pf-alert-accent) 10%,
      transparent
    );
    border-width: var(--pf-stroke-width);
    border-color: color-mix(in srgb, var(--pf-alert-accent) 25%, transparent);
  }

  &_color_neutral.pfAlert_variant_solid {
    --pf-alert-fg: var(--pf-color-surface);

    background-color: var(--pf-color-text);
    border-color: transparent;
  }

  &_color_neutral.pfAlert_variant_outline {
    --pf-alert-fg: var(--pf-color-text);

    background-color: var(--pf-color-surface);
    border-width: var(--pf-stroke-width);
    border-color: var(--pf-border-color);
  }

  &_color_neutral.pfAlert_variant_soft {
    --pf-alert-fg: var(--pf-color-text);

    background-color: color-mix(
      in srgb,
      var(--pf-color-muted) 12%,
      var(--pf-color-surface)
    );
    border-color: transparent;
  }

  &_color_neutral.pfAlert_variant_subtle {
    --pf-alert-fg: var(--pf-color-text);

    background-color: color-mix(
      in srgb,
      var(--pf-color-muted) 12%,
      var(--pf-color-surface)
    );
    border-width: var(--pf-stroke-width);
    border-color: var(--pf-border-color);
  }
}

.pfAlert__leading {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  flex-shrink: 0;
}

.pfAlert_orientation_horizontal .pfAlert__leading {
  align-items: center;
}

.pfAlert__icon {
  flex-shrink: 0;
}

.pfAlert__avatar {
  flex-shrink: 0;
}

.pfAlert__wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
}

.pfAlert__title {
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
}

.pfAlert__description {
  color: color-mix(in srgb, var(--pf-alert-fg, currentColor) 90%, transparent);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfAlert__description_afterTitle {
  margin-top: var(--pf-space-xs);
}

.pfAlert__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: var(--pf-space-sm);
}

.pfAlert__actions_vertical {
  margin-top: var(--pf-space-md);

  align-items: flex-start;
}

.pfAlert_orientation_vertical .pfAlert__end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: var(--pf-space-sm);
}

.pfAlert_orientation_horizontal .pfAlert__end {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  gap: var(--pf-space-sm);
}

.pfAlert__actions_horizontal {
  margin-top: 0;

  align-items: center;
}
</style>
