<script setup lang="ts">
import type { Component, PropType } from 'vue';
import { inject } from 'vue';
import PfTreeBranch from './PfTreeBranch.vue';
import PfTreeRow from './PfTreeRow.vue';
import type { PfTreeItem, PfTreeItemUi } from './treeTypes';
import type { PfTreeContext } from './treeContext';

const props = defineProps({
  items: {
    type: Array as PropType<readonly PfTreeItem[]>,
    required: true,
  },
  pathPrefix: { type: String, default: '' },
  flat: Boolean,
  linkAs: [String, Object] as PropType<string | Component | undefined>,
});

const ctx = inject<PfTreeContext>('pfTreeContext')!;

function pathForIndex(parent: string, index: number): string {
  return parent ? `${parent}/${index}` : String(index);
}

function itemPath(index: number): string {
  return pathForIndex(props.pathPrefix, index);
}

function keyAt(index: number): string {
  const item = props.items[index];
  if (!item) return '';
  return ctx.resolveKey(item, itemPath(index));
}

function mergedUi(item: PfTreeItem): PfTreeItemUi | undefined {
  return { ...(ctx.ui as PfTreeItemUi | undefined), ...item.ui };
}

/** Explicit slot types to avoid TS7022 on recursive `PfTreeBranch`. */
defineSlots<{
  'item-leading'(props: {
    item: PfTreeItem;
    itemKey: string;
    selected: boolean;
    indeterminate: boolean;
    handleSelect: () => void;
  }): unknown;
  'item-label'(props: {
    item: PfTreeItem;
    itemKey: string;
    selected: boolean;
  }): unknown;
  'item-trailing'(props: {
    item: PfTreeItem;
    itemKey: string;
    selected: boolean;
  }): unknown;
}>();
</script>

<template>
  <ul class="pfTree__list pfTree__list_nested" role="group">
    <li
      v-for="(item, index) in items"
      :key="keyAt(index)"
      class="pfTree__item pfTree__item_nested"
    >
      <PfTreeRow
        :item-key="keyAt(index)"
        :item="item"
        :depth="0"
        :flat="flat"
        :has-children="Boolean(item.children?.length)"
        :expanded="ctx.isExpanded(keyAt(index))"
        :selected="ctx.isSelected(keyAt(index))"
        :indeterminate="ctx.isIndeterminate(keyAt(index))"
        :disabled="ctx.disabled || Boolean(item.disabled)"
        :link-as="linkAs"
        :trailing-chevron="ctx.trailingChevronFor(item)"
        :leading-icon="
          ctx.leadingIconFor(
            item,
            Boolean(item.children?.length),
            ctx.isExpanded(keyAt(index))
          )
        "
        :leading-image-src="ctx.itemIconSrc(item)"
        :leading-image-alt="ctx.leadingImageAlt(item) ?? undefined"
        :ui="mergedUi(item)"
        @toggle="(e) => ctx.onToggleExpand(keyAt(index), item, e)"
        @select="(e) => ctx.onSelectRow(keyAt(index), item, e)"
      >
        <template #item-leading="p">
          <slot name="item-leading" v-bind="p" />
        </template>
        <template #item-label="p">
          <slot name="item-label" v-bind="p" />
        </template>
        <template #item-trailing="p">
          <slot name="item-trailing" v-bind="p" />
        </template>
      </PfTreeRow>

      <div
        v-if="item.children?.length"
        class="pfTree__subtree"
        :class="{
          pfTree__subtree_open: ctx.isExpanded(keyAt(index)),
        }"
        :aria-hidden="ctx.isExpanded(keyAt(index)) ? undefined : 'true'"
        :inert="!ctx.isExpanded(keyAt(index))"
      >
        <div class="pfTree__subtreeInner">
          <PfTreeBranch
            :items="item.children"
            :path-prefix="itemPath(index)"
            :flat="flat"
            :link-as="linkAs"
          >
            <template #item-leading="c">
              <slot name="item-leading" v-bind="c" />
            </template>
            <template #item-label="c">
              <slot name="item-label" v-bind="c" />
            </template>
            <template #item-trailing="c">
              <slot name="item-trailing" v-bind="c" />
            </template>
          </PfTreeBranch>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.pfTree__list_nested {
  border-inline-start: var(--pf-tree-list-child-border);

  margin: 0;
  margin-inline-start: var(--pf-tree-list-child-margin-start);

  padding: 0;
  padding-inline-start: var(--pf-space-sm);

  list-style: none;
}

.pfTree__item_nested {
  margin: 0;
}

.pfTree__subtree {
  display: grid;
  grid-template-rows: 0fr;

  overflow: hidden;

  transition: grid-template-rows var(--pf-tree-expand-duration)
    var(--pf-tree-expand-easing);
}

.pfTree__subtree_open {
  grid-template-rows: 1fr;
}

.pfTree__subtreeInner {
  min-height: 0;

  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .pfTree__subtree {
    transition-duration: 0.01ms;
  }
}
</style>
