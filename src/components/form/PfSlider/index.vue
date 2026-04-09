<script setup lang="ts">
import type { Component } from 'vue';
import {
  computed,
  inject,
  onBeforeUnmount,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useId,
  watch,
} from 'vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import { usePfApp } from '../../../composables/usePfApp';

export type PfSliderColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfSliderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfSliderOrientation = 'horizontal' | 'vertical';

export type PfSliderModelValue = number | [number, number];

export interface PfSliderUi {
  root?: string;
  track?: string;
  range?: string;
  thumb?: string;
}

/** Built-in value tooltip options (no separate `PfTooltip`). */
export interface PfSliderTooltipProps {
  class?: string;
  /** Format for this thumb’s displayed number (index 0 / 1). */
  formatValue?: (value: number, thumbIndex: number) => string;
  /** Side relative to the thumb. */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    modelValue?: PfSliderModelValue;
    defaultValue?: PfSliderModelValue;
    min?: number;
    max?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    orientation?: PfSliderOrientation;
    color?: PfSliderColor;
    size?: PfSliderSize;
    inverted?: boolean;
    disabled?: boolean;
    name?: string;
    tooltip?: boolean | PfSliderTooltipProps;
    ui?: PfSliderUi;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal',
    color: 'primary',
    inverted: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: PfSliderModelValue];
  change: [event: Event];
}>();

const attrs = useAttrs();
const app = usePfApp();
const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): PfSliderSize => props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const isRtl = computed(() => {
  if (app.value.dir === 'rtl') return true;
  if (app.value.dir === 'ltr') return false;
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('dir') === 'rtl';
});

const baseId = useId();

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

const span = computed(() => Math.max(props.max - props.min, Number.EPSILON));

function snap(value: number): number {
  const { min, max, step } = props;
  if (step <= 0) return clamp(value, min, max);
  const steps = Math.round((value - min) / step);
  const v = min + steps * step;
  return clamp(v, min, max);
}

function defaultForMode(range: boolean): PfSliderModelValue {
  const { min } = props;
  if (range) {
    const a = snap(min + span.value * 0.25);
    const b = snap(min + span.value * 0.75);
    return a <= b ? [a, b] : [b, a];
  }
  return snap(min + span.value / 2);
}

function normalizeToArray(v: PfSliderModelValue): [number, number] {
  if (typeof v === 'number') return [v, v];
  const a = v[0] ?? props.min;
  const b = v[1] ?? props.max;
  return [snap(a), snap(b)].sort((x, y) => x - y) as [number, number];
}

const isControlled = computed(() => props.modelValue !== undefined);

const localValue = ref<PfSliderModelValue>(
  props.defaultValue !== undefined
    ? Array.isArray(props.defaultValue)
      ? normalizeToArray(props.defaultValue)
      : snap(props.defaultValue)
    : defaultForMode(false)
);

/** Two-thumb mode: explicit array in model/default. */
const isRange = computed(() => {
  const v = isControlled.value ? props.modelValue! : localValue.value;
  return Array.isArray(v);
});

const valuesSorted = computed((): [number, number] => {
  const v = isControlled.value ? props.modelValue! : localValue.value;
  if (typeof v === 'number') {
    const s = snap(v);
    return [s, s];
  }
  return normalizeToArray(v);
});

watch(
  () => props.modelValue,
  (v) => {
    if (v === undefined) return;
    if (typeof v === 'number') {
      localValue.value = snap(v);
    } else {
      const [a, b] = normalizeToArray(v);
      localValue.value = [a, b];
    }
  },
  { deep: true }
);

function emitValue(next: PfSliderModelValue) {
  if (!isControlled.value) {
    localValue.value = next;
  }
  emit('update:modelValue', next);
}

function minDelta(): number {
  const k = props.minStepsBetweenThumbs ?? 0;
  return Math.max(0, k) * props.step;
}

function commit(nextPair: [number, number], asRange: boolean): void {
  const d = minDelta();
  let [lo, hi] = nextPair;
  if (hi - lo < d) {
    const mid = (lo + hi) / 2;
    lo = snap(mid - d / 2);
    hi = snap(mid + d / 2);
    if (hi - lo < d) {
      lo = snap(hi - d);
    }
  }
  lo = clamp(lo, props.min, props.max);
  hi = clamp(hi, props.min, props.max);
  if (hi < lo) [lo, hi] = [hi, lo];

  if (asRange) {
    emitValue([lo, hi]);
  } else {
    emitValue(snap(lo));
  }
}

const trackRef = ref<HTMLElement | null>(null);

const activeThumb = ref<0 | 1 | null>(null);
const dragging = ref(false);
const hoveredThumb = ref<0 | 1 | null>(null);
const focusedThumb = ref<0 | 1 | null>(null);

const tooltipCfg = computed((): PfSliderTooltipProps | null => {
  const t = props.tooltip;
  if (!t) return null;
  return t === true ? {} : t;
});

const showTooltip = computed(() => tooltipCfg.value != null);

function formatThumbValue(value: number, index: 0 | 1): string {
  const fmt = tooltipCfg.value?.formatValue;
  return fmt ? fmt(value, index) : String(snap(value));
}

function pointerToValue(clientX: number, clientY: number): number {
  const el = trackRef.value;
  if (!el) return props.min;
  const r = el.getBoundingClientRect();
  let linearT: number;
  if (props.orientation === 'vertical') {
    const h = Math.max(r.height, 1);
    let t = 1 - (clientY - r.top) / h;
    t = clamp(t, 0, 1);
    linearT = props.inverted ? 1 - t : t;
  } else {
    const w = Math.max(r.width, 1);
    let t = (clientX - r.left) / w;
    t = clamp(t, 0, 1);
    const u = isRtl.value ? 1 - t : t;
    linearT = props.inverted ? 1 - u : u;
  }
  return snap(props.min + linearT * span.value);
}

function nearestThumb(target: number): 0 | 1 {
  if (!isRange.value) return 0;
  const [a, b] = valuesSorted.value;
  return Math.abs(target - a) <= Math.abs(target - b) ? 0 : 1;
}

function onTrackPointerDown(e: PointerEvent) {
  if (props.disabled) return;
  e.preventDefault();
  const v = pointerToValue(e.clientX, e.clientY);
  const idx: 0 | 1 = isRange.value ? nearestThumb(v) : 0;
  activeThumb.value = idx;
  dragging.value = true;

  const [lo, hi] = valuesSorted.value;
  let next: [number, number];
  if (!isRange.value) {
    next = [v, v];
  } else if (idx === 0) {
    next = [clamp(v, props.min, hi - minDelta()), hi];
    if (next[0] > next[1] - minDelta())
      next = [snap(next[1] - minDelta()), next[1]];
  } else {
    next = [lo, clamp(v, lo + minDelta(), props.max)];
    if (next[1] < next[0] + minDelta())
      next = [next[0], snap(next[0] + minDelta())];
  }
  commit(next, isRange.value);

  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
}

function onWindowPointerMove(e: PointerEvent) {
  if (!dragging.value || activeThumb.value == null) return;
  const v = pointerToValue(e.clientX, e.clientY);
  const idx = activeThumb.value;
  const [lo, hi] = valuesSorted.value;
  let next: [number, number];
  if (!isRange.value) {
    next = [v, v];
  } else if (idx === 0) {
    next = [clamp(v, props.min, hi - minDelta()), hi];
  } else {
    next = [lo, clamp(v, lo + minDelta(), props.max)];
  }
  commit(next, isRange.value);
}

function onWindowPointerUp(e: PointerEvent) {
  if (!dragging.value) return;
  dragging.value = false;
  activeThumb.value = null;
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
  if (e.type === 'pointerup' || e.type === 'pointercancel') {
    emit('change', e);
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
});

function onThumbPointerDown(e: PointerEvent, idx: 0 | 1) {
  if (props.disabled) return;
  e.stopPropagation();
  e.preventDefault();
  activeThumb.value = idx;
  dragging.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
}

function visualPercent(raw: number): number {
  const t = ((raw - props.min) / span.value) * 100;
  if (props.orientation === 'vertical') {
    return props.inverted ? 100 - t : t;
  }
  let p = props.inverted ? 100 - t : t;
  if (isRtl.value) p = 100 - p;
  return p;
}

const rangeStyle = computed((): Record<string, string> => {
  const [lo, hi] = valuesSorted.value;
  let p0: number;
  let p1: number;
  if (isRange.value) {
    p0 = visualPercent(lo);
    p1 = visualPercent(hi);
    if (p0 > p1) [p0, p1] = [p1, p0];
  } else {
    const atMin = visualPercent(props.min);
    const atVal = visualPercent(lo);
    p0 = Math.min(atMin, atVal);
    p1 = Math.max(atMin, atVal);
  }
  if (props.orientation === 'vertical') {
    return {
      bottom: `${p0}%`,
      height: `${p1 - p0}%`,
    };
  }
  return {
    left: `${p0}%`,
    width: `${p1 - p0}%`,
  };
});

function thumbStyle(v: number): Record<string, string> {
  const p = visualPercent(v);
  if (props.orientation === 'vertical') {
    return {
      bottom: `${p}%`,
      left: '50%',
    };
  }
  return {
    left: `${p}%`,
  };
}

function thumbList(): { index: 0 | 1; value: number }[] {
  const [lo, hi] = valuesSorted.value;
  if (!isRange.value) {
    return [{ index: 0, value: lo }];
  }
  return [
    { index: 0, value: lo },
    { index: 1, value: hi },
  ];
}

function tooltipVisible(idx: 0 | 1): boolean {
  if (!showTooltip.value) return false;
  return (
    hoveredThumb.value === idx ||
    focusedThumb.value === idx ||
    (dragging.value && activeThumb.value === idx)
  );
}

function tooltipClass(_idx: 0 | 1): string[] {
  const list = [
    'pfSlider__tooltip',
    `pfSlider__tooltip_side_${tooltipCfg.value?.side ?? (props.orientation === 'vertical' ? 'right' : 'top')}`,
  ];
  if (tooltipCfg.value?.class) list.push(tooltipCfg.value.class);
  return list;
}

function onKeydown(e: KeyboardEvent, idx: 0 | 1) {
  if (props.disabled) return;
  const step = props.step;
  const big = step * 10;
  let delta = 0;
  const vert = props.orientation === 'vertical';
  const inv = props.inverted;
  const rtl = isRtl.value;

  const key = e.key;
  const [lo, hi] = valuesSorted.value;
  const d = minDelta();

  if (key === 'Home') {
    e.preventDefault();
    if (!isRange.value) {
      commit([props.min, props.min], false);
    } else if (idx === 0) {
      commit([props.min, hi], true);
    } else {
      commit([lo, clamp(lo + d, props.min, props.max)], true);
    }
    emit('change', e);
    return;
  }
  if (key === 'End') {
    e.preventDefault();
    if (!isRange.value) {
      commit([props.max, props.max], false);
    } else if (idx === 0) {
      commit([clamp(hi - d, props.min, props.max), hi], true);
    } else {
      commit([lo, props.max], true);
    }
    emit('change', e);
    return;
  }

  if ((!vert && key === 'ArrowRight') || (vert && key === 'ArrowUp')) {
    delta = vert ? (inv ? -step : step) : rtl === inv ? step : -step;
  } else if ((!vert && key === 'ArrowLeft') || (vert && key === 'ArrowDown')) {
    delta = vert ? (inv ? step : -step) : rtl === inv ? -step : step;
  } else if (key === 'PageUp') {
    delta = big;
  } else if (key === 'PageDown') {
    delta = -big;
  } else {
    return;
  }
  e.preventDefault();
  applyKey(idx, delta);
  emit('change', e);
}

function applyKey(idx: 0 | 1, delta: number) {
  const [lo, hi] = valuesSorted.value;
  const cur = idx === 0 ? lo : hi;
  const target = snap(cur + delta);
  let next: [number, number];
  if (!isRange.value) {
    next = [target, target];
  } else if (idx === 0) {
    next = [clamp(target, props.min, hi - minDelta()), hi];
  } else {
    next = [lo, clamp(target, lo + minDelta(), props.max)];
  }
  commit(next, isRange.value);
}

const resolvedTag = computed(() => {
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const rootClass = computed(() => {
  const list: (string | undefined | false)[] = [
    'pfSlider',
    `pfSlider_orientation_${props.orientation}`,
    `pfSlider_size_${effectiveSize.value}`,
    `pfSlider_color_${props.color}`,
    props.disabled && 'pfSlider_disabled',
    props.inverted && 'pfSlider_inverted',
    dragging.value && 'pfSlider_dragging',
    props.ui?.root,
    attrs.class as string | undefined,
  ];
  return list;
});

const trackClass = computed(() => [
  'pfSlider__track',
  `pfSlider__track_orientation_${props.orientation}`,
  `pfSlider__track_size_${effectiveSize.value}`,
  props.ui?.track,
]);
const rangeClass = computed(() => [
  'pfSlider__range',
  `pfSlider__range_orientation_${props.orientation}`,
  `pfSlider__range_color_${props.color}`,
  props.ui?.range,
]);

function thumbClass(idx: 0 | 1): (string | undefined)[] {
  return [
    'pfSlider__thumb',
    `pfSlider__thumb_orientation_${props.orientation}`,
    `pfSlider__thumb_color_${props.color}`,
    `pfSlider__thumb_size_${effectiveSize.value}`,
    focusedThumb.value === idx ? 'pfSlider__thumb_focused' : undefined,
    props.ui?.thumb,
  ];
}

const passthroughAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown>;
  return rest;
});

const hiddenInputs = computed((): number[] => {
  if (!props.name) return [];
  const [lo, hi] = valuesSorted.value;
  if (!isRange.value) return [lo];
  return [lo, hi];
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div
      ref="trackRef"
      class="pfSlider__track"
      :class="trackClass"
      @pointerdown="onTrackPointerDown"
    >
      <div class="pfSlider__range" :class="rangeClass" :style="rangeStyle" />

      <button
        v-for="item in thumbList()"
        :id="`${baseId}-thumb-${item.index}`"
        :key="item.index"
        type="button"
        :class="thumbClass(item.index)"
        :style="thumbStyle(item.value)"
        :tabindex="disabled ? -1 : 0"
        role="slider"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="item.value"
        :aria-orientation="
          orientation === 'vertical' ? 'vertical' : 'horizontal'
        "
        :aria-disabled="disabled ? 'true' : undefined"
        :disabled="disabled"
        @pointerdown="onThumbPointerDown($event, item.index)"
        @mouseenter="hoveredThumb = item.index"
        @mouseleave="hoveredThumb = null"
        @focus="focusedThumb = item.index"
        @blur="focusedThumb = null"
        @keydown="onKeydown($event, item.index)"
      >
        <span
          v-if="showTooltip && tooltipVisible(item.index)"
          :class="tooltipClass(item.index)"
          aria-hidden="true"
        >
          {{ formatThumbValue(item.value, item.index) }}
        </span>
      </button>
    </div>

    <template v-if="name">
      <input
        v-for="(v, i) in hiddenInputs"
        :key="i"
        type="hidden"
        :name="name"
        :value="String(v)"
      />
    </template>
  </component>
</template>

<style scoped lang="scss">
.pfSlider {
  position: relative;

  display: flex;
  align-items: center;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  user-select: none;
  touch-action: none;

  &_orientation_horizontal {
    width: 100%;
    min-width: 0;
    flex-direction: row;
  }

  &_orientation_vertical {
    height: 100%;
    min-height: var(--pf-slider-vertical-min-height);
    flex-direction: column;
    align-items: center;
  }

  &_disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }

  &:not(.pfSlider_disabled) .pfSlider__track {
    cursor: pointer;
  }
}

/* Track thickness — classes on this node (scoped + only absolute children → without explicit height track was 0). */
.pfSlider__track {
  position: relative;

  flex-grow: 1;
  box-sizing: border-box;

  background: var(--pf-slider-track-bg);
  border-radius: 9999px;

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

  &_orientation_horizontal {
    width: 100%;
    height: var(--pf-slider-track-thickness);
  }

  &_orientation_vertical {
    width: var(--pf-slider-track-thickness);
    min-height: 0;
    flex: 1 1 auto;
  }

  &_orientation_horizontal#{&}_size_xs {
    height: var(--pf-slider-track-thickness-xs);
  }

  &_orientation_horizontal#{&}_size_sm {
    height: var(--pf-slider-track-thickness-sm);
  }

  &_orientation_horizontal#{&}_size_md {
    height: var(--pf-slider-track-thickness-md);
  }

  &_orientation_horizontal#{&}_size_lg {
    height: var(--pf-slider-track-thickness-lg);
  }

  &_orientation_horizontal#{&}_size_xl {
    height: var(--pf-slider-track-thickness-xl);
  }

  &_orientation_vertical#{&}_size_xs {
    width: var(--pf-slider-track-thickness-xs);
  }

  &_orientation_vertical#{&}_size_sm {
    width: var(--pf-slider-track-thickness-sm);
  }

  &_orientation_vertical#{&}_size_md {
    width: var(--pf-slider-track-thickness-md);
  }

  &_orientation_vertical#{&}_size_lg {
    width: var(--pf-slider-track-thickness-lg);
  }

  &_orientation_vertical#{&}_size_xl {
    width: var(--pf-slider-track-thickness-xl);
  }
}

.pfSlider__range {
  position: absolute;

  border-radius: 9999px;

  transition:
    left var(--pf-animation-duration) var(--pf-animation-easing),
    width var(--pf-animation-duration) var(--pf-animation-easing),
    bottom var(--pf-animation-duration) var(--pf-animation-easing),
    height var(--pf-animation-duration) var(--pf-animation-easing);

  pointer-events: none;

  &_orientation_horizontal {
    top: 0;

    height: 100%;
  }

  &_orientation_vertical {
    right: 0;
    left: 0;

    width: 100%;
  }

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
}

.pfSlider__thumb {
  position: absolute;
  z-index: 1;

  padding: 0;
  box-sizing: border-box;

  background: var(--pf-color-surface);
  border: 2px solid transparent;
  border-radius: 50%;
  outline: none;

  transition:
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: grab;

  &_orientation_horizontal {
    top: 50%;

    transform: translate(-50%, -50%);
  }

  &_orientation_vertical {
    transform: translate(-50%, 50%);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    cursor: grabbing;
  }

  &_color_primary {
    border-color: var(--pf-color-primary);
  }

  &_color_secondary {
    border-color: var(--pf-color-secondary);
  }

  &_color_success {
    border-color: var(--pf-color-success);
  }

  &_color_info {
    border-color: var(--pf-color-info);
  }

  &_color_warning {
    border-color: var(--pf-color-warning);
  }

  &_color_error {
    border-color: var(--pf-color-error);
  }

  &_color_neutral {
    border-color: var(--pf-color-neutral);
  }

  &_size_xs {
    width: var(--pf-slider-thumb-size-xs);
    height: var(--pf-slider-thumb-size-xs);
  }

  &_size_sm {
    width: var(--pf-slider-thumb-size-sm);
    height: var(--pf-slider-thumb-size-sm);
  }

  &_size_md {
    width: var(--pf-slider-thumb-size-md);
    height: var(--pf-slider-thumb-size-md);
  }

  &_size_lg {
    width: var(--pf-slider-thumb-size-lg);
    height: var(--pf-slider-thumb-size-lg);
  }

  &_size_xl {
    width: var(--pf-slider-thumb-size-xl);
    height: var(--pf-slider-thumb-size-xl);
  }

  &_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-primary) 45%, transparent);
  }

  &_color_secondary.pfSlider__thumb_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-secondary) 45%, transparent);
  }

  &_color_success.pfSlider__thumb_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-success) 45%, transparent);
  }

  &_color_info.pfSlider__thumb_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-info) 45%, transparent);
  }

  &_color_warning.pfSlider__thumb_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-warning) 45%, transparent);
  }

  &_color_error.pfSlider__thumb_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-error) 45%, transparent);
  }

  &_color_neutral.pfSlider__thumb_focused {
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--pf-color-neutral) 45%, transparent);
  }
}

.pfSlider_dragging .pfSlider__thumb {
  transition: none;
}

.pfSlider_dragging .pfSlider__range {
  transition: none;
}

.pfSlider__tooltip {
  position: absolute;
  z-index: 2;

  padding: 0.125rem 0.375rem;

  color: var(--pf-color-surface);
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
  white-space: nowrap;

  background: var(--pf-color-text);
  border-radius: var(--pf-radius-sm);

  pointer-events: none;

  &_side_top {
    bottom: 100%;
    left: 50%;
    margin-bottom: var(--pf-space-xs);

    transform: translateX(-50%);
  }

  &_side_bottom {
    top: 100%;
    left: 50%;
    margin-top: var(--pf-space-xs);

    transform: translateX(-50%);
  }

  &_side_left {
    top: 50%;
    right: 100%;
    margin-right: var(--pf-space-xs);

    transform: translateY(-50%);
  }

  &_side_right {
    top: 50%;
    left: 100%;
    margin-left: var(--pf-space-xs);

    transform: translateY(-50%);
  }
}
</style>
