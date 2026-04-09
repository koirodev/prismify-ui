<script setup lang="ts">
import {
  computed,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  watch,
  type Component,
  type Slots,
} from 'vue';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import PfAvatar from '../../element/PfAvatar/index.vue';
import type { PfBadgeAvatarProps } from '../../element/PfBadge/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfTimelineColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfTimelineSize =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl';

export type PfTimelineOrientation = 'horizontal' | 'vertical';

export type PfTimelineItemUi = Partial<{
  item: string;
  container: string;
  indicator: string;
  separator: string;
  wrapper: string;
  date: string;
  title: string;
  description: string;
}>;

export interface PfTimelineItem {
  date?: string;
  title?: string;
  description?: string;
  icon?: PfIconName;
  avatar?: PfBadgeAvatarProps;
  value?: string | number;
  slot?: string;
  class?: unknown;
  ui?: PfTimelineItemUi;
}

export type PfTimelineUi = Partial<{
  root: string;
  item: string;
  container: string;
  indicator: string;
  separator: string;
  wrapper: string;
  date: string;
  title: string;
  description: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    items?: readonly PfTimelineItem[];
    size?: PfTimelineSize;
    color?: PfTimelineColor;
    orientation?: PfTimelineOrientation;
    valueKey?: string;
    defaultValue?: string | number;
    modelValue?: string | number;
    ui?: PfTimelineUi;
  }>(),
  {
    items: () => [],
    size: 'md',
    color: 'primary',
    orientation: 'vertical',
    valueKey: 'value',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined];
  select: [event: Event, item: PfTimelineItem];
}>();

const attrs = useAttrs();
const slots: Slots = useSlots();
const vModelBound = usePfVModelBound();

const localValue = ref<string | number | undefined>(
  props.defaultValue !== undefined ? props.defaultValue : undefined
);

watch(
  () => props.defaultValue,
  (d) => {
    if (!vModelBound.value && d !== undefined) {
      localValue.value = d;
    }
  }
);

function getItemValue(item: PfTimelineItem, index: number): string | number {
  const raw = (item as Record<string, unknown>)[props.valueKey];
  if (raw !== undefined && raw !== null) return raw as string | number;
  return index;
}

const selected = computed({
  get: () => {
    if (vModelBound.value) {
      return props.modelValue;
    }
    if (props.modelValue !== undefined) {
      return props.modelValue;
    }
    if (localValue.value !== undefined) {
      return localValue.value;
    }
    if (props.items.length === 0) {
      return undefined;
    }
    return getItemValue(props.items[0], 0);
  },
  set: (v: string | number | undefined) => {
    emit('update:modelValue', v);
    if (!vModelBound.value) {
      localValue.value = v;
    }
  },
});

watch(
  () => props.items,
  (items) => {
    if (vModelBound.value || props.defaultValue !== undefined) {
      return;
    }
    if (items.length === 0) {
      return;
    }
    if (localValue.value === undefined) {
      localValue.value = getItemValue(items[0], 0);
    }
  },
  { immediate: true, deep: true }
);

const activeIndex = computed(() => {
  const sel = selected.value;
  if (props.items.length === 0 || sel === undefined) {
    return -1;
  }
  const idx = props.items.findIndex((it, i) => getItemValue(it, i) === sel);
  return idx >= 0 ? idx : 0;
});

function itemState(index: number): 'completed' | 'active' | 'pending' {
  const ai = activeIndex.value;
  if (ai < 0) {
    return 'pending';
  }
  if (index < ai) {
    return 'completed';
  }
  if (index === ai) {
    return 'active';
  }
  return 'pending';
}

function separatorColored(state: 'completed' | 'active' | 'pending'): boolean {
  return state === 'completed';
}

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() => [
  'pfTimeline',
  `pfTimeline_size_${props.size}`,
  `pfTimeline_color_${props.color}`,
  `pfTimeline_orientation_${props.orientation}`,
  attrs.class,
  props.ui?.root,
]);

const avatarSize = computed((): PfTimelineSize => props.size);

const iconSize = computed((): PfIconSize => {
  const map: Record<PfTimelineSize, PfIconSize> = {
    '2xs': '2xs',
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
    '3xl': '3xl',
  };
  return map[props.size];
});

function hasNamedSlot(name: string): boolean {
  return typeof (slots as Record<string, unknown>)[name] === 'function';
}

function onItemClick(e: Event, item: PfTimelineItem, index: number) {
  emit('select', e, item);
  const v = getItemValue(item, index);
  selected.value = v;
}

function itemKey(item: PfTimelineItem, index: number): string | number {
  const v = getItemValue(item, index);
  return typeof v === 'string' || typeof v === 'number' ? v : index;
}
</script>

<template>
  <component
    :is="resolvedTag"
    :class="rootClass"
    role="list"
    v-bind="passthroughAttrs"
  >
    <div
      v-for="(item, index) in items"
      :key="itemKey(item, index)"
      role="listitem"
      class="pfTimeline__item"
      :class="[item.class, item.ui?.item, props.ui?.item]"
      :data-state="itemState(index)"
      @click="onItemClick($event, item, index)"
    >
      <div
        class="pfTimeline__container"
        :class="[item.ui?.container, props.ui?.container]"
      >
        <div
          class="pfTimeline__indicator"
          :class="[
            item.avatar && 'pfTimeline__indicator_hasAvatar',
            item.ui?.indicator,
            props.ui?.indicator,
          ]"
        >
          <template v-if="item.slot && hasNamedSlot(`${item.slot}-indicator`)">
            <slot
              :name="`${item.slot}-indicator`"
              :item="item"
              :index="index"
            />
          </template>
          <slot
            v-else-if="hasNamedSlot('indicator')"
            name="indicator"
            :item="item"
            :index="index"
          />
          <template v-else>
            <PfAvatar
              v-if="item.avatar"
              v-bind="item.avatar"
              :size="item.avatar.size ?? avatarSize"
            />
            <PfIcon v-else-if="item.icon" :name="item.icon" :size="iconSize" />
            <span v-else class="pfTimeline__dot" aria-hidden="true" />
          </template>
        </div>
        <div
          v-if="index < items.length - 1"
          class="pfTimeline__separator"
          :class="[
            item.ui?.separator,
            props.ui?.separator,
            separatorColored(itemState(index))
              ? 'pfTimeline__separator_colored'
              : '',
          ]"
          aria-hidden="true"
        />
      </div>
      <div
        class="pfTimeline__wrapper"
        :class="[item.ui?.wrapper, props.ui?.wrapper]"
      >
        <template v-if="item.slot && hasNamedSlot(`${item.slot}-date`)">
          <div
            class="pfTimeline__date"
            :class="[item.ui?.date, props.ui?.date]"
          >
            <slot :name="`${item.slot}-date`" :item="item" :index="index" />
          </div>
        </template>
        <div
          v-else-if="hasNamedSlot('date')"
          class="pfTimeline__date"
          :class="[item.ui?.date, props.ui?.date]"
        >
          <slot name="date" :item="item" :index="index" />
        </div>
        <div
          v-else-if="item.date != null && item.date !== ''"
          class="pfTimeline__date"
          :class="[item.ui?.date, props.ui?.date]"
        >
          {{ item.date }}
        </div>

        <template v-if="item.slot && hasNamedSlot(`${item.slot}-title`)">
          <div
            class="pfTimeline__title"
            :class="[item.ui?.title, props.ui?.title]"
          >
            <slot :name="`${item.slot}-title`" :item="item" :index="index" />
          </div>
        </template>
        <div
          v-else-if="hasNamedSlot('title')"
          class="pfTimeline__title"
          :class="[item.ui?.title, props.ui?.title]"
        >
          <slot name="title" :item="item" :index="index" />
        </div>
        <div
          v-else-if="item.title != null && item.title !== ''"
          class="pfTimeline__title"
          :class="[item.ui?.title, props.ui?.title]"
        >
          {{ item.title }}
        </div>

        <template v-if="item.slot && hasNamedSlot(`${item.slot}-description`)">
          <div
            class="pfTimeline__description"
            :class="[item.ui?.description, props.ui?.description]"
          >
            <slot
              :name="`${item.slot}-description`"
              :item="item"
              :index="index"
            />
          </div>
        </template>
        <div
          v-else-if="hasNamedSlot('description')"
          class="pfTimeline__description"
          :class="[item.ui?.description, props.ui?.description]"
        >
          <slot name="description" :item="item" :index="index" />
        </div>
        <div
          v-else-if="item.description != null && item.description !== ''"
          class="pfTimeline__description"
          :class="[item.ui?.description, props.ui?.description]"
        >
          {{ item.description }}
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfTimeline {
  display: flex;
  gap: var(--pf-timeline-root-gap);

  font-family: var(--pf-font-sans);
}

.pfTimeline_orientation_vertical {
  width: 100%;
  flex-direction: column;
}

.pfTimeline_orientation_horizontal {
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
}

.pfTimeline__item {
  position: relative;

  min-width: 0;
  display: flex;
  flex: 1 1 auto;
  gap: var(--pf-timeline-item-gap);

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: pointer;

  &[data-state='pending']
    .pfTimeline__indicator:not(.pfTimeline__indicator_hasAvatar) {
    color: var(--pf-color-muted);

    background: var(--pf-timeline-separator-pending-bg);
  }

  &[data-state='pending'] .pfTimeline__indicator_hasAvatar {
    opacity: 0.65;
  }

  &[data-state='active']
    .pfTimeline__indicator:not(.pfTimeline__indicator_hasAvatar),
  &[data-state='completed']
    .pfTimeline__indicator:not(.pfTimeline__indicator_hasAvatar) {
    color: var(--pf-color-surface);

    background: var(--pf-timeline-accent);
  }

  &[data-state='active'] .pfTimeline__indicator_hasAvatar,
  &[data-state='completed'] .pfTimeline__indicator_hasAvatar {
    border-radius: 50%;
    outline: 2px solid var(--pf-timeline-accent);
    outline-offset: 2px;
    opacity: 1;
  }

  &[data-state='pending'] .pfTimeline__dot {
    background: var(--pf-color-muted);
  }
}

.pfTimeline_color_primary {
  --pf-timeline-accent: var(--pf-color-primary);
}

.pfTimeline_color_secondary {
  --pf-timeline-accent: var(--pf-color-secondary);
}

.pfTimeline_color_success {
  --pf-timeline-accent: var(--pf-color-success);
}

.pfTimeline_color_info {
  --pf-timeline-accent: var(--pf-color-info);
}

.pfTimeline_color_warning {
  --pf-timeline-accent: var(--pf-color-warning);
}

.pfTimeline_color_error {
  --pf-timeline-accent: var(--pf-color-error);
}

.pfTimeline_color_neutral {
  --pf-timeline-accent: var(--pf-color-text);
}

.pfTimeline_orientation_vertical .pfTimeline__item {
  flex-direction: row;
  align-items: stretch;
}

.pfTimeline_orientation_horizontal .pfTimeline__item {
  min-width: 0;
  flex-direction: column;
  align-items: stretch;
}

.pfTimeline__container {
  position: relative;

  display: flex;
  flex-shrink: 0;
}

.pfTimeline_orientation_vertical .pfTimeline__container {
  flex-direction: column;
  align-items: center;
}

.pfTimeline_orientation_horizontal .pfTimeline__container {
  width: 100%;
  flex-direction: row;
  align-items: center;
}

.pfTimeline__indicator {
  width: var(--pf-timeline-indicator-size);
  height: var(--pf-timeline-indicator-size);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;

  border-radius: 50%;

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    color var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    outline-color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfTimeline__indicator_hasAvatar {
  width: auto;
  min-width: 0;
  height: auto;
  min-height: 0;

  background: transparent;
}

.pfTimeline__dot {
  width: 0.5rem;
  height: 0.5rem;
  display: block;

  border-radius: 50%;
}

.pfTimeline__separator {
  flex: 1 1 auto;

  background: var(--pf-timeline-separator-pending-bg);
  border-radius: var(--pf-radius-xs);

  transition: background-color var(--pf-animation-duration)
    var(--pf-animation-easing);
}

.pfTimeline__separator.pfTimeline__separator_colored {
  background: var(--pf-timeline-accent);
}

.pfTimeline_orientation_vertical .pfTimeline__separator {
  width: var(--pf-timeline-separator-thickness);
  min-height: var(--pf-timeline-separator-min-height);
}

.pfTimeline_orientation_horizontal .pfTimeline__separator {
  min-width: 1rem;
  height: var(--pf-timeline-separator-thickness);
}

.pfTimeline__wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: var(--pf-space-xs);
}

.pfTimeline__date {
  color: var(--pf-color-muted);
  line-height: var(--pf-line-height-sm);
}

.pfTimeline__title {
  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-md);
}

.pfTimeline__description {
  color: var(--pf-color-muted);
  line-height: var(--pf-line-height-md);
}

/* Sizes: font size and min separator height */
.pfTimeline_size_2xs {
  --pf-timeline-indicator-size: var(--pf-avatar-size-2xs);
  --pf-timeline-separator-min-height: 0.875rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-3xs);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-xs);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-2xs);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 1.25rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.25rem;
  }
}

.pfTimeline_size_xs {
  --pf-timeline-indicator-size: var(--pf-avatar-size-xs);
  --pf-timeline-separator-min-height: 1rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-2xs);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-xs);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-xs);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 1.375rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.375rem;
  }
}

.pfTimeline_size_sm {
  --pf-timeline-indicator-size: var(--pf-avatar-size-sm);
  --pf-timeline-separator-min-height: 1.125rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-xs);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-sm);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-xs);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 1.5rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.5rem;
  }
}

.pfTimeline_size_md {
  --pf-timeline-indicator-size: var(--pf-avatar-size-md);
  --pf-timeline-separator-min-height: 1.25rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-xs);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-sm);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-sm);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 1.625rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.5rem;
  }
}

.pfTimeline_size_lg {
  --pf-timeline-indicator-size: var(--pf-avatar-size-lg);
  --pf-timeline-separator-min-height: 1.375rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-sm);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-md);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-sm);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 1.75rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.625rem;
  }
}

.pfTimeline_size_xl {
  --pf-timeline-indicator-size: var(--pf-avatar-size-xl);
  --pf-timeline-separator-min-height: 1.5rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-sm);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-md);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-md);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 1.875rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.75rem;
  }
}

.pfTimeline_size_2xl {
  --pf-timeline-indicator-size: var(--pf-avatar-size-2xl);
  --pf-timeline-separator-min-height: 1.625rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-sm);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-lg);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-md);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 2rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 0.875rem;
  }
}

.pfTimeline_size_3xl {
  --pf-timeline-indicator-size: var(--pf-avatar-size-3xl);
  --pf-timeline-separator-min-height: 1.75rem;

  .pfTimeline__date {
    font-size: var(--pf-font-size-md);
  }

  .pfTimeline__title {
    font-size: var(--pf-font-size-lg);
  }

  .pfTimeline__description {
    font-size: var(--pf-font-size-lg);
  }

  &.pfTimeline_orientation_horizontal .pfTimeline__wrapper {
    padding-inline-end: 2.125rem;
  }

  &.pfTimeline_orientation_vertical .pfTimeline__wrapper {
    padding-bottom: 1rem;
  }
}
</style>
