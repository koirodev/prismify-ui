<script setup lang="ts">
import { computed, resolveDynamicComponent, type Component } from 'vue';

export type PfProgressColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfProgressSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type PfProgressOrientation = 'horizontal' | 'vertical';

export type PfProgressAnimation =
  | 'carousel'
  | 'carousel-inverse'
  | 'swing'
  | 'elastic';

export interface PfProgressUi {
  root?: string;
  track?: string;
  indicator?: string;
  status?: string;
  steps?: string;
  step?: string;
}

const modelValue = defineModel<number | null>({ default: null });

const props = withDefaults(
  defineProps<{
    /** Upper bound for value or step labels (`max.length`). */
    max?: number | readonly string[];
    /** Show value above the track (or `status` slot). */
    status?: boolean;
    /** Fill from the opposite edge. */
    inverted?: boolean;
    size?: PfProgressSize;
    color?: PfProgressColor;
    orientation?: PfProgressOrientation;
    /** Animation in indeterminate state. */
    animation?: PfProgressAnimation;
    /** `aria-label` text (human-readable). */
    getValueLabel?: (
      value: number | null | undefined,
      max: number
    ) => string | undefined;
    /** Current value text for `aria-valuetext`. */
    getValueText?: (
      value: number | null | undefined,
      max: number
    ) => string | undefined;
    /** Root tag or component. */
    as?: string | Component;
    /** Extra classes per part (optional). */
    ui?: PfProgressUi;
  }>(),
  {
    status: false,
    inverted: false,
    size: 'md',
    color: 'primary',
    orientation: 'horizontal',
    animation: 'carousel',
    as: 'div',
    ui: undefined,
  }
);

defineSlots<{
  status?: () => unknown;
}>();

const resolvedTag = computed(() => {
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const resolvedMax = computed(() => {
  const m = props.max;
  if (Array.isArray(m)) return Math.max(1, m.length);
  if (typeof m === 'number' && Number.isFinite(m)) return Math.max(1, m);
  return 100;
});

const isIndeterminate = computed(() => modelValue.value == null);

const rawValue = computed(() => {
  const v = modelValue.value;
  if (v == null || Number.isNaN(Number(v))) return 0;
  return Math.min(Math.max(Number(v), 0), resolvedMax.value);
});

const percent = computed(() => (rawValue.value / resolvedMax.value) * 100);

const stepLabels = computed((): readonly string[] | null => {
  const m = props.max;
  return Array.isArray(m) ? m : null;
});

const activeStepIndex = computed(() => {
  const labels = stepLabels.value;
  if (!labels?.length) return -1;
  return Math.min(labels.length - 1, Math.floor(rawValue.value));
});

const defaultStatusText = computed(() => {
  if (stepLabels.value && activeStepIndex.value >= 0) {
    return String(stepLabels.value[activeStepIndex.value]);
  }
  return `${Math.round(percent.value)}%`;
});

const progressAttrs = computed(() => {
  const mx = resolvedMax.value;
  if (isIndeterminate.value) {
    const text =
      props.getValueText?.(null, mx) ??
      props.getValueLabel?.(null, mx) ??
      'Loading';
    return {
      role: 'progressbar' as const,
      'aria-valuetext': text,
      'aria-busy': true as const,
    };
  }
  const vn = rawValue.value;
  const vt =
    props.getValueText?.(vn, mx) ??
    props.getValueLabel?.(vn, mx) ??
    `${Math.round(percent.value)}%`;
  const label = props.getValueLabel?.(vn, mx);
  return {
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-valuemax': mx,
    'aria-valuenow': vn,
    'aria-valuetext': vt,
    ...(label ? { 'aria-label': label } : {}),
  };
});

const rootClass = computed(() => {
  const list: string[] = [
    'pfProgress',
    `pfProgress_orientation_${props.orientation}`,
  ];
  if (props.inverted) list.push('pfProgress_inverted');
  if (props.ui?.root) list.push(props.ui.root);
  return list;
});

const trackClass = computed(() => {
  const list = [
    'pfProgress__track',
    `pfProgress__track_orientation_${props.orientation}`,
    `pfProgress__track_size_${props.size}`,
    `pfProgress__track_animation_${props.animation}`,
  ];
  if (props.inverted) list.push('pfProgress__track_inverted');
  if (isIndeterminate.value) list.push('pfProgress__track_indeterminate');
  if (props.ui?.track) list.push(props.ui.track);
  return list;
});

const indicatorClass = computed(() => {
  const list = [
    'pfProgress__indicator',
    `pfProgress__indicator_color_${props.color}`,
    `pfProgress__indicator_orientation_${props.orientation}`,
  ];
  if (isIndeterminate.value) list.push('pfProgress__indicator_indeterminate');
  if (props.ui?.indicator) list.push(props.ui.indicator);
  return list;
});

const indicatorStyle = computed(() => {
  if (isIndeterminate.value) return undefined;
  const p = Math.min(100, Math.max(0, percent.value));
  if (props.orientation === 'vertical') {
    return { height: `${p}%` };
  }
  return { width: `${p}%` };
});

const trackDimStyle = computed(() => {
  const t = `var(--pf-progress-thickness-${props.size})`;
  if (props.orientation === 'horizontal') {
    return { height: t };
  }
  return { width: t };
});

const statusClass = computed(() => {
  const list = [
    'pfProgress__status',
    `pfProgress__status_orientation_${props.orientation}`,
    `pfProgress__status_size_${props.size}`,
  ];
  if (props.inverted) list.push('pfProgress__status_inverted');
  if (props.ui?.status) list.push(props.ui.status);
  return list;
});

const stepsClass = computed(() => {
  const list = ['pfProgress__steps', `pfProgress__steps_color_${props.color}`];
  if (props.inverted && props.orientation === 'vertical') {
    list.push('pfProgress__steps_inverted_vertical');
  }
  if (props.ui?.steps) list.push(props.ui.steps);
  return list;
});

const stepsGridStyle = computed(() => {
  const n = stepLabels.value?.length ?? 0;
  if (n <= 0) return undefined;
  return {
    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
  };
});

function stepClass(i: number): string[] {
  const list = [
    'pfProgress__step',
    `pfProgress__step_size_${props.size}`,
    `pfProgress__step_orientation_${props.orientation}`,
  ];
  if (i === activeStepIndex.value) list.push('pfProgress__step_active');
  if (props.ui?.step) list.push(props.ui.step);
  return list;
}
</script>

<template>
  <component :is="resolvedTag" :class="rootClass">
    <div v-if="status" :class="statusClass">
      <slot name="status">{{ defaultStatusText }}</slot>
    </div>

    <div v-bind="progressAttrs" :class="trackClass" :style="trackDimStyle">
      <div
        :class="indicatorClass"
        :style="indicatorStyle"
        :data-state="isIndeterminate ? 'indeterminate' : 'determinate'"
      />
    </div>

    <div
      v-if="stepLabels && stepLabels.length > 0"
      :class="stepsClass"
      :style="stepsGridStyle"
    >
      <span v-for="(label, i) in stepLabels" :key="i" :class="stepClass(i)">
        {{ label }}
      </span>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfProgress {
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  &_orientation_horizontal {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--pf-space-sm);
  }

  &_orientation_vertical {
    width: fit-content;
    max-width: 100%;
    height: 100%;
    min-height: var(--pf-progress-vertical-min-height);
    display: flex;
    flex-direction: row-reverse;
    align-items: stretch;
    gap: var(--pf-space-sm);
  }

  &__status {
    min-width: fit-content;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    color: var(--pf-color-muted);
    line-height: var(--pf-line-height-sm);

    transition:
      opacity var(--pf-animation-duration) var(--pf-animation-easing),
      transform var(--pf-animation-duration) var(--pf-animation-easing);

    &_orientation_vertical {
      min-height: fit-content;
      flex-direction: column;
      justify-content: flex-end;

      text-align: end;
    }

    &_size_2xs,
    &_size_xs {
      font-size: var(--pf-font-size-xs);
    }

    &_size_sm,
    &_size_md,
    &_size_lg {
      font-size: var(--pf-font-size-sm);
    }

    &_size_xl,
    &_size_2xl {
      font-size: var(--pf-font-size-md);
    }

    &_inverted.pfProgress__status_orientation_horizontal {
      flex-direction: row-reverse;
    }

    &_inverted.pfProgress__status_orientation_vertical {
      flex-direction: column-reverse;
    }
  }

  &.pfProgress_inverted.pfProgress_orientation_horizontal
    .pfProgress__status_inverted {
    align-self: flex-end;
  }

  &__track {
    position: relative;

    flex-shrink: 0;

    background: var(--pf-progress-track-bg);
    border-radius: 9999px;
    overflow: hidden;

    &_orientation_horizontal {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: stretch;
    }

    &_orientation_vertical {
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-end;
      flex: 1 1 auto;
    }

    &_inverted#{&}_orientation_vertical {
      flex-direction: column-reverse;
    }
  }

  &__indicator {
    flex-shrink: 0;

    border-radius: 9999px;

    transition:
      width var(--pf-animation-duration) var(--pf-animation-easing),
      height var(--pf-animation-duration) var(--pf-animation-easing);

    &_color_primary {
      background: var(--pf-color-primary);
    }

    &_color_secondary {
      background: var(--pf-color-secondary);
    }

    &_color_success {
      background: var(--pf-color-success);
    }

    &_color_info {
      background: var(--pf-color-info);
    }

    &_color_warning {
      background: var(--pf-color-warning);
    }

    &_color_error {
      background: var(--pf-color-error);
    }

    &_color_neutral {
      background: var(--pf-color-neutral);
    }

    &_orientation_horizontal {
      height: 100%;
    }

    &_orientation_vertical {
      width: 100%;
    }

    .pfProgress__track_orientation_horizontal:not(
        .pfProgress__track_indeterminate
      )
      & {
      width: 0;
    }

    .pfProgress__track_orientation_vertical:not(
        .pfProgress__track_indeterminate
      )
      & {
      height: 0;
    }

    .pfProgress__track_orientation_horizontal.pfProgress__track_inverted:not(
        .pfProgress__track_indeterminate
      )
      & {
      margin-inline-start: auto;
    }
  }

  &__track_indeterminate .pfProgress__indicator_indeterminate {
    position: absolute;

    border-radius: 9999px;

    transition: none;
  }

  &__track_orientation_horizontal.pfProgress__track_indeterminate
    .pfProgress__indicator_indeterminate {
    top: 0;
    bottom: 0;

    width: 38%;
    height: 100%;
  }

  &__track_orientation_vertical.pfProgress__track_indeterminate
    .pfProgress__indicator_indeterminate {
    right: 0;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 38%;
  }

  /* --- Indeterminate animations: horizontal --- */
  &__track_orientation_horizontal.pfProgress__track_animation_carousel
    .pfProgress__indicator_indeterminate {
    animation: pfProgress-carousel-h var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
  }

  &__track_orientation_horizontal.pfProgress__track_animation_carousel-inverse
    .pfProgress__indicator_indeterminate {
    animation: pfProgress-carousel-h-inv
      var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
  }

  &__track_orientation_horizontal.pfProgress__track_animation_swing
    .pfProgress__indicator_indeterminate {
    left: 50%;
    margin-left: -19%;

    animation: pfProgress-swing-h var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
    transform-origin: center center;
  }

  &__track_orientation_horizontal.pfProgress__track_animation_elastic
    .pfProgress__indicator_indeterminate {
    left: 50%;
    margin-left: -19%;

    animation: pfProgress-elastic-h var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
    transform-origin: center center;
  }

  /* --- Indeterminate animations: vertical --- */
  &__track_orientation_vertical.pfProgress__track_animation_carousel
    .pfProgress__indicator_indeterminate {
    animation: pfProgress-carousel-v var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
  }

  &__track_orientation_vertical.pfProgress__track_animation_carousel-inverse
    .pfProgress__indicator_indeterminate {
    animation: pfProgress-carousel-v-inv
      var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
  }

  &__track_orientation_vertical.pfProgress__track_animation_swing
    .pfProgress__indicator_indeterminate {
    top: 50%;
    margin-top: -19%;

    animation: pfProgress-swing-v var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
    transform-origin: center center;
  }

  &__track_orientation_vertical.pfProgress__track_animation_elastic
    .pfProgress__indicator_indeterminate {
    top: 50%;
    margin-top: -19%;

    animation: pfProgress-elastic-v var(--pf-progress-indeterminate-duration)
      var(--pf-progress-indeterminate-easing) infinite;
    transform-origin: center center;
  }

  &__steps {
    width: 100%;
    display: grid;
    align-items: end;
    gap: var(--pf-space-xs);

    color: var(--pf-color-muted);

    &_inverted_vertical {
      align-items: start;
    }
  }

  &__steps_color_primary &__step_active {
    color: var(--pf-color-primary);
  }

  &__steps_color_secondary &__step_active {
    color: var(--pf-color-secondary);
  }

  &__steps_color_success &__step_active {
    color: var(--pf-color-success);
  }

  &__steps_color_info &__step_active {
    color: var(--pf-color-info);
  }

  &__steps_color_warning &__step_active {
    color: var(--pf-color-warning);
  }

  &__steps_color_error &__step_active {
    color: var(--pf-color-error);
  }

  &__steps_color_neutral &__step_active {
    color: var(--pf-color-neutral);
  }

  &__step {
    min-width: 0;

    line-height: var(--pf-line-height-sm);
    text-align: center;

    opacity: 0.55;

    transition:
      opacity var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing);

    &_size_2xs,
    &_size_xs {
      font-size: var(--pf-font-size-xs);
    }

    &_size_sm,
    &_size_md,
    &_size_lg {
      font-size: var(--pf-font-size-sm);
    }

    &_size_xl,
    &_size_2xl {
      font-size: var(--pf-font-size-md);
    }

    &_orientation_vertical {
      text-align: end;
    }

    &_active {
      color: var(--pf-color-text);
      font-weight: var(--pf-font-weight-medium);

      opacity: 1;
    }
  }
}

@keyframes pfProgress-carousel-h {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(320%);
  }
}

@keyframes pfProgress-carousel-h-inv {
  0% {
    transform: translateX(320%);
  }

  100% {
    transform: translateX(-100%);
  }
}

@keyframes pfProgress-carousel-v {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(-320%);
  }
}

@keyframes pfProgress-carousel-v-inv {
  0% {
    transform: translateY(-320%);
  }

  100% {
    transform: translateY(100%);
  }
}

@keyframes pfProgress-swing-h {
  0%,
  100% {
    transform: translateX(-50%) scaleX(0.2);
  }

  50% {
    transform: translateX(-50%) scaleX(1);
  }
}

@keyframes pfProgress-swing-v {
  0%,
  100% {
    transform: translateY(-50%) scaleY(0.2);
  }

  50% {
    transform: translateY(-50%) scaleY(1);
  }
}

@keyframes pfProgress-elastic-h {
  0% {
    transform: translateX(-50%) scaleX(0.15);
  }

  40% {
    transform: translateX(-50%) scaleX(1.08);
  }

  65% {
    transform: translateX(-50%) scaleX(0.92);
  }

  85% {
    transform: translateX(-50%) scaleX(1.02);
  }

  100% {
    transform: translateX(-50%) scaleX(1);
  }
}

@keyframes pfProgress-elastic-v {
  0% {
    transform: translateY(-50%) scaleY(0.15);
  }

  40% {
    transform: translateY(-50%) scaleY(1.08);
  }

  65% {
    transform: translateY(-50%) scaleY(0.92);
  }

  85% {
    transform: translateY(-50%) scaleY(1.02);
  }

  100% {
    transform: translateY(-50%) scaleY(1);
  }
}

:dir(rtl)
  .pfProgress__track_orientation_horizontal.pfProgress__track_animation_carousel {
  .pfProgress__indicator_indeterminate {
    animation-name: pfProgress-carousel-h-inv;
  }
}

:dir(rtl)
  .pfProgress__track_orientation_horizontal.pfProgress__track_animation_carousel-inverse {
  .pfProgress__indicator_indeterminate {
    animation-name: pfProgress-carousel-h;
  }
}
</style>
