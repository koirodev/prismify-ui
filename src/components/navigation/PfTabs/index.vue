<script setup lang="ts">
import type { Component } from 'vue';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  resolveDynamicComponent,
  shallowRef,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfBadge from '../../element/PfBadge/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfTabsColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfTabsVariant = 'pill' | 'link';

export type PfTabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfTabsOrientation = 'horizontal' | 'vertical';

export type PfTabsItemAvatar = {
  src?: string;
  alt?: string;
  icon?: PfIconName;
  text?: string;
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  chip?:
    | boolean
    | { color?: import('../../element/PfAvatar/index.vue').PfAvatarChipColor };
};

export type PfTabsItemBadge =
  | string
  | number
  | {
      label?: string | number;
      color?:
        | 'error'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'info'
        | 'warning'
        | 'neutral';
      variant?: 'solid' | 'outline' | 'soft' | 'subtle';
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    };

export type PfTabsItemUi = Partial<{
  trigger: string;
  leadingIcon: string;
  leadingAvatar: string;
  leadingAvatarSize: string;
  label: string;
  trailingBadge: string;
  trailingBadgeSize: string;
  content: string;
}>;

export interface PfTabsItem {
  label?: string;
  icon?: PfIconName;
  avatar?: PfTabsItemAvatar;
  badge?: PfTabsItemBadge;
  content?: string;
  value?: string | number;
  disabled?: boolean;
  slot?: string;
  class?: unknown;
  ui?: PfTabsItemUi;
}

export type PfTabsUi = Partial<{
  root: string;
  list: string;
  indicator: string;
  trigger: string;
  leadingIcon: string;
  leadingAvatar: string;
  leadingAvatarSize: string;
  label: string;
  trailingBadge: string;
  trailingBadgeSize: string;
  content: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    items?: readonly PfTabsItem[];
    color?: PfTabsColor;
    variant?: PfTabsVariant;
    size?: PfTabsSize;
    orientation?: PfTabsOrientation;
    /** Show content panels; `false` — tab switcher only. */
    content?: boolean;
    valueKey?: string;
    labelKey?: string;
    ui?: PfTabsUi;
    defaultValue?: string | number;
    modelValue?: string | number;
    /** `automatic` — arrow keys immediately change the active tab; `manual` — select with Enter/Space. */
    activationMode?: 'automatic' | 'manual';
    /** `true` — inactive panels are removed from the DOM. */
    unmountOnHide?: boolean;
    disabled?: boolean;
  }>(),
  {
    items: () => [] as readonly PfTabsItem[],
    color: 'primary',
    variant: 'pill',
    size: 'md',
    orientation: 'horizontal',
    content: true,
    valueKey: 'value',
    labelKey: 'label',
    activationMode: 'automatic',
    unmountOnHide: true,
    disabled: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

defineSlots<{
  leading(): unknown;
  default(): unknown;
  trailing(): unknown;
  content(props: Record<string, unknown>): unknown;
  'list-leading'(): unknown;
  'list-trailing'(): unknown;
  [key: string]:
    | ((props: Record<string, unknown>) => unknown)
    | (() => unknown);
}>();

const attrs = useAttrs();
const slots = useSlots();
const baseId = useId();
const modelBound = usePfVModelBound();

const listRef = ref<HTMLElement | null>(null);
const triggerRefs = shallowRef<(HTMLElement | null)[]>([]);
const indicatorMetrics = ref<{
  left: number;
  top: number;
  width: number;
  height: number;
} | null>(null);

const focusIndex = ref(0);

const internalValue = ref<string | number | undefined>(undefined);

function normalizeDefault(): string | number {
  if (props.defaultValue !== undefined) {
    return props.defaultValue;
  }
  return '0';
}

if (!modelBound.value) {
  internalValue.value = normalizeDefault();
}

const activeValue = computed((): string | number | undefined => {
  if (modelBound.value) {
    return props.modelValue;
  }
  return internalValue.value;
});

function itemRecord(item: PfTabsItem): Record<string, unknown> {
  return item as unknown as Record<string, unknown>;
}

function itemValue(item: PfTabsItem, index: number): string {
  const raw = itemRecord(item)[props.valueKey];
  if (raw !== undefined && raw !== null && String(raw) !== '') {
    return String(raw);
  }
  return String(index);
}

function itemLabel(item: PfTabsItem): string {
  const raw = itemRecord(item)[props.labelKey];
  return raw !== undefined && raw !== null ? String(raw) : '';
}

const itemsList = computed(() => props.items ?? []);

const activeIndex = computed(() => {
  const items = itemsList.value;
  if (items.length === 0) return 0;
  const cur = activeValue.value;
  const curStr = cur === undefined ? '0' : String(cur);
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (itemValue(item, i) === curStr) {
      return i;
    }
  }
  return 0;
});

watch(
  () => activeIndex.value,
  (i) => {
    focusIndex.value = i;
  },
  { immediate: true }
);

watch(
  () => itemsList.value.length,
  (n) => {
    triggerRefs.value = Array.from(
      { length: n },
      (_, i) => triggerRefs.value[i] ?? null
    );
  },
  { immediate: true }
);

function setActive(next: string | number) {
  if (modelBound.value) {
    emit('update:modelValue', next);
  } else {
    internalValue.value = next;
  }
}

function selectByIndex(index: number) {
  const items = itemsList.value;
  if (index < 0 || index >= items.length) return;
  const item = items[index]!;
  if (props.disabled || item.disabled) return;
  setActive(itemValue(item, index));
}

function isItemDisabled(index: number): boolean {
  return props.disabled || Boolean(itemsList.value[index]?.disabled);
}

function mergedItemUi(item: PfTabsItem): PfTabsItemUi {
  return { ...props.ui, ...item.ui };
}

function bindTriggerRef(el: Element | null, index: number) {
  const resolved = el as HTMLElement | null;
  if (triggerRefs.value[index] === resolved) {
    return;
  }
  const next = [...triggerRefs.value];
  next[index] = resolved;
  triggerRefs.value = next;
}

function tabId(index: number): string {
  return `${baseId.replace(/:/g, '')}-tab-${index}`;
}

function panelId(index: number): string {
  return `${baseId.replace(/:/g, '')}-panel-${index}`;
}

function tabIndexFor(index: number): number {
  return focusIndex.value === index ? 0 : -1;
}

function onTriggerFocusIn(index: number) {
  focusIndex.value = index;
  if (props.activationMode === 'automatic' && !isItemDisabled(index)) {
    selectByIndex(index);
  }
}

function onListKeydown(e: KeyboardEvent) {
  if (props.disabled) return;
  const items = itemsList.value;
  if (items.length === 0) return;

  const horizontal = props.orientation === 'horizontal';
  const nextKeys = horizontal
    ? ['ArrowRight', 'ArrowDown']
    : ['ArrowDown', 'ArrowRight'];
  const prevKeys = horizontal
    ? ['ArrowLeft', 'ArrowUp']
    : ['ArrowUp', 'ArrowLeft'];

  let delta = 0;
  if (nextKeys.includes(e.key)) delta = 1;
  else if (prevKeys.includes(e.key)) delta = -1;
  else if (e.key === 'Home') {
    e.preventDefault();
    const first = findEnabledIndex(0, 1);
    if (first >= 0) moveFocusTo(first);
    return;
  } else if (e.key === 'End') {
    e.preventDefault();
    const last = findEnabledIndex(items.length - 1, -1);
    if (last >= 0) moveFocusTo(last);
    return;
  } else if (
    (e.key === ' ' || e.key === 'Enter') &&
    props.activationMode === 'manual'
  ) {
    e.preventDefault();
    selectByIndex(focusIndex.value);
    return;
  } else {
    return;
  }

  e.preventDefault();
  const next = findEnabledIndex(focusIndex.value, delta > 0 ? 1 : -1);
  if (next >= 0) moveFocusTo(next);
}

function findEnabledIndex(from: number, step: number): number {
  const items = itemsList.value;
  const n = items.length;
  if (n === 0) return -1;
  let i = from;
  for (let k = 0; k < n; k++) {
    i = (i + step + n) % n;
    if (!isItemDisabled(i)) return i;
  }
  return -1;
}

function moveFocusTo(index: number) {
  focusIndex.value = index;
  if (props.activationMode === 'automatic') {
    selectByIndex(index);
  }
  nextTick(() => {
    triggerRefs.value[index]?.focus();
  });
}

function badgeBind(item: PfTabsItem): Record<string, unknown> | null {
  const b = item.badge;
  if (b === undefined || b === null) return null;
  if (typeof b === 'string' || typeof b === 'number') {
    return { label: b, size: badgeSize.value };
  }
  const o = b as Record<string, unknown>;
  return {
    ...o,
    size: (o.size as string | undefined) ?? badgeSize.value,
  };
}

const badgeSize = computed((): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'xs';
    case 'md':
      return 'sm';
    case 'lg':
    case 'xl':
      return 'md';
    default:
      return 'sm';
  }
});

function avatarSizeForItem(item: PfTabsItem): PfTabsItemAvatar['size'] {
  if (item.avatar?.size) return item.avatar.size;
  switch (props.size) {
    case 'xs':
    case 'sm':
      return '3xs';
    case 'md':
      return '2xs';
    case 'lg':
    case 'xl':
      return 'xs';
    default:
      return '2xs';
  }
}

const iconSize = computed((): PfIconSize => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'sm';
    case 'md':
      return 'md';
    case 'lg':
    case 'xl':
      return 'lg';
    default:
      return 'md';
  }
});

function hasNamedSlot(name: string | undefined): boolean {
  if (!name) return false;
  return Boolean(slots[name]);
}

function updateIndicator() {
  const list = listRef.value;
  const idx = activeIndex.value;
  const el = triggerRefs.value[idx];
  if (!list || !el) {
    indicatorMetrics.value = null;
    return;
  }
  const lr = list.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  indicatorMetrics.value = {
    left: er.left - lr.left,
    top: er.top - lr.top,
    width: er.width,
    height: er.height,
  };
}

let ro: ResizeObserver | undefined;

watch(
  [
    activeIndex,
    () => itemsList.value.length,
    () => props.orientation,
    () => props.variant,
  ],
  () => {
    nextTick(() => updateIndicator());
  }
);

watch(
  listRef,
  (el) => {
    ro?.disconnect();
    if (!el) return;
    ro = new ResizeObserver(() => updateIndicator());
    ro.observe(el);
    nextTick(() => updateIndicator());
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  ro?.disconnect();
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => [
  'pfTabs',
  `pfTabs_orientation_${props.orientation}`,
  `pfTabs_variant_${props.variant}`,
  `pfTabs_size_${props.size}`,
  `pfTabs_color_${props.color}`,
  attrs.class,
  props.ui?.root,
]);

const listClass = computed(() => ['pfTabs__list', props.ui?.list]);

const indicatorStyle = computed(() => {
  const m = indicatorMetrics.value;
  if (!m || itemsList.value.length === 0) {
    return { opacity: '0', pointerEvents: 'none' as const };
  }
  const isLink = props.variant === 'link';
  const horiz = props.orientation === 'horizontal';
  if (isLink && horiz) {
    return {
      opacity: '1',
      left: `${m.left}px`,
      bottom: '0',
      width: `${m.width}px`,
      height: 'var(--pf-stroke-width, 1px)',
      top: 'auto',
      transform: 'none',
    };
  }
  if (isLink && !horiz) {
    return {
      opacity: '1',
      top: `${m.top}px`,
      left: '0',
      width: 'var(--pf-stroke-width, 1px)',
      height: `${m.height}px`,
      transform: 'none',
    };
  }
  return {
    opacity: '1',
    left: `${m.left}px`,
    top: `${m.top}px`,
    width: `${m.width}px`,
    height: `${m.height}px`,
    transform: 'none',
  };
});

defineExpose({
  /** Refs to tab button DOM nodes (by index). */
  triggersRef: triggerRefs,
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div
      class="pfTabs__toolbar"
      :class="{
        pfTabs__toolbar_vertical: orientation === 'vertical',
      }"
    >
      <div
        v-if="hasNamedSlot('leading')"
        class="pfTabs__toolbarSlot pfTabs__toolbarSlot_leading"
      >
        <slot name="leading" />
      </div>

      <div
        ref="listRef"
        class="pfTabs__listWrap"
        :class="{
          pfTabs__listWrap_vertical: orientation === 'vertical',
        }"
      >
        <div
          role="tablist"
          :class="listClass"
          :aria-orientation="
            orientation === 'vertical' ? 'vertical' : 'horizontal'
          "
          @keydown="onListKeydown"
        >
          <slot name="list-leading" />

          <div
            class="pfTabs__indicator"
            :class="ui?.indicator"
            :style="indicatorStyle"
          />

          <button
            v-for="(item, index) in itemsList"
            :id="tabId(index)"
            :key="itemValue(item, index)"
            :ref="(el) => bindTriggerRef(el as Element | null, index)"
            type="button"
            role="tab"
            class="pfTabs__trigger"
            :class="[
              mergedItemUi(item).trigger,
              item.class,
              {
                pfTabs__trigger_active: activeIndex === index,
                pfTabs__trigger_disabled: disabled || item.disabled,
              },
            ]"
            :aria-selected="activeIndex === index"
            :aria-controls="panelId(index)"
            :tabindex="tabIndexFor(index)"
            :disabled="disabled || item.disabled"
            :data-state="activeIndex === index ? 'active' : 'inactive'"
            @click="selectByIndex(index)"
            @focusin="onTriggerFocusIn(index)"
          >
            <span
              v-if="item.icon"
              class="pfTabs__leadingIcon"
              :class="[ui?.leadingIcon, mergedItemUi(item).leadingIcon]"
            >
              <PfIcon :name="item.icon" :size="iconSize" />
            </span>
            <PfAvatar
              v-else-if="item.avatar"
              class="pfTabs__leadingAvatar"
              :class="[ui?.leadingAvatar, mergedItemUi(item).leadingAvatar]"
              v-bind="{ ...item.avatar, size: avatarSizeForItem(item) }"
            />
            <span
              class="pfTabs__label"
              :class="[ui?.label, mergedItemUi(item).label]"
            >
              {{ itemLabel(item) }}
            </span>
            <PfBadge
              v-if="badgeBind(item)"
              class="pfTabs__trailingBadge"
              :class="[ui?.trailingBadge, mergedItemUi(item).trailingBadge]"
              v-bind="badgeBind(item)!"
            />
          </button>

          <slot name="list-trailing" />
        </div>
      </div>

      <div
        v-if="hasNamedSlot('trailing')"
        class="pfTabs__toolbarSlot pfTabs__toolbarSlot_trailing"
      >
        <slot name="trailing" />
      </div>
    </div>

    <slot name="default" />

    <div v-if="content" class="pfTabs__panels">
      <div
        v-for="(item, index) in itemsList"
        v-show="activeIndex === index"
        :id="panelId(index)"
        :key="`panel-${itemValue(item, index)}`"
        role="tabpanel"
        class="pfTabs__panel"
        :class="[ui?.content, mergedItemUi(item).content]"
        :aria-labelledby="tabId(index)"
        :aria-hidden="activeIndex !== index ? true : undefined"
      >
        <template v-if="!unmountOnHide || activeIndex === index">
          <template v-if="item.slot && hasNamedSlot(item.slot)">
            <slot :name="item.slot" :item="item" :index="index" />
          </template>
          <template v-else-if="hasNamedSlot('content')">
            <slot name="content" :item="item" :index="index" />
          </template>
          <template v-else>
            {{ item.content }}
          </template>
        </template>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfTabs {
  min-width: 0;
  display: flex;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  &_orientation_horizontal {
    flex-direction: column;
    gap: var(--pf-tabs-gap);
  }

  &_orientation_vertical {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--pf-tabs-gap);
  }
}

.pfTabs__toolbar {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pf-tabs-gap);

  &_vertical {
    flex-direction: column;
    align-items: stretch;
  }
}

.pfTabs__toolbarSlot {
  flex: 0 0 auto;
}

.pfTabs__listWrap {
  position: relative;

  min-width: 0;
  flex: 1 1 auto;

  &_vertical {
    align-self: stretch;
  }
}

.pfTabs__list {
  position: relative;

  padding: var(--pf-tabs-list-padding);
  min-width: 0;
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: var(--pf-tabs-list-gap);
  box-sizing: border-box;

  .pfTabs_orientation_horizontal & {
    width: 100%;
    flex-direction: row;
  }

  .pfTabs_orientation_vertical & {
    width: auto;
    min-height: 0;
    flex-direction: column;
  }

  .pfTabs_variant_pill & {
    background: var(--pf-tabs-list-bg-elevated);
    border-radius: var(--pf-tabs-list-radius);
  }

  .pfTabs_variant_link.pfTabs_orientation_horizontal & {
    padding: 0;
    gap: 0;

    border-bottom: var(--pf-stroke-width) solid var(--pf-tabs-link-border-color);
  }

  .pfTabs_variant_link.pfTabs_orientation_vertical & {
    border-inline-start: var(--pf-stroke-width) solid
      var(--pf-tabs-link-border-color);

    padding: 0;
    gap: 0;
  }
}

.pfTabs__indicator {
  position: absolute;
  z-index: 0;

  box-sizing: border-box;

  transition:
    left var(--pf-tabs-indicator-duration) var(--pf-tabs-indicator-easing),
    top var(--pf-tabs-indicator-duration) var(--pf-tabs-indicator-easing),
    width var(--pf-tabs-indicator-duration) var(--pf-tabs-indicator-easing),
    height var(--pf-tabs-indicator-duration) var(--pf-tabs-indicator-easing),
    opacity var(--pf-tabs-indicator-duration) var(--pf-tabs-indicator-easing);

  pointer-events: none;

  .pfTabs_variant_pill & {
    box-shadow: var(--pf-tabs-indicator-shadow);
    border-radius: var(--pf-radius-sm);
  }

  .pfTabs_color_primary.pfTabs_variant_pill & {
    background: var(--pf-color-primary);
  }

  .pfTabs_color_secondary.pfTabs_variant_pill & {
    background: var(--pf-color-secondary);
  }

  .pfTabs_color_success.pfTabs_variant_pill & {
    background: var(--pf-color-success);
  }

  .pfTabs_color_info.pfTabs_variant_pill & {
    background: var(--pf-color-info);
  }

  .pfTabs_color_warning.pfTabs_variant_pill & {
    background: var(--pf-color-warning);
  }

  .pfTabs_color_error.pfTabs_variant_pill & {
    background: var(--pf-color-error);
  }

  .pfTabs_color_neutral.pfTabs_variant_pill & {
    background: var(--pf-color-text);
  }

  .pfTabs_color_primary.pfTabs_variant_link & {
    background: var(--pf-color-primary);
  }

  .pfTabs_color_secondary.pfTabs_variant_link & {
    background: var(--pf-color-secondary);
  }

  .pfTabs_color_success.pfTabs_variant_link & {
    background: var(--pf-color-success);
  }

  .pfTabs_color_info.pfTabs_variant_link & {
    background: var(--pf-color-info);
  }

  .pfTabs_color_warning.pfTabs_variant_link & {
    background: var(--pf-color-warning);
  }

  .pfTabs_color_error.pfTabs_variant_link & {
    background: var(--pf-color-error);
  }

  .pfTabs_color_neutral.pfTabs_variant_link & {
    background: var(--pf-color-text);
  }
}

.pfTabs__trigger {
  position: relative;
  z-index: 1;

  padding: 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  gap: 0.375rem;

  color: var(--pf-color-muted);
  font: inherit;
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
  text-align: center;

  background: transparent;
  border: none;
  border-radius: var(--pf-radius-sm);

  transition: color var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: pointer;

  .pfTabs_orientation_vertical & {
    width: 100%;
    justify-content: flex-start;
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    outline: none;
  }

  &_active {
    color: var(--pf-color-text);
  }

  .pfTabs_color_primary &_active {
    color: var(--pf-color-primary);
  }

  .pfTabs_color_secondary &_active {
    color: var(--pf-color-secondary);
  }

  .pfTabs_color_success &_active {
    color: var(--pf-color-success);
  }

  .pfTabs_color_info &_active {
    color: var(--pf-color-info);
  }

  .pfTabs_color_warning &_active {
    color: var(--pf-color-warning);
  }

  .pfTabs_color_error &_active {
    color: var(--pf-color-error);
  }

  .pfTabs_variant_pill &_active {
    color: var(--pf-color-surface);
  }

  .pfTabs_variant_pill.pfTabs_color_primary &_active {
    color: var(--pf-color-surface);
  }

  .pfTabs_variant_pill.pfTabs_color_neutral &_active {
    color: var(--pf-color-surface);
  }

  &_disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }
}

.pfTabs_variant_link .pfTabs__trigger {
  flex: 0 1 auto;
}

.pfTabs_size_xs .pfTabs__trigger {
  padding: 0.25rem 0.5rem;
  gap: 0.25rem;

  font-size: var(--pf-font-size-xs);
}

.pfTabs_size_sm .pfTabs__trigger {
  padding: 0.375rem 0.5rem;
  gap: 0.375rem;

  font-size: var(--pf-font-size-xs);
}

.pfTabs_size_md .pfTabs__trigger {
  padding: 0.375rem 0.75rem;
  gap: 0.375rem;

  font-size: var(--pf-font-size-sm);
}

.pfTabs_size_lg .pfTabs__trigger {
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;

  font-size: var(--pf-font-size-sm);
}

.pfTabs_size_xl .pfTabs__trigger {
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;

  font-size: var(--pf-font-size-base);
}

.pfTabs__leadingIcon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.pfTabs__leadingAvatar {
  flex-shrink: 0;
}

.pfTabs__label {
  min-width: 0;
  flex: 1 1 auto;

  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfTabs__trailingBadge {
  flex-shrink: 0;
}

.pfTabs__panels {
  padding-top: var(--pf-tabs-content-padding-top);
  min-width: 0;
  box-sizing: border-box;
}

.pfTabs__panel {
  min-width: 0;
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    border-radius: var(--pf-radius-sm);
    outline: none;
  }
}
</style>
