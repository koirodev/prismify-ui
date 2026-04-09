<script setup lang="ts">
import {
  computed,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  watch,
  type Component,
} from 'vue';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfStepperColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfStepperSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfStepperOrientation = 'horizontal' | 'vertical';

export type PfStepperItemState = 'completed' | 'active' | 'pending';

export type PfStepperItemUi = Partial<{
  item: string;
  container: string;
  trigger: string;
  indicator: string;
  icon: string;
  separator: string;
  wrapper: string;
  title: string;
  description: string;
}>;

export interface PfStepperItem {
  title?: string;
  description?: string;
  /** Step panel text when there is no `content` / named slot. */
  content?: string;
  icon?: PfIconName;
  value?: string | number;
  disabled?: boolean;
  slot?: string;
  class?: unknown;
  ui?: PfStepperItemUi;
}

export type PfStepperUi = Partial<{
  root: string;
  header: string;
  item: string;
  container: string;
  trigger: string;
  indicator: string;
  icon: string;
  separator: string;
  wrapper: string;
  title: string;
  description: string;
  content: string;
}>;

type PfStepperSlots = Readonly<
  Record<string, ((props?: Record<string, unknown>) => unknown) | undefined>
>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    items: readonly PfStepperItem[];
    size?: PfStepperSize;
    color?: PfStepperColor;
    orientation?: PfStepperOrientation;
    valueKey?: string;
    defaultValue?: string | number;
    modelValue?: string | number;
    disabled?: boolean;
    /** If `true`, cannot jump to a step with index greater than `activeIndex + 1` (no skipping ahead). */
    linear?: boolean;
    ui?: PfStepperUi;
  }>(),
  {
    size: 'md',
    color: 'primary',
    orientation: 'horizontal',
    valueKey: 'value',
    linear: true,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined];
  next: [item: PfStepperItem];
  prev: [item: PfStepperItem];
}>();

defineSlots<{
  indicator(props: Record<string, unknown>): unknown;
  wrapper(props: Record<string, unknown>): unknown;
  title(props: Record<string, unknown>): unknown;
  description(props: Record<string, unknown>): unknown;
  content(props: Record<string, unknown>): unknown;
  [key: string]: (props: Record<string, unknown>) => unknown;
}>();

const attrs = useAttrs();
const slots = useSlots() as PfStepperSlots;
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

function getItemValue(item: PfStepperItem, index: number): string | number {
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

const activeItem = computed(() => {
  const i = activeIndex.value;
  if (i < 0 || i >= props.items.length) {
    return undefined;
  }
  return props.items[i];
});

function itemState(index: number): PfStepperItemState {
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

function separatorColored(index: number): boolean {
  return itemState(index) === 'completed';
}

function canNavigateTo(index: number): boolean {
  if (props.disabled) {
    return false;
  }
  const item = props.items[index];
  if (item?.disabled) {
    return false;
  }
  if (!props.linear) {
    return true;
  }
  return index <= activeIndex.value + 1;
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
  'pfStepper',
  `pfStepper_size_${props.size}`,
  `pfStepper_color_${props.color}`,
  `pfStepper_orientation_${props.orientation}`,
  props.disabled && 'pfStepper_disabled',
  attrs.class,
  props.ui?.root,
]);

const iconSize = computed((): PfIconSize => {
  const map: Record<PfStepperSize, PfIconSize> = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  };
  return map[props.size];
});

function hasNamedSlot(name: string): boolean {
  return typeof (slots as Record<string, unknown>)[name] === 'function';
}

function itemKey(item: PfStepperItem, index: number): string | number {
  const v = getItemValue(item, index);
  return typeof v === 'string' || typeof v === 'number' ? v : index;
}

function onSelect(index: number) {
  if (!canNavigateTo(index)) {
    return;
  }
  const item = props.items[index];
  selected.value = getItemValue(item, index);
}

const hasNext = computed(
  () => activeIndex.value >= 0 && activeIndex.value < props.items.length - 1
);
const hasPrev = computed(() => activeIndex.value > 0);

function next() {
  if (props.disabled || !hasNext.value) {
    return;
  }
  const ni = activeIndex.value + 1;
  const item = props.items[ni];
  selected.value = getItemValue(item, ni);
  emit('next', item);
}

function prev() {
  if (props.disabled || !hasPrev.value) {
    return;
  }
  const pi = activeIndex.value - 1;
  const item = props.items[pi];
  selected.value = getItemValue(item, pi);
  emit('prev', item);
}

defineExpose({
  next,
  prev,
  hasNext,
  hasPrev,
});

const showContentPanel = computed(() => {
  const ai = activeItem.value;
  if (!ai) {
    return false;
  }
  if (ai.content != null && ai.content !== '') {
    return true;
  }
  if (hasNamedSlot('content')) {
    return true;
  }
  if (ai.slot && hasNamedSlot(ai.slot)) {
    return true;
  }
  return false;
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <!-- Horizontal: equal columns; line like Reka — absolute inside container, left/right from column center -->
    <div
      v-if="orientation === 'horizontal'"
      class="pfStepper__header pfStepper__header_horizontal"
      :class="props.ui?.header"
      role="list"
    >
      <template v-for="(item, index) in items" :key="itemKey(item, index)">
        <div
          class="pfStepper__item pfStepper__item_horizontalFlex"
          role="listitem"
          :data-state="itemState(index)"
          :data-disabled="item.disabled ? '' : undefined"
          :class="[item.class, item.ui?.item, props.ui?.item]"
        >
          <div
            class="pfStepper__container pfStepper__container_horizontalIcon"
            :class="[item.ui?.container, props.ui?.container]"
          >
            <button
              type="button"
              class="pfStepper__trigger"
              :class="[item.ui?.trigger, props.ui?.trigger]"
              :disabled="!canNavigateTo(index)"
              :aria-current="itemState(index) === 'active' ? 'step' : undefined"
              @click="onSelect(index)"
            >
              <span
                class="pfStepper__indicator"
                :class="[item.ui?.indicator, props.ui?.indicator]"
              >
                <template
                  v-if="item.slot && hasNamedSlot(`${item.slot}-indicator`)"
                >
                  <slot
                    :name="`${item.slot}-indicator`"
                    :item="item"
                    :index="index"
                    :state="itemState(index)"
                  />
                </template>
                <slot
                  v-else-if="hasNamedSlot('indicator')"
                  name="indicator"
                  :item="item"
                  :index="index"
                  :state="itemState(index)"
                />
                <template v-else-if="itemState(index) === 'completed'">
                  <PfIcon
                    class="pfStepper__icon"
                    :class="[item.ui?.icon, props.ui?.icon]"
                    name="check"
                    :size="iconSize"
                  />
                </template>
                <template v-else-if="item.icon">
                  <PfIcon
                    class="pfStepper__icon"
                    :class="[item.ui?.icon, props.ui?.icon]"
                    :name="item.icon"
                    :size="iconSize"
                  />
                </template>
                <span v-else class="pfStepper__stepIndex" aria-hidden="true">
                  {{ index + 1 }}
                </span>
              </span>
            </button>
            <div
              v-if="index < items.length - 1"
              class="pfStepper__separator pfStepper__separator_track"
              :class="[
                item.ui?.separator,
                props.ui?.separator,
                separatorColored(index) ? 'pfStepper__separator_colored' : '',
              ]"
              role="presentation"
              aria-hidden="true"
            />
          </div>
          <div class="pfStepper__labelCell pfStepper__labelCell_horizontal">
            <div
              class="pfStepper__wrapper"
              :class="[item.ui?.wrapper, props.ui?.wrapper]"
            >
              <template
                v-if="item.slot && hasNamedSlot(`${item.slot}-wrapper`)"
              >
                <slot
                  :name="`${item.slot}-wrapper`"
                  :item="item"
                  :index="index"
                />
              </template>
              <slot
                v-else-if="hasNamedSlot('wrapper')"
                name="wrapper"
                :item="item"
                :index="index"
              />
              <template v-else>
                <template
                  v-if="item.slot && hasNamedSlot(`${item.slot}-title`)"
                >
                  <div
                    class="pfStepper__title"
                    :class="[item.ui?.title, props.ui?.title]"
                  >
                    <slot
                      :name="`${item.slot}-title`"
                      :item="item"
                      :index="index"
                    />
                  </div>
                </template>
                <div
                  v-else-if="hasNamedSlot('title')"
                  class="pfStepper__title"
                  :class="[item.ui?.title, props.ui?.title]"
                >
                  <slot name="title" :item="item" :index="index" />
                </div>
                <div
                  v-else-if="item.title != null && item.title !== ''"
                  class="pfStepper__title"
                  :class="[item.ui?.title, props.ui?.title]"
                >
                  {{ item.title }}
                </div>

                <template
                  v-if="item.slot && hasNamedSlot(`${item.slot}-description`)"
                >
                  <div
                    class="pfStepper__description"
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
                  class="pfStepper__description"
                  :class="[item.ui?.description, props.ui?.description]"
                >
                  <slot name="description" :item="item" :index="index" />
                </div>
                <div
                  v-else-if="
                    item.description != null && item.description !== ''
                  "
                  class="pfStepper__description"
                  :class="[item.ui?.description, props.ui?.description]"
                >
                  {{ item.description }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-else class="pfStepper__header" :class="props.ui?.header" role="list">
      <div
        v-for="(item, index) in items"
        :key="itemKey(item, index)"
        role="listitem"
        class="pfStepper__item"
        :class="[item.class, item.ui?.item, props.ui?.item]"
        :data-state="itemState(index)"
        :data-disabled="item.disabled ? '' : undefined"
      >
        <div
          class="pfStepper__container"
          :class="[item.ui?.container, props.ui?.container]"
        >
          <button
            type="button"
            class="pfStepper__trigger"
            :class="[item.ui?.trigger, props.ui?.trigger]"
            :disabled="!canNavigateTo(index)"
            :aria-current="itemState(index) === 'active' ? 'step' : undefined"
            @click="onSelect(index)"
          >
            <span
              class="pfStepper__indicator"
              :class="[item.ui?.indicator, props.ui?.indicator]"
            >
              <template
                v-if="item.slot && hasNamedSlot(`${item.slot}-indicator`)"
              >
                <slot
                  :name="`${item.slot}-indicator`"
                  :item="item"
                  :index="index"
                  :state="itemState(index)"
                />
              </template>
              <slot
                v-else-if="hasNamedSlot('indicator')"
                name="indicator"
                :item="item"
                :index="index"
                :state="itemState(index)"
              />
              <template v-else-if="itemState(index) === 'completed'">
                <PfIcon
                  class="pfStepper__icon"
                  :class="[item.ui?.icon, props.ui?.icon]"
                  name="check"
                  :size="iconSize"
                />
              </template>
              <template v-else-if="item.icon">
                <PfIcon
                  class="pfStepper__icon"
                  :class="[item.ui?.icon, props.ui?.icon]"
                  :name="item.icon"
                  :size="iconSize"
                />
              </template>
              <span v-else class="pfStepper__stepIndex" aria-hidden="true">
                {{ index + 1 }}
              </span>
            </span>
          </button>
          <div
            v-if="index < items.length - 1"
            class="pfStepper__separator pfStepper__separator_track pfStepper__separator_track_vertical"
            :class="[
              item.ui?.separator,
              props.ui?.separator,
              separatorColored(index) ? 'pfStepper__separator_colored' : '',
            ]"
            role="presentation"
            aria-hidden="true"
          />
        </div>
        <div
          class="pfStepper__wrapper"
          :class="[item.ui?.wrapper, props.ui?.wrapper]"
        >
          <template v-if="item.slot && hasNamedSlot(`${item.slot}-wrapper`)">
            <slot :name="`${item.slot}-wrapper`" :item="item" :index="index" />
          </template>
          <slot
            v-else-if="hasNamedSlot('wrapper')"
            name="wrapper"
            :item="item"
            :index="index"
          />
          <template v-else>
            <template v-if="item.slot && hasNamedSlot(`${item.slot}-title`)">
              <div
                class="pfStepper__title"
                :class="[item.ui?.title, props.ui?.title]"
              >
                <slot
                  :name="`${item.slot}-title`"
                  :item="item"
                  :index="index"
                />
              </div>
            </template>
            <div
              v-else-if="hasNamedSlot('title')"
              class="pfStepper__title"
              :class="[item.ui?.title, props.ui?.title]"
            >
              <slot name="title" :item="item" :index="index" />
            </div>
            <div
              v-else-if="item.title != null && item.title !== ''"
              class="pfStepper__title"
              :class="[item.ui?.title, props.ui?.title]"
            >
              {{ item.title }}
            </div>

            <template
              v-if="item.slot && hasNamedSlot(`${item.slot}-description`)"
            >
              <div
                class="pfStepper__description"
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
              class="pfStepper__description"
              :class="[item.ui?.description, props.ui?.description]"
            >
              <slot name="description" :item="item" :index="index" />
            </div>
            <div
              v-else-if="item.description != null && item.description !== ''"
              class="pfStepper__description"
              :class="[item.ui?.description, props.ui?.description]"
            >
              {{ item.description }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="showContentPanel"
      class="pfStepper__content"
      :class="props.ui?.content"
    >
      <template v-if="activeItem?.slot && hasNamedSlot(activeItem.slot)">
        <slot :name="activeItem.slot" />
      </template>
      <slot
        v-else-if="hasNamedSlot('content')"
        name="content"
        :item="activeItem"
        :index="activeIndex"
      />
      <template v-else-if="activeItem?.content != null">
        {{ activeItem.content }}
      </template>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfStepper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--pf-stepper-root-gap);

  font-family: var(--pf-font-sans);
}

.pfStepper__header {
  width: 100%;
  display: flex;
  gap: var(--pf-stepper-header-gap);
}

.pfStepper__header_horizontal {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 0;
}

.pfStepper_orientation_horizontal
  .pfStepper__header:not(.pfStepper__header_horizontal) {
  flex-direction: row;
  align-items: flex-start;
}

.pfStepper_orientation_vertical .pfStepper__header {
  flex-direction: column;
  align-items: stretch;
}

.pfStepper__item {
  position: relative;

  min-width: 0;
  display: flex;
  flex: 1 1 0;
  gap: var(--pf-stepper-item-gap);

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

  &[data-state='pending'] .pfStepper__trigger:not(:disabled) {
    cursor: pointer;
  }

  &[data-state='active'] .pfStepper__trigger:not(:disabled),
  &[data-state='completed'] .pfStepper__trigger:not(:disabled) {
    cursor: pointer;
  }
}

.pfStepper_disabled .pfStepper__item {
  opacity: 0.72;
}

.pfStepper_orientation_horizontal
  .pfStepper__item:not(.pfStepper__item_horizontalFlex) {
  flex-direction: column;
  align-items: stretch;
}

.pfStepper__item_horizontalFlex {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;

  text-align: center;
}

.pfStepper__labelCell {
  min-width: 0;
  display: block;
}

.pfStepper__labelCell_horizontal {
  width: 100%;
}

.pfStepper__container_horizontalIcon {
  position: relative;

  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.pfStepper__item_horizontalFlex .pfStepper__trigger {
  position: relative;
  z-index: 1;
}

.pfStepper_orientation_vertical .pfStepper__item {
  flex-direction: row;
  align-items: stretch;
}

.pfStepper__container {
  position: relative;

  display: flex;
  flex-shrink: 0;
}

.pfStepper_orientation_vertical .pfStepper__container {
  position: relative;

  width: var(--pf-stepper-trigger-size);
  min-width: var(--pf-stepper-trigger-size);
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  flex-shrink: 0;
}

.pfStepper_orientation_vertical .pfStepper__container .pfStepper__trigger {
  position: relative;
  z-index: 1;
}

.pfStepper_orientation_horizontal
  .pfStepper__container:not(.pfStepper__container_horizontalIcon) {
  width: 100%;
  flex-direction: row;
  align-items: center;
}

.pfStepper__trigger {
  margin: 0;

  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  border-radius: 50%;

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    color var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: inherit;

  &:focus-visible {
    outline: 2px solid var(--pf-stepper-focus-ring);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;

    cursor: not-allowed;
  }
}

.pfStepper__indicator {
  width: var(--pf-stepper-trigger-size);
  height: var(--pf-stepper-trigger-size);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  font-weight: var(--pf-font-weight-bold);

  border-radius: 50%;

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfStepper__icon {
  flex-shrink: 0;
}

.pfStepper__stepIndex {
  line-height: 1;
}

.pfStepper__item[data-state='pending'] .pfStepper__indicator {
  color: var(--pf-color-muted);

  background: var(--pf-stepper-separator-pending-bg);
}

.pfStepper__item[data-state='active'] .pfStepper__indicator,
.pfStepper__item[data-state='completed'] .pfStepper__indicator {
  color: var(--pf-color-surface);

  background: var(--pf-stepper-accent);
}

.pfStepper_color_primary {
  --pf-stepper-accent: var(--pf-color-primary);
  --pf-stepper-focus-ring: var(--pf-color-primary);
}

.pfStepper_color_secondary {
  --pf-stepper-accent: var(--pf-color-secondary);
  --pf-stepper-focus-ring: var(--pf-color-secondary);
}

.pfStepper_color_success {
  --pf-stepper-accent: var(--pf-color-success);
  --pf-stepper-focus-ring: var(--pf-color-success);
}

.pfStepper_color_info {
  --pf-stepper-accent: var(--pf-color-info);
  --pf-stepper-focus-ring: var(--pf-color-info);
}

.pfStepper_color_warning {
  --pf-stepper-accent: var(--pf-color-warning);
  --pf-stepper-focus-ring: var(--pf-color-warning);
}

.pfStepper_color_error {
  --pf-stepper-accent: var(--pf-color-error);
  --pf-stepper-focus-ring: var(--pf-color-error);
}

.pfStepper_color_neutral {
  --pf-stepper-accent: var(--pf-color-text);
  --pf-stepper-focus-ring: var(--pf-color-text);
}

.pfStepper__separator {
  flex: 1 1 auto;

  background: var(--pf-stepper-separator-pending-bg);
  border-radius: var(--pf-radius-sm);

  transition: background-color var(--pf-animation-duration)
    var(--pf-animation-easing);
}

.pfStepper__separator.pfStepper__separator_colored {
  background: var(--pf-stepper-accent);
}

.pfStepper_orientation_vertical
  .pfStepper__separator:not(.pfStepper__separator_track) {
  width: var(--pf-stepper-separator-thickness);
  min-height: var(--pf-stepper-separator-min-height);
}

.pfStepper_orientation_horizontal
  .pfStepper__separator:not(.pfStepper__separator_track) {
  min-width: 1rem;
  height: var(--pf-stepper-separator-thickness);
}

/* Like Reka: line between circles; small gap from circle — --pf-stepper-line-gap. */
.pfStepper_orientation_horizontal
  .pfStepper__separator_track:not(.pfStepper__separator_track_vertical) {
  position: absolute;
  top: calc(50% - var(--pf-stepper-separator-thickness) / 2);
  right: calc(
    -50% + var(--pf-stepper-trigger-size) / 2 + var(--pf-stepper-line-gap)
  );
  bottom: auto;
  left: calc(
    50% + var(--pf-stepper-trigger-size) / 2 + var(--pf-stepper-line-gap)
  );
  z-index: 0;

  width: auto;
  height: var(--pf-stepper-separator-thickness);
  flex: none;

  pointer-events: none;
}

/*
 * Vertical: column container stretches to row height (`align-items: stretch` on item).
 * Line from bottom of circle to bottom of column with gap; without «-50%» — otherwise when height ≈ circle
 * the segment height collapsed.
 */
.pfStepper_orientation_vertical .pfStepper__separator_track_vertical {
  position: absolute;
  top: calc(var(--pf-stepper-trigger-size) + var(--pf-stepper-line-gap));
  right: auto;
  bottom: var(--pf-stepper-line-gap);
  left: calc(50% - var(--pf-stepper-separator-thickness) / 2);
  z-index: 0;

  width: var(--pf-stepper-separator-thickness);
  height: auto;
  min-height: 0;
  flex: none;

  pointer-events: none;
}

.pfStepper__wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: var(--pf-space-xs);

  text-align: center;
}

.pfStepper_orientation_vertical .pfStepper__wrapper {
  padding-bottom: var(--pf-space-xs);

  text-align: start;
}

.pfStepper__title {
  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-md);
}

.pfStepper__description {
  color: var(--pf-color-muted);
  line-height: var(--pf-line-height-md);
  text-wrap: balance;
}

.pfStepper__content {
  padding-top: var(--pf-stepper-content-padding-top);
  width: 100%;

  color: var(--pf-color-text);
  line-height: var(--pf-line-height-md);
}

/* Sizes */
.pfStepper_size_xs {
  --pf-stepper-separator-min-height: 1rem;
  --pf-stepper-trigger-size: var(--pf-avatar-size-xs);

  .pfStepper__title {
    font-size: var(--pf-font-size-2xs);
  }

  .pfStepper__description {
    font-size: var(--pf-font-size-2xs);
  }

  .pfStepper__stepIndex {
    font-size: var(--pf-font-size-2xs);
  }

  &.pfStepper_orientation_horizontal .pfStepper__wrapper {
    margin-top: 0.375rem;
  }

  &.pfStepper_orientation_vertical .pfStepper__item {
    gap: 0.375rem;
  }
}

.pfStepper_size_sm {
  --pf-stepper-separator-min-height: 1.125rem;
  --pf-stepper-trigger-size: var(--pf-avatar-size-sm);

  .pfStepper__title {
    font-size: var(--pf-font-size-xs);
  }

  .pfStepper__description {
    font-size: var(--pf-font-size-xs);
  }

  .pfStepper__stepIndex {
    font-size: var(--pf-font-size-xs);
  }

  &.pfStepper_orientation_horizontal .pfStepper__wrapper {
    margin-top: 0.5rem;
  }

  &.pfStepper_orientation_vertical .pfStepper__item {
    gap: 0.5rem;
  }
}

.pfStepper_size_md {
  --pf-stepper-separator-min-height: 1.25rem;
  --pf-stepper-trigger-size: var(--pf-avatar-size-md);

  .pfStepper__title {
    font-size: var(--pf-font-size-sm);
  }

  .pfStepper__description {
    font-size: var(--pf-font-size-sm);
  }

  .pfStepper__stepIndex {
    font-size: var(--pf-font-size-sm);
  }

  &.pfStepper_orientation_horizontal .pfStepper__wrapper {
    margin-top: 0.625rem;
  }

  &.pfStepper_orientation_vertical .pfStepper__item {
    gap: 0.625rem;
  }
}

.pfStepper_size_lg {
  --pf-stepper-separator-min-height: 1.375rem;
  --pf-stepper-trigger-size: var(--pf-avatar-size-lg);

  .pfStepper__title {
    font-size: var(--pf-font-size-md);
  }

  .pfStepper__description {
    font-size: var(--pf-font-size-sm);
  }

  .pfStepper__stepIndex {
    font-size: var(--pf-font-size-md);
  }

  &.pfStepper_orientation_horizontal .pfStepper__wrapper {
    margin-top: 0.75rem;
  }

  &.pfStepper_orientation_vertical .pfStepper__item {
    gap: 0.75rem;
  }
}

.pfStepper_size_xl {
  --pf-stepper-separator-min-height: 1.5rem;
  --pf-stepper-trigger-size: var(--pf-avatar-size-xl);

  .pfStepper__title {
    font-size: var(--pf-font-size-lg);
  }

  .pfStepper__description {
    font-size: var(--pf-font-size-md);
  }

  .pfStepper__stepIndex {
    font-size: var(--pf-font-size-lg);
  }

  &.pfStepper_orientation_horizontal .pfStepper__wrapper {
    margin-top: 0.875rem;
  }

  &.pfStepper_orientation_vertical .pfStepper__item {
    gap: 0.875rem;
  }
}
</style>
