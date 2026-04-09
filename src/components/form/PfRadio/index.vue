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
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import { nativeInputValuePart } from '../groupItems';

export type PfRadioColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfRadioVariant = 'card' | 'list';

export type PfRadioSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfRadioIndicator = 'start' | 'end' | 'hidden';

export type PfRadioUi = Partial<{
  root: string;
  container: string;
  base: string;
  indicator: string;
  dot: string;
  wrapper: string;
  label: string;
  description: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    /** Group selected value (`v-model`). */
    modelValue?: unknown;
    defaultValue?: unknown;
    /** This option’s value. */
    value: unknown;
    label?: string;
    description?: string;
    color?: PfRadioColor;
    variant?: PfRadioVariant;
    size?: PfRadioSize;
    indicator?: PfRadioIndicator;
    ui?: PfRadioUi;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    autofocus?: boolean;
    form?: string;
  }>(),
  {
    color: 'primary',
    variant: 'list',
    size: undefined,
    indicator: 'start',
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

const vModelBound = usePfVModelBound();

const localModel = ref<unknown>(
  props.defaultValue !== undefined ? props.defaultValue : undefined
);

watch(
  () => props.modelValue,
  (v) => {
    if (!vModelBound.value && v !== undefined) {
      localModel.value = v;
    }
  },
  { immediate: true }
);

const model = computed({
  get: () => {
    if (vModelBound.value) {
      return props.modelValue;
    }
    return props.modelValue !== undefined ? props.modelValue : localModel.value;
  },
  set: (v) => {
    if (vModelBound.value || props.modelValue !== undefined) {
      emit('update:modelValue', v);
    } else {
      localModel.value = v;
    }
  },
});

const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): PfRadioSize => props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const isChecked = computed(() => Object.is(model.value, props.value));

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

const nativeValue = computed(() => nativeInputValuePart(props.value));

const hasLabelSlot = computed(() => slots.label != null);
const hasDescriptionSlot = computed(() => slots.description != null);
const hasTextBlock = computed(
  () =>
    props.label != null ||
    props.description != null ||
    hasLabelSlot.value ||
    hasDescriptionSlot.value
);

const rootClass = computed(() => {
  const list: (string | undefined | false)[] = [
    'pfRadio',
    props.ui?.root,
    `pfRadio_size_${effectiveSize.value}`,
    `pfRadio_color_${props.color}`,
    `pfRadio_variant_${props.variant}`,
    `pfRadio_indicator_${props.indicator}`,
    props.disabled && 'pfRadio_disabled',
    isChecked.value && 'pfRadio_checked',
  ];
  return list;
});

const containerClass = computed(() => [
  'pfRadio__container',
  props.ui?.container,
]);

const baseClass = computed(() => ['pfRadio__base', props.ui?.base]);

const indicatorClass = computed(() => [
  'pfRadio__indicator',
  props.ui?.indicator,
]);

const dotClass = computed(() => ['pfRadio__dot', props.ui?.dot]);

const wrapperClass = computed(() => ['pfRadio__wrapper', props.ui?.wrapper]);

const labelClass = computed(() => [
  'pfRadio__label',
  props.required && 'pfRadio__label_required',
  props.ui?.label,
]);

const descriptionClass = computed(() => [
  'pfRadio__description',
  props.ui?.description,
]);

const ariaDescribedBy = computed(() =>
  props.description != null || hasDescriptionSlot.value
    ? descriptionId.value
    : undefined
);

function onNativeChange(e: Event) {
  const el = e.target as HTMLInputElement;
  if (props.disabled) return;
  if (el.checked) {
    model.value = props.value;
  }
  emit('change', e);
}

function syncDomInput() {
  const el = inputRef.value;
  if (!el) return;
  el.checked = isChecked.value;
}

watch([model, isChecked], async () => {
  await nextTick();
  syncDomInput();
});

watch(inputRef, () => {
  syncDomInput();
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
    <span :class="containerClass">
      <input
        :id="inputId"
        ref="inputRef"
        type="radio"
        class="pfRadio__native"
        v-bind="{
          ...attrs,
          class: undefined,
          style: undefined,
        }"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="nativeValue"
        :form="form"
        :autofocus="autofocus"
        :checked="isChecked"
        :aria-describedby="ariaDescribedBy"
        @change="onNativeChange"
      />
      <span :class="baseClass" aria-hidden="true">
        <span :class="indicatorClass">
          <Transition name="pfRadioDot" mode="out-in">
            <span v-if="isChecked" :key="'dot'" :class="dotClass" />
          </Transition>
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
    <label class="pfRadio__control" :for="inputId">
      <span :class="containerClass">
        <input
          :id="inputId"
          ref="inputRef"
          type="radio"
          class="pfRadio__native"
          v-bind="{
            ...attrs,
            class: undefined,
            style: undefined,
          }"
          :disabled="disabled"
          :required="required"
          :name="name"
          :value="nativeValue"
          :form="form"
          :autofocus="autofocus"
          :checked="isChecked"
          :aria-describedby="ariaDescribedBy"
          @change="onNativeChange"
        />
        <span :class="baseClass" aria-hidden="true">
          <span :class="indicatorClass">
            <Transition name="pfRadioDot" mode="out-in">
              <span v-if="isChecked" :key="'dot'" :class="dotClass" />
            </Transition>
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
label.pfRadio {
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);
}

.pfRadio:not(label) {
  display: block;
}

label.pfRadio.pfRadio_indicator_end {
  flex-direction: row-reverse;
}

.pfRadio:not(label).pfRadio_indicator_end .pfRadio__control {
  flex-direction: row-reverse;
}

.pfRadio {
  max-width: 100%;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    border-color var(--pf-animation-duration) var(--pf-animation-easing);

  &_disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }

  &:not(&_disabled) {
    cursor: pointer;
  }

  &_variant_card {
    border: 1px solid var(--pf-border-color);
    border-radius: var(--pf-radius-sm);

    &.pfRadio_checked {
      border-color: var(--pf-radio-accent, var(--pf-color-primary));
    }
  }

  &_size_xs.pfRadio_variant_card {
    padding: var(--pf-checkbox-card-pad-xs);
  }

  &_size_sm.pfRadio_variant_card {
    padding: var(--pf-checkbox-card-pad-sm);
  }

  &_size_md.pfRadio_variant_card {
    padding: var(--pf-checkbox-card-pad-md);
  }

  &_size_lg.pfRadio_variant_card {
    padding: var(--pf-checkbox-card-pad-lg);
  }

  &_size_xl.pfRadio_variant_card {
    padding: var(--pf-checkbox-card-pad-xl);
  }

  &_indicator_hidden .pfRadio__wrapper {
    text-align: center;
  }

  &_color_primary {
    --pf-radio-accent: var(--pf-color-primary);
    --pf-radio-focus-ring: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-radio-accent: var(--pf-color-secondary);
    --pf-radio-focus-ring: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-radio-accent: var(--pf-color-success);
    --pf-radio-focus-ring: var(--pf-color-success);
  }

  &_color_info {
    --pf-radio-accent: var(--pf-color-info);
    --pf-radio-focus-ring: var(--pf-color-info);
  }

  &_color_warning {
    --pf-radio-accent: var(--pf-color-warning);
    --pf-radio-focus-ring: var(--pf-color-warning);
  }

  &_color_error {
    --pf-radio-accent: var(--pf-color-error);
    --pf-radio-focus-ring: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-radio-accent: var(--pf-color-neutral);
    --pf-radio-focus-ring: var(--pf-color-neutral);
  }
}

.pfRadio__control {
  margin: 0;

  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);
  box-sizing: border-box;

  cursor: pointer;
}

.pfRadio_disabled .pfRadio__control {
  cursor: not-allowed;
}

.pfRadio__container {
  position: relative;

  height: var(--pf-checkbox-container-height);
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-start;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pfRadio_size_xs .pfRadio__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-xs);
}

.pfRadio_size_sm .pfRadio__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-sm);
}

.pfRadio_size_md .pfRadio__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-md);
}

.pfRadio_size_lg .pfRadio__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-lg);
}

.pfRadio_size_xl .pfRadio__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-xl);
}

.pfRadio__native {
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

.pfRadio_indicator_hidden .pfRadio__base {
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

.pfRadio__native:focus {
  outline: none;
}

.pfRadio__native:focus-visible + .pfRadio__base {
  outline: 2px solid var(--pf-radio-focus-ring, var(--pf-color-primary));
  outline-offset: 2px;
}

.pfRadio__base {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  background-color: var(--pf-color-surface);
  border: var(--pf-stroke-width) solid var(--pf-border-color);
  border-radius: 50%;
  overflow: hidden;

  transition: border-color var(--pf-animation-duration)
    var(--pf-animation-easing);

  &::before {
    content: '';

    inset: 0;
    position: absolute;

    background-color: var(--pf-radio-accent, var(--pf-color-primary));
    opacity: 0;
    will-change: opacity, transform;

    transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

    pointer-events: none;
  }

  .pfRadio_checked & {
    border-color: var(--pf-radio-accent, var(--pf-color-primary));

    &::before {
      opacity: 1;
    }
  }

  .pfRadio_disabled & {
    cursor: not-allowed;
  }
}

.pfRadio_size_xs .pfRadio__base {
  width: var(--pf-checkbox-size-xs);
  height: var(--pf-checkbox-size-xs);
}

.pfRadio_size_sm .pfRadio__base {
  width: var(--pf-checkbox-size-sm);
  height: var(--pf-checkbox-size-sm);
}

.pfRadio_size_md .pfRadio__base {
  width: var(--pf-checkbox-size-md);
  height: var(--pf-checkbox-size-md);
}

.pfRadio_size_lg .pfRadio__base {
  width: var(--pf-checkbox-size-lg);
  height: var(--pf-checkbox-size-lg);
}

.pfRadio_size_xl .pfRadio__base {
  width: var(--pf-checkbox-size-xl);
  height: var(--pf-checkbox-size-xl);
}

.pfRadio__indicator {
  position: relative;
  z-index: 1;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.pfRadio__dot {
  width: 42%;
  height: 42%;
  flex-shrink: 0;

  background-color: var(--pf-color-surface);
  border-radius: 50%;
}

:deep(.pfRadioDot-enter-active),
:deep(.pfRadioDot-leave-active) {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

:deep(.pfRadioDot-enter-from),
:deep(.pfRadioDot-leave-to) {
  opacity: 0;

  transform: scale(0.75);
}

.pfRadio__wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--pf-space-xs);
}

.pfRadio_size_xs .pfRadio__wrapper {
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfRadio_size_sm .pfRadio__wrapper {
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfRadio_size_md .pfRadio__wrapper {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfRadio_size_lg .pfRadio__wrapper {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfRadio_size_xl .pfRadio__wrapper {
  font-size: var(--pf-font-size-md);
  line-height: var(--pf-line-height-md);
}

.pfRadio__label {
  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-normal);

  .pfRadio_disabled & {
    cursor: not-allowed;
  }

  &_required::after {
    content: '*';

    margin-left: var(--pf-space-xs);

    color: var(--pf-color-error);
    font-weight: var(--pf-font-weight-bold);
  }
}

.pfRadio__description {
  color: var(--pf-color-muted);

  .pfRadio_disabled & {
    cursor: not-allowed;
  }
}
</style>
