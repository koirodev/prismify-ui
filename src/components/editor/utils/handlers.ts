import type { Editor } from '@tiptap/vue-3';
import { TextSelection } from '@tiptap/pm/state';
import type {
  PfEditorCommandItem,
  PfEditorCustomHandlers,
  PfEditorHandler,
} from './types';

function resolvePos(editor: Editor, item?: PfEditorCommandItem): number {
  if (typeof item?.pos === 'number') {
    return item.pos;
  }
  return editor.state.selection.from;
}

function resolveNodeRange(
  editor: Editor,
  item?: PfEditorCommandItem
): { from: number; to: number } | null {
  const pos = resolvePos(editor, item);
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return null;
  return { from: pos, to: pos + node.nodeSize };
}

function isSelectionEmpty(editor: Editor): boolean {
  return editor.state.selection.empty;
}

const defaultHandlers: Record<string, PfEditorHandler<PfEditorCommandItem>> = {
  mark: {
    canExecute: (editor, item) =>
      item?.mark != null &&
      editor
        .can()
        .chain()
        .focus()
        .toggleMark(item.mark as any)
        .run(),
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .toggleMark((item?.mark ?? 'bold') as any),
    isActive: (editor, item) =>
      item?.mark != null ? editor.isActive(item.mark as any) : false,
  },
  textAlign: {
    canExecute: (editor, item) =>
      item?.align != null &&
      (editor.can().chain().focus() as any).setTextAlign(item.align).run(),
    execute: (editor, item) =>
      (editor.chain().focus() as any).setTextAlign(item?.align ?? 'left'),
    isActive: (editor, item) =>
      item?.align != null ? editor.isActive({ textAlign: item.align }) : false,
  },
  heading: {
    canExecute: (editor, item) =>
      typeof item?.level === 'number' &&
      editor
        .can()
        .chain()
        .focus()
        .toggleHeading({ level: item.level as any })
        .run(),
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .toggleHeading({ level: (item?.level ?? 1) as any }),
    isActive: (editor, item) =>
      typeof item?.level === 'number'
        ? editor.isActive('heading', { level: item.level })
        : false,
  },
  link: {
    canExecute: (editor) =>
      editor.can().chain().focus().extendMarkRange('link').run(),
    execute: (editor) =>
      editor
        .chain()
        .focus()
        .command(({ chain }) => {
          const active = editor.isActive('link');
          const nextHref = globalThis.prompt?.(
            active ? 'Edit link URL' : 'Insert link URL',
            editor.getAttributes('link').href ?? ''
          );

          if (!nextHref) {
            return chain().extendMarkRange('link').unsetLink().run();
          }

          return chain()
            .extendMarkRange('link')
            .setLink({ href: nextHref })
            .run();
        }),
    isActive: (editor) => editor.isActive('link'),
  },
  image: {
    canExecute: (editor) =>
      editor.can().chain().focus().setImage({ src: '' }).run(),
    execute: (editor) =>
      editor
        .chain()
        .focus()
        .command(({ chain }) => {
          const src = globalThis.prompt?.('Image URL');
          if (!src) return false;
          return chain().setImage({ src }).run();
        }),
    isActive: (editor) => editor.isActive('image'),
  },
  imageUpload: {
    canExecute: (editor) =>
      editor.can().chain().focus().insertContent({ type: 'imageUpload' }).run(),
    execute: (editor) =>
      editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor) => editor.isActive('imageUpload'),
  },
  blockquote: {
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBlockquote().run(),
    execute: (editor) => editor.chain().focus().toggleBlockquote(),
    isActive: (editor) => editor.isActive('blockquote'),
  },
  bulletList: {
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBulletList().run(),
    execute: (editor) => editor.chain().focus().toggleBulletList(),
    isActive: (editor) => editor.isActive('bulletList'),
  },
  orderedList: {
    canExecute: (editor) =>
      editor.can().chain().focus().toggleOrderedList().run(),
    execute: (editor) => editor.chain().focus().toggleOrderedList(),
    isActive: (editor) => editor.isActive('orderedList'),
  },
  taskList: {
    canExecute: (editor) => editor.can().chain().focus().toggleTaskList().run(),
    execute: (editor) => editor.chain().focus().toggleTaskList(),
    isActive: (editor) => editor.isActive('taskList'),
  },
  codeBlock: {
    canExecute: (editor) =>
      editor.can().chain().focus().toggleCodeBlock().run(),
    execute: (editor) => editor.chain().focus().toggleCodeBlock(),
    isActive: (editor) => editor.isActive('codeBlock'),
  },
  horizontalRule: {
    canExecute: (editor) =>
      editor.can().chain().focus().setHorizontalRule().run(),
    execute: (editor) => editor.chain().focus().setHorizontalRule(),
    isActive: () => false,
  },
  paragraph: {
    canExecute: (editor) => editor.can().chain().focus().setParagraph().run(),
    execute: (editor) => editor.chain().focus().setParagraph(),
    isActive: (editor) => editor.isActive('paragraph'),
  },
  undo: {
    canExecute: (editor) => editor.can().chain().focus().undo().run(),
    execute: (editor) => editor.chain().focus().undo(),
    isActive: () => false,
  },
  redo: {
    canExecute: (editor) => editor.can().chain().focus().redo().run(),
    execute: (editor) => editor.chain().focus().redo(),
    isActive: () => false,
  },
  clearFormatting: {
    canExecute: (editor) => editor.isEditable,
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .command(({ tr, state, dispatch }) => {
          const range = resolveNodeRange(editor, item);
          if (range) {
            tr.setSelection(TextSelection.near(state.doc.resolve(range.from)));
          }
          if (dispatch) dispatch(tr);
          return true;
        })
        .unsetAllMarks()
        .clearNodes(),
    isActive: () => false,
  },
  duplicate: {
    canExecute: (editor, item) => resolveNodeRange(editor, item) != null,
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const pos = resolvePos(editor, item);
          const node = editor.state.doc.nodeAt(pos);
          if (!node) return false;
          tr.insert(pos + node.nodeSize, node.copy(node.content));
          editor.view.dispatch(tr);
          return true;
        }),
    isActive: () => false,
  },
  delete: {
    canExecute: (editor, item) => resolveNodeRange(editor, item) != null,
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const range = resolveNodeRange(editor, item);
          if (!range) return false;
          tr.deleteRange(range.from, range.to);
          editor.view.dispatch(tr);
          return true;
        }),
    isActive: () => false,
  },
  moveUp: {
    canExecute: (editor, item) => {
      const pos = resolvePos(editor, item);
      const offset = pos - 1;
      let can = false;
      editor.state.doc.forEach((_, blockOffset) => {
        if (blockOffset === offset) can = blockOffset > 0;
      });
      return can;
    },
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const pos = resolvePos(editor, item);
          const targetOffset = pos - 1;
          const blocks: Array<{ offset: number; size: number }> = [];
          editor.state.doc.forEach((node, offset) => {
            blocks.push({ offset, size: node.nodeSize });
          });
          const currentIndex = blocks.findIndex(
            (entry) => entry.offset === targetOffset
          );
          if (currentIndex <= 0) return false;
          const current = blocks[currentIndex];
          const previous = blocks[currentIndex - 1];
          const node = editor.state.doc.nodeAt(current.offset + 1);
          if (!node) return false;
          tr.delete(current.offset + 1, current.offset + 1 + current.size);
          tr.insert(previous.offset + 1, node);
          editor.view.dispatch(tr);
          return true;
        }),
    isActive: () => false,
  },
  moveDown: {
    canExecute: (editor, item) => {
      const pos = resolvePos(editor, item);
      const offset = pos - 1;
      const blocks: number[] = [];
      editor.state.doc.forEach((_, blockOffset) => {
        blocks.push(blockOffset);
      });
      const index = blocks.findIndex((value) => value === offset);
      return index >= 0 && index < blocks.length - 1;
    },
    execute: (editor, item) =>
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const pos = resolvePos(editor, item);
          const targetOffset = pos - 1;
          const blocks: Array<{ offset: number; size: number }> = [];
          editor.state.doc.forEach((node, offset) => {
            blocks.push({ offset, size: node.nodeSize });
          });
          const currentIndex = blocks.findIndex(
            (entry) => entry.offset === targetOffset
          );
          if (currentIndex < 0 || currentIndex >= blocks.length - 1)
            return false;
          const current = blocks[currentIndex];
          const next = blocks[currentIndex + 1];
          const node = editor.state.doc.nodeAt(current.offset + 1);
          if (!node) return false;
          tr.delete(current.offset + 1, current.offset + 1 + current.size);
          tr.insert(next.offset + 1 + next.size - current.size, node);
          editor.view.dispatch(tr);
          return true;
        }),
    isActive: () => false,
  },
  suggestion: {
    canExecute: (editor) => editor.isEditable,
    execute: (editor, item) =>
      editor.chain().focus().insertContentAt(resolvePos(editor, item), '/'),
    isActive: () => false,
  },
  mention: {
    canExecute: (editor) => editor.isEditable,
    execute: (editor, item) =>
      editor.chain().focus().insertContentAt(resolvePos(editor, item), '@'),
    isActive: () => false,
  },
  emoji: {
    canExecute: (editor) => editor.isEditable,
    execute: (editor, item) =>
      editor.chain().focus().insertContentAt(resolvePos(editor, item), ':'),
    isActive: () => false,
  },
};

export function createEditorHandlers(
  customHandlers?: PfEditorCustomHandlers
): PfEditorCustomHandlers {
  return {
    ...defaultHandlers,
    ...(customHandlers ?? {}),
  };
}

export function runEditorHandler(
  editor: Editor,
  handlers: PfEditorCustomHandlers,
  item: PfEditorCommandItem
): boolean {
  const kind = item.kind;
  if (!kind) return false;
  const handler = handlers[kind];
  if (!handler) return false;
  if (!handler.canExecute(editor, item)) return false;
  if (handler.isDisabled?.(editor, item)) return false;
  return handler.execute(editor, item).run();
}

export function resolveItemDisabled(
  editor: Editor,
  handlers: PfEditorCustomHandlers,
  item: PfEditorCommandItem
): boolean {
  if (!item.kind) return false;
  const handler = handlers[item.kind];
  if (!handler) return false;
  if (!handler.canExecute(editor, item)) return true;
  return handler.isDisabled?.(editor, item) ?? false;
}

export function resolveItemActive(
  editor: Editor,
  handlers: PfEditorCustomHandlers,
  item: PfEditorCommandItem
): boolean {
  if (!item.kind) return false;
  const handler = handlers[item.kind];
  if (!handler) return !!(item as { active?: boolean }).active;
  return handler.isActive(editor, item);
}

export function shouldApplyInlineHandler(editor: Editor): boolean {
  return !isSelectionEmpty(editor) || editor.isActive('link');
}
