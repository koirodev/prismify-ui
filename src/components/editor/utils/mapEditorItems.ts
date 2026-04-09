import type { Editor } from '@tiptap/vue-3';
import type { PfDropdownMenuItem } from '../../overlay/PfDropdownMenu/types';
import type {
  PfEditorCustomHandlers,
  PfEditorSuggestionMenuItem,
  PfEditorToolbarItem,
} from './types';
import {
  resolveItemActive,
  resolveItemDisabled,
  runEditorHandler,
} from './handlers';

type EditorMappableItem = PfEditorToolbarItem | PfEditorSuggestionMenuItem;

function normalizeGroups<T>(items: T[] | T[][] | undefined): T[][] {
  if (!items?.length) return [];
  if (Array.isArray(items[0])) {
    return items as T[][];
  }
  return [items as T[]];
}

function mapChildren(
  editor: Editor,
  children: EditorMappableItem[] | EditorMappableItem[][] | undefined,
  handlers: PfEditorCustomHandlers
): PfDropdownMenuItem[] | PfDropdownMenuItem[][] | undefined {
  if (!children) return undefined;
  const childGroups = normalizeGroups(children);
  return childGroups.map((group) =>
    group.map((child) => mapEditorItem(editor, child, handlers))
  );
}

export function mapEditorItem(
  editor: Editor,
  item: EditorMappableItem,
  handlers: PfEditorCustomHandlers
): PfDropdownMenuItem {
  const mapped: PfDropdownMenuItem = {
    type: item.type as PfDropdownMenuItem['type'],
    label: item.label,
    description: item.description,
    icon: item.icon as PfDropdownMenuItem['icon'],
    disabled:
      item.disabled ??
      (item.kind ? resolveItemDisabled(editor, handlers, item) : undefined),
    class: item.class,
  };

  if (item.kind) {
    const active = resolveItemActive(editor, handlers, item);
    if (active) {
      mapped.color = (item.activeColor ?? item.color ?? 'primary') as any;
    } else if (item.color) {
      mapped.color = item.color as any;
    }

    mapped.onSelect = (event: Event) => {
      const ok = runEditorHandler(editor, handlers, item);
      if (!ok) {
        event.preventDefault();
      }
    };
  } else if (item.onClick) {
    mapped.onSelect = (event: Event) => {
      item.onClick?.(event as MouseEvent);
    };
  }

  const children = mapChildren(editor, item.items, handlers);
  if (children) {
    mapped.children = children;
  }

  return mapped;
}

export function mapEditorItems(
  editor: Editor,
  items: EditorMappableItem[] | EditorMappableItem[][],
  handlers: PfEditorCustomHandlers
): PfDropdownMenuItem[][] {
  return normalizeGroups(items).map((group) =>
    group.map((item) => mapEditorItem(editor, item, handlers))
  );
}
