<script setup lang="ts">
import type { Component } from 'vue';
import {
  computed,
  inject,
  nextTick,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfSwitchColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfSwitchSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfSwitchUi = Partial<{
  root: string;
  base: string;
  container: string;
  thumb: string;
  thumbBody: string;
  icon: string;
  wrapper: string;
  label: string;
  description: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    modelValue?: unknown;
    defaultValue?: unknown;
    trueValue?: unknown;
    falseValue?: unknown;
    label?: string;
    description?: string;
    color?: PfSwitchColor;
    size?: PfSwitchSize;
    checkedIcon?: PfIconName;
    uncheckedIcon?: PfIconName;
    loading?: boolean;
    loadingIcon?: PfIconName;
    ui?: PfSwitchUi;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string | number;
    id?: string;
    autofocus?: boolean;
    form?: string;
  }>(),
  {
    color: 'primary',
    size: undefined,
    loading: false,
    disabled: false,
    required: false,
    autofocus: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
  change: [event: Event];
}>();

const attrs = useAttrs();
const slots = useSlots();

const localModel = ref<unknown>(
  props.defaultValue !== undefined ? props.defaultValue : false
);

watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) {
      localModel.value = v;
    }
  },
  { immediate: true }
);

const model = computed({
  get: () =>
    props.modelValue !== undefined ? props.modelValue : localModel.value,
  set: (v) => {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', v);
    } else {
      localModel.value = v;
    }
  },
});

const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): PfSwitchSize => props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const trueV = computed(() => props.trueValue ?? true);
const falseV = computed(() => props.falseValue ?? false);

const isChecked = computed(() => Object.is(model.value, trueV.value));

const inputRef = ref<HTMLInputElement | null>(null);

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);

const descriptionId = computed(() => `${inputId.value}-desc`);

const resolvedTag = computed(() => {
  const a = props.as ?? 'label';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const isLabelRoot = computed(() => {
  const a = props.as;
  if (a == null) return true;
  return typeof a === 'string' && a.toLowerCase() === 'label';
});

const isInputDisabled = computed(() => props.disabled || props.loading);

const spinnerIcon = computed((): PfIconName => props.loadingIcon ?? 'spinner');

const iconSize = computed((): PfIconSize => {
  switch (effectiveSize.value) {
    case 'xs':
      return '2xs';
    case 'sm':
      return 'xs';
    case 'md':
      return 'sm';
    case 'lg':
      return 'md';
    case 'xl':
      return 'lg';
    default:
      return 'sm';
  }
});

const hasLabelSlot = computed(() => slots.label != null);
const hasDescriptionSlot = computed(() => slots.description != null);
const hasTextBlock = computed(
  () =>
    props.label != null ||
    props.description != null ||
    hasLabelSlot.value ||
    hasDescriptionSlot.value
);

const showCheckedIcon = computed(
  () => !props.loading && props.checkedIcon != null && isChecked.value
);

const showUncheckedIcon = computed(
  () => !props.loading && props.uncheckedIcon != null && !isChecked.value
);

const rootClass = computed(() => {
  const list: (string | undefined | false)[] = [
    'pfSwitch',
    props.ui?.root,
    `pfSwitch_size_${effectiveSize.value}`,
    `pfSwitch_color_${props.color}`,
    isInputDisabled.value && 'pfSwitch_disabled',
    isChecked.value && 'pfSwitch_checked',
    props.loading && 'pfSwitch_loading',
    dragging.value && 'pfSwitch_dragging',
  ];
  return list;
});

const containerClass = computed(() => [
  'pfSwitch__container',
  props.ui?.container,
]);

const baseClass = computed(() => ['pfSwitch__base', props.ui?.base]);

const thumbClass = computed(() => [
  'pfSwitch__thumb',
  props.ui?.thumb,
  dragging.value && 'pfSwitch__thumb_dragging',
]);

const thumbSquish = ref(false);

const thumbBodyClass = computed(() => {
  const list: (string | undefined | false)[] = [
    'pfSwitch__thumbBody',
    props.ui?.thumbBody,
    thumbSquish.value && 'pfSwitch__thumbBody_squishing',
  ];
  return list;
});

const iconClass = computed(() => ['pfSwitch__icon', props.ui?.icon]);

const wrapperClass = computed(() => ['pfSwitch__wrapper', props.ui?.wrapper]);

const labelClass = computed(() => [
  'pfSwitch__label',
  props.required && 'pfSwitch__label_required',
  props.ui?.label,
]);

const descriptionClass = computed(() => [
  'pfSwitch__description',
  props.ui?.description,
]);

const ariaDescribedBy = computed(() =>
  props.description != null || hasDescriptionSlot.value
    ? descriptionId.value
    : undefined
);

const nativeValue = computed(() => {
  if (props.value !== undefined) return String(props.value);
  if (typeof trueV.value === 'string' || typeof trueV.value === 'number') {
    return String(trueV.value);
  }
  return 'on';
});

function onNativeChange(e: Event) {
  if (isInputDisabled.value) return;
  const el = e.target as HTMLInputElement;
  model.value = el.checked ? trueV.value : falseV.value;
  emit('change', e);
}

watch(isChecked, () => {
  thumbSquish.value = false;
  void nextTick(() => {
    thumbSquish.value = true;
  });
});

function onThumbSquishEnd(e: AnimationEvent) {
  if (e.target !== e.currentTarget) return;
  thumbSquish.value = false;
}

const containerRef = ref<HTMLElement | null>(null);
const baseRef = ref<HTMLElement | null>(null);
const thumbRef = ref<HTMLElement | null>(null);

const dragging = ref(false);
/** `translateX` offset in px while dragging; `null` — position from CSS. */
const dragTranslatePx = ref<number | null>(null);

let dragPointerId = -1;
let grabOffsetX = 0;
let dragMoved = false;
let dragStartClientX = 0;

const DRAG_MOVE_PX = 5;

function parseSwitchMetrics() {
  const el = containerRef.value;
  const base = baseRef.value;
  if (!el || !base) return null;

  const s = getComputedStyle(el);
  const inset = parseFloat(s.getPropertyValue('--pf-switch-inset')) || 0;
  const thumbVar = parseFloat(s.getPropertyValue('--pf-switch-thumb')) || 0;
  const thumbEl = thumbRef.value;
  const thumb =
    thumbEl != null && thumbEl.offsetWidth > 0 ? thumbEl.offsetWidth : thumbVar;

  let travel = parseFloat(s.getPropertyValue('--pf-switch-travel'));
  if (!Number.isFinite(travel) || travel <= 0) {
    const rect = base.getBoundingClientRect();
    const bl = parseFloat(getComputedStyle(base).borderLeftWidth) || 0;
    const innerW = rect.width - 2 * bl;
    travel = Math.max(0, innerW - 2 * inset - thumb);
  }

  return { travel, inset, thumb };
}

function switchIsRtl(): boolean {
  const b = baseRef.value;
  return b != null && getComputedStyle(b).direction === 'rtl';
}

/** Current thumb translateX in px from computed transform (no mismatch with subpixel/CSS var). */
function readThumbTranslateXPx(): number | undefined {
  const el = thumbRef.value;
  if (!el) return undefined;
  const tr = getComputedStyle(el).transform;
  if (!tr || tr === 'none') return 0;
  try {
    return new DOMMatrixReadOnly(tr).m41;
  } catch {
    return undefined;
  }
}

function updateDragFromClientX(clientX: number) {
  const m = parseSwitchMetrics();
  const base = baseRef.value;
  const thumbEl = thumbRef.value;
  if (!m || !base || !thumbEl || m.travel <= 0) return;

  const thumbPx = thumbEl.offsetWidth || m.thumb;
  if (thumbPx <= 0) return;

  const rect = base.getBoundingClientRect();
  const bl = parseFloat(getComputedStyle(base).borderLeftWidth) || 0;
  const innerLeft = rect.left + bl;
  const rtl = switchIsRtl();

  const targetCenter = clientX + grabOffsetX;
  let thumbLeft = targetCenter - thumbPx / 2 - innerLeft;

  const minL = rtl ? m.inset - m.travel : m.inset;
  const maxL = rtl ? m.inset : m.inset + m.travel;
  thumbLeft = Math.min(maxL, Math.max(minL, thumbLeft));

  let progress: number;
  if (rtl) {
    progress = (m.inset - thumbLeft) / m.travel;
  } else {
    progress = (thumbLeft - m.inset) / m.travel;
  }
  progress = Math.min(1, Math.max(0, progress));
  dragTranslatePx.value = rtl ? -progress * m.travel : progress * m.travel;
}

function onThumbPointerDown(e: PointerEvent) {
  if (isInputDisabled.value || e.button !== 0) return;
  e.stopPropagation();
  e.preventDefault();

  const thumbEl = thumbRef.value;
  const m = parseSwitchMetrics();
  if (!thumbEl || !m) return;

  const tRect = thumbEl.getBoundingClientRect();
  const centerX = tRect.left + tRect.width / 2;
  grabOffsetX = centerX - e.clientX;
  dragMoved = false;
  dragStartClientX = e.clientX;
  dragPointerId = e.pointerId;
  dragging.value = true;

  const fromMatrix = readThumbTranslateXPx();
  if (fromMatrix !== undefined) {
    dragTranslatePx.value = fromMatrix;
  } else {
    updateDragFromClientX(e.clientX);
    if (dragTranslatePx.value == null && m.travel > 0) {
      const rtl = switchIsRtl();
      dragTranslatePx.value = isChecked.value
        ? rtl
          ? -m.travel
          : m.travel
        : 0;
    }
  }

  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onThumbPointerMove(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== dragPointerId) return;
  if (Math.abs(e.clientX - dragStartClientX) > DRAG_MOVE_PX) {
    dragMoved = true;
  }
  updateDragFromClientX(e.clientX);
}

function commitDrag(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== dragPointerId) return;

  const el = e.currentTarget as HTMLElement;
  try {
    el.releasePointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }

  dragging.value = false;
  dragPointerId = -1;

  const m = parseSwitchMetrics();
  let nextChecked: boolean;

  if (!dragMoved) {
    nextChecked = !isChecked.value;
  } else if (m != null && m.travel > 0 && dragTranslatePx.value != null) {
    const rtl = switchIsRtl();
    const p = rtl
      ? -dragTranslatePx.value / m.travel
      : dragTranslatePx.value / m.travel;
    nextChecked = p >= 0.5;
  } else {
    nextChecked = isChecked.value;
  }

  dragTranslatePx.value = null;

  const nextVal = nextChecked ? trueV.value : falseV.value;
  if (!Object.is(model.value, nextVal)) {
    model.value = nextVal;
    emit('change', e);
  }
}

function onThumbClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

const thumbTransformStyle = computed((): Record<string, string> | undefined => {
  if (dragTranslatePx.value != null) {
    return {
      transform: `translateY(-50%) translateX(${dragTranslatePx.value}px)`,
      transition: 'none',
    };
  }
  return undefined;
});

defineExpose({ inputRef });
</script>

<template>
  <component
    :is="resolvedTag"
    v-if="isLabelRoot"
    :class="[rootClass, attrs.class as string | undefined]"
    :style="
      (attrs.style as Record<string, string> | string | undefined) ?? undefined
    "
  >
    <span ref="containerRef" :class="containerClass">
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        class="pfSwitch__native"
        v-bind="{
          ...attrs,
          class: undefined,
          style: undefined,
        }"
        :disabled="isInputDisabled"
        :required="required"
        :name="name"
        :value="nativeValue"
        :form="form"
        :autofocus="autofocus"
        :checked="isChecked"
        :aria-describedby="ariaDescribedBy"
        role="switch"
        :aria-checked="isChecked"
        @change="onNativeChange"
      />
      <span ref="baseRef" :class="baseClass" aria-hidden="true">
        <span ref="thumbRef" :class="thumbClass" :style="thumbTransformStyle">
          <span
            :class="thumbBodyClass"
            @animationend="onThumbSquishEnd"
            @pointerdown="onThumbPointerDown"
            @pointermove="onThumbPointerMove"
            @pointerup="commitDrag"
            @pointercancel="commitDrag"
            @click="onThumbClick"
          >
            <Transition
              v-if="loading || checkedIcon || uncheckedIcon"
              name="pfSwitchIcon"
              mode="out-in"
            >
              <PfIcon
                v-if="loading"
                key="pf-switch-icon-loading"
                :name="spinnerIcon"
                :size="iconSize"
                :class="[iconClass, 'pfSwitch__iconSpin']"
              />
              <PfIcon
                v-else-if="showCheckedIcon && checkedIcon"
                key="pf-switch-icon-checked"
                :name="checkedIcon"
                :size="iconSize"
                :class="iconClass"
              />
              <PfIcon
                v-else-if="showUncheckedIcon && uncheckedIcon"
                key="pf-switch-icon-unchecked"
                :name="uncheckedIcon"
                :size="iconSize"
                :class="iconClass"
              />
            </Transition>
          </span>
        </span>
      </span>
    </span>
    <span v-if="hasTextBlock" :class="wrapperClass">
      <span v-if="label != null || slots.label" :class="labelClass">
        <slot name="label">{{ label }}</slot>
      </span>
      <span
        v-if="description != null || slots.description"
        :id="descriptionId"
        :class="descriptionClass"
      >
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </component>
  <component
    :is="resolvedTag"
    v-else
    :class="[rootClass, attrs.class as string | undefined]"
    :style="
      (attrs.style as Record<string, string> | string | undefined) ?? undefined
    "
  >
    <label class="pfSwitch__control" :for="inputId">
      <span ref="containerRef" :class="containerClass">
        <input
          :id="inputId"
          ref="inputRef"
          type="checkbox"
          class="pfSwitch__native"
          v-bind="{
            ...attrs,
            class: undefined,
            style: undefined,
          }"
          :disabled="isInputDisabled"
          :required="required"
          :name="name"
          :value="nativeValue"
          :form="form"
          :autofocus="autofocus"
          :checked="isChecked"
          :aria-describedby="ariaDescribedBy"
          role="switch"
          :aria-checked="isChecked"
          @change="onNativeChange"
        />
        <span ref="baseRef" :class="baseClass" aria-hidden="true">
          <span ref="thumbRef" :class="thumbClass" :style="thumbTransformStyle">
            <span
              :class="thumbBodyClass"
              @animationend="onThumbSquishEnd"
              @pointerdown="onThumbPointerDown"
              @pointermove="onThumbPointerMove"
              @pointerup="commitDrag"
              @pointercancel="commitDrag"
              @click="onThumbClick"
            >
              <Transition
                v-if="loading || checkedIcon || uncheckedIcon"
                name="pfSwitchIcon"
                mode="out-in"
              >
                <PfIcon
                  v-if="loading"
                  key="pf-switch-icon-loading"
                  :name="spinnerIcon"
                  :size="iconSize"
                  :class="[iconClass, 'pfSwitch__iconSpin']"
                />
                <PfIcon
                  v-else-if="showCheckedIcon && checkedIcon"
                  key="pf-switch-icon-checked"
                  :name="checkedIcon"
                  :size="iconSize"
                  :class="iconClass"
                />
                <PfIcon
                  v-else-if="showUncheckedIcon && uncheckedIcon"
                  key="pf-switch-icon-unchecked"
                  :name="uncheckedIcon"
                  :size="iconSize"
                  :class="iconClass"
                />
              </Transition>
            </span>
          </span>
        </span>
      </span>
      <span v-if="hasTextBlock" :class="wrapperClass">
        <span v-if="label != null || slots.label" :class="labelClass">
          <slot name="label">{{ label }}</slot>
        </span>
        <span
          v-if="description != null || slots.description"
          :id="descriptionId"
          :class="descriptionClass"
        >
          <slot name="description">{{ description }}</slot>
        </span>
      </span>
    </label>
  </component>
</template>

<style scoped lang="scss">
@keyframes pfSwitch-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pfSwitchThumbSquish {
  0%,
  100% {
    border-radius: 50%;

    transform: scale(1, 1);
  }

  40% {
    border-radius: 38%;

    transform: scale(1.14, 0.82);
  }

  72% {
    border-radius: 50%;

    transform: scale(0.96, 1.06);
  }
}

label.pfSwitch {
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);
}

.pfSwitch:not(label) {
  display: block;
}

.pfSwitch {
  max-width: 100%;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

  &_disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }

  &:not(&_disabled) {
    cursor: pointer;
  }

  &_dragging {
    user-select: none;
  }

  &_color_primary {
    --pf-switch-accent: var(--pf-color-primary);
    --pf-switch-focus-ring: var(--pf-color-primary);
    --pf-switch-icon-on: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-switch-accent: var(--pf-color-secondary);
    --pf-switch-focus-ring: var(--pf-color-secondary);
    --pf-switch-icon-on: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-switch-accent: var(--pf-color-success);
    --pf-switch-focus-ring: var(--pf-color-success);
    --pf-switch-icon-on: var(--pf-color-success);
  }

  &_color_info {
    --pf-switch-accent: var(--pf-color-info);
    --pf-switch-focus-ring: var(--pf-color-info);
    --pf-switch-icon-on: var(--pf-color-info);
  }

  &_color_warning {
    --pf-switch-accent: var(--pf-color-warning);
    --pf-switch-focus-ring: var(--pf-color-warning);
    --pf-switch-icon-on: var(--pf-color-warning);
  }

  &_color_error {
    --pf-switch-accent: var(--pf-color-error);
    --pf-switch-focus-ring: var(--pf-color-error);
    --pf-switch-icon-on: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-switch-accent: var(--pf-color-neutral);
    --pf-switch-focus-ring: var(--pf-color-neutral);
    --pf-switch-icon-on: var(--pf-color-text);
  }
}

.pfSwitch__control {
  margin: 0;

  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);
  box-sizing: border-box;

  cursor: pointer;
}

.pfSwitch_disabled .pfSwitch__control {
  cursor: not-allowed;
}

.pfSwitch__container {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pfSwitch_size_xs .pfSwitch__container {
  --pf-switch-inset: var(--pf-switch-inset-xs);
  --pf-switch-thumb: var(--pf-switch-thumb-size-xs);
  --pf-switch-track-h: var(--pf-switch-track-height-xs);
  --pf-switch-track-w: var(--pf-switch-track-width-xs);
  --pf-switch-travel: var(--pf-switch-travel-xs);
}

.pfSwitch_size_sm .pfSwitch__container {
  --pf-switch-inset: var(--pf-switch-inset-sm);
  --pf-switch-thumb: var(--pf-switch-thumb-size-sm);
  --pf-switch-track-h: var(--pf-switch-track-height-sm);
  --pf-switch-track-w: var(--pf-switch-track-width-sm);
  --pf-switch-travel: var(--pf-switch-travel-sm);
}

.pfSwitch_size_md .pfSwitch__container {
  --pf-switch-inset: var(--pf-switch-inset-md);
  --pf-switch-thumb: var(--pf-switch-thumb-size-md);
  --pf-switch-track-h: var(--pf-switch-track-height-md);
  --pf-switch-track-w: var(--pf-switch-track-width-md);
  --pf-switch-travel: var(--pf-switch-travel-md);
}

.pfSwitch_size_lg .pfSwitch__container {
  --pf-switch-inset: var(--pf-switch-inset-lg);
  --pf-switch-thumb: var(--pf-switch-thumb-size-lg);
  --pf-switch-track-h: var(--pf-switch-track-height-lg);
  --pf-switch-track-w: var(--pf-switch-track-width-lg);
  --pf-switch-travel: var(--pf-switch-travel-lg);
}

.pfSwitch_size_xl .pfSwitch__container {
  --pf-switch-inset: var(--pf-switch-inset-xl);
  --pf-switch-thumb: var(--pf-switch-thumb-size-xl);
  --pf-switch-track-h: var(--pf-switch-track-height-xl);
  --pf-switch-track-w: var(--pf-switch-track-width-xl);
  --pf-switch-travel: var(--pf-switch-travel-xl);
}

.pfSwitch__native {
  position: absolute;
  margin: -1px;

  padding: 0;
  width: 1px;
  height: 1px;

  white-space: nowrap;

  border: 0;
  overflow: hidden;

  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}

.pfSwitch__native:focus {
  outline: none;
}

.pfSwitch__native:focus-visible + .pfSwitch__base {
  outline: 2px solid var(--pf-switch-focus-ring, var(--pf-color-primary));
  outline-offset: 2px;
}

.pfSwitch__base {
  position: relative;

  width: var(--pf-switch-track-w);
  height: var(--pf-switch-track-h);
  display: block;
  flex-shrink: 0;
  box-sizing: border-box;

  background-color: color-mix(
    in srgb,
    var(--pf-border-color) 55%,
    var(--pf-color-surface)
  );
  border: calc(var(--pf-switch-track-border-x) / 2) solid transparent;
  border-radius: 9999px;
  overflow: visible;

  transition: background-color var(--pf-switch-move-duration)
    var(--pf-switch-move-easing);

  .pfSwitch_checked & {
    background-color: var(--pf-switch-accent, var(--pf-color-primary));
  }

  .pfSwitch_disabled & {
    cursor: not-allowed;
  }
}

.pfSwitch__thumb {
  position: absolute;
  top: 50%;
  left: var(--pf-switch-inset);

  width: var(--pf-switch-thumb);
  height: var(--pf-switch-thumb);

  transform: translateY(-50%) translateX(0);
  transition: transform var(--pf-switch-move-duration)
    var(--pf-switch-move-easing);

  pointer-events: none;

  &_dragging {
    z-index: 1;
  }

  .pfSwitch_checked & {
    transform: translateY(-50%) translateX(var(--pf-switch-travel));
  }

  [dir='rtl'] .pfSwitch_checked & {
    transform: translateY(-50%) translateX(calc(-1 * var(--pf-switch-travel)));
  }
}

.pfSwitch__thumbBody {
  position: relative;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.08),
    0 1px 3px rgb(0 0 0 / 0.06);
  background-color: var(--pf-color-surface);
  border-radius: 50%;
  will-change: transform;

  transform-origin: center center;

  pointer-events: auto;
  touch-action: none;

  &_squishing {
    animation: pfSwitchThumbSquish var(--pf-switch-squish-duration)
      var(--pf-switch-squish-easing);
  }

  .pfSwitch_disabled &,
  .pfSwitch_loading & {
    cursor: not-allowed;
    pointer-events: none;
  }
}

.pfSwitch__icon {
  position: absolute;

  width: 65%;
  height: 65%;

  color: var(--pf-color-muted);

  .pfSwitch_checked .pfSwitch__thumbBody & {
    color: var(--pf-switch-icon-on, var(--pf-color-primary));
  }
}

.pfSwitch__iconSpin {
  color: var(--pf-switch-icon-on, var(--pf-color-primary));

  animation: pfSwitch-spin 0.95s linear infinite;
}

:deep(.pfSwitchIcon-enter-active),
:deep(.pfSwitchIcon-leave-active) {
  transition:
    opacity calc(var(--pf-animation-duration) / 2) var(--pf-animation-easing),
    transform calc(var(--pf-animation-duration) / 2) var(--pf-animation-easing);
}

:deep(.pfSwitchIcon-enter-from),
:deep(.pfSwitchIcon-leave-to) {
  opacity: 0;

  transform: scale(0.82);
}

.pfSwitch__wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--pf-space-xs);
}

.pfSwitch_size_xs .pfSwitch__wrapper {
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfSwitch_size_sm .pfSwitch__wrapper {
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfSwitch_size_md .pfSwitch__wrapper {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfSwitch_size_lg .pfSwitch__wrapper {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfSwitch_size_xl .pfSwitch__wrapper {
  font-size: var(--pf-font-size-md);
  line-height: var(--pf-line-height-md);
}

.pfSwitch__label {
  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-medium);

  .pfSwitch_disabled & {
    cursor: not-allowed;
  }

  &_required::after {
    content: '*';

    margin-left: var(--pf-space-xs);

    color: var(--pf-color-error);
    font-weight: var(--pf-font-weight-bold);
  }
}

.pfSwitch__description {
  color: var(--pf-color-muted);

  .pfSwitch_disabled & {
    cursor: not-allowed;
  }
}
</style>
