import type { RouteLocationRaw } from 'vue-router';
import type { PfIconName } from '../../element/PfIcon/paths';
import type {
  PfSelectColor,
  PfSelectOptionAvatarConfig,
} from '../../form/PfSelect/index.vue';

export type PfContextMenuSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfContextMenuItemType = 'label' | 'separator' | 'checkbox' | 'link';

export interface PfContextMenuItem {
  label?: string;
  icon?: PfIconName;
  avatar?: PfSelectOptionAvatarConfig;
  kbds?: string[];
  type?: PfContextMenuItemType;
  color?: PfSelectColor;
  checked?: boolean;
  disabled?: boolean;
  slot?: string;
  onSelect?: (e: Event) => void;
  onUpdateChecked?: (checked: boolean) => void;
  children?: PfContextMenuItem[] | PfContextMenuItem[][];
  to?: RouteLocationRaw;
  target?: string;
  external?: boolean;
  class?: string;
}

export type PfContextMenuItemsInput =
  | readonly PfContextMenuItem[]
  | readonly (readonly PfContextMenuItem[])[];

export interface PfContextMenuUi {
  content?: string;
  viewport?: string;
  group?: string;
  label?: string;
  separator?: string;
  item?: string;
  itemLeadingIcon?: string;
  itemLeadingAvatar?: string;
  itemTrailing?: string;
  itemTrailingIcon?: string;
  itemTrailingKbds?: string;
  itemTrailingKbdsSize?: string;
  itemLabel?: string;
  itemLabelExternalIcon?: string;
}
