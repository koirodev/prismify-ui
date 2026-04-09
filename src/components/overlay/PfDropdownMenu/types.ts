import type { RouteLocationRaw } from 'vue-router';
import type { PfIconName } from '../../element/PfIcon/paths';
import type {
  PfSelectColor,
  PfSelectOptionAvatarConfig,
} from '../../form/PfSelect/index.vue';

export type PfDropdownMenuSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfDropdownMenuItemType =
  | 'label'
  | 'separator'
  | 'checkbox'
  | 'link';

export interface PfDropdownMenuContent {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
}

export interface PfDropdownMenuItem {
  label?: string;
  description?: string;
  icon?: PfIconName;
  avatar?: PfSelectOptionAvatarConfig;
  kbds?: string[];
  type?: PfDropdownMenuItemType;
  color?: PfSelectColor;
  checked?: boolean;
  disabled?: boolean;
  slot?: string;
  onSelect?: (e: Event) => void;
  onUpdateChecked?: (checked: boolean) => void;
  children?: PfDropdownMenuItem[] | PfDropdownMenuItem[][];
  filter?: boolean | Record<string, unknown>;
  filterFields?: string[];
  ignoreFilter?: boolean;
  to?: RouteLocationRaw;
  target?: string;
  external?: boolean;
  class?: string;
  [key: string]: unknown;
}

export type PfDropdownMenuItemsInput =
  | readonly PfDropdownMenuItem[]
  | readonly (readonly PfDropdownMenuItem[])[];

export type PfDropdownMenuFilter = boolean | Record<string, unknown>;

export interface PfDropdownMenuUi {
  content?: string;
  input?: string;
  empty?: string;
  viewport?: string;
  arrow?: string;
  group?: string;
  label?: string;
  separator?: string;
  item?: string;
  itemLeadingIcon?: string;
  itemLeadingAvatar?: string;
  itemLeadingAvatarSize?: string;
  itemTrailing?: string;
  itemTrailingIcon?: string;
  itemTrailingKbds?: string;
  itemTrailingKbdsSize?: string;
  itemWrapper?: string;
  itemLabel?: string;
  itemDescription?: string;
  itemLabelExternalIcon?: string;
}
