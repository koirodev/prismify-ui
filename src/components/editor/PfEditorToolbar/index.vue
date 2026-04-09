<script setup lang="ts">
import { computed, inject } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { BubbleMenu, FloatingMenu } from '@tiptap/vue-3/menus';
import PfButton from '../../element/PfButton/index.vue';
import PfDropdownMenu from '../../overlay/PfDropdownMenu/index.vue';
import type { PfDropdownMenuContent } from '../../overlay/PfDropdownMenu/types';
import {
  resolveItemActive,
  resolveItemDisabled,
  runEditorHandler,
} from '../utils/handlers';
import { PF_EDITOR_INJECTION_KEY } from '../utils/injection';
import { mapEditorItems } from '../utils/mapEditorItems';
import type {
  PfEditorCustomHandlers,
  PfEditorToolbarItem,
} from '../utils/types';

const props = withDefaults(
  defineProps<{
    editor?: Editor;
    handlers?: PfEditorCustomHandlers;
    items?: PfEditorToolbarItem[] | PfEditorToolbarItem[][];
    layout?: 'fixed' | 'bubble' | 'floating';
    pluginKey?: unknown;
    updateDelay?: number;
    resizeDelay?: number;
    shouldShow?: (...args: any[]) => boolean;
    appendTo?: unknown;
    options?: unknown;
    content?: PfDropdownMenuContent;
    ui?: Partial<{
      root: string;
      base: string;
      group: string;
      separator: string;
    }>;
  }>(),
  {
    editor: undefined,
    handlers: undefined,
    items: () => [],
    layout: 'fixed',
    pluginKey: undefined,
    updateDelay: undefined,
    resizeDelay: undefined,
    shouldShow: undefined,
    appendTo: undefined,
    options: undefined,
    content: () => ({
      side: 'bottom',
      align: 'start',
      sideOffset: 6,
      alignOffset: 0,
    }),
    ui: () => ({}),
  }
);

const injected = inject(PF_EDITOR_INJECTION_KEY, null);

const editor = computed(() => props.editor ?? injected?.editor.value);
const handlers = computed<PfEditorCustomHandlers>(
  () => props.handlers ?? injected?.handlers.value ?? {}
);

const groups = computed(() => {
  const value = props.items ?? [];
  if (!value.length) return [] as PfEditorToolbarItem[][];
  if (Array.isArray(value[0])) return value as PfEditorToolbarItem[][];
  return [value as PfEditorToolbarItem[]];
});

function isDisabled(item: PfEditorToolbarItem): boolean {
  if (!editor.value || !item.kind) return !!item.disabled;
  return (
    item.disabled ?? resolveItemDisabled(editor.value, handlers.value, item)
  );
}

function isActive(item: PfEditorToolbarItem): boolean {
  if (!editor.value || !item.kind) return !!item.active;
  return item.active ?? resolveItemActive(editor.value, handlers.value, item);
}

function handleItemClick(item: PfEditorToolbarItem, event: MouseEvent) {
  if (!editor.value) return;
  if (item.onClick) {
    item.onClick(event);
    return;
  }
  if (!item.kind) return;
  runEditorHandler(editor.value, handlers.value, item);
}

function mappedItems(item: PfEditorToolbarItem) {
  if (!editor.value || !item.items) return [];
  return mapEditorItems(editor.value, item.items, handlers.value);
}
</script>

<template>
  <div v-if="!editor" class="pfEditorToolbar" :class="[ui?.root]">
    <div
      class="pfEditorToolbar__base"
      :class="[ui?.base, `pfEditorToolbar__base_layout_${layout}`]"
    />
  </div>

  <div
    v-else-if="layout === 'fixed'"
    class="pfEditorToolbar"
    :class="[ui?.root]"
  >
    <div
      class="pfEditorToolbar__base"
      :class="[ui?.base, `pfEditorToolbar__base_layout_${layout}`]"
    >
      <template v-for="(group, groupIndex) in groups" :key="groupIndex">
        <span
          v-if="groupIndex > 0"
          class="pfEditorToolbar__separator"
          :class="ui?.separator"
          aria-hidden="true"
        />

        <div class="pfEditorToolbar__group" :class="ui?.group">
          <template
            v-for="(item, itemIndex) in group"
            :key="`${groupIndex}-${itemIndex}`"
          >
            <slot
              v-if="item.slot"
              :name="item.slot"
              :item="item"
              :editor="editor"
              :handlers="handlers"
            />

            <PfDropdownMenu
              v-else-if="item.items?.length"
              :items="mappedItems(item)"
              :content="content"
            >
              <PfButton
                :icon="item.icon as any"
                :label="item.label"
                color="neutral"
                variant="ghost"
                active-variant="soft"
                size="sm"
                :disabled="isDisabled(item)"
                :active="isActive(item)"
              />
            </PfDropdownMenu>

            <PfButton
              v-else
              :icon="item.icon as any"
              :label="item.label"
              :color="item.color ?? 'neutral'"
              :variant="item.variant ?? 'ghost'"
              :active-color="item.activeColor ?? 'primary'"
              :active-variant="item.activeVariant ?? 'soft'"
              :size="item.size ?? 'sm'"
              :loading="item.loading"
              :disabled="isDisabled(item)"
              :active="isActive(item)"
              @click="(event) => handleItemClick(item, event)"
            />
          </template>
        </div>
      </template>
    </div>
  </div>

  <BubbleMenu
    v-else-if="layout === 'bubble'"
    class="pfEditorToolbar pfEditorToolbar_float"
    :editor="editor"
    :plugin-key="pluginKey as any"
    :update-delay="updateDelay"
    :resize-delay="resizeDelay"
    :append-to="appendTo as any"
    :options="options as any"
    :should-show="shouldShow as any"
  >
    <div
      class="pfEditorToolbar__base"
      :class="[ui?.base, `pfEditorToolbar__base_layout_${layout}`]"
    >
      <template v-for="(group, groupIndex) in groups" :key="groupIndex">
        <span
          v-if="groupIndex > 0"
          class="pfEditorToolbar__separator"
          :class="ui?.separator"
          aria-hidden="true"
        />
        <div class="pfEditorToolbar__group" :class="ui?.group">
          <template
            v-for="(item, itemIndex) in group"
            :key="`${groupIndex}-${itemIndex}`"
          >
            <slot
              v-if="item.slot"
              :name="item.slot"
              :item="item"
              :editor="editor"
              :handlers="handlers"
            />
            <PfButton
              v-else
              :icon="item.icon as any"
              :label="item.label"
              :color="item.color ?? 'neutral'"
              :variant="item.variant ?? 'ghost'"
              :active-color="item.activeColor ?? 'primary'"
              :active-variant="item.activeVariant ?? 'soft'"
              :size="item.size ?? 'sm'"
              :loading="item.loading"
              :disabled="isDisabled(item)"
              :active="isActive(item)"
              @click="(event) => handleItemClick(item, event)"
            />
          </template>
        </div>
      </template>
    </div>
  </BubbleMenu>

  <FloatingMenu
    v-else
    class="pfEditorToolbar pfEditorToolbar_float"
    :editor="editor"
    :plugin-key="pluginKey as any"
    :should-show="shouldShow as any"
    :append-to="appendTo as any"
    :options="options as any"
  >
    <div
      class="pfEditorToolbar__base"
      :class="[ui?.base, `pfEditorToolbar__base_layout_${layout}`]"
    >
      <template v-for="(group, groupIndex) in groups" :key="groupIndex">
        <span
          v-if="groupIndex > 0"
          class="pfEditorToolbar__separator"
          :class="ui?.separator"
          aria-hidden="true"
        />
        <div class="pfEditorToolbar__group" :class="ui?.group">
          <template
            v-for="(item, itemIndex) in group"
            :key="`${groupIndex}-${itemIndex}`"
          >
            <slot
              v-if="item.slot"
              :name="item.slot"
              :item="item"
              :editor="editor"
              :handlers="handlers"
            />
            <PfButton
              v-else
              :icon="item.icon as any"
              :label="item.label"
              :color="item.color ?? 'neutral'"
              :variant="item.variant ?? 'ghost'"
              :active-color="item.activeColor ?? 'primary'"
              :active-variant="item.activeVariant ?? 'soft'"
              :size="item.size ?? 'sm'"
              :loading="item.loading"
              :disabled="isDisabled(item)"
              :active="isActive(item)"
              @click="(event) => handleItemClick(item, event)"
            />
          </template>
        </div>
      </template>
    </div>
  </FloatingMenu>
</template>

<style scoped lang="scss">
.pfEditorToolbar {
  &__base {
    display: flex;
    align-items: center;
    gap: var(--pf-editor-toolbar-gap);

    &_layout_bubble,
    &_layout_floating {
      padding: var(--pf-space-xs);

      box-shadow: var(--pf-editor-toolbar-shadow);
      background: var(--pf-editor-toolbar-surface);
      border: var(--pf-stroke-width) solid var(--pf-editor-border);
      border-radius: var(--pf-radius-md);
    }
  }

  &__group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &__separator {
    width: var(--pf-stroke-width);
    height: 1.5rem;

    background: var(--pf-editor-border);
  }
}
</style>
