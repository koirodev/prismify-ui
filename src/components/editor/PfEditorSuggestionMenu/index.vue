<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import PfIcon from '../../element/PfIcon/index.vue';
import { runEditorHandler } from '../utils/handlers';
import { PF_EDITOR_INJECTION_KEY } from '../utils/injection';
import type {
  PfEditorCustomHandlers,
  PfEditorSuggestionMenuItem,
} from '../utils/types';
import { useEditorMenu } from '../utils/useEditorMenu';

const props = withDefaults(
  defineProps<{
    editor?: Editor;
    handlers?: PfEditorCustomHandlers;
    items?: PfEditorSuggestionMenuItem[] | PfEditorSuggestionMenuItem[][];
    char?: string;
    pluginKey?: string;
    filterFields?: string[];
    limit?: number;
    appendTo?: HTMLElement | (() => HTMLElement);
    options?: Record<string, unknown>;
    ui?: Partial<{
      content: string;
      viewport: string;
      group: string;
      label: string;
      separator: string;
      item: string;
      itemLeadingIcon: string;
      itemWrapper: string;
      itemLabel: string;
      itemDescription: string;
    }>;
  }>(),
  {
    editor: undefined,
    handlers: undefined,
    items: () => [],
    char: '/',
    pluginKey: 'suggestionMenu',
    filterFields: () => ['label', 'description'],
    limit: 9,
    appendTo: undefined,
    options: () => ({}),
    ui: () => ({}),
  }
);

const injected = inject(PF_EDITOR_INJECTION_KEY, null);

const editor = computed(() => props.editor ?? injected?.editor.value);
const handlers = computed<PfEditorCustomHandlers>(
  () => props.handlers ?? injected?.handlers.value ?? {}
);

const menu = useEditorMenu({
  editor: () => editor.value,
  char: props.char,
  items: props.items,
  limit: props.limit,
  filterFields: props.filterFields,
});

function selectItem(item: PfEditorSuggestionMenuItem) {
  if (!editor.value) return;

  if (item.type === 'label' || item.type === 'separator' || item.disabled)
    return;

  if (item.kind) {
    if (menu.range.value) {
      editor.value.chain().focus().deleteRange(menu.range.value).run();
    }
    runEditorHandler(editor.value, handlers.value, item);
  } else if (typeof item.onClick === 'function') {
    item.onClick(new MouseEvent('click'));
  }
  menu.closeMenu();
}

function onKeydown(event: KeyboardEvent) {
  if (!menu.isOpen.value || !menu.activeItem.value) return;
  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault();
    selectItem(menu.activeItem.value);
  }
}

let cleanup: (() => void) | null = null;
watch(
  editor,
  (instance) => {
    cleanup?.();
    cleanup = null;
    if (!instance) return;
    const handler = (event: KeyboardEvent) => onKeydown(event);
    let dom: HTMLElement | null = null;
    try {
      dom = (instance as any).view?.dom ?? null;
    } catch {
      dom = null;
    }
    dom?.addEventListener('keydown', handler);
    cleanup = () => {
      dom?.removeEventListener('keydown', handler);
    };
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  cleanup?.();
  cleanup = null;
});

const groups = computed(() => menu.getFilteredGroups());
</script>

<template>
  <div
    v-if="menu.isOpen.value && groups.length"
    class="pfEditorSuggestionMenu"
    :class="ui?.content"
  >
    <div class="pfEditorSuggestionMenu__viewport" :class="ui?.viewport">
      <template v-for="(group, groupIndex) in groups" :key="groupIndex">
        <div
          v-if="groupIndex > 0"
          class="pfEditorSuggestionMenu__separator"
          :class="ui?.separator"
        />

        <div class="pfEditorSuggestionMenu__group" :class="ui?.group">
          <template
            v-for="(item, itemIndex) in group"
            :key="`${groupIndex}-${itemIndex}`"
          >
            <div
              v-if="item.type === 'label'"
              class="pfEditorSuggestionMenu__label"
              :class="ui?.label"
            >
              {{ item.label }}
            </div>
            <button
              v-else-if="item.type !== 'separator'"
              type="button"
              class="pfEditorSuggestionMenu__item"
              :class="[
                ui?.item,
                menu.activeItem.value === item &&
                  'pfEditorSuggestionMenu__item_active',
              ]"
              :disabled="item.disabled"
              @click="selectItem(item)"
            >
              <span
                v-if="item.icon"
                class="pfEditorSuggestionMenu__itemLeadingIcon"
                :class="ui?.itemLeadingIcon"
              >
                <PfIcon :name="item.icon as any" size="sm" />
              </span>
              <span
                class="pfEditorSuggestionMenu__itemWrapper"
                :class="ui?.itemWrapper"
              >
                <span
                  class="pfEditorSuggestionMenu__itemLabel"
                  :class="ui?.itemLabel"
                >
                  {{ item.label }}
                </span>
                <span
                  v-if="item.description"
                  class="pfEditorSuggestionMenu__itemDescription"
                  :class="ui?.itemDescription"
                >
                  {{ item.description }}
                </span>
              </span>
            </button>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfEditorSuggestionMenu {
  position: absolute;
  top: var(--pf-editor-menu-offset-y);
  left: var(--pf-editor-menu-offset-x);
  z-index: var(--pf-editor-menu-z-index);

  min-width: var(--pf-editor-menu-min-width);
  max-width: var(--pf-editor-menu-max-width);
  max-height: var(--pf-editor-menu-max-height);

  box-shadow: var(--pf-editor-menu-shadow);
  background: var(--pf-editor-menu-surface);
  border: var(--pf-stroke-width) solid var(--pf-editor-border);
  border-radius: var(--pf-radius-md);

  &__viewport {
    max-height: inherit;

    overflow: auto;
  }

  &__group {
    padding: var(--pf-space-xs);
    display: grid;
    gap: 2px;
  }

  &__label {
    padding: 0 var(--pf-space-xs);

    color: var(--pf-editor-muted);
    font-size: var(--pf-font-size-xs);
    font-weight: var(--pf-font-weight-bold);
  }

  &__separator {
    height: var(--pf-stroke-width);

    background: var(--pf-editor-border);
  }

  &__item {
    padding: var(--pf-space-xs);
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: var(--pf-space-xs);

    color: var(--pf-editor-text);
    text-align: start;

    background: transparent;
    border: 0;
    border-radius: var(--pf-radius-sm);

    cursor: pointer;

    &_active,
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--pf-editor-border) 45%, transparent);
    }
  }

  &__itemLeadingIcon {
    margin-top: 1px;

    display: inline-flex;
    align-items: center;
  }

  &__itemWrapper {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__itemLabel {
    font-size: var(--pf-font-size-sm);
  }

  &__itemDescription {
    color: var(--pf-editor-muted);
    font-size: var(--pf-font-size-xs);
  }
}
</style>
