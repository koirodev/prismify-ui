import type { PfIconName } from '../../element/PfIcon/paths';
import type { PfTreeItem, PfTreeUi } from './treeTypes';

export interface PfTreeContext {
  resolveKey: (item: PfTreeItem, path: string) => string;
  isExpanded: (key: string) => boolean;
  isSelected: (key: string) => boolean;
  isIndeterminate: (key: string) => boolean;
  trailingIcon: PfIconName;
  expandedIcon: PfIconName;
  collapsedIcon: PfIconName;
  disabled: boolean;
  ui: PfTreeUi | undefined;
  itemIconSrc: (item: PfTreeItem) => string | undefined;
  leadingImageAlt: (item: PfTreeItem) => string | undefined;
  leadingIconFor: (
    item: PfTreeItem,
    hasChildren: boolean,
    expanded: boolean
  ) => PfIconName | undefined;
  trailingChevronFor: (item: PfTreeItem) => PfIconName;
  onToggleExpand: (key: string, item: PfTreeItem, originalEvent: Event) => void;
  onSelectRow: (key: string, item: PfTreeItem, originalEvent: Event) => void;
}
