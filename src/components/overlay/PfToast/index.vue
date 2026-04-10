<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import type {
  PfToastAction,
  PfToastCloseButton,
  PfToastColor,
  PfToastOrientation,
} from '../../../composables/usePfToast';

export type PfToastUi = Partial<{
  root: string;
  wrapper: string;
  title: string;
  description: string;
  icon: string;
  actions: string;
  close: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    title?: string;
    description?: string;
    icon?: PfIconName;
    color?: PfToastColor;
    orientation?: PfToastOrientation;
    close?: boolean | PfToastCloseButton;
    closeIcon?: PfIconName;
    actions?: PfToastAction[];
    progress?: boolean;
    progressDuration?: number;
    progressPaused?: boolean;
    ui?: PfToastUi;
    pulse?: number;
  }>(),
  {
    color: 'primary',
    orientation: 'vertical',
    close: true,
    closeIcon: 'crossSmall',
    actions: () => [],
    progress: true,
    progressDuration: 0,
    progressPaused: false,
    pulse: 0,
  }
);

const emit = defineEmits<{
  close: [];
  action: [action: PfToastAction, event: MouseEvent];
}>();

const attrs = useAttrs();
const slots = useSlots();

const hasTitle = computed(
  () => slots.title != null || (props.title != null && props.title !== '')
);
const hasDescription = computed(
  () =>
    slots.description != null ||
    (props.description != null && props.description !== '')
);

const rootClass = computed(() => [
  'pfToast',
  `pfToast_color_${props.color}`,
  `pfToast_orientation_${props.orientation}`,
  props.pulse > 0 && 'pfToast_pulse',
  attrs.class,
  props.ui?.root,
]);

const closeButtonBind = computed(() => {
  const base = {
    size: 'sm' as const,
    color: 'neutral' as const,
    variant: 'link' as const,
    iconOnly: true as const,
    icon: props.closeIcon,
    ariaLabel: 'Close',
    type: 'button' as const,
  };
  if (props.close && typeof props.close === 'object') {
    return {
      ...base,
      ...props.close,
      iconOnly: true as const,
      icon: props.closeIcon,
      ariaLabel: props.close.ariaLabel ?? base.ariaLabel,
    };
  }
  return base;
});

const showClose = computed(() => props.close !== false);
const showProgress = computed(
  () => props.progress !== false && props.progressDuration > 0
);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

function onCloseClick() {
  emit('close');
}

function onAction(action: PfToastAction, event: MouseEvent) {
  action.onClick?.(event);
  emit('action', action, event);
}
</script>

<template>
  <div :class="rootClass" role="status" v-bind="passthroughAttrs">
    <div
      v-if="icon || slots.leading"
      class="pfToast__leading"
      :class="ui?.icon"
    >
      <slot name="leading">
        <PfIcon v-if="icon" :name="icon" size="md" />
      </slot>
    </div>

    <div class="pfToast__wrapper" :class="ui?.wrapper">
      <div v-if="hasTitle" class="pfToast__title" :class="ui?.title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div
        v-if="hasDescription"
        class="pfToast__description"
        :class="ui?.description"
      >
        <slot name="description">{{ description }}</slot>
      </div>

      <div
        v-if="orientation === 'vertical' && (actions.length || slots.actions)"
        class="pfToast__actions"
        :class="ui?.actions"
      >
        <slot name="actions">
          <PfButton
            v-for="(action, index) in actions"
            :key="`${id ?? 'toast'}-action-${index}`"
            size="xs"
            v-bind="action"
            @click="onAction(action, $event)"
          />
        </slot>
      </div>
    </div>

    <div class="pfToast__end">
      <div
        v-if="orientation === 'horizontal' && (actions.length || slots.actions)"
        class="pfToast__actions"
        :class="ui?.actions"
      >
        <slot name="actions">
          <PfButton
            v-for="(action, index) in actions"
            :key="`${id ?? 'toast'}-action-${index}`"
            size="xs"
            v-bind="action"
            @click="onAction(action, $event)"
          />
        </slot>
      </div>
      <div v-if="showClose" class="pfToast__close" :class="ui?.close">
        <slot name="close" :close="onCloseClick">
          <PfButton v-bind="closeButtonBind" @click="onCloseClick" />
        </slot>
      </div>
    </div>

    <div v-if="showProgress" class="pfToast__progress">
      <span
        class="pfToast__progressBar"
        :style="{
          animationDuration: `${progressDuration}ms`,
          animationPlayState: progressPaused ? 'paused' : 'running',
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfToast {
  position: relative;
  box-sizing: border-box;

  padding: var(--pf-space-md);
  width: min(100%, var(--pf-toast-width));
  display: flex;
  gap: var(--pf-space-sm);

  color: var(--pf-toast-fg);
  font-family: var(--pf-font-sans);

  box-shadow: var(--pf-toast-shadow);
  background: var(--pf-toast-surface);
  border: var(--pf-stroke-width) solid var(--pf-toast-border);
  border-radius: var(--pf-toast-radius);
  overflow: hidden;

  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing);

  pointer-events: auto;

  &_orientation_horizontal {
    align-items: center;
  }

  &_orientation_vertical {
    align-items: flex-start;
  }

  &_pulse {
    animation: pfToastPulse var(--pf-toast-pulse-duration)
      var(--pf-animation-easing);
  }

  &_color_primary {
    --pf-toast-accent: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-toast-accent: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-toast-accent: var(--pf-color-success);
  }

  &_color_info {
    --pf-toast-accent: var(--pf-color-info);
  }

  &_color_warning {
    --pf-toast-accent: var(--pf-color-warning);
  }

  &_color_error {
    --pf-toast-accent: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-toast-accent: var(--pf-color-neutral);
  }
}

.pfToast__leading {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;

  color: var(--pf-toast-accent);
}

.pfToast__wrapper {
  min-width: 0;
  flex: 1 1 auto;
}

.pfToast__title {
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
}

.pfToast__description {
  margin-top: var(--pf-space-xs);

  color: var(--pf-toast-muted);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfToast__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-space-xs);
}

.pfToast_orientation_vertical .pfToast__actions {
  margin-top: var(--pf-space-sm);
}

.pfToast__end {
  display: inline-flex;
  align-items: flex-start;
  flex-shrink: 0;
  gap: var(--pf-space-xs);
}

.pfToast_orientation_horizontal .pfToast__end {
  align-items: center;
}

.pfToast__progress {
  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;

  height: 2px;

  background: color-mix(in srgb, var(--pf-toast-accent) 20%, transparent);
}

.pfToast__progressBar {
  width: 100%;
  height: 100%;
  display: block;

  background: var(--pf-toast-accent);

  animation-name: pfToastProgress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  transform-origin: left center;
}

@keyframes pfToastPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }
}

@keyframes pfToastProgress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}
</style>
