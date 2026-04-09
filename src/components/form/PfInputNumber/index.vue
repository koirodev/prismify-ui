<script setup lang="ts">
import {
  NumberFormatter,
  NumberParser,
  type NumberFormatOptions,
} from '@internationalized/number';
import type { Ref } from 'vue';
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  unref,
  useAttrs,
  watch,
} from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfInput from '../PfInput/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfInputNumberColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfInputNumberVariant =
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'none';

export type PfInputNumberUi = Partial<{
  root: string;
  base: string;
  increment: string;
  decrement: string;
}>;

export type PfInputNumberStepButtonProps = Partial<{
  variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  color: PfInputNumberColor;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>;

function defaultLocale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    placeholder?: string;
    color?: PfInputNumberColor;
    variant?: PfInputNumberVariant;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    highlight?: boolean;
    fixed?: boolean;
    orientation?: 'horizontal' | 'vertical';
    increment?: boolean | PfInputNumberStepButtonProps;
    decrement?: boolean | PfInputNumberStepButtonProps;
    incrementIcon?: PfIconName;
    decrementIcon?: PfIconName;
    incrementDisabled?: boolean;
    decrementDisabled?: boolean;
    autofocus?: boolean;
    autofocusDelay?: number;
    defaultValue?: number | null;
    modelValue?: number | null;
    ui?: PfInputNumberUi;
    min?: number;
    max?: number;
    step?: number;
    stepSnapping?: boolean;
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    formatOptions?: NumberFormatOptions;
    locale?: string;
    disableWheelChange?: boolean;
    invertWheelChange?: boolean;
    focusOnChange?: boolean;
    enterKeyHint?:
      | 'enter'
      | 'done'
      | 'go'
      | 'next'
      | 'previous'
      | 'search'
      | 'send';
    form?: string;
    list?: string;
    autocomplete?: string;
  }>(),
  {
    color: 'primary',
    variant: 'outline',
    orientation: 'horizontal',
    step: 1,
    stepSnapping: true,
    disabled: false,
    required: false,
    readonly: false,
    autofocusDelay: 0,
    incrementIcon: 'plusSmall',
    decrementIcon: 'minusSmall',
    incrementDisabled: false,
    decrementDisabled: false,
    highlight: false,
    fixed: true,
    disableWheelChange: false,
    invertWheelChange: false,
    focusOnChange: false,
    autocomplete: 'off',
    increment: true,
    decrement: true,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
  blur: [event: FocusEvent];
  change: [event: Event];
}>();

const attrs = useAttrs();
const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' =>
    props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const isControlled = computed(() => props.modelValue !== undefined);

const localNumber = ref<number | null>(null);

function applyExternalValue(v: number | null | undefined) {
  if (v == null || (typeof v === 'number' && Number.isNaN(v))) {
    localNumber.value = null;
  } else {
    localNumber.value = v;
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (props.modelValue !== undefined) {
      applyExternalValue(v);
    }
  },
  { immediate: true }
);

if (!isControlled.value && props.defaultValue != null) {
  applyExternalValue(props.defaultValue);
}

const resolvedLocale = computed(() => props.locale ?? defaultLocale());

const formatOpts = computed(() => props.formatOptions ?? {});

const formatter = computed(
  () => new NumberFormatter(resolvedLocale.value, formatOpts.value)
);

const parser = computed(
  () => new NumberParser(resolvedLocale.value, formatOpts.value)
);

const pfInputRef = ref<InstanceType<typeof PfInput> | null>(null);
const inputString = ref('');

function resolveInputElement(): HTMLInputElement | null {
  const inner = pfInputRef.value?.inputRef;
  if (inner == null) return null;
  return unref(inner as unknown as Ref<HTMLInputElement | null>);
}
const isFocused = ref(false);
const draft = ref('');

/** ± buttons via `v-show`: with `v-if` branches sometimes did not mount until first tick with ref flags from watch. */
const shellIsVertical = ref(false);
const renderHorizontalDec = ref(false);
const renderHorizontalInc = ref(false);
const renderVerticalRail = ref(false);
const renderVerticalInc = ref(false);
const renderVerticalDec = ref(false);

function syncStepperLayout() {
  const o =
    props.orientation === 'vertical'
      ? ('vertical' as const)
      : ('horizontal' as const);
  const incOn = props.increment !== false;
  const decOn = props.decrement !== false;
  shellIsVertical.value = o === 'vertical';
  if (o === 'horizontal') {
    renderHorizontalDec.value = decOn;
    renderHorizontalInc.value = incOn;
    renderVerticalRail.value = false;
    renderVerticalInc.value = false;
    renderVerticalDec.value = false;
  } else {
    renderHorizontalDec.value = false;
    renderHorizontalInc.value = false;
    const rail = incOn || decOn;
    renderVerticalRail.value = rail;
    renderVerticalInc.value = rail && incOn;
    renderVerticalDec.value = rail && decOn;
  }
}

watch(
  () => [props.orientation, props.increment, props.decrement],
  syncStepperLayout,
  { immediate: true, deep: true, flush: 'sync' }
);

const incrementButtonBind = computed(() => {
  const base = {
    type: 'button' as const,
    variant: 'link' as const,
    color: props.color,
    size: effectiveSize.value,
    iconOnly: true,
    ariaLabel: 'Increase',
    disabled:
      props.disabled ||
      props.incrementDisabled ||
      props.readonly ||
      incrAtMax.value,
  };
  if (props.increment === false) {
    return base;
  }
  if (typeof props.increment === 'object' && props.increment !== null) {
    return { ...base, ...props.increment };
  }
  return base;
});

const decrementButtonBind = computed(() => {
  const base = {
    type: 'button' as const,
    variant: 'link' as const,
    color: props.color,
    size: effectiveSize.value,
    iconOnly: true,
    ariaLabel: 'Decrease',
    disabled:
      props.disabled ||
      props.decrementDisabled ||
      props.readonly ||
      decrAtMin.value,
  };
  if (props.decrement === false) {
    return base;
  }
  if (typeof props.decrement === 'object' && props.decrement !== null) {
    return { ...base, ...props.decrement };
  }
  return base;
});

function clamp(n: number): number {
  let v = n;
  if (props.min != null) v = Math.max(props.min, v);
  if (props.max != null) v = Math.min(props.max, v);
  return v;
}

function snapValue(n: number): number {
  const step = props.step ?? 1;
  if (step === 0 || props.stepSnapping === false) {
    return clamp(n);
  }
  if (props.min != null) {
    const snapped = Math.round((n - props.min) / step) * step + props.min;
    return clamp(snapped);
  }
  const snapped = Math.round(n / step) * step;
  return clamp(snapped);
}

const incrAtMax = computed(() => {
  const v = localNumber.value;
  if (v == null || props.max == null) return false;
  return v >= props.max;
});

const decrAtMin = computed(() => {
  const v = localNumber.value;
  if (v == null || props.min == null) return false;
  return v <= props.min;
});

const displayCommitted = computed(() => {
  if (localNumber.value == null || Number.isNaN(localNumber.value)) {
    return '';
  }
  return formatter.value.format(localNumber.value);
});

const inputDisplay = computed(() =>
  isFocused.value ? draft.value : displayCommitted.value
);

watch(
  () => inputDisplay.value,
  (v) => {
    inputString.value = v;
  },
  { immediate: true }
);

const pfInputUi = computed(() =>
  props.ui?.base ? { base: props.ui.base } : undefined
);

function commitValue(n: number | null, snap: boolean) {
  let v = n;
  if (v != null && Number.isNaN(v)) v = null;
  if (v != null) {
    v = clamp(v);
    if (snap) v = snapValue(v);
  }
  localNumber.value = v;
  emit('update:modelValue', v);
}

onMounted(() => {
  if (props.autofocus) {
    window.setTimeout(() => {
      resolveInputElement()?.focus();
    }, props.autofocusDelay ?? 0);
  }
});

function onFocus() {
  isFocused.value = true;
  if (localNumber.value != null && !Number.isNaN(localNumber.value)) {
    draft.value = formatter.value.format(localNumber.value);
  } else {
    draft.value = '';
  }
}

function onStringInput(val: string) {
  const p = parser.value;
  if (!p.isValidPartialNumber(val, props.min, props.max)) {
    inputString.value = draft.value;
    return;
  }
  draft.value = val;
  if (val.trim() === '') {
    commitValue(null, false);
    return;
  }
  const parsed = p.parse(val);
  if (!Number.isNaN(parsed)) {
    commitValue(clamp(parsed), false);
  }
}

function onWrapFocusIn(e: FocusEvent) {
  const t = e.target as HTMLElement;
  if (t?.classList?.contains('pfInput__native')) {
    onFocus();
  }
}

function onWrapFocusOut(e: FocusEvent) {
  const t = e.target as HTMLElement;
  if (t?.classList?.contains('pfInput__native')) {
    onBlur(e);
  }
}

function onBlur(e: FocusEvent) {
  isFocused.value = false;
  if (draft.value.trim() === '') {
    commitValue(null, false);
  } else {
    const parsed = parser.value.parse(draft.value);
    if (Number.isNaN(parsed)) {
      draft.value =
        localNumber.value != null && !Number.isNaN(localNumber.value)
          ? formatter.value.format(localNumber.value)
          : '';
    } else {
      commitValue(parsed, props.stepSnapping !== false);
    }
  }
  emit('blur', e);
  emit('change', e);
}

function bump(delta: number, e?: Event) {
  if (props.disabled || props.readonly) return;
  if (delta > 0 && props.increment === false) return;
  if (delta < 0 && props.decrement === false) return;
  const step = props.step ?? 1;
  let base = localNumber.value;
  if (base == null || Number.isNaN(base)) {
    base = props.min ?? 0;
  }
  let next = base + delta * step;
  next = props.stepSnapping !== false ? snapValue(next) : clamp(next);
  commitValue(next, false);
  if (isFocused.value) {
    const v = localNumber.value;
    draft.value =
      v != null && !Number.isNaN(v) ? formatter.value.format(v) : '';
  }
  if (props.focusOnChange) {
    void nextTick(() => resolveInputElement()?.focus());
  }
  emit('change', e ?? new Event('change'));
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled || props.readonly) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const up = e.key === 'ArrowUp';
  if (up && props.increment === false) return;
  if (!up && props.decrement === false) return;
  if (up && incrAtMax.value) return;
  if (!up && decrAtMin.value) return;
  e.preventDefault();
  bump(up ? 1 : -1, e);
}

function onWheel(e: WheelEvent) {
  if (props.disableWheelChange || props.disabled || props.readonly) return;
  if (!isFocused.value) return;
  e.preventDefault();
  const sign = Math.sign(e.deltaY);
  if (sign === 0) return;
  const dir = props.invertWheelChange ? sign : -sign;
  bump(dir > 0 ? 1 : -1, e);
}

const rootClass = computed(() => [
  'pfInputNumber',
  `pfInputNumber_size_${effectiveSize.value}`,
  `pfInputNumber_color_${props.color}`,
  `pfInputNumber_variant_${props.variant}`,
  `pfInputNumber_orientation_${props.orientation === 'vertical' ? 'vertical' : 'horizontal'}`,
  props.disabled && 'pfInputNumber_disabled',
  props.highlight && 'pfInputNumber_highlight',
  !props.fixed && 'pfInputNumber_responsiveText',
  props.decrement !== false && 'pfInputNumber_hasDecr',
  props.increment !== false && 'pfInputNumber_hasIncr',
  props.ui?.root,
]);

const wrapClass = computed(() => attrs.class);

const inputAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const pfInputAttrs = computed(() => ({
  ...inputAttrs.value,
  inputmode: 'decimal',
}));

const hiddenValue = computed(() =>
  localNumber.value == null || Number.isNaN(localNumber.value)
    ? ''
    : String(localNumber.value)
);

defineExpose({
  get inputRef(): HTMLInputElement | null {
    return resolveInputElement();
  },
});
</script>

<template>
  <div class="pfInputNumber__wrap" :class="wrapClass">
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="hiddenValue"
      :disabled="disabled"
      :required="required"
    />
    <div :class="rootClass">
      <div
        class="pfInputNumber__shell"
        :class="{
          pfInputNumber__shell_vertical: shellIsVertical,
        }"
      >
        <div class="pfInputNumber__field">
          <span
            v-show="renderHorizontalDec"
            class="pfInputNumber__decr pfInputNumber__decr_horizontal"
            :class="ui?.decrement"
          >
            <slot
              name="decrement"
              :decrease="() => bump(-1)"
              :disabled="decrementButtonBind.disabled"
            >
              <PfButton
                v-bind="decrementButtonBind"
                :icon="decrementIcon"
                @click="bump(-1)"
              />
            </slot>
          </span>

          <div
            class="pfInputNumber__input"
            @focusin="onWrapFocusIn"
            @focusout="onWrapFocusOut"
          >
            <PfInput
              :id="id"
              ref="pfInputRef"
              :model-value="inputString"
              :color="color"
              :variant="variant"
              :size="effectiveSize"
              :highlight="highlight"
              :fixed="fixed"
              :disabled="disabled"
              :readonly="readonly"
              :placeholder="placeholder"
              :required="required && !name"
              :autocomplete="autocomplete"
              :form="form"
              :list="list"
              :enter-key-hint="enterKeyHint"
              :animated-text="false"
              type="number"
              :ui="pfInputUi"
              v-bind="pfInputAttrs"
              @update:model-value="onStringInput"
              @keydown="onKeydown"
              @wheel="onWheel"
            />
          </div>

          <div v-show="renderVerticalRail" class="pfInputNumber__rail">
            <span
              v-show="renderVerticalInc"
              class="pfInputNumber__incr pfInputNumber__incr_vertical"
              :class="ui?.increment"
            >
              <slot
                name="increment"
                :increase="() => bump(1)"
                :disabled="incrementButtonBind.disabled"
              >
                <PfButton
                  v-bind="incrementButtonBind"
                  :icon="incrementIcon"
                  @click="bump(1)"
                />
              </slot>
            </span>
            <span
              v-show="renderVerticalDec"
              class="pfInputNumber__decr pfInputNumber__decr_vertical"
              :class="ui?.decrement"
            >
              <slot
                name="decrement"
                :decrease="() => bump(-1)"
                :disabled="decrementButtonBind.disabled"
              >
                <PfButton
                  v-bind="decrementButtonBind"
                  :icon="decrementIcon"
                  @click="bump(-1)"
                />
              </slot>
            </span>
          </div>

          <span
            v-show="renderHorizontalInc"
            class="pfInputNumber__incr pfInputNumber__incr_horizontal"
            :class="ui?.increment"
          >
            <slot
              name="increment"
              :increase="() => bump(1)"
              :disabled="incrementButtonBind.disabled"
            >
              <PfButton
                v-bind="incrementButtonBind"
                :icon="incrementIcon"
                @click="bump(1)"
              />
            </slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfInputNumber__wrap {
  max-width: 100%;
  display: inline-flex;
  box-sizing: border-box;
}

.pfInputNumber {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

  &_disabled {
    opacity: 0.55;
  }

  &__shell {
    position: relative;

    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  &__shell_vertical &__field {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: var(--pf-space-xs);
  }

  &_orientation_horizontal &__field {
    padding-inline: var(--pf-space-xs);
    min-width: 0;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: var(--pf-space-xs);
  }

  &__field {
    isolation: isolate;

    position: relative;

    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  &__rail {
    padding-block: var(--pf-space-xs);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  &__decr,
  &__incr {
    z-index: 2;

    display: flex;
    align-items: center;
    flex-shrink: 0;

    :deep(.pfButton) {
      pointer-events: auto;
    }
  }

  &__decr_horizontal,
  &__incr_horizontal {
    position: relative;

    align-self: stretch;
  }

  &__incr_vertical,
  &__decr_vertical {
    transform: scale(0.9);
  }

  &__input {
    min-width: 0;
    max-width: 100%;
    min-height: 0;
    flex: 1 1 0%;

    :deep(.pfInput) {
      width: 100%;
    }
  }

  &_orientation_horizontal &__input {
    :deep(.pfInput__native) {
      text-align: center;
    }
  }

  &_orientation_vertical &__input {
    flex: 1;

    :deep(.pfInput__native) {
      text-align: start;
    }
  }

  &_hasDecr:not(&_hasIncr) &_orientation_horizontal &__input {
    :deep(.pfInput__native) {
      text-align: start;
    }
  }

  &:focus-within {
    z-index: 1;
  }
}
</style>
