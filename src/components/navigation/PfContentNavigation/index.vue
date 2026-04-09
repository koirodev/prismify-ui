<script setup lang="ts">
import {
  computed,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useId,
  useSlots,
  watch,
  type Component,
  type PropType,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfLink from '../PfLink/index.vue';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfContentNavigationColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfContentNavigationVariant = 'pill' | 'link';
export type PfContentNavigationType = 'single' | 'multiple';

export interface PfContentNavigationItem {
  id?: string;
  label?: string;
  to?: string;
  href?: string;
  target?: string;
  external?: boolean;
  icon?: PfIconName;
  trailingIcon?: PfIconName;
  disabled?: boolean;
  exact?: boolean;
  exactHash?: boolean;
  exactQuery?: boolean | 'partial';
  class?: unknown;
  badge?: string | number;
  children?: PfContentNavigationItem[];
  [key: string]: unknown;
}

export type PfContentNavigationUi = Partial<{
  root: string;
  list: string;
  item: string;
  itemWithChildren: string;
  listWithChildren: string;
  trigger: string;
  link: string;
  linkLeadingIcon: string;
  linkTrailing: string;
  linkTrailingBadge: string;
  linkTrailingIcon: string;
  linkTitle: string;
  content: string;
}>;

defineOptions({
  name: 'PfContentNavigation',
  inheritAttrs: false,
});

const slots = useSlots();

const props = defineProps({
  as: [String, Object] as PropType<string | Component | undefined>,
  items: {
    type: Array as PropType<readonly PfContentNavigationItem[]>,
    default: () => [] as readonly PfContentNavigationItem[],
  },
  defaultOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  trailingIcon: {
    type: String as PropType<PfIconName>,
    default: 'angleSmallDown',
  },
  color: {
    type: String as PropType<PfContentNavigationColor>,
    default: 'primary',
  },
  variant: {
    type: String as PropType<PfContentNavigationVariant>,
    default: 'pill',
  },
  highlight: {
    type: Boolean,
    default: false,
  },
  highlightColor: {
    type: String as PropType<PfContentNavigationColor | undefined>,
    default: undefined,
  },
  collapsible: {
    type: Boolean,
    default: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  ui: Object as PropType<PfContentNavigationUi | undefined>,
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<PfContentNavigationType>,
    default: 'multiple',
  },
  modelValue: [String, Array] as PropType<string | string[] | undefined>,
  defaultValue: [String, Array] as PropType<string | string[] | undefined>,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

const attrs = useAttrs();
const idBase = useId().replace(/:/g, '');
const modelBound = usePfVModelBound();

const itemsList = computed(() => props.items ?? []);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'nav';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

function normalizePath(input: string): string {
  if (!input) return '/';
  try {
    const u = new URL(input, window.location.origin);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return input;
  }
}

const currentLocation = computed(() => {
  if (typeof window === 'undefined') {
    return { path: '/', hash: '' };
  }
  return {
    path: `${window.location.pathname}${window.location.search}`,
    hash: window.location.hash,
  };
});

function itemId(item: PfContentNavigationItem, index: number): string {
  if (item.id && item.id.trim() !== '') return item.id;
  if (typeof item.to === 'string' && item.to.trim() !== '') return item.to;
  if (typeof item.href === 'string' && item.href.trim() !== '')
    return item.href;
  return `${idBase}-${props.level}-${index}`;
}

function itemHref(item: PfContentNavigationItem): string | undefined {
  if (typeof item.to === 'string') return item.to;
  if (typeof item.href === 'string') return item.href;
  return undefined;
}

function isActiveItem(item: PfContentNavigationItem): boolean {
  const link = itemHref(item);
  if (!link) return false;
  const target = normalizePath(link);
  const current = `${currentLocation.value.path}${currentLocation.value.hash}`;
  if (item.exactHash) {
    return target === current;
  }
  if (item.exact) {
    return target === currentLocation.value.path;
  }
  return current.startsWith(target);
}

function hasChildren(item: PfContentNavigationItem): boolean {
  return Array.isArray(item.children) && item.children.length > 0;
}

function hasActiveDescendant(item: PfContentNavigationItem): boolean {
  if (!hasChildren(item)) return false;
  return item.children!.some(
    (child) => isActiveItem(child) || hasActiveDescendant(child)
  );
}

function initialOpenFromItems(
  items: readonly PfContentNavigationItem[]
): string[] {
  if (props.defaultOpen === false) return [];

  const idsWithChildren = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => hasChildren(item))
    .map(({ item, index }) => itemId(item, index));

  const routeOpenIds = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => hasActiveDescendant(item))
    .map(({ item, index }) => itemId(item, index));

  if (props.defaultOpen === true) {
    return idsWithChildren;
  }

  if (routeOpenIds.length > 0) {
    return routeOpenIds;
  }

  if (props.type === 'single') {
    return idsWithChildren.length > 0 ? [idsWithChildren[0]!] : [];
  }

  if (props.level === 0) {
    return idsWithChildren;
  }

  return [];
}

function normalizeValue(
  value: string | string[] | undefined,
  mode: PfContentNavigationType
): string | string[] | undefined {
  if (value === undefined) {
    const opened = initialOpenFromItems(itemsList.value);
    return mode === 'single' ? opened[0] : opened;
  }
  if (mode === 'single') {
    if (typeof value === 'string') return value;
    return Array.isArray(value) ? value[0] : undefined;
  }
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

const internalValue = ref<string | string[] | undefined>(
  normalizeValue(props.defaultValue, props.type)
);

watch(
  () => [props.type, props.defaultValue, props.items] as const,
  ([nextType, nextDefault]) => {
    if (modelBound.value) return;
    internalValue.value = normalizeValue(nextDefault, nextType);
  },
  { deep: true }
);

const activeValue = computed(() =>
  modelBound.value ? props.modelValue : internalValue.value
);

function isItemOpen(item: PfContentNavigationItem, index: number): boolean {
  const key = itemId(item, index);
  if (props.type === 'single') {
    return activeValue.value === key;
  }
  return Array.isArray(activeValue.value) && activeValue.value.includes(key);
}

function setActive(next: string | string[] | undefined): void {
  if (modelBound.value) {
    emit('update:modelValue', next);
    return;
  }
  internalValue.value = next;
}

function toggleItem(item: PfContentNavigationItem, index: number): void {
  if (props.disabled || item.disabled || !hasChildren(item)) return;
  const key = itemId(item, index);
  if (props.type === 'single') {
    const cur = activeValue.value as string | undefined;
    if (cur === key) {
      if (props.collapsible) setActive(undefined);
    } else {
      setActive(key);
    }
    return;
  }
  const arr = Array.isArray(activeValue.value) ? [...activeValue.value] : [];
  const i = arr.indexOf(key);
  if (i >= 0) {
    if (props.collapsible) arr.splice(i, 1);
  } else {
    arr.push(key);
  }
  setActive(arr);
}

function rootClass() {
  const effectiveHighlightColor = props.highlightColor ?? props.color;
  return [
    'pfContentNavigation',
    `pfContentNavigation_color_${props.color}`,
    `pfContentNavigation_variant_${props.variant}`,
    `pfContentNavigation_highlightColor_${effectiveHighlightColor}`,
    props.highlight ? 'pfContentNavigation_highlight' : null,
    props.disabled ? 'pfContentNavigation_disabled' : null,
    props.level > 0 ? 'pfContentNavigation_level' : null,
    attrs.class,
    props.ui?.root,
  ];
}

function linkClass(item: PfContentNavigationItem, _index: number): unknown[] {
  const active = isActiveItem(item);
  return [
    'pfContentNavigation__link',
    active
      ? 'pfContentNavigation__link_active'
      : 'pfContentNavigation__link_inactive',
    props.ui?.link,
  ];
}

function slotPayload(item: PfContentNavigationItem, index: number) {
  return {
    item,
    index,
    level: props.level,
    active: isActiveItem(item),
    open: isItemOpen(item, index),
  };
}
</script>

<template>
  <component :is="resolvedTag" :class="rootClass()" v-bind="passthroughAttrs">
    <ul class="pfContentNavigation__list" :class="ui?.list">
      <li
        v-for="(item, index) in itemsList"
        :key="itemId(item, index)"
        class="pfContentNavigation__item"
        :class="[
          item.class,
          hasChildren(item)
            ? ['pfContentNavigation__itemWithChildren', ui?.itemWithChildren]
            : null,
          ui?.item,
        ]"
        :data-state="
          hasChildren(item)
            ? isItemOpen(item, index)
              ? 'open'
              : 'closed'
            : undefined
        "
      >
        <div class="pfContentNavigation__row">
          <slot
            v-if="slots.link"
            name="link"
            v-bind="slotPayload(item, index)"
          />
          <template v-else>
            <PfLink
              v-if="itemHref(item)"
              raw
              :to="item.to"
              :href="item.href"
              :target="item.target"
              :external="item.external"
              :disabled="disabled || item.disabled"
              :exact="item.exact"
              :exact-hash="item.exactHash"
              :exact-query="item.exactQuery"
              :class="linkClass(item, index)"
              :active="isActiveItem(item)"
            >
              <span
                v-if="slots['link-leading'] || item.icon"
                class="pfContentNavigation__linkLeading"
                :class="ui?.linkLeadingIcon"
              >
                <slot
                  v-if="slots['link-leading']"
                  name="link-leading"
                  v-bind="slotPayload(item, index)"
                />
                <PfIcon v-else-if="item.icon" :name="item.icon" size="sm" />
              </span>
              <span
                class="pfContentNavigation__linkTitle"
                :class="ui?.linkTitle"
              >
                <slot name="link-title" v-bind="slotPayload(item, index)">
                  {{ item.label }}
                </slot>
              </span>
              <span
                v-if="
                  slots['link-trailing'] ||
                  item.badge !== undefined ||
                  (hasChildren(item) && item.trailingIcon)
                "
                class="pfContentNavigation__linkTrailing"
                :class="ui?.linkTrailing"
              >
                <slot
                  v-if="slots['link-trailing']"
                  name="link-trailing"
                  v-bind="slotPayload(item, index)"
                />
                <span
                  v-else-if="item.badge !== undefined"
                  class="pfContentNavigation__linkTrailingBadge"
                  :class="ui?.linkTrailingBadge"
                >
                  {{ item.badge }}
                </span>
                <PfIcon
                  v-else-if="hasChildren(item) && item.trailingIcon"
                  :name="item.trailingIcon"
                  size="sm"
                  :class="ui?.linkTrailingIcon"
                />
              </span>
            </PfLink>
            <span v-else :class="linkClass(item, index)">
              {{ item.label }}
            </span>
          </template>

          <button
            v-if="hasChildren(item)"
            class="pfContentNavigation__trigger"
            :class="[
              ui?.trigger,
              isItemOpen(item, index)
                ? 'pfContentNavigation__trigger_open'
                : null,
            ]"
            type="button"
            :disabled="disabled || item.disabled"
            :aria-expanded="isItemOpen(item, index)"
            @click="toggleItem(item, index)"
          >
            <PfIcon :name="trailingIcon" size="sm" />
          </button>
        </div>

        <div
          v-if="hasChildren(item)"
          class="pfContentNavigation__content"
          :class="[
            ui?.content,
            isItemOpen(item, index)
              ? 'pfContentNavigation__content_open'
              : 'pfContentNavigation__content_closed',
          ]"
        >
          <PfContentNavigation
            :items="item.children"
            :type="type"
            :collapsible="collapsible"
            :default-open="defaultOpen"
            :trailing-icon="trailingIcon"
            :color="color"
            :variant="variant"
            :highlight="highlight"
            :highlight-color="highlightColor"
            :disabled="disabled || item.disabled"
            :level="level + 1"
            :ui="ui"
            class="pfContentNavigation__children"
            :class="ui?.listWithChildren"
          />
        </div>
      </li>
    </ul>
  </component>
</template>

<style scoped lang="scss">
.pfContentNavigation {
  --pf-content-nav-accent: var(--pf-color-primary);
  --pf-content-nav-highlight: var(--pf-color-primary);

  min-width: 0;

  font-family: var(--pf-font-sans);

  &__list {
    margin: 0;

    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--pf-space-xs);

    list-style: none;
  }

  &__item {
    min-width: 0;
  }

  &__itemWithChildren {
    display: flex;
    flex-direction: column;
    gap: var(--pf-space-xs);
  }

  &__row {
    min-width: 0;
    display: flex;
    align-items: stretch;
    gap: var(--pf-space-xs);
  }

  &__link {
    position: relative;

    padding: var(--pf-space-xs) var(--pf-space-sm);
    min-width: 0;
    display: inline-flex;
    align-items: center;
    flex: 1 1 auto;
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-sm);
    line-height: var(--pf-line-height-md);
    text-decoration: none;

    border-radius: var(--pf-radius-sm);

    transition:
      color var(--pf-animation-duration) var(--pf-animation-easing),
      background-color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__linkLeading {
    display: inline-flex;
    flex-shrink: 0;
  }

  &__linkTitle {
    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__linkTrailing {
    margin-inline-start: auto;

    display: inline-flex;
    align-items: center;
    gap: var(--pf-space-xs);
  }

  &__linkTrailingBadge {
    padding: 0 0.35rem;
    min-width: 1.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    color: var(--pf-color-muted);
    font-size: var(--pf-font-size-xs);

    background: color-mix(in srgb, var(--pf-color-muted) 12%, transparent);
    border-radius: var(--pf-radius-sm);
  }

  &__trigger {
    width: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    color: var(--pf-color-muted);

    background: transparent;
    border: none;
    border-radius: var(--pf-radius-sm);

    transition:
      transform var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing);

    cursor: pointer;

    &:focus-visible {
      box-shadow: var(--pf-focus-ring);
      outline: none;
    }

    &_open {
      color: var(--pf-color-text);

      transform: rotate(180deg);
    }
  }

  &__content {
    overflow: hidden;

    transition:
      opacity var(--pf-animation-duration) var(--pf-animation-easing),
      max-height var(--pf-animation-duration) var(--pf-animation-easing);

    &_open {
      max-height: 80rem;

      opacity: 1;
    }

    &_closed {
      max-height: 0;

      opacity: 0;

      pointer-events: none;
    }
  }

  &__children {
    border-inline-start: var(--pf-stroke-width) solid var(--pf-border-color);

    margin-inline-start: var(--pf-space-md);

    padding-inline-start: var(--pf-space-sm);
  }

  &_variant_pill &__link_active {
    color: var(--pf-content-nav-accent);
    font-weight: var(--pf-font-weight-medium);

    background: color-mix(
      in srgb,
      var(--pf-content-nav-accent) 10%,
      transparent
    );
  }

  &_variant_link &__link_active {
    color: var(--pf-content-nav-accent);
    font-weight: var(--pf-font-weight-medium);
  }

  &__link_inactive {
    color: var(--pf-color-muted);

    &:hover {
      color: var(--pf-color-text);

      background: color-mix(in srgb, var(--pf-color-muted) 10%, transparent);
    }
  }

  &_highlight.pfContentNavigation_level &__link_active::after {
    content: '';

    position: absolute;
    inset-block: 0.2rem;
    inset-inline-start: calc(var(--pf-space-sm) * -1);

    width: 2px;

    background: var(--pf-content-nav-highlight);
    border-radius: 999px;
  }

  &_disabled {
    opacity: 0.7;

    pointer-events: none;
  }

  &_color_primary {
    --pf-content-nav-accent: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-content-nav-accent: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-content-nav-accent: var(--pf-color-success);
  }

  &_color_info {
    --pf-content-nav-accent: var(--pf-color-info);
  }

  &_color_warning {
    --pf-content-nav-accent: var(--pf-color-warning);
  }

  &_color_error {
    --pf-content-nav-accent: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-content-nav-accent: var(--pf-color-text);
  }

  &_highlightColor_primary {
    --pf-content-nav-highlight: var(--pf-color-primary);
  }

  &_highlightColor_secondary {
    --pf-content-nav-highlight: var(--pf-color-secondary);
  }

  &_highlightColor_success {
    --pf-content-nav-highlight: var(--pf-color-success);
  }

  &_highlightColor_info {
    --pf-content-nav-highlight: var(--pf-color-info);
  }

  &_highlightColor_warning {
    --pf-content-nav-highlight: var(--pf-color-warning);
  }

  &_highlightColor_error {
    --pf-content-nav-highlight: var(--pf-color-error);
  }

  &_highlightColor_neutral {
    --pf-content-nav-highlight: var(--pf-color-text);
  }
}
</style>
