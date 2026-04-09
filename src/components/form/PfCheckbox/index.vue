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

export type PfCheckboxColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfCheckboxVariant = 'card' | 'list';

export type PfCheckboxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfCheckboxIndicator = 'start' | 'end' | 'hidden';

export type PfCheckboxUi = Partial<{
  root: string;
  container: string;
  base: string;
  indicator: string;
  icon: string;
  wrapper: string;
  label: string;
  description: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or component. Default `label` (whole hit area is clickable). */
    as?: string | Component;
    modelValue?: unknown;
    /** Initial value without `v-model`. */
    defaultValue?: boolean | 'indeterminate';
    trueValue?: unknown;
    falseValue?: unknown;
    label?: string;
    description?: string;
    color?: PfCheckboxColor;
    variant?: PfCheckboxVariant;
    size?: PfCheckboxSize;
    indicator?: PfCheckboxIndicator;
    icon?: PfIconName;
    indeterminateIcon?: PfIconName;
    ui?: PfCheckboxUi;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    /** Value submitted when checked (`input[value]`). */
    value?: string | number;
    id?: string;
    autofocus?: boolean;
    form?: string;
  }>(),
  {
    color: 'primary',
    variant: 'list',
    size: undefined,
    indicator: 'start',
    icon: 'check',
    indeterminateIcon: 'minus',
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
  (): PfCheckboxSize => props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const trueV = computed(() => props.trueValue ?? true);
const falseV = computed(() => props.falseValue ?? false);

const isIndeterminate = computed(() => model.value === 'indeterminate');

const isChecked = computed(
  () => !isIndeterminate.value && Object.is(model.value, trueV.value)
);

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

const showCheckIcon = computed(() => isChecked.value && !isIndeterminate.value);
const showIndeterminateIcon = computed(() => isIndeterminate.value);

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
    'pfCheckbox',
    props.ui?.root,
    `pfCheckbox_size_${effectiveSize.value}`,
    `pfCheckbox_color_${props.color}`,
    `pfCheckbox_variant_${props.variant}`,
    `pfCheckbox_indicator_${props.indicator}`,
    props.disabled && 'pfCheckbox_disabled',
    (isChecked.value || isIndeterminate.value) && 'pfCheckbox_checked',
  ];
  return list;
});

const containerClass = computed(() => [
  'pfCheckbox__container',
  props.ui?.container,
]);

const baseClass = computed(() => ['pfCheckbox__base', props.ui?.base]);

const indicatorClass = computed(() => [
  'pfCheckbox__indicator',
  props.ui?.indicator,
]);

const iconClass = computed(() => ['pfCheckbox__icon', props.ui?.icon]);

const wrapperClass = computed(() => ['pfCheckbox__wrapper', props.ui?.wrapper]);

const labelClass = computed(() => [
  'pfCheckbox__label',
  props.required && 'pfCheckbox__label_required',
  props.ui?.label,
]);

const descriptionClass = computed(() => [
  'pfCheckbox__description',
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
    model.value = trueV.value;
  } else {
    model.value = falseV.value;
  }
  emit('change', e);
}

function syncDomInput() {
  const el = inputRef.value;
  if (!el) return;
  el.indeterminate = isIndeterminate.value;
  el.checked = isChecked.value;
}

watch([model, isIndeterminate, isChecked], async () => {
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
        type="checkbox"
        class="pfCheckbox__native"
        v-bind="{
          ...attrs,
          class: undefined,
          style: undefined,
        }"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="value"
        :form="form"
        :autofocus="autofocus"
        :checked="isChecked"
        :aria-describedby="ariaDescribedBy"
        @change="onNativeChange"
      />
      <span :class="baseClass" aria-hidden="true">
        <span :class="indicatorClass">
          <Transition name="pfCheckboxIcon" mode="out-in">
            <PfIcon
              v-if="showCheckIcon"
              :key="'check'"
              :name="icon"
              :size="iconSize"
              :class="iconClass"
            />
            <PfIcon
              v-else-if="showIndeterminateIcon"
              :key="'indeterminate'"
              :name="indeterminateIcon"
              :size="iconSize"
              :class="iconClass"
            />
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
    <label class="pfCheckbox__control" :for="inputId">
      <span :class="containerClass">
        <input
          :id="inputId"
          ref="inputRef"
          type="checkbox"
          class="pfCheckbox__native"
          v-bind="{
            ...attrs,
            class: undefined,
            style: undefined,
          }"
          :disabled="disabled"
          :required="required"
          :name="name"
          :value="value"
          :form="form"
          :autofocus="autofocus"
          :checked="isChecked"
          :aria-describedby="ariaDescribedBy"
          @change="onNativeChange"
        />
        <span :class="baseClass" aria-hidden="true">
          <span :class="indicatorClass">
            <Transition name="pfCheckboxIcon" mode="out-in">
              <PfIcon
                v-if="showCheckIcon"
                :key="'check'"
                :name="icon"
                :size="iconSize"
                :class="iconClass"
              />
              <PfIcon
                v-else-if="showIndeterminateIcon"
                :key="'indeterminate'"
                :name="indeterminateIcon"
                :size="iconSize"
                :class="iconClass"
              />
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
label.pfCheckbox {
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);
}

.pfCheckbox:not(label) {
  display: block;
}

label.pfCheckbox.pfCheckbox_indicator_end {
  flex-direction: row-reverse;
}

.pfCheckbox:not(label).pfCheckbox_indicator_end .pfCheckbox__control {
  flex-direction: row-reverse;
}

.pfCheckbox {
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

    &.pfCheckbox_checked {
      border-color: var(--pf-checkbox-accent, var(--pf-color-primary));
    }
  }

  &_size_xs.pfCheckbox_variant_card {
    padding: var(--pf-checkbox-card-pad-xs);
  }

  &_size_sm.pfCheckbox_variant_card {
    padding: var(--pf-checkbox-card-pad-sm);
  }

  &_size_md.pfCheckbox_variant_card {
    padding: var(--pf-checkbox-card-pad-md);
  }

  &_size_lg.pfCheckbox_variant_card {
    padding: var(--pf-checkbox-card-pad-lg);
  }

  &_size_xl.pfCheckbox_variant_card {
    padding: var(--pf-checkbox-card-pad-xl);
  }

  &_indicator_hidden .pfCheckbox__wrapper {
    text-align: center;
  }

  &_color_primary {
    --pf-checkbox-accent: var(--pf-color-primary);
    --pf-checkbox-focus-ring: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-checkbox-accent: var(--pf-color-secondary);
    --pf-checkbox-focus-ring: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-checkbox-accent: var(--pf-color-success);
    --pf-checkbox-focus-ring: var(--pf-color-success);
  }

  &_color_info {
    --pf-checkbox-accent: var(--pf-color-info);
    --pf-checkbox-focus-ring: var(--pf-color-info);
  }

  &_color_warning {
    --pf-checkbox-accent: var(--pf-color-warning);
    --pf-checkbox-focus-ring: var(--pf-color-warning);
  }

  &_color_error {
    --pf-checkbox-accent: var(--pf-color-error);
    --pf-checkbox-focus-ring: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-checkbox-accent: var(--pf-color-neutral);
    --pf-checkbox-focus-ring: var(--pf-color-neutral);
  }
}

.pfCheckbox__control {
  margin: 0;

  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);
  box-sizing: border-box;

  cursor: pointer;
}

.pfCheckbox_disabled .pfCheckbox__control {
  cursor: not-allowed;
}

.pfCheckbox__container {
  position: relative;

  height: var(--pf-checkbox-container-height);
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-start;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pfCheckbox_size_xs .pfCheckbox__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-xs);
}

.pfCheckbox_size_sm .pfCheckbox__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-sm);
}

.pfCheckbox_size_md .pfCheckbox__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-md);
}

.pfCheckbox_size_lg .pfCheckbox__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-lg);
}

.pfCheckbox_size_xl .pfCheckbox__container {
  --pf-checkbox-container-height: var(--pf-checkbox-container-height-xl);
}

.pfCheckbox__native {
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

.pfCheckbox_indicator_hidden .pfCheckbox__base {
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

.pfCheckbox__native:focus {
  outline: none;
}

.pfCheckbox__native:focus-visible + .pfCheckbox__base {
  outline: 2px solid var(--pf-checkbox-focus-ring, var(--pf-color-primary));
  outline-offset: 2px;
}

.pfCheckbox__base {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  background-color: var(--pf-color-surface);
  border: var(--pf-stroke-width) solid var(--pf-border-color);
  border-radius: calc(var(--pf-radius-sm) * 0.4);
  overflow: hidden;

  transition: border-color var(--pf-animation-duration)
    var(--pf-animation-easing);

  &::before {
    content: '';

    inset: 0;
    position: absolute;

    background-color: var(--pf-checkbox-accent, var(--pf-color-primary));
    opacity: 0;

    transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

    pointer-events: none;
  }

  .pfCheckbox_checked & {
    border-color: var(--pf-checkbox-accent, var(--pf-color-primary));

    &::before {
      opacity: 1;
    }
  }

  .pfCheckbox_disabled & {
    cursor: not-allowed;
  }
}

.pfCheckbox_size_xs .pfCheckbox__base {
  width: var(--pf-checkbox-size-xs);
  height: var(--pf-checkbox-size-xs);
}

.pfCheckbox_size_sm .pfCheckbox__base {
  width: var(--pf-checkbox-size-sm);
  height: var(--pf-checkbox-size-sm);
}

.pfCheckbox_size_md .pfCheckbox__base {
  width: var(--pf-checkbox-size-md);
  height: var(--pf-checkbox-size-md);
}

.pfCheckbox_size_lg .pfCheckbox__base {
  width: var(--pf-checkbox-size-lg);
  height: var(--pf-checkbox-size-lg);
}

.pfCheckbox_size_xl .pfCheckbox__base {
  width: var(--pf-checkbox-size-xl);
  height: var(--pf-checkbox-size-xl);
}

.pfCheckbox__indicator {
  position: relative;
  z-index: 1;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  color: var(--pf-color-surface);
}

.pfCheckbox__icon {
  inset: 0;
  position: absolute;
  margin: auto;

  width: 71%;
  height: 71%;
  flex-shrink: 0;

  will-change: transform;
}

:deep(.pfCheckboxIcon-enter-active),
:deep(.pfCheckboxIcon-leave-active) {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

:deep(.pfCheckboxIcon-enter-from),
:deep(.pfCheckboxIcon-leave-to) {
  opacity: 0;

  transform: scale(0.82);
}

.pfCheckbox__wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--pf-space-xs);
}

.pfCheckbox_size_xs .pfCheckbox__wrapper {
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfCheckbox_size_sm .pfCheckbox__wrapper {
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfCheckbox_size_md .pfCheckbox__wrapper {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfCheckbox_size_lg .pfCheckbox__wrapper {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfCheckbox_size_xl .pfCheckbox__wrapper {
  font-size: var(--pf-font-size-md);
  line-height: var(--pf-line-height-md);
}

.pfCheckbox__label {
  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-normal);

  .pfCheckbox_disabled & {
    cursor: not-allowed;
  }

  &_required::after {
    content: '*';

    margin-left: var(--pf-space-xs);

    color: var(--pf-color-error);
    font-weight: var(--pf-font-weight-bold);
  }
}

.pfCheckbox__description {
  color: var(--pf-color-muted);

  .pfCheckbox_disabled & {
    cursor: not-allowed;
  }
}
</style>
