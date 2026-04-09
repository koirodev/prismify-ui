import type { InjectionKey, Ref } from 'vue';
import type { PfDashboardStorage } from './storage';
import type { PfDashboardUnit } from './resize';

export interface PfDashboardSidebarApi {
  side: 'left' | 'right';
  open: Ref<boolean>;
  collapsed: Ref<boolean>;
  setOpen: (value: boolean) => void;
  setCollapsed: (value: boolean) => void;
  toggleOpen: () => void;
  toggleCollapsed: () => void;
}

export interface PfDashboardStateEntry {
  size?: number;
  open?: boolean;
  collapsed?: boolean;
}

export interface PfDashboardGroupContext {
  unit: Ref<PfDashboardUnit>;
  storage: Ref<PfDashboardStorage>;
  storageKey: Ref<string>;
  persistent: Ref<boolean>;
  groupRef: Ref<HTMLElement | null>;
  readState: (id: string) => PfDashboardStateEntry;
  writeState: (id: string, entry: PfDashboardStateEntry) => void;
  registerSidebar: (id: string, api: PfDashboardSidebarApi) => void;
  unregisterSidebar: (id: string) => void;
  getSidebarBySide: (side: 'left' | 'right') => PfDashboardSidebarApi | null;
}

export const PF_DASHBOARD_GROUP_KEY: InjectionKey<PfDashboardGroupContext> =
  Symbol('PF_DASHBOARD_GROUP_KEY');
