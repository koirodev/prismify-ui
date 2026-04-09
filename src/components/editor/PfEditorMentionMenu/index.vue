<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import { PF_EDITOR_INJECTION_KEY } from '../utils/injection';
import type { PfEditorMentionMenuItem } from '../utils/types';
import { useEditorMenu } from '../utils/useEditorMenu';

const props = withDefaults(
  defineProps<{
    editor?: Editor;
    items?: PfEditorMentionMenuItem[] | PfEditorMentionMenuItem[][];
    char?: string;
    pluginKey?: string;
    filterFields?: string[];
    limit?: number;
    ignoreFilter?: boolean;
    searchTerm?: string;
    ui?: Partial<{
      content: string;
      viewport: string;
      group: string;
      label: string;
      separator: string;
      item: string;
      itemLeadingIcon: string;
      itemLeadingAvatar: string;
      itemWrapper: string;
      itemLabel: string;
      itemDescription: string;
    }>;
  }>(),
  {
    editor: undefined,
    items: () => [],
    char: '@',
    pluginKey: 'mentionMenu',
    filterFields: () => ['label', 'description'],
    limit: 7,
    ignoreFilter: false,
    searchTerm: '',
    ui: () => ({}),
  }
);

const emit = defineEmits<{
  'update:searchTerm': [value: string];
}>();

const injected = inject(PF_EDITOR_INJECTION_KEY, null);
const editor = computed(() => props.editor ?? injected?.editor.value);

const menu = useEditorMenu({
  editor: () => editor.value,
  char: props.char,
  items: props.items,
  limit: props.limit,
  filterFields: props.filterFields,
  ignoreFilter: props.ignoreFilter,
});

watch(
  () => menu.searchTerm.value,
  (value) => emit('update:searchTerm', value)
);

function selectItem(item: PfEditorMentionMenuItem) {
  if (!editor.value || item.disabled) return;
  if (!menu.range.value) return;

  editor.value
    .chain()
    .focus()
    .deleteRange(menu.range.value)
    .insertContent([
      {
        type: 'mention',
        attrs: {
          id: item.id ?? item.label,
          label: item.label,
        },
      },
      { type: 'text', text: ' ' },
    ])
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
    class="pfEditorMentionMenu"
    :class="ui?.content"
  >
    <div class="pfEditorMentionMenu__viewport" :class="ui?.viewport">
      <template v-for="(group, groupIndex) in groups" :key="groupIndex">
        <div
          v-if="groupIndex > 0"
          class="pfEditorMentionMenu__separator"
          :class="ui?.separator"
        />

        <div class="pfEditorMentionMenu__group" :class="ui?.group">
          <button
            v-for="(item, itemIndex) in group"
            :key="`${groupIndex}-${itemIndex}`"
            type="button"
            class="pfEditorMentionMenu__item"
            :class="[
              ui?.item,
              menu.activeItem.value === item &&
                'pfEditorMentionMenu__item_active',
            ]"
            :disabled="item.disabled"
            @click="selectItem(item)"
          >
            <span
              v-if="item.avatar"
              class="pfEditorMentionMenu__itemLeadingAvatar"
              :class="ui?.itemLeadingAvatar"
            >
              <PfAvatar
                :src="item.avatar.src"
                :alt="item.avatar.alt"
                :text="item.avatar.text"
                :icon="item.avatar.icon as any"
                :size="item.avatar.size ?? '2xs'"
              />
            </span>
            <span
              v-else-if="item.icon"
              class="pfEditorMentionMenu__itemLeadingIcon"
              :class="ui?.itemLeadingIcon"
            >
              <PfIcon :name="item.icon as any" size="sm" />
            </span>
            <span
              class="pfEditorMentionMenu__itemWrapper"
              :class="ui?.itemWrapper"
            >
              <span
                class="pfEditorMentionMenu__itemLabel"
                :class="ui?.itemLabel"
              >
                {{ item.label }}
              </span>
              <span
                v-if="item.description"
                class="pfEditorMentionMenu__itemDescription"
                :class="ui?.itemDescription"
              >
                {{ item.description }}
              </span>
            </span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfEditorMentionMenu {
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
