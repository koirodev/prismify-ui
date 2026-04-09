import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';

type MenuItem = Record<string, any>;

interface UseEditorMenuOptions<TItem extends MenuItem> {
  editor: () => Editor | null | undefined;
  char: string;
  items: TItem[] | TItem[][];
  limit?: number;
  filterFields?: string[];
  ignoreFilter?: boolean;
}

function normalizeGroups<T>(items: T[] | T[][]): T[][] {
  if (!items.length) return [];
  if (Array.isArray(items[0])) return items as T[][];
  return [items as T[]];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function useEditorMenu<TItem extends MenuItem>(
  options: UseEditorMenuOptions<TItem>
) {
  const isOpen = ref(false);
  const searchTerm = ref('');
  const selectedIndex = ref(0);
  const range = ref<{ from: number; to: number } | null>(null);

  const groups = computed(() => normalizeGroups(options.items));

  const filteredGroups = computed(() => {
    const normalized = groups.value;
    if (options.ignoreFilter || searchTerm.value.trim() === '') {
      return normalized;
    }

    const fields = options.filterFields?.length
      ? options.filterFields
      : ['label'];
    const term = searchTerm.value.toLowerCase().trim();

    return normalized
      .map((group) =>
        group.filter((item) => {
          return fields.some((field) => {
            const raw = item[field];
            if (Array.isArray(raw)) {
              return raw.join(' ').toLowerCase().includes(term);
            }
            return String(raw ?? '')
              .toLowerCase()
              .includes(term);
          });
        })
      )
      .filter((group) => group.length > 0);
  });

  const flatItems = computed(() =>
    filteredGroups.value
      .flat()
      .slice(0, options.limit ?? Number.POSITIVE_INFINITY)
  );

  const activeItem = computed(
    () => flatItems.value[selectedIndex.value] ?? null
  );

  function closeMenu() {
    isOpen.value = false;
    selectedIndex.value = 0;
    range.value = null;
    searchTerm.value = '';
  }

  function detectTrigger(editor: Editor) {
    const { selection, doc } = editor.state;
    if (!selection.empty) {
      closeMenu();
      return;
    }

    const pos = selection.from;
    const maxRead = Math.min(120, pos);
    const textBefore = doc.textBetween(pos - maxRead, pos, '\n', '\0');
    const escapedChar = escapeRegExp(options.char);
    const regex = new RegExp(`(^|\\s)${escapedChar}([\\w-]*)$`);
    const match = textBefore.match(regex);
    if (!match) {
      closeMenu();
      return;
    }

    const query = match[2] ?? '';
    const from = pos - query.length - 1;
    const to = pos;
    range.value = { from, to };
    searchTerm.value = query;
    isOpen.value = true;
    selectedIndex.value = 0;
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen.value || flatItems.value.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % flatItems.value.length;
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex.value =
        (selectedIndex.value - 1 + flatItems.value.length) %
        flatItems.value.length;
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
  }

  function mount(editor: Editor) {
    const update = () => detectTrigger(editor);
    const keydown = (event: KeyboardEvent) => onKeydown(event);
    let dom: HTMLElement | null = null;
    try {
      dom = (editor as any).view?.dom ?? null;
    } catch {
      dom = null;
    }

    editor.on('update', update);
    editor.on('selectionUpdate', update);
    dom?.addEventListener('keydown', keydown);

    return () => {
      editor.off('update', update);
      editor.off('selectionUpdate', update);
      dom?.removeEventListener('keydown', keydown);
    };
  }

  let stop: (() => void) | null = null;

  watch(
    () => options.editor(),
    (editor) => {
      stop?.();
      stop = null;
      closeMenu();
      if (!editor) return;
      stop = mount(editor);
      detectTrigger(editor);
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    stop?.();
    stop = null;
  });

  function replaceTriggerWith(editor: Editor, content: string) {
    if (!range.value) return false;
    editor
      .chain()
      .focus()
      .deleteRange(range.value)
      .insertContent(content)
      .run();
    closeMenu();
    return true;
  }

  function getFilteredGroups() {
    const limit = options.limit ?? Number.POSITIVE_INFINITY;
    let count = 0;
    const next: TItem[][] = [];
    for (const group of filteredGroups.value) {
      const part: TItem[] = [];
      for (const item of group) {
        if (count >= limit) break;
        part.push(item);
        count += 1;
      }
      if (part.length > 0) next.push(part);
      if (count >= limit) break;
    }
    return next;
  }

  return {
    isOpen,
    searchTerm,
    selectedIndex,
    flatItems,
    activeItem,
    range,
    closeMenu,
    replaceTriggerWith,
    getFilteredGroups,
  };
}
