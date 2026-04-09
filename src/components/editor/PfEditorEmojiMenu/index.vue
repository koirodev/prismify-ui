<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { PF_EDITOR_INJECTION_KEY } from '../utils/injection';
import type { PfEditorEmojiMenuItem } from '../utils/types';
import { useEditorMenu } from '../utils/useEditorMenu';

const props = withDefaults(
  defineProps<{
    editor?: Editor;
    items?: PfEditorEmojiMenuItem[] | PfEditorEmojiMenuItem[][];
    char?: string;
    pluginKey?: string;
    filterFields?: string[];
    limit?: number;
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
    items: () => [],
    char: ':',
    pluginKey: 'emojiMenu',
    filterFields: () => ['name', 'shortcodes', 'tags'],
    limit: 10,
    ui: () => ({}),
  }
);

const injected = inject(PF_EDITOR_INJECTION_KEY, null);
const editor = computed(() => props.editor ?? injected?.editor.value);

const menu = useEditorMenu({
  editor: () => editor.value,
  char: props.char,
  items: props.items,
  limit: props.limit,
  filterFields: props.filterFields,
});

function selectItem(item: PfEditorEmojiMenuItem) {
  if (!editor.value || !menu.range.value) return;

  editor.value
    .chain()
    .focus()
    .deleteRange(menu.range.value)
    .insertContent(`${item.emoji} `)
    .run();

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
    class="pfEditorEmojiMenu"
    :class="ui?.content"
  >
    <div class="pfEditorEmojiMenu__viewport" :class="ui?.viewport">
      <template v-for="(group, groupIndex) in groups" :key="groupIndex">
        <div
          v-if="groupIndex > 0"
          class="pfEditorEmojiMenu__separator"
          :class="ui?.separator"
        />

        <div class="pfEditorEmojiMenu__group" :class="ui?.group">
          <button
            v-for="(item, itemIndex) in group"
            :key="`${groupIndex}-${itemIndex}`"
            type="button"
            class="pfEditorEmojiMenu__item"
            :class="[
              ui?.item,
              menu.activeItem.value === item &&
                'pfEditorEmojiMenu__item_active',
            ]"
            @click="selectItem(item)"
          >
            <span class="pfEditorEmojiMenu__itemEmoji">
              {{ item.emoji }}
            </span>
            <span
              class="pfEditorEmojiMenu__itemWrapper"
              :class="ui?.itemWrapper"
            >
              <span class="pfEditorEmojiMenu__itemLabel" :class="ui?.itemLabel">
                {{ item.name }}
              </span>
              <span
                v-if="item.shortcodes?.length"
                class="pfEditorEmojiMenu__itemDescription"
                :class="ui?.itemDescription"
              >
                :{{ item.shortcodes[0] }}
              </span>
            </span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfEditorEmojiMenu {
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

  &__separator {
    height: var(--pf-stroke-width);

    background: var(--pf-editor-border);
  }

  &__item {
    padding: var(--pf-space-xs);
    width: 100%;
    display: flex;
    align-items: center;
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

  &__itemEmoji {
    width: 1.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 1rem;
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
