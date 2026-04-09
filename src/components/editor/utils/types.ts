import type {
  ChainedCommands,
  Editor,
  Extensions,
  JSONContent,
} from '@tiptap/vue-3';
import type { MentionOptions } from '@tiptap/extension-mention';
import type { PlaceholderOptions } from '@tiptap/extension-placeholder';
import type { ImageOptions } from '@tiptap/extension-image';
import type { NodeRangeOptions } from '@tiptap/extension-node-range';
import type { StarterKitOptions } from '@tiptap/starter-kit';

export type PfEditorContentType = 'json' | 'html' | 'markdown';

export type PfEditorAlign = 'left' | 'center' | 'right' | 'justify';

export interface PfEditorHandler<TItem = unknown> {
  canExecute: (editor: Editor, item?: TItem) => boolean;
  execute: (editor: Editor, item?: TItem) => ChainedCommands;
  isActive: (editor: Editor, item?: TItem) => boolean;
  isDisabled?: (editor: Editor, item?: TItem) => boolean;
}

export type PfEditorCustomHandlers = Record<string, PfEditorHandler<any>>;

export interface PfEditorCommandItem {
  kind?: string;
  mark?: string;
  align?: PfEditorAlign;
  level?: number;
  language?: string;
  pos?: number;
}

export interface PfEditorToolbarItem extends PfEditorCommandItem {
  type?: 'label' | 'separator';
  label?: string;
  description?: string;
  icon?: string;
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  activeColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  activeVariant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  slot?: string;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  to?: string;
  download?: boolean;
  class?: string;
  items?: PfEditorToolbarItem[] | PfEditorToolbarItem[][];
  onClick?: (event: MouseEvent) => void;
}

export type PfEditorSuggestionMenuItem = Omit<PfEditorToolbarItem, 'items'> & {
  items?: never;
};

export interface PfEditorMentionMenuItem {
  id?: string | number;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
  avatar?: {
    src?: string;
    alt?: string;
    icon?: string;
    text?: string;
    size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    loading?: 'eager' | 'lazy';
  };
}

export interface PfEditorEmojiMenuItem {
  name: string;
  emoji: string;
  shortcodes?: string[];
  tags?: string[];
  group?: string;
  fallbackImage?: string;
}

export interface PfEditorUi {
  root?: string;
  content?: string;
  base?: string;
}

export interface PfEditorProps {
  modelValue?: null | string | JSONContent | JSONContent[];
  contentType?: PfEditorContentType;
  starterKit?: Partial<StarterKitOptions>;
  placeholder?:
    | string
    | (Partial<PlaceholderOptions> & {
        mode?: 'firstLine' | 'everyLine';
      });
  markdown?:
    | Partial<{
        markedOptions: Record<string, unknown>;
      }>
    | false;
  image?: boolean | Partial<ImageOptions>;
  mention?:
    | boolean
    | Partial<Omit<MentionOptions<any, any>, 'suggestion' | 'suggestions'>>;
  handlers?: PfEditorCustomHandlers;
  /**
   * Required for correct block drag-and-drop (`PfEditorDragHandle` / `@tiptap/extension-drag-handle`).
   * Enabled by default; pass `false` to disable.
   */
  nodeRange?: boolean | Partial<NodeRangeOptions>;
  extensions?: Extensions;
  editable?: boolean;
  autofocus?: boolean | 'start' | 'end' | 'all';
  textDirection?: 'ltr' | 'rtl' | 'auto';
  ui?: PfEditorUi;
}
