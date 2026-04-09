<script setup lang="ts">
import type { Component, ComponentPublicInstance } from 'vue';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  resolveDynamicComponent,
  useAttrs,
  watch,
} from 'vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import type { PfColorPickerFormat } from './colorPicker';
import {
  colorStringToHsv,
  formatColorFromRgb,
  hsvToColorString,
  hsvToRgb,
  type PfColorPickerHsv,
  type Rgb,
} from './colorPicker';

const WHITE: Rgb = { r: 255, g: 255, b: 255 };

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function normalizeHueFromTrackY(yPercent: number): number {
  return (yPercent / 100) * 360;
}

function trackYFromHue(h: number): number {
  return (h / 360) * 100;
}

export type PfColorPickerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfColorPickerUi = Partial<{
  root: string;
  picker: string;
  selector: string;
  selectorBackground: string;
  selectorThumb: string;
  track: string;
  trackThumb: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    modelValue?: string;
    defaultValue?: string;
    format?: PfColorPickerFormat;
    throttle?: number;
    disabled?: boolean;
    size?: PfColorPickerSize;
    ui?: PfColorPickerUi;
    /** Undo/redo history (Ctrl/Cmd+Z, Ctrl/Cmd+Y / Ctrl+Shift+Z). */
    history?: boolean;
    /** Debounce writing a stage to history (ms): while dragging, do not log every step. */
    historyDebounce?: number;
    /** Max undo stack length. */
    historyLimit?: number;
  }>(),
  {
    defaultValue: '#FFFFFF',
    format: 'hex',
    throttle: 50,
    disabled: false,
    size: 'md',
    history: true,
    historyDebounce: 300,
    historyLimit: 50,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const attrs = useAttrs();
const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): PfColorPickerSize => props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const isControlled = computed(() => props.modelValue !== undefined);

const localModel = ref<string>(props.defaultValue ?? '#FFFFFF');

const rootRef = ref<HTMLElement | ComponentPublicInstance | null>(null);
const selectorRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);

function pickerRootEl(): HTMLElement | null {
  const r = rootRef.value;
  if (!r) return null;
  if (r instanceof HTMLElement) return r;
  const el = (r as ComponentPublicInstance).$el;
  return el instanceof HTMLElement ? el : null;
}

function focusPickerRoot(): void {
  const el = pickerRootEl();
  if (!el || !historyEnabled.value) return;
  el.focus({ preventScroll: true });
}

function onRootPointerDownCapture(): void {
  if (!historyEnabled.value || props.disabled) return;
  focusPickerRoot();
}

const selectorPos = ref({ x: 0, y: 0 });
const trackPos = ref({ y: 0 });

let dragging: 'selector' | 'track' | null = null;
let lastEmitAt = 0;
let emitTimer: ReturnType<typeof setTimeout> | null = null;

const historyPast = ref<string[]>([]);
const historyFuture = ref<string[]>([]);
const lastRecorded = ref('');
let historyDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let skipModelWatchReset = false;

const historyEnabled = computed(() => props.history && !props.disabled);

function getCurrentString(): string {
  return hsvToColorString(hsvFromPositions(), props.format);
}

function trimHistoryPast(): void {
  const lim = props.historyLimit;
  while (historyPast.value.length > lim) {
    historyPast.value.shift();
  }
}

function resetHistory(): void {
  if (historyDebounceTimer) {
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = null;
  }
  historyPast.value = [];
  historyFuture.value = [];
  lastRecorded.value = getCurrentString();
}

function maybeRecordHistory(): void {
  if (!historyEnabled.value) return;
  const cur = getCurrentString();
  if (cur === lastRecorded.value) return;
  historyPast.value.push(lastRecorded.value);
  lastRecorded.value = cur;
  historyFuture.value = [];
  trimHistoryPast();
}

function scheduleHistoryRecord(): void {
  if (!historyEnabled.value) return;
  if (historyDebounceTimer) clearTimeout(historyDebounceTimer);
  historyDebounceTimer = setTimeout(() => {
    historyDebounceTimer = null;
    maybeRecordHistory();
  }, props.historyDebounce);
}

function flushHistoryRecord(): void {
  if (historyDebounceTimer) {
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = null;
  }
  maybeRecordHistory();
}

function applyValueFromHistory(value: string): void {
  skipModelWatchReset = true;
  syncFromString(value);
  if (!isControlled.value) {
    localModel.value = value;
  }
  emit('update:modelValue', value);
  nextTick(() => {
    skipModelWatchReset = false;
  });
}

function undo(): void {
  if (!historyEnabled.value || historyPast.value.length === 0) return;
  flushHistoryRecord();
  const prev = historyPast.value.pop()!;
  historyFuture.value.unshift(lastRecorded.value);
  lastRecorded.value = prev;
  applyValueFromHistory(prev);
}

function redo(): void {
  if (!historyEnabled.value || historyFuture.value.length === 0) return;
  flushHistoryRecord();
  const next = historyFuture.value.shift()!;
  historyPast.value.push(lastRecorded.value);
  lastRecorded.value = next;
  applyValueFromHistory(next);
}

const canUndo = computed(
  () => historyEnabled.value && historyPast.value.length > 0
);
const canRedo = computed(
  () => historyEnabled.value && historyFuture.value.length > 0
);

function onRootKeydown(e: KeyboardEvent): void {
  if (!historyEnabled.value) return;
  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
    e.preventDefault();
    redo();
  }
}

defineExpose({
  undo,
  redo,
  canUndo,
  canRedo,
});

function hsvFromPositions(): PfColorPickerHsv {
  const h = normalizeHueFromTrackY(trackPos.value.y);
  const s = selectorPos.value.x;
  const v = 100 - selectorPos.value.y;
  return { h, s, v };
}

function syncPositionsFromHsv(hsv: PfColorPickerHsv): void {
  selectorPos.value = { x: hsv.s, y: 100 - hsv.v };
  trackPos.value = { y: trackYFromHue(hsv.h) };
}

function syncFromString(s: string): void {
  const hsv = colorStringToHsv(s, WHITE);
  syncPositionsFromHsv(hsv);
}

function flushEmit(): void {
  const hsv = hsvFromPositions();
  const str = hsvToColorString(hsv, props.format);
  if (!isControlled.value) {
    localModel.value = str;
  }
  skipModelWatchReset = true;
  emit('update:modelValue', str);
  nextTick(() => {
    skipModelWatchReset = false;
  });
  scheduleHistoryRecord();
}

function scheduleEmit(): void {
  const now = Date.now();
  const elapsed = now - lastEmitAt;
  if (elapsed >= props.throttle) {
    lastEmitAt = now;
    if (emitTimer) {
      clearTimeout(emitTimer);
      emitTimer = null;
    }
    flushEmit();
    return;
  }
  if (emitTimer) return;
  emitTimer = setTimeout(() => {
    emitTimer = null;
    lastEmitAt = Date.now();
    flushEmit();
  }, props.throttle - elapsed);
}

syncFromString(
  isControlled.value && props.modelValue !== undefined
    ? props.modelValue
    : localModel.value
);
lastRecorded.value = getCurrentString();

watch(
  () => props.modelValue,
  (v) => {
    if (v === undefined) return;
    if (skipModelWatchReset) return;
    syncFromString(v);
    resetHistory();
  }
);

watch(
  () => props.format,
  (_n, oldFormat) => {
    if (oldFormat === undefined) return;
    flushEmit();
    resetHistory();
  }
);

function onWindowPointerMove(e: PointerEvent): void {
  if (props.disabled || !dragging) return;
  if (dragging === 'selector') {
    setSelectorFromPointer(e.clientX, e.clientY, false);
  } else {
    setTrackFromPointer(e.clientY, false);
  }
}

function onWindowPointerUp(e: PointerEvent): void {
  if (dragging) {
    if (emitTimer) {
      clearTimeout(emitTimer);
      emitTimer = null;
    }
    lastEmitAt = 0;
    flushEmit();
    flushHistoryRecord();
  }
  dragging = null;
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
  if (e.type === 'pointerup' || e.type === 'pointercancel') {
    /* drag end */
  }
}

function setSelectorFromPointer(
  clientX: number,
  clientY: number,
  startDrag: boolean
): void {
  const el = selectorRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = clamp(((clientX - r.left) / Math.max(r.width, 1)) * 100, 0, 100);
  const y = clamp(((clientY - r.top) / Math.max(r.height, 1)) * 100, 0, 100);
  selectorPos.value = { x, y };
  if (startDrag) {
    lastEmitAt = 0;
    flushEmit();
  } else {
    scheduleEmit();
  }
}

function setTrackFromPointer(clientY: number, startDrag: boolean): void {
  const el = trackRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const y = clamp(((clientY - r.top) / Math.max(r.height, 1)) * 100, 0, 100);
  trackPos.value = { y };
  if (startDrag) {
    lastEmitAt = 0;
    flushEmit();
  } else {
    scheduleEmit();
  }
}

function onSelectorPointerDown(e: PointerEvent): void {
  if (props.disabled) return;
  e.preventDefault();
  dragging = 'selector';
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  setSelectorFromPointer(e.clientX, e.clientY, true);
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
}

function onTrackPointerDown(e: PointerEvent): void {
  if (props.disabled) return;
  e.preventDefault();
  dragging = 'track';
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  setTrackFromPointer(e.clientY, true);
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
}

onBeforeUnmount(() => {
  if (emitTimer) clearTimeout(emitTimer);
  if (historyDebounceTimer) clearTimeout(historyDebounceTimer);
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
});

const pureHueHex = computed(() => {
  const h = normalizeHueFromTrackY(trackPos.value.y);
  const rgb = hsvToRgb({ h, s: 100, v: 100 });
  return formatColorFromRgb(rgb, 'hex');
});

const selectorThumbHex = computed(() => {
  const rgb = hsvToRgb(hsvFromPositions());
  return formatColorFromRgb(rgb, 'hex');
});

const selectorBackgroundStyle = computed(() => ({
  backgroundColor: pureHueHex.value,
}));

const selectorThumbStyle = computed(() => ({
  backgroundColor: selectorThumbHex.value,
  left: `${selectorPos.value.x}%`,
  top: `${selectorPos.value.y}%`,
  transform: 'translate(-50%, -50%)',
}));

const trackThumbStyle = computed(() => ({
  backgroundColor: pureHueHex.value,
  left: '50%',
  top: `${trackPos.value.y}%`,
  transform: 'translate(-50%, -50%)',
}));

const resolvedTag = computed(() => {
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const rootClass = computed(() => [
  'pfColorPicker',
  `pfColorPicker_size_${effectiveSize.value}`,
  props.disabled && 'pfColorPicker_disabled',
  historyEnabled.value && 'pfColorPicker_history',
  props.ui?.root,
  attrs.class as string | undefined,
]);

const rootTabindex = computed(() => (historyEnabled.value ? 0 : undefined));

const passthroughAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown>;
  return rest;
});
</script>

<template>
  <component
    :is="resolvedTag"
    ref="rootRef"
    :class="rootClass"
    :tabindex="rootTabindex"
    v-bind="passthroughAttrs"
    @pointerdown.capture="onRootPointerDownCapture"
    @keydown="onRootKeydown"
  >
    <div class="pfColorPicker__picker" :class="props.ui?.picker">
      <div
        ref="selectorRef"
        class="pfColorPicker__selector"
        :class="props.ui?.selector"
        data-pf-color-picker-selector
        @pointerdown="onSelectorPointerDown"
      >
        <div
          class="pfColorPicker__selectorBackground"
          :class="props.ui?.selectorBackground"
          data-pf-color-picker-background
          :style="selectorBackgroundStyle"
        />
        <div
          class="pfColorPicker__selectorThumb"
          :class="props.ui?.selectorThumb"
          data-pf-color-picker-selector-thumb
          :style="selectorThumbStyle"
        />
      </div>
      <div
        ref="trackRef"
        class="pfColorPicker__track"
        :class="props.ui?.track"
        data-pf-color-picker-track
        @pointerdown="onTrackPointerDown"
      >
        <div
          class="pfColorPicker__trackThumb"
          :class="props.ui?.trackThumb"
          data-pf-color-picker-track-thumb
          :style="trackThumbStyle"
        />
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfColorPicker {
  display: inline-flex;

  color: var(--pf-color-text);
}

.pfColorPicker_history:focus {
  outline: none;
}

.pfColorPicker_history:focus-visible {
  box-shadow: var(--pf-focus-ring);
  border-radius: var(--pf-radius-sm);
}

.pfColorPicker_disabled {
  opacity: 0.75;

  pointer-events: none;
}

.pfColorPicker__picker {
  display: flex;
  align-items: stretch;
  gap: var(--pf-color-picker-gap);
}

.pfColorPicker__selector {
  position: relative;

  width: var(--pf-color-picker-selector-size);
  height: var(--pf-color-picker-selector-size);
  flex-shrink: 0;

  border-radius: var(--pf-radius-sm);
  overflow: hidden;

  cursor: crosshair;
  touch-action: none;
}

.pfColorPicker__selectorBackground {
  position: relative;

  width: 100%;
  height: 100%;

  border-radius: inherit;
}

[data-pf-color-picker-background] {
  background-image:
    linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%),
    linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

.pfColorPicker__selectorThumb {
  position: absolute;

  width: var(--pf-color-picker-thumb-size);
  height: var(--pf-color-picker-thumb-size);

  box-shadow:
    0 0 0 2px var(--pf-color-surface),
    0 0 0 1px color-mix(in srgb, var(--pf-border-color) 60%, transparent);
  border-radius: 50%;

  pointer-events: none;
}

.pfColorPicker__track {
  position: relative;

  width: var(--pf-color-picker-track-width);
  height: var(--pf-color-picker-selector-size);
  flex-shrink: 0;

  border-radius: var(--pf-radius-sm);

  cursor: ns-resize;
  touch-action: none;
}

[data-pf-color-picker-track] {
  background-image: linear-gradient(
    0deg,
    #f00 0%,
    #f0f 17%,
    #00f 33%,
    #0ff 50%,
    #0f0 67%,
    #ff0 83%,
    #f00
  );
}

.pfColorPicker__trackThumb {
  position: absolute;

  width: var(--pf-color-picker-thumb-size);
  height: var(--pf-color-picker-thumb-size);

  box-shadow:
    0 0 0 2px var(--pf-color-surface),
    0 0 0 1px color-mix(in srgb, var(--pf-border-color) 60%, transparent);
  border-radius: 50%;

  pointer-events: none;
}

.pfColorPicker_size_xs {
  --pf-color-picker-selector-size: var(--pf-color-picker-size-xs);
  --pf-color-picker-track-width: var(--pf-color-picker-track-width-xs);
}

.pfColorPicker_size_sm {
  --pf-color-picker-selector-size: var(--pf-color-picker-size-sm);
  --pf-color-picker-track-width: var(--pf-color-picker-track-width-sm);
}

.pfColorPicker_size_md {
  --pf-color-picker-selector-size: var(--pf-color-picker-size-md);
  --pf-color-picker-track-width: var(--pf-color-picker-track-width-md);
}

.pfColorPicker_size_lg {
  --pf-color-picker-selector-size: var(--pf-color-picker-size-lg);
  --pf-color-picker-track-width: var(--pf-color-picker-track-width-lg);
}

.pfColorPicker_size_xl {
  --pf-color-picker-selector-size: var(--pf-color-picker-size-xl);
  --pf-color-picker-track-width: var(--pf-color-picker-track-width-xl);
}
</style>
