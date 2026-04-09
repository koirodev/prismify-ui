import type { PfIconName } from '../../element/PfIcon/paths';
import type { PfTreeItem } from './treeTypes';

export function pfTreeItemIconSrc(item: PfTreeItem): string | undefined {
  const r = item as Record<string, unknown>;
  const src = item.iconSrc ?? item.imageSrc ?? r.imageSrc;
  if (typeof src === 'string' && src.trim() !== '') return src;
  return undefined;
}

export function pfTreeLeadingImageAlt(item: PfTreeItem): string | undefined {
  if (item.iconAlt != null && String(item.iconAlt) !== '') {
    return String(item.iconAlt);
  }
  if (item.label != null && String(item.label) !== '') {
    return String(item.label);
  }
  return undefined;
}

export function pfTreeLeadingIcon(
  item: PfTreeItem,
  hasChildren: boolean,
  expanded: boolean,
  expandedIcon: PfIconName,
  collapsedIcon: PfIconName
): PfIconName | undefined {
  if (pfTreeItemIconSrc(item)) return undefined;
  if (item.icon) return item.icon;
  if (hasChildren) return expanded ? expandedIcon : collapsedIcon;
  return undefined;
}
