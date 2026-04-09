import type { PfIconName } from '../../element/PfIcon/paths';

export type PfTreeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfTreeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfTreeSelectionBehavior = 'replace' | 'toggle';

export type PfTreeItemUi = Partial<{
  item: string;
  listWithChildren: string;
  itemWithChildren: string;
  link: string;
  linkLeadingIcon: string;
  linkLabel: string;
  linkTrailing: string;
  linkTrailingIcon: string;
}>;

/** Root classes (`PfTree`); `item*` — on tree nodes. */
export type PfTreeUi = Partial<{
  root: string;
  item: string;
  listWithChildren: string;
  itemWithChildren: string;
  link: string;
  linkLeadingIcon: string;
  linkLabel: string;
  linkTrailing: string;
  linkTrailingIcon: string;
}>;

export interface PfTreeItem {
  label?: string;
  /** Explicit node key when using `get-key` / `labelKey`. */
  id?: string;
  /** `PfIcon` glyph. */
  icon?: PfIconName;
  /** Image on the left instead of `icon` (URL or data URI). Takes precedence over `icon`. */
  iconSrc?: string;
  /** Label for `iconSrc` (a11y). */
  iconAlt?: string;
  /** Alias for `iconSrc` (like other library components). */
  imageSrc?: string;
  trailingIcon?: PfIconName;
  defaultExpanded?: boolean;
  disabled?: boolean;
  slot?: string;
  children?: PfTreeItem[];
  onToggle?: (e: Event) => void;
  onSelect?: (e: Event) => void;
  class?: unknown;
  ui?: PfTreeItemUi;
}

export interface PfTreeTogglePayload {
  originalEvent: Event;
  item: PfTreeItem;
  key: string;
}

export interface PfTreeSelectPayload {
  originalEvent: Event;
  item: PfTreeItem;
  key: string;
}
