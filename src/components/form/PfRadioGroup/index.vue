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
import PfRadio from '../PfRadio/index.vue';
import type {
  PfRadioColor,
  PfRadioIndicator,
  PfRadioSize,
  PfRadioVariant,
} from '../PfRadio/index.vue';
import {
  PF_FIELD_GROUP_INJECTION_KEY,
  type PfFieldGroupSize,
} from '../../element/PfFieldGroup/injection';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import {
  normalizeChoiceGroupItems,
  type PfChoiceGroupItem,
} from '../groupItems';

export type PfRadioGroupUi = Partial<{
  root: string;
  fieldset: string;
  legend: string;
  item: string;
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
    legend?: string;
    valueKey?: string;
    labelKey?: string;
    descriptionKey?: string;
    items?: readonly PfChoiceGroupItem[];
    modelValue?: unknown;
    defaultValue?: unknown;
    size?: PfRadioSize;
    variant?: PfRadioVariant | 'table';
    orientation?: 'horizontal' | 'vertical';
    indicator?: PfRadioIndicator;
    disabled?: boolean;
    name?: string;
    required?: boolean;
    color?: PfRadioColor;
    ui?: PfRadioGroupUi;
  }>(),
  {
    valueKey: 'value',
    labelKey: 'label',
    descriptionKey: 'description',
    variant: 'list',
    orientation: 'vertical',
    indicator: 'start',
    disabled: false,
    required: false,
    color: 'primary',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
  change: [event: Event];
}>();

const attrs = useAttrs();
const slots = useSlots();

const autoName = useId().replace(/:/g, '');
const groupName = computed(() => props.name ?? `pf-rg-${autoName}`);

const vModelBound = usePfVModelBound();

const localValue = ref<unknown>(
  props.defaultValue !== undefined ? props.defaultValue : undefined
);

watch(
  () => props.modelValue,
  (v) => {
    if (!vModelBound.value && v !== undefined) {
      localValue.value = v;
    }
  },
  { immediate: true }
);

const selected = computed({
  get: () => {
    if (vModelBound.value) {
      return props.modelValue;
    }
    return props.modelValue !== undefined ? props.modelValue : localValue.value;
  },
  set: (v) => {
    if (vModelBound.value || props.modelValue !== undefined) {
      emit('update:modelValue', v);
    } else {
      localValue.value = v;
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

const innerRadioVariant = computed(
  (): PfRadioVariant => (props.variant === 'table' ? 'list' : props.variant)
);

function onItemModelUpdate(v: unknown) {
  selected.value = v;
}

function onItemChange(e: Event) {
  emit('change', e);
}

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => [
  'pfRadioGroup',
  `pfRadioGroup_orientation_${props.orientation}`,
  `pfRadioGroup_variant_${props.variant}`,
  `pfRadioGroup_color_${props.color}`,
  props.disabled && 'pfRadioGroup_disabled',
  attrs.class,
  props.ui?.root,
]);

const fieldsetClass = computed(() => [
  'pfRadioGroup__fieldset',
  props.ui?.fieldset,
]);

const legendClass = computed(() => [
  'pfRadioGroup__legend',
  props.required && 'pfRadioGroup__legend_required',
  props.ui?.legend,
]);

function itemClass(item: { class?: string }) {
  return ['pfRadioGroup__item', props.ui?.item, item.class];
}

function radioUiForItem(item: { ui?: Record<string, string | undefined> }) {
  return {
    container: props.ui?.container,
    base: props.ui?.base,
    indicator: props.ui?.indicator,
    dot: props.ui?.dot,
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
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <fieldset :class="fieldsetClass" :disabled="disabled">
      <legend v-if="legend != null || slots.legend" :class="legendClass">
        <slot name="legend">{{ legend }}</slot>
      </legend>
      <PfRadio
        v-for="item in normalized"
        :key="item.key"
        :class="itemClass(item)"
        :model-value="selected"
        :value="item.value"
        :label="item.label"
        :description="item.description"
        :disabled="disabled || item.disabled"
        :required="required"
        :name="groupName"
        :color="color"
        :variant="innerRadioVariant"
        :size="size"
        :indicator="indicator"
        :ui="radioUiForItem(item)"
        @update:model-value="onItemModelUpdate"
        @change="onItemChange"
      >
        <template v-if="slots.label" #label>
          <slot name="label" :item="item" />
        </template>
        <template v-if="slots.description" #description>
          <slot name="description" :item="item" />
        </template>
      </PfRadio>
    </fieldset>
  </component>
</template>

<style scoped lang="scss">
.pfRadioGroup {
  max-width: 100%;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);
}

.pfRadioGroup__fieldset {
  margin: 0;

  padding: 0;
  min-width: 0;

  border: none;
}

.pfRadioGroup_orientation_vertical .pfRadioGroup__fieldset {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--pf-space-sm);
}

.pfRadioGroup_orientation_horizontal .pfRadioGroup__fieldset {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--pf-space-md);
}

.pfRadioGroup__legend {
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

.pfRadioGroup_color_primary {
  --pf-radio-group-accent: var(--pf-color-primary);
}

.pfRadioGroup_color_secondary {
  --pf-radio-group-accent: var(--pf-color-secondary);
}

.pfRadioGroup_color_success {
  --pf-radio-group-accent: var(--pf-color-success);
}

.pfRadioGroup_color_info {
  --pf-radio-group-accent: var(--pf-color-info);
}

.pfRadioGroup_color_warning {
  --pf-radio-group-accent: var(--pf-color-warning);
}

.pfRadioGroup_color_error {
  --pf-radio-group-accent: var(--pf-color-error);
}

.pfRadioGroup_color_neutral {
  --pf-radio-group-accent: var(--pf-color-neutral);
}

.pfRadioGroup_variant_table .pfRadioGroup__item {
  border: 1px solid var(--pf-border-color);
  border-radius: 0;

  transition:
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    background-color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_vertical
  .pfRadioGroup__item:first-child {
  border-start-end-radius: var(--pf-radius-sm);
  border-start-start-radius: var(--pf-radius-sm);
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_vertical
  .pfRadioGroup__item:last-child {
  border-end-end-radius: var(--pf-radius-sm);
  border-end-start-radius: var(--pf-radius-sm);
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_vertical
  .pfRadioGroup__fieldset {
  gap: 0;
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_vertical
  .pfRadioGroup__item:not(:first-child) {
  margin-top: calc(-1 * var(--pf-stroke-width));
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_horizontal
  .pfRadioGroup__item:first-child {
  border-end-start-radius: var(--pf-radius-sm);
  border-start-start-radius: var(--pf-radius-sm);
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_horizontal
  .pfRadioGroup__item:last-child {
  border-end-end-radius: var(--pf-radius-sm);
  border-start-end-radius: var(--pf-radius-sm);
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_horizontal
  .pfRadioGroup__fieldset {
  gap: 0;
}

.pfRadioGroup_variant_table.pfRadioGroup_orientation_horizontal
  .pfRadioGroup__item:not(:first-child) {
  margin-inline-start: calc(-1 * var(--pf-stroke-width));
}

.pfRadioGroup_variant_table .pfRadioGroup__item:deep(.pfRadio_checked) {
  position: relative;
  z-index: 1;

  background-color: color-mix(
    in srgb,
    var(--pf-radio-group-accent, var(--pf-color-primary)) 10%,
    var(--pf-color-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--pf-radio-group-accent, var(--pf-color-primary)) 50%,
    var(--pf-border-color)
  );
}

.pfRadioGroup_variant_table.pfRadioGroup_disabled .pfRadioGroup__item {
  cursor: not-allowed;
}

.pfRadioGroup_variant_table .pfRadioGroup__item:deep(.pfRadio) {
  padding: var(--pf-space-md);
}

.pfRadioGroup_disabled {
  opacity: 0.85;
}
</style>
