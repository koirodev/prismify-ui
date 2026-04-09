import { reactive } from 'vue';
import type { PfIconName } from '../components/element/PfIcon/paths';

export type PfToastColor =
  | 'error'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'neutral';

export type PfToastOrientation = 'vertical' | 'horizontal';

export type PfToastAction = Partial<{
  label: string;
  color: PfToastColor;
  variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon: PfIconName;
  leading: boolean;
  trailing: boolean;
  ariaLabel: string;
  disabled: boolean;
  loading: boolean;
  type: 'button' | 'submit' | 'reset';
  href: string;
  to: string;
  target: string;
  rel: string;
  download: boolean | string;
  onClick: (event?: MouseEvent) => void;
}>;

export type PfToastCloseButton = Partial<{
  color: PfToastColor;
  variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  class: string;
  ariaLabel: string;
}>;

export type PfToastInput = {
  id?: string;
  title?: string;
  description?: string;
  icon?: PfIconName;
  color?: PfToastColor;
  orientation?: PfToastOrientation;
  close?: boolean | PfToastCloseButton;
  closeIcon?: PfIconName;
  actions?: PfToastAction[];
  progress?: boolean;
  duration?: number;
  onClose?: () => void;
};

export type PfToastRecord = Required<Pick<PfToastInput, 'id'>> &
  Omit<PfToastInput, 'id'> & {
    createdAt: number;
    pulse: number;
  };

const state = reactive<{ items: PfToastRecord[] }>({
  items: [],
});

function makeId() {
  return `pf-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function add(input: PfToastInput): PfToastRecord {
  const nextId = input.id ?? makeId();
  const existing = state.items.find((item) => item.id === nextId);
  if (existing) {
    existing.pulse += 1;
    existing.createdAt = Date.now();
    return existing;
  }
  const record: PfToastRecord = {
    ...input,
    id: nextId,
    createdAt: Date.now(),
    pulse: 0,
  };
  state.items.push(record);
  return record;
}

function update(id: string, patch: Partial<Omit<PfToastRecord, 'id'>>) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return null;
  Object.assign(item, patch);
  return item;
}

function remove(id: string) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  const [removed] = state.items.splice(index, 1);
  removed?.onClose?.();
  return true;
}

function clear() {
  for (const item of state.items) item.onClose?.();
  state.items.splice(0, state.items.length);
}

export function usePfToast() {
  return {
    items: state.items,
    add,
    update,
    remove,
    clear,
  };
}
