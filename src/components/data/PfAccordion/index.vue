<script setup lang="ts">
import {
  computed,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useId,
  useSlots,
  type Component,
  type PropType,
  type Slots,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfAccordionItemUi = Partial<{
  item: string;
  header: string;
  trigger: string;
  leadingIcon: string;
  label: string;
  trailingIcon: string;
  content: string;
  body: string;
}>;

export interface PfAccordionItem {
  label?: string;
  icon?: PfIconName;
  trailingIcon?: PfIconName;
  content?: string;
  value?: string;
  disabled?: boolean;
  slot?: string;
  class?: unknown;
  ui?: PfAccordionItemUi;
}

export type PfAccordionUi = Partial<{
  root: string;
  item: string;
  header: string;
  trigger: string;
  content: string;
  body: string;
  leadingIcon: string;
  trailingIcon: string;
  label: string;
}>;

export type PfAccordionType = 'single' | 'multiple';

defineOptions({ inheritAttrs: false });

const slots: Slots = useSlots();

const itemsList = computed((): readonly PfAccordionItem[] => props.items);

const props = defineProps({
  as: [String, Object] as PropType<string | Component | undefined>,
  items: {
    type: Array as PropType<readonly PfAccordionItem[]>,
    default: () => [] as readonly PfAccordionItem[],
  },
  trailingIcon: {
    type: String as PropType<PfIconName>,
    default: 'angleSmallDown',
  },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' },
  ui: Object as PropType<PfAccordionUi | undefined>,
  collapsible: { type: Boolean, default: true },
  defaultValue: [String, Array] as PropType<string | string[] | undefined>,
  modelValue: [String, Array] as PropType<string | string[] | undefined>,
  type: {
    type: String as PropType<PfAccordionType>,
    default: 'single',
  },
  disabled: Boolean,
  /** `true` — remove content from the DOM when closed (no height animation). Default `false` — smooth expand/collapse. */
  unmountOnHide: { type: Boolean, default: false },
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

const attrs = useAttrs();
const baseId = useId();
const modelBound = usePfVModelBound();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => ['pfAccordion', attrs.class, props.ui?.root]);

function normalizeDefault(
  v: string | string[] | undefined,
  mode: PfAccordionType
): string | string[] | undefined {
  if (v === undefined) {
    return mode === 'multiple' ? [] : undefined;
  }
  if (mode === 'multiple') {
    return Array.isArray(v) ? [...v] : [v];
  }
  if (typeof v === 'string') {
    return v;
  }
  if (Array.isArray(v) && v.length > 0) {
    return v[0];
  }
  return undefined;
}

const internalValue = ref<string | string[] | undefined>(
  normalizeDefault(props.defaultValue, props.type)
);

const activeValue = computed(() => {
  if (modelBound.value) {
    return props.modelValue;
  }
  return internalValue.value;
});

function setActive(next: string | string[] | undefined) {
  if (modelBound.value) {
    emit('update:modelValue', next);
  } else {
    internalValue.value = next;
  }
}

function itemRecord(item: PfAccordionItem): Record<string, unknown> {
  return item as unknown as Record<string, unknown>;
}

function itemValue(item: PfAccordionItem, index: number): string {
  const raw = itemRecord(item)[props.valueKey];
  if (raw !== undefined && raw !== null && String(raw) !== '') {
    return String(raw);
  }
  return String(index);
}

function itemLabel(item: PfAccordionItem): string {
  const raw = itemRecord(item)[props.labelKey];
  return raw !== undefined && raw !== null ? String(raw) : '';
}

function isItemOpen(item: PfAccordionItem, index: number): boolean {
  const v = itemValue(item, index);
  const cur = activeValue.value;
  if (props.type === 'multiple') {
    return Array.isArray(cur) && cur.includes(v);
  }
  return cur === v;
}

function toggleItem(item: PfAccordionItem, index: number) {
  if (props.disabled) return;
  if (item.disabled) return;
  const v = itemValue(item, index);
  if (props.type === 'multiple') {
    const cur = activeValue.value;
    const arr = Array.isArray(cur) ? [...cur] : [];
    const i = arr.indexOf(v);
    if (i >= 0) {
      arr.splice(i, 1);
    } else {
      arr.push(v);
    }
    setActive(arr);
    return;
  }
  const cur = activeValue.value as string | undefined;
  if (cur === v) {
    if (props.collapsible) {
      setActive(undefined);
    }
  } else {
    setActive(v);
  }
}

function mergedItemUi(item: PfAccordionItem): PfAccordionItemUi {
  return { ...props.ui, ...item.ui };
}

function trailingIconFor(item: PfAccordionItem): PfIconName {
  return item.trailingIcon ?? props.trailingIcon;
}

function slotProps(item: PfAccordionItem, index: number) {
  const open = isItemOpen(item, index);
  return { item, index, open };
}

function panelId(index: number): string {
  return `${baseId.replace(/:/g, '')}-panel-${index}`;
}

function headerId(index: number): string {
  return `${baseId.replace(/:/g, '')}-header-${index}`;
}

function hasNamedSlot(name: string | undefined): boolean {
  if (!name) return false;
  return Boolean(slots[name]);
}
</script>

<template>
  <component
    :is="resolvedTag"
    class="pfAccordion"
    :class="rootClass"
    v-bind="passthroughAttrs"
  >
    <div
      v-for="(item, index) in itemsList"
      :key="itemValue(item, index)"
      class="pfAccordion__item"
      :class="[item.class, mergedItemUi(item).item]"
      :data-state="isItemOpen(item, index) ? 'open' : 'closed'"
    >
      <div class="pfAccordion__header" :class="mergedItemUi(item).header">
        <button
          :id="headerId(index)"
          class="pfAccordion__trigger"
          type="button"
          :class="[
            mergedItemUi(item).trigger,
            disabled || item.disabled ? 'pfAccordion__trigger_disabled' : null,
          ]"
          :aria-expanded="isItemOpen(item, index)"
          :aria-controls="panelId(index)"
          :disabled="disabled || item.disabled"
          :data-state="isItemOpen(item, index) ? 'open' : 'closed'"
          @click="toggleItem(item, index)"
        >
          <span
            v-if="slots.leading || item.icon"
            class="pfAccordion__leading"
            :class="[mergedItemUi(item).leadingIcon]"
          >
            <slot
              v-if="slots.leading"
              name="leading"
              v-bind="slotProps(item, index)"
            />
            <PfIcon v-else-if="item.icon" :name="item.icon" size="sm" />
          </span>
          <span class="pfAccordion__label" :class="[mergedItemUi(item).label]">
            <slot name="label" v-bind="slotProps(item, index)">
              {{ itemLabel(item) }}
            </slot>
          </span>
          <span
            class="pfAccordion__trailing"
            :class="[mergedItemUi(item).trailingIcon]"
          >
            <slot
              v-if="slots.trailing"
              name="trailing"
              v-bind="slotProps(item, index)"
            />
            <PfIcon
              v-else
              class="pfAccordion__chevron"
              :class="{
                pfAccordion__chevron_open: isItemOpen(item, index),
              }"
              :name="trailingIconFor(item)"
              size="sm"
            />
          </span>
        </button>
      </div>

      <!-- Mounted only when open if unmountOnHide; otherwise always (height animation) -->
      <div
        v-if="unmountOnHide ? isItemOpen(item, index) : true"
        :id="panelId(index)"
        class="pfAccordion__panel"
        :class="[
          !unmountOnHide ? 'pfAccordion__panel_animated' : null,
          !unmountOnHide && isItemOpen(item, index)
            ? 'pfAccordion__panel_open'
            : null,
          !unmountOnHide && !isItemOpen(item, index)
            ? 'pfAccordion__panel_closed'
            : null,
          mergedItemUi(item).content,
        ]"
        role="region"
        :aria-labelledby="headerId(index)"
        :aria-hidden="isItemOpen(item, index) ? undefined : true"
        :data-state="isItemOpen(item, index) ? 'open' : 'closed'"
      >
        <div class="pfAccordion__panelInner">
          <template v-if="!unmountOnHide || isItemOpen(item, index)">
            <template v-if="item.slot && hasNamedSlot(item.slot)">
              <slot :name="item.slot" v-bind="slotProps(item, index)" />
            </template>
            <template
              v-else-if="item.slot && hasNamedSlot(`${item.slot}-body`)"
            >
              <div class="pfAccordion__body" :class="[mergedItemUi(item).body]">
                <slot
                  :name="`${item.slot}-body`"
                  v-bind="slotProps(item, index)"
                />
              </div>
            </template>
            <template v-else-if="slots.body">
              <div class="pfAccordion__body" :class="[mergedItemUi(item).body]">
                <slot name="body" v-bind="slotProps(item, index)" />
              </div>
            </template>
            <template v-else-if="slots.content">
              <slot name="content" v-bind="slotProps(item, index)" />
            </template>
            <div
              v-else
              class="pfAccordion__body"
              :class="[mergedItemUi(item).body]"
            >
              {{ item.content }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfAccordion {
  min-width: 0;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);
}

.pfAccordion__item {
  box-sizing: border-box;

  border-bottom: var(--pf-accordion-item-border);

  &:last-child {
    border-bottom: none;
  }
}

.pfAccordion__header {
  display: flex;
}

.pfAccordion__trigger {
  padding: var(--pf-accordion-trigger-padding-y) 0;
  min-width: 0;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  gap: var(--pf-accordion-trigger-gap);

  color: var(--pf-color-text);
  font: inherit;
  text-align: start;

  background: none;
  border: none;

  cursor: pointer;

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    border-radius: var(--pf-radius-sm);
    outline: none;
  }

  &_disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }
}

.pfAccordion__leading {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.pfAccordion__label {
  min-width: 0;
  flex: 1 1 auto;

  font-size: var(--pf-accordion-label-font-size);
  font-weight: var(--pf-accordion-label-font-weight);
  line-height: var(--pf-line-height-md);
  word-break: break-word;
}

.pfAccordion__trailing {
  margin-inline-start: auto;

  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--pf-accordion-trigger-gap);
}

.pfAccordion__chevron {
  transition: transform var(--pf-accordion-trailing-rotate-duration)
    var(--pf-accordion-trailing-rotate-easing);

  &_open {
    transform: rotate(180deg);
  }
}

.pfAccordion__panel {
  min-width: 0;
  box-sizing: border-box;

  overflow: hidden;

  &_animated {
    display: grid;

    transition: grid-template-rows var(--pf-accordion-panel-duration)
      var(--pf-accordion-panel-easing);
  }

  &_animated.pfAccordion__panel_closed {
    grid-template-rows: 0fr;
  }

  &_animated.pfAccordion__panel_open {
    grid-template-rows: 1fr;
  }
}

.pfAccordion__panelInner {
  min-height: 0;

  overflow: hidden;
}

.pfAccordion__body {
  padding-bottom: var(--pf-accordion-body-padding-bottom);

  color: var(--pf-color-muted);
  font-size: var(--pf-accordion-body-font-size);
  line-height: var(--pf-line-height-md);
}
</style>
