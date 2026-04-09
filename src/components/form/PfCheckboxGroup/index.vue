<script setup lang="ts">
import type { Component } from 'vue';
import {
  computed,
  provide,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue';
import PfCheckbox from '../PfCheckbox/index.vue';
import type {
  PfCheckboxColor,
  PfCheckboxIndicator,
  PfCheckboxSize,
  PfCheckboxVariant,
} from '../PfCheckbox/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import {
  PF_FIELD_GROUP_INJECTION_KEY,
  type PfFieldGroupSize,
} from '../../element/PfFieldGroup/injection';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import {
  normalizeChoiceGroupItems,
  type PfChoiceGroupItem,
} from '../groupItems';

export type PfCheckboxGroupUi = Partial<{
  root: string;
  fieldset: string;
  legend: string;
  item: string;
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
    as?: string | Component;
    legend?: string;
    valueKey?: string;
    labelKey?: string;
    descriptionKey?: string;
    items?: readonly PfChoiceGroupItem[];
    modelValue?: unknown[];
    defaultValue?: unknown[];
    size?: PfCheckboxSize;
    variant?: PfCheckboxVariant | 'table';
    orientation?: 'horizontal' | 'vertical';
    indicator?: PfCheckboxIndicator;
    disabled?: boolean;
    loop?: boolean;
    name?: string;
    required?: boolean;
    color?: PfCheckboxColor;
    icon?: PfIconName;
    ui?: PfCheckboxGroupUi;
  }>(),
  {
    valueKey: 'value',
    labelKey: 'label',
    descriptionKey: 'description',
    variant: 'list',
    orientation: 'vertical',
    indicator: 'start',
    disabled: false,
    loop: false,
    required: false,
    color: 'primary',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]];
  change: [event: Event];
}>();

const attrs = useAttrs();
const slots = useSlots();

const autoName = useId().replace(/:/g, '');
const groupName = computed(() => props.name ?? `pf-cb-${autoName}`);

const vModelBound = usePfVModelBound();

const localSelection = ref<unknown[]>(
  props.defaultValue !== undefined ? [...props.defaultValue] : []
);

watch(
  () => props.modelValue,
  (v) => {
    if (!vModelBound.value && v !== undefined) {
      localSelection.value = [...v];
    }
  },
  { immediate: true, deep: true }
);

const selection = computed({
  get: () => {
    if (vModelBound.value) {
      return props.modelValue ?? [];
    }
    return props.modelValue !== undefined
      ? props.modelValue
      : localSelection.value;
  },
  set: (v) => {
    if (vModelBound.value || props.modelValue !== undefined) {
      emit('update:modelValue', v);
    } else {
      localSelection.value = v;
    }
  },
});

provide(
  PF_FIELD_GROUP_INJECTION_KEY,
  computed(() => ({
    size: props.size as PfFieldGroupSize | undefined,
  }))
);

const normalized = computed(() =>
  normalizeChoiceGroupItems(props.items, {
    valueKey: props.valueKey,
    labelKey: props.labelKey,
    descriptionKey: props.descriptionKey,
  })
);

function isSelected(value: unknown): boolean {
  return selection.value.some((v) => Object.is(v, value));
}

function setSelection(next: unknown[]) {
  selection.value = next;
}

function onItemModelUpdate(itemValue: unknown, v: unknown) {
  const checked = v === true;
  const cur = selection.value;
  let next: unknown[];
  if (checked) {
    next = isSelected(itemValue) ? cur : [...cur, itemValue];
  } else {
    next = cur.filter((x) => !Object.is(x, itemValue));
  }
  setSelection(next);
}

function onItemChange(e: Event) {
  emit('change', e);
}

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => [
  'pfCheckboxGroup',
  `pfCheckboxGroup_orientation_${props.orientation}`,
  `pfCheckboxGroup_variant_${props.variant}`,
  `pfCheckboxGroup_color_${props.color}`,
  props.disabled && 'pfCheckboxGroup_disabled',
  attrs.class,
  props.ui?.root,
]);

const fieldsetClass = computed(() => [
  'pfCheckboxGroup__fieldset',
  props.ui?.fieldset,
]);

const legendClass = computed(() => [
  'pfCheckboxGroup__legend',
  props.required && 'pfCheckboxGroup__legend_required',
  props.ui?.legend,
]);

function itemClass(item: { class?: string }) {
  return ['pfCheckboxGroup__item', props.ui?.item, item.class];
}

function checkboxUiForItem(item: { ui?: Record<string, string | undefined> }) {
  return {
    container: props.ui?.container,
    base: props.ui?.base,
    indicator: props.ui?.indicator,
    icon: props.ui?.icon,
    wrapper: props.ui?.wrapper,
    label: props.ui?.label,
    description: props.ui?.description,
    ...item.ui,
  };
}

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const fieldsetRef = ref<HTMLFieldSetElement | null>(null);

function focusAdjacentCheckbox(delta: number) {
  const root = fieldsetRef.value;
  if (!root) return;
  const boxes = root.querySelectorAll<HTMLInputElement>(
    'input.pfCheckbox__native:not([disabled])'
  );
  const list = [...boxes];
  const active = document.activeElement;
  let i = list.indexOf(active as HTMLInputElement);
  if (i < 0) return;
  let next = i + delta;
  if (props.loop) {
    next = ((next % list.length) + list.length) % list.length;
  } else {
    if (next < 0 || next >= list.length) return;
  }
  list[next]?.focus();
}

function onFieldsetKeydown(e: KeyboardEvent) {
  if (!props.loop) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    focusAdjacentCheckbox(1);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    focusAdjacentCheckbox(-1);
  }
}

const innerCheckboxVariant = computed(
  (): PfCheckboxVariant => (props.variant === 'table' ? 'list' : props.variant)
);
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <fieldset
      ref="fieldsetRef"
      :class="fieldsetClass"
      :disabled="disabled"
      @keydown="onFieldsetKeydown"
    >
      <legend v-if="legend != null || slots.legend" :class="legendClass">
        <slot name="legend">{{ legend }}</slot>
      </legend>
      <PfCheckbox
        v-for="item in normalized"
        :key="item.key"
        :class="itemClass(item)"
        :model-value="isSelected(item.value)"
        :true-value="true"
        :false-value="false"
        :label="item.label"
        :description="item.description"
        :disabled="disabled || item.disabled"
        :required="required"
        :name="groupName"
        :color="color"
        :variant="innerCheckboxVariant"
        :size="size"
        :indicator="indicator"
        :icon="icon"
        :ui="checkboxUiForItem(item)"
        @update:model-value="(v) => onItemModelUpdate(item.value, v)"
        @change="onItemChange"
      >
        <template v-if="slots.label" #label>
          <slot name="label" :item="item" />
        </template>
        <template v-if="slots.description" #description>
          <slot name="description" :item="item" />
        </template>
      </PfCheckbox>
    </fieldset>
  </component>
</template>

<style scoped lang="scss">
.pfCheckboxGroup {
  max-width: 100%;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);
}

.pfCheckboxGroup__fieldset {
  margin: 0;

  padding: 0;
  min-width: 0;

  border: none;
}

.pfCheckboxGroup_orientation_vertical .pfCheckboxGroup__fieldset {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--pf-space-sm);
}

.pfCheckboxGroup_orientation_horizontal .pfCheckboxGroup__fieldset {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--pf-space-md);
}

.pfCheckboxGroup__legend {
  margin-bottom: var(--pf-space-sm);

  padding: 0;

  color: var(--pf-color-text);
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);

  &_required::after {
    content: '*';

    margin-left: var(--pf-space-xs);

    color: var(--pf-color-error);
  }
}

.pfCheckboxGroup_color_primary {
  --pf-checkbox-group-accent: var(--pf-color-primary);
}

.pfCheckboxGroup_color_secondary {
  --pf-checkbox-group-accent: var(--pf-color-secondary);
}

.pfCheckboxGroup_color_success {
  --pf-checkbox-group-accent: var(--pf-color-success);
}

.pfCheckboxGroup_color_info {
  --pf-checkbox-group-accent: var(--pf-color-info);
}

.pfCheckboxGroup_color_warning {
  --pf-checkbox-group-accent: var(--pf-color-warning);
}

.pfCheckboxGroup_color_error {
  --pf-checkbox-group-accent: var(--pf-color-error);
}

.pfCheckboxGroup_color_neutral {
  --pf-checkbox-group-accent: var(--pf-color-neutral);
}

.pfCheckboxGroup_variant_table .pfCheckboxGroup__item {
  border: 1px solid var(--pf-border-color);
  border-radius: 0;

  transition:
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    background-color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_vertical
  .pfCheckboxGroup__item:first-child {
  border-start-end-radius: var(--pf-radius-sm);
  border-start-start-radius: var(--pf-radius-sm);
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_vertical
  .pfCheckboxGroup__item:last-child {
  border-end-end-radius: var(--pf-radius-sm);
  border-end-start-radius: var(--pf-radius-sm);
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_vertical
  .pfCheckboxGroup__fieldset {
  gap: 0;
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_vertical
  .pfCheckboxGroup__item:not(:first-child) {
  margin-top: calc(-1 * var(--pf-stroke-width));
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_horizontal
  .pfCheckboxGroup__item:first-child {
  border-end-start-radius: var(--pf-radius-sm);
  border-start-start-radius: var(--pf-radius-sm);
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_horizontal
  .pfCheckboxGroup__item:last-child {
  border-end-end-radius: var(--pf-radius-sm);
  border-start-end-radius: var(--pf-radius-sm);
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_horizontal
  .pfCheckboxGroup__fieldset {
  gap: 0;
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_orientation_horizontal
  .pfCheckboxGroup__item:not(:first-child) {
  margin-inline-start: calc(-1 * var(--pf-stroke-width));
}

.pfCheckboxGroup_variant_table
  .pfCheckboxGroup__item:deep(.pfCheckbox_checked) {
  position: relative;
  z-index: 1;

  background-color: color-mix(
    in srgb,
    var(--pf-checkbox-group-accent, var(--pf-color-primary)) 10%,
    var(--pf-color-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--pf-checkbox-group-accent, var(--pf-color-primary)) 50%,
    var(--pf-border-color)
  );
}

.pfCheckboxGroup_variant_table.pfCheckboxGroup_disabled .pfCheckboxGroup__item {
  cursor: not-allowed;
}

.pfCheckboxGroup_variant_table .pfCheckboxGroup__item:deep(.pfCheckbox) {
  padding: var(--pf-space-md);
}

.pfCheckboxGroup_disabled {
  opacity: 0.85;
}
</style>
