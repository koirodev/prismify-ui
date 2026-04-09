<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  computed,
  useSlots,
  type Component,
  type PropType,
  type Slot,
  type VNode,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import type { PfTreeItem, PfTreeItemUi } from './treeTypes';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  itemKey: { type: String, required: true },
  item: { type: Object as PropType<PfTreeItem>, required: true },
  depth: { type: Number, default: 0 },
  flat: Boolean,
  hasChildren: Boolean,
  expanded: Boolean,
  selected: Boolean,
  indeterminate: Boolean,
  disabled: Boolean,
  linkAs: [String, Object] as PropType<string | Component | undefined>,
  trailingChevron: { type: String as PropType<PfIconName>, required: true },
  leadingIcon: String as PropType<PfIconName | undefined>,
  leadingImageSrc: String as PropType<string | undefined>,
  leadingImageAlt: String as PropType<string | undefined>,
  ui: Object as PropType<PfTreeItemUi | undefined>,
});

const emit = defineEmits<{
  toggle: [e: MouseEvent];
  select: [e: MouseEvent];
}>();

const slots = useSlots();

function vnodeHasRenderableContent(n: VNode | undefined | null): boolean {
  if (!n) return false;
  if (n.type === Comment) return false;
  if (n.type === Text) {
    const c = n.children;
    if (typeof c === 'string' && c.trim() === '') return false;
    return true;
  }
  if (n.type === Fragment) {
    const ch = n.children;
    if (ch == null) return false;
    if (Array.isArray(ch)) {
      return ch.some(
        (x) =>
          typeof x === 'object' &&
          x != null &&
          vnodeHasRenderableContent(x as VNode)
      );
    }
    if (typeof ch === 'string') return ch.trim() !== '';
    return false;
  }
  return true;
}

function slotHasRenderableContent(
  fn: Slot | undefined,
  slotProps?: unknown
): boolean {
  if (typeof fn !== 'function') return false;
  const nodes = fn(slotProps);
  if (!nodes?.length) return false;
  return nodes.some((n) => vnodeHasRenderableContent(n));
}

const leadingSlotProps = computed(() => ({
  item: props.item,
  itemKey: props.itemKey,
  selected: props.selected,
  indeterminate: props.indeterminate,
  handleSelect: handleSelectFromSlot,
}));

const hasCustomLeadingSlot = computed(() =>
  slotHasRenderableContent(slots['item-leading'], leadingSlotProps.value)
);

const showDefaultLeadingVisual = computed(() => {
  if (hasCustomLeadingSlot.value) return false;
  const src = props.leadingImageSrc?.trim();
  if (src) return true;
  return Boolean(props.leadingIcon);
});

const resolvedLink = computed(() => props.linkAs ?? 'button');

const rowStyle = computed(() => {
  if (!props.flat) return undefined;
  return {
    paddingInlineStart: `calc(${props.depth} * var(--pf-tree-indent))`,
  };
});

function onExpandClick(e: MouseEvent) {
  emit('toggle', e);
}

function onSelectClick(e: MouseEvent) {
  if (props.disabled) return;
  emit('select', e);
}

function handleSelectFromSlot() {
  if (props.disabled) return;
  emit('select', new MouseEvent('click', { bubbles: true }));
}

const itemClass = computed(() => props.item.class);

const leadingImgAlt = computed(() => props.leadingImageAlt ?? '');
</script>

<template>
  <div
    class="pfTree__row"
    :class="[
      ui?.item,
      itemClass,
      { pfTree__row_selected: selected, pfTree__row_disabled: disabled },
    ]"
    role="presentation"
    :style="rowStyle"
  >
    <span class="pfTree__leading" :class="ui?.linkLeadingIcon">
      <slot
        name="item-leading"
        :item="item"
        :item-key="itemKey"
        :selected="selected"
        :indeterminate="indeterminate"
        :handle-select="handleSelectFromSlot"
      />
      <img
        v-if="showDefaultLeadingVisual && leadingImageSrc?.trim()"
        class="pfTree__leadingImg"
        :src="leadingImageSrc"
        :alt="leadingImgAlt"
        draggable="false"
      />
      <PfIcon
        v-else-if="showDefaultLeadingVisual && leadingIcon"
        :name="leadingIcon"
        :size="'sm'"
      />
    </span>

    <component
      :is="resolvedLink"
      class="pfTree__link"
      :class="ui?.link"
      v-bind="resolvedLink === 'button' ? { type: 'button' } : {}"
      :disabled="disabled"
      role="treeitem"
      :aria-selected="selected ? true : undefined"
      :data-pf-tree-key="itemKey"
      @click="onSelectClick"
    >
      <span class="pfTree__label" :class="ui?.linkLabel">
        <slot
          name="item-label"
          :item="item"
          :item-key="itemKey"
          :selected="selected"
        >
          {{ item.label }}
        </slot>
      </span>
    </component>

    <button
      v-if="hasChildren"
      type="button"
      class="pfTree__expand pfTree__expand_trailing"
      :class="ui?.linkTrailingIcon"
      :disabled="disabled"
      :aria-expanded="expanded"
      :aria-label="expanded ? 'Collapse' : 'Expand'"
      @click.stop="onExpandClick"
    >
      <PfIcon
        class="pfTree__chevron"
        :class="{ pfTree__chevron_expanded: expanded }"
        :name="trailingChevron"
        :size="'sm'"
      />
    </button>

    <span class="pfTree__trailing" :class="ui?.linkTrailing">
      <slot
        name="item-trailing"
        :item="item"
        :item-key="itemKey"
        :selected="selected"
      />
    </span>
  </div>
</template>

<style scoped lang="scss">
.pfTree__row {
  position: relative;

  padding-inline: var(--pf-tree-row-pad-x);
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: var(--pf-tree-row-gap);
  box-sizing: border-box;

  border-radius: var(--pf-radius-sm);

  transition:
    color var(--pf-tree-transition-duration) var(--pf-tree-transition-easing),
    opacity var(--pf-tree-transition-duration) var(--pf-tree-transition-easing);

  &::before {
    content: '';

    inset: 0;
    position: absolute;
    z-index: 0;

    background: transparent;
    border-radius: inherit;

    transition: background var(--pf-tree-transition-duration)
      var(--pf-tree-transition-easing);

    pointer-events: none;
  }

  &:not(.pfTree__row_disabled):not(.pfTree__row_selected):hover::before {
    background: var(--pf-tree-row-hover-bg);
  }
}

.pfTree__leading {
  position: relative;
  z-index: 1;

  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--pf-tree-row-gap);

  color: var(--pf-tree-leading-color);

  transition: color var(--pf-tree-transition-duration)
    var(--pf-tree-transition-easing);
}

.pfTree__leadingImg {
  width: var(--pf-tree-icon-size);
  height: var(--pf-tree-icon-size);
  flex-shrink: 0;
  object-fit: contain;

  border-radius: var(--pf-radius-xs);
}

.pfTree__link {
  position: relative;
  z-index: 1;

  padding: var(--pf-tree-link-pad-y) var(--pf-tree-link-pad-x);
  min-width: 0;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  gap: var(--pf-tree-row-gap);

  color: var(--pf-tree-link-color);
  font: inherit;
  font-size: var(--pf-tree-font-size);
  line-height: var(--pf-tree-line-height);
  text-align: start;

  background: transparent;
  border: none;
  border-radius: var(--pf-radius-sm);

  transition: color var(--pf-tree-transition-duration)
    var(--pf-tree-transition-easing);

  cursor: pointer;

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    outline: none;
  }

  &:disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }
}

.pfTree__label {
  min-width: 0;
  flex: 1 1 auto;

  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfTree__expand {
  position: relative;
  z-index: 1;

  padding: var(--pf-tree-link-pad-y) var(--pf-tree-link-pad-x);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  color: var(--pf-tree-chevron-color);

  background: none;
  border: none;

  transition: color var(--pf-tree-transition-duration)
    var(--pf-tree-transition-easing);

  cursor: pointer;

  &:disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    border-radius: var(--pf-radius-sm);
    outline: none;
  }

  &_trailing {
    margin-inline-start: auto;
  }
}

.pfTree__chevron {
  width: var(--pf-tree-icon-size);
  height: var(--pf-tree-icon-size);

  transition: transform var(--pf-tree-chevron-rotate-duration)
    var(--pf-tree-chevron-rotate-easing);

  &_expanded {
    transform: rotate(180deg);
  }
}

.pfTree__trailing {
  position: relative;
  z-index: 1;

  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--pf-tree-row-gap);
}
</style>
