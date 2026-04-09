<script setup lang="ts">
import {
  computed,
  provide,
  ref,
  useAttrs,
  useSlots,
  watch,
  type Component,
  type PropType,
} from 'vue';
import PfTreeBranch from './PfTreeBranch.vue';
import PfTreeRow from './PfTreeRow.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import type { PfTreeContext } from './treeContext';
import {
  pfTreeItemIconSrc,
  pfTreeLeadingIcon,
  pfTreeLeadingImageAlt,
} from './treeItemDisplay';
import type {
  PfTreeColor,
  PfTreeItem,
  PfTreeItemUi,
  PfTreeSelectPayload,
  PfTreeSelectionBehavior,
  PfTreeSize,
  PfTreeTogglePayload,
  PfTreeUi,
} from './treeTypes';

export type {
  PfTreeColor,
  PfTreeItem,
  PfTreeItemUi,
  PfTreeSelectPayload,
  PfTreeSelectionBehavior,
  PfTreeSize,
  PfTreeTogglePayload,
  PfTreeUi,
} from './treeTypes';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  as: [String, Object] as PropType<
    string | Component | { link?: string | Component } | undefined
  >,
  color: {
    type: String as PropType<PfTreeColor>,
    /** Default `success` — accent like a “file” tree (green selection). */
    default: 'success',
  },
  size: {
    type: String as PropType<PfTreeSize>,
    default: 'md',
  },
  getKey: Function as PropType<(item: PfTreeItem) => string | undefined>,
  labelKey: { type: String, default: 'label' },
  trailingIcon: {
    type: String as PropType<PfIconName>,
    default: 'angleSmallDown',
  },
  expandedIcon: {
    type: String as PropType<PfIconName>,
    default: 'folder',
  },
  collapsedIcon: {
    type: String as PropType<PfIconName>,
    default: 'folder',
  },
  items: {
    type: Array as PropType<readonly PfTreeItem[]>,
    default: () => [] as readonly PfTreeItem[],
  },
  modelValue: [String, Array] as PropType<string | string[] | undefined>,
  defaultValue: [String, Array] as PropType<string | string[] | undefined>,
  multiple: Boolean,
  nested: { type: Boolean, default: true },
  virtualize: [Boolean, Object] as PropType<
    boolean | { overscan?: number; estimateSize?: number }
  >,
  selectionBehavior: {
    type: String as PropType<PfTreeSelectionBehavior>,
    default: 'toggle',
  },
  propagateSelect: Boolean,
  bubbleSelect: Boolean,
  disabled: Boolean,
  expanded: Array as PropType<string[] | undefined>,
  defaultExpanded: Array as PropType<string[] | undefined>,
  ui: Object as PropType<PfTreeUi | undefined>,
  linkAs: [String, Object] as PropType<string | Component | undefined>,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
  'update:expanded': [value: string[]];
  select: [payload: PfTreeSelectPayload];
  toggle: [payload: PfTreeTogglePayload];
}>();

const attrs = useAttrs();
const slots = useSlots();
const modelBound = usePfVModelBound();

/** `v-model:expanded` mode: `expanded` prop is passed (including `[]`). */
const expandedBound = computed(() => props.expanded !== undefined);

function itemRecord(item: PfTreeItem): Record<string, unknown> {
  return item as unknown as Record<string, unknown>;
}

function resolveKey(item: PfTreeItem, path: string): string {
  if (props.getKey) {
    const k = props.getKey(item);
    if (k !== undefined && k !== null && String(k) !== '') return String(k);
  }
  const raw = itemRecord(item)[props.labelKey];
  if (raw !== undefined && raw !== null && String(raw) !== '') {
    return String(raw);
  }
  return path;
}

interface TreeIndex {
  keyToItem: Map<string, PfTreeItem>;
  keyToChildren: Map<string, readonly string[]>;
  keyToParent: Map<string, string | undefined>;
  keyToDescendants: Map<string, string[]>;
}

function buildTreeIndex(items: readonly PfTreeItem[] | undefined): TreeIndex {
  const keyToItem = new Map<string, PfTreeItem>();
  const keyToChildren = new Map<string, readonly string[]>();
  const keyToParent = new Map<string, string | undefined>();
  const keyToDescendants = new Map<string, string[]>();

  function walk(
    list: readonly PfTreeItem[] | undefined,
    p: string,
    parentKey: string | undefined
  ) {
    if (!list?.length) return;
    list.forEach((item, i) => {
      const path = p ? `${p}/${i}` : String(i);
      const key = resolveKey(item, path);
      keyToItem.set(key, item);
      keyToParent.set(key, parentKey);
      if (item.children?.length) {
        const directKeys = item.children.map((c, ci) =>
          resolveKey(c, `${path}/${ci}`)
        );
        keyToChildren.set(key, directKeys);
        walk(item.children, path, key);
        const desc = directKeys.flatMap((dk) => [
          dk,
          ...(keyToDescendants.get(dk) ?? []),
        ]);
        keyToDescendants.set(key, desc);
      } else {
        keyToChildren.set(key, []);
        keyToDescendants.set(key, []);
      }
    });
  }

  walk(items, '', undefined);
  return { keyToItem, keyToChildren, keyToParent, keyToDescendants };
}

const treeIndex = computed(() => buildTreeIndex(props.items));

function collectDefaultExpandedFromItems(
  list: readonly PfTreeItem[] | undefined,
  path: string
): string[] {
  if (!list?.length) return [];
  const out: string[] = [];
  list.forEach((item, i) => {
    const p = path ? `${path}/${i}` : String(i);
    const key = resolveKey(item, p);
    if (item.children?.length && item.defaultExpanded) {
      out.push(key);
      out.push(...collectDefaultExpandedFromItems(item.children, p));
    }
  });
  return out;
}

const internalExpanded = ref<string[]>([
  ...(props.defaultExpanded ?? []),
  ...collectDefaultExpandedFromItems(props.items, ''),
]);

const activeExpanded = computed(() => {
  if (expandedBound.value) {
    return props.expanded ?? [];
  }
  return internalExpanded.value;
});

const expandedSet = computed(() => new Set(activeExpanded.value));

function setExpanded(next: string[]) {
  if (expandedBound.value) {
    emit('update:expanded', next);
  } else {
    internalExpanded.value = [...next];
  }
}

function toggleExpandedKey(key: string) {
  const set = new Set(expandedSet.value);
  if (set.has(key)) set.delete(key);
  else set.add(key);
  setExpanded([...set]);
}

const internalValue = ref<string | string[] | undefined>(
  normalizeDefaultValue(props.defaultValue)
);

watch(
  () => props.defaultValue,
  (v) => {
    if (!modelBound.value) {
      internalValue.value = normalizeDefaultValue(v);
    }
  }
);

function normalizeDefaultValue(
  v: string | string[] | undefined
): string | string[] | undefined {
  if (v === undefined) return props.multiple ? [] : undefined;
  if (props.multiple) {
    return Array.isArray(v) ? [...v] : [v];
  }
  if (Array.isArray(v) && v.length > 0) return v[0];
  return v as string | undefined;
}

const selectedValue = computed(() => {
  if (modelBound.value) return props.modelValue;
  return internalValue.value;
});

function setSelected(next: string | string[] | undefined) {
  if (modelBound.value) {
    emit('update:modelValue', next);
  } else {
    internalValue.value = next;
  }
}

function isSelected(key: string): boolean {
  const v = selectedValue.value;
  if (props.multiple) {
    return Array.isArray(v) && v.includes(key);
  }
  return v === key;
}

function isIndeterminate(key: string): boolean {
  if (!props.bubbleSelect || !props.multiple) return false;
  const children = treeIndex.value.keyToChildren.get(key) ?? [];
  if (children.length === 0) return false;
  const selectedCount = children.filter((c) => isSelected(c)).length;
  return selectedCount > 0 && selectedCount < children.length;
}

function bubbleSelection(set: Set<string>) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const [parentKey, childKeys] of treeIndex.value.keyToChildren) {
      if (!childKeys.length) continue;
      const allSelected = childKeys.every((c) => set.has(c));
      if (allSelected && !set.has(parentKey)) {
        set.add(parentKey);
        changed = true;
      } else if (!allSelected && set.has(parentKey)) {
        set.delete(parentKey);
        changed = true;
      }
    }
  }
}

function applySelection(key: string, item: PfTreeItem) {
  if (props.disabled || item.disabled) return;
  if (props.multiple) {
    const set = new Set(
      Array.isArray(selectedValue.value) ? [...selectedValue.value] : []
    );
    if (props.selectionBehavior === 'replace') {
      set.clear();
      set.add(key);
    } else if (set.has(key)) {
      set.delete(key);
    } else {
      set.add(key);
    }
    if (props.propagateSelect) {
      const desc = treeIndex.value.keyToDescendants.get(key) ?? [];
      if (set.has(key)) {
        desc.forEach((d) => set.add(d));
      } else {
        desc.forEach((d) => set.delete(d));
      }
    }
    if (props.bubbleSelect) {
      bubbleSelection(set);
    }
    setSelected([...set]);
  } else {
    const cur = selectedValue.value as string | undefined;
    setSelected(cur === key ? undefined : key);
  }
}

function onToggleExpand(key: string, item: PfTreeItem, originalEvent: Event) {
  const e = new Event('toggle', { cancelable: true });
  item.onToggle?.(e);
  if (e.defaultPrevented) return;
  emit('toggle', { originalEvent, item, key });
  toggleExpandedKey(key);
}

function onSelectRow(key: string, item: PfTreeItem, originalEvent: Event) {
  const e = new Event('select', { cancelable: true });
  item.onSelect?.(e);
  if (e.defaultPrevented) return;
  emit('select', { originalEvent, item, key });
  if (e.defaultPrevented) return;
  applySelection(key, item);
}

const ctx: PfTreeContext = {
  resolveKey,
  isExpanded: (key: string) => expandedSet.value.has(key),
  isSelected,
  isIndeterminate,
  get trailingIcon() {
    return props.trailingIcon;
  },
  get expandedIcon() {
    return props.expandedIcon;
  },
  get collapsedIcon() {
    return props.collapsedIcon;
  },
  get disabled() {
    return props.disabled;
  },
  get ui() {
    return props.ui;
  },
  itemIconSrc: pfTreeItemIconSrc,
  leadingImageAlt: pfTreeLeadingImageAlt,
  leadingIconFor: (item, hasChildren, expanded) =>
    pfTreeLeadingIcon(
      item,
      hasChildren,
      expanded,
      props.expandedIcon,
      props.collapsedIcon
    ),
  trailingChevronFor: (item) => trailingChevron(item),
  onToggleExpand,
  onSelectRow,
};

provide('pfTreeContext', ctx);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() => [
  'pfTree',
  attrs.class,
  props.ui?.root,
  `pfTree_color_${props.color}`,
  `pfTree_size_${props.size}`,
  props.disabled ? 'pfTree_disabled' : null,
  props.virtualize ? 'pfTree_virtualize' : null,
]);

const effectiveNested = computed(() => props.nested && !props.virtualize);

interface FlatRow {
  item: PfTreeItem;
  key: string;
  depth: number;
  hasChildren: boolean;
  path: string;
}

function flattenRows(
  list: readonly PfTreeItem[] | undefined,
  path: string,
  depth: number
): FlatRow[] {
  if (!list?.length) return [];
  const out: FlatRow[] = [];
  list.forEach((item, i) => {
    const p = path ? `${path}/${i}` : String(i);
    const key = resolveKey(item, p);
    const hasChildren = Boolean(item.children?.length);
    out.push({ item, key, depth, hasChildren, path: p });
    if (hasChildren && expandedSet.value.has(key)) {
      out.push(...flattenRows(item.children, p, depth + 1));
    }
  });
  return out;
}

const flatRows = computed(() => flattenRows(props.items, '', 0));

function trailingChevron(item: PfTreeItem): PfIconName {
  return item.trailingIcon ?? props.trailingIcon;
}

function leadingIconFor(
  item: PfTreeItem,
  hasChildren: boolean,
  expanded: boolean
): PfIconName | undefined {
  return pfTreeLeadingIcon(
    item,
    hasChildren,
    expanded,
    props.expandedIcon,
    props.collapsedIcon
  );
}

function mergedUi(item: PfTreeItem): PfTreeItemUi | undefined {
  return { ...props.ui, ...item.ui };
}

function isAsLinkOnlyShape(a: unknown): a is { link: string | Component } {
  if (a == null || typeof a !== 'object') return false;
  const o = a as Record<string, unknown>;
  return (
    'link' in o &&
    Object.keys(o).length === 1 &&
    (typeof o.link === 'string' || typeof o.link === 'object')
  );
}

const resolvedTag = computed(() => {
  const a = props.as;
  if (a == null || a === '') return 'div';
  if (isAsLinkOnlyShape(a)) return 'div';
  return a as string | Component;
});

const resolvedLinkAs = computed(() => {
  if (props.linkAs != null) return props.linkAs;
  const a = props.as;
  if (a != null && typeof a === 'object' && 'link' in (a as object)) {
    return (a as { link: string | Component }).link;
  }
  return undefined;
});
</script>

<template>
  <component
    :is="resolvedTag"
    class="pfTree"
    :class="rootClass"
    role="tree"
    v-bind="passthroughAttrs"
  >
    <PfTreeBranch
      v-if="effectiveNested && items.length"
      :items="items"
      path-prefix=""
      :flat="false"
      :link-as="resolvedLinkAs"
    >
      <template #item-leading="p">
        <slot
          v-if="p.item.slot && slots[`${p.item.slot}-leading`]"
          :name="`${p.item.slot}-leading`"
          v-bind="p"
        />
        <slot v-else name="item-leading" v-bind="p" />
      </template>
      <template #item-label="p">
        <slot
          v-if="p.item.slot && slots[p.item.slot]"
          :name="p.item.slot"
          :item="p.item"
        />
        <slot
          v-else-if="p.item.slot && slots[`${p.item.slot}-label`]"
          :name="`${p.item.slot}-label`"
          v-bind="p"
        />
        <slot v-else name="item-label" v-bind="p" />
      </template>
      <template #item-trailing="p">
        <slot
          v-if="p.item.slot && slots[`${p.item.slot}-trailing`]"
          :name="`${p.item.slot}-trailing`"
          v-bind="p"
        />
        <slot v-else name="item-trailing" v-bind="p" />
      </template>
    </PfTreeBranch>

    <template v-else>
      <div
        v-for="row in flatRows"
        :key="row.key"
        class="pfTree__flatItem"
        :class="[ui?.itemWithChildren, ui?.listWithChildren]"
      >
        <PfTreeRow
          :item-key="row.key"
          :item="row.item"
          :depth="row.depth"
          :flat="true"
          :has-children="row.hasChildren"
          :expanded="ctx.isExpanded(row.key)"
          :selected="ctx.isSelected(row.key)"
          :indeterminate="ctx.isIndeterminate(row.key)"
          :disabled="disabled || Boolean(row.item.disabled)"
          :link-as="resolvedLinkAs"
          :trailing-chevron="trailingChevron(row.item)"
          :leading-icon="
            leadingIconFor(row.item, row.hasChildren, ctx.isExpanded(row.key))
          "
          :leading-image-src="pfTreeItemIconSrc(row.item)"
          :leading-image-alt="pfTreeLeadingImageAlt(row.item)"
          :ui="mergedUi(row.item)"
          @toggle="(e) => ctx.onToggleExpand(row.key, row.item, e)"
          @select="(e) => ctx.onSelectRow(row.key, row.item, e)"
        >
          <template #item-leading="p">
            <slot
              v-if="p.item.slot && slots[`${p.item.slot}-leading`]"
              :name="`${p.item.slot}-leading`"
              v-bind="p"
            />
            <slot v-else name="item-leading" v-bind="p" />
          </template>
          <template #item-label="p">
            <slot
              v-if="p.item.slot && slots[p.item.slot]"
              :name="p.item.slot"
              :item="p.item"
            />
            <slot
              v-else-if="p.item.slot && slots[`${p.item.slot}-label`]"
              :name="`${p.item.slot}-label`"
              v-bind="p"
            />
            <slot v-else name="item-label" v-bind="p" />
          </template>
          <template #item-trailing="p">
            <slot
              v-if="p.item.slot && slots[`${p.item.slot}-trailing`]"
              :name="`${p.item.slot}-trailing`"
              v-bind="p"
            />
            <slot v-else name="item-trailing" v-bind="p" />
          </template>
        </PfTreeRow>
      </div>
    </template>
  </component>
</template>

<style scoped lang="scss">
.pfTree {
  min-width: 0;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  &_virtualize {
    max-height: 20rem;

    overflow-y: auto;
  }

  &_disabled {
    opacity: 0.75;

    pointer-events: none;
  }

  &_size_xs {
    --pf-tree-font-size: var(--pf-font-size-xs);
    --pf-tree-icon-size: var(--pf-icon-size-xs);
    --pf-tree-link-pad-x: 0.5rem;
    --pf-tree-link-pad-y: 0.25rem;
    --pf-tree-row-pad-x: var(--pf-space-xs);
  }

  &_size_sm {
    --pf-tree-font-size: var(--pf-font-size-xs);
    --pf-tree-icon-size: var(--pf-icon-size-sm);
    --pf-tree-link-pad-x: 0.5rem;
    --pf-tree-link-pad-y: 0.3125rem;
    --pf-tree-row-pad-x: var(--pf-space-xs);
  }

  &_size_md {
    --pf-tree-font-size: var(--pf-font-size-sm);
    --pf-tree-icon-size: var(--pf-icon-size-sm);
    --pf-tree-link-pad-x: 0.625rem;
    --pf-tree-link-pad-y: 0.375rem;
    --pf-tree-row-pad-x: var(--pf-space-sm);
  }

  &_size_lg {
    --pf-tree-font-size: var(--pf-font-size-sm);
    --pf-tree-icon-size: var(--pf-icon-size-md);
    --pf-tree-link-pad-x: 0.75rem;
    --pf-tree-link-pad-y: 0.5rem;
    --pf-tree-row-pad-x: var(--pf-space-sm);
  }

  &_size_xl {
    --pf-tree-font-size: var(--pf-font-size-base);
    --pf-tree-icon-size: var(--pf-icon-size-lg);
    --pf-tree-link-pad-x: 0.75rem;
    --pf-tree-link-pad-y: 0.5rem;
    --pf-tree-row-pad-x: var(--pf-space-md);
  }

  &_color_primary {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(
          in srgb,
          var(--pf-color-primary) 14%,
          transparent
        );
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-primary);
      }
    }
  }

  &_color_secondary {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(
          in srgb,
          var(--pf-color-secondary) 14%,
          transparent
        );
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-secondary);
      }
    }
  }

  &_color_success {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(
          in srgb,
          var(--pf-color-success) 16%,
          transparent
        );
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-success);
      }
    }
  }

  &_color_info {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(in srgb, var(--pf-color-info) 14%, transparent);
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-info);
      }
    }
  }

  &_color_warning {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(
          in srgb,
          var(--pf-color-warning) 14%,
          transparent
        );
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-warning);
      }
    }
  }

  &_color_error {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(in srgb, var(--pf-color-error) 14%, transparent);
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-error);
      }
    }
  }

  &_color_neutral {
    :deep(.pfTree__row_selected) {
      &::before {
        background: color-mix(in srgb, var(--pf-color-muted) 14%, transparent);
      }

      .pfTree__link,
      .pfTree__leading,
      .pfTree__expand {
        color: var(--pf-color-text);
      }
    }
  }
}

.pfTree__flatItem {
  min-width: 0;
  box-sizing: border-box;
}
</style>
