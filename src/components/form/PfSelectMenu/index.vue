<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  ref,
  shallowRef,
  useId,
  useSlots,
  watch,
  watchEffect,
} from 'vue';
import PfInput from '../PfInput/index.vue';
import PfSelect from '../PfSelect/index.vue';
import type {
  PfSelectColor,
  PfSelectModelValue,
  PfSelectOption,
  PfSelectOptionAvatarConfig,
  PfSelectOptionGroups,
  PfSelectSize,
  PfSelectUi,
  PfSelectVariant,
} from '../PfSelect/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfSelectMenuPrimitive = string | number | boolean;

export interface PfSelectMenuItemObject {
  label?: string;
  value?: unknown;
  disabled?: boolean;
  icon?: PfIconName;
  imageSrc?: string;
  imageAlt?: string;
  avatar?: PfSelectOptionAvatarConfig;
  chip?: PfSelectOption['chip'];
  selectedIcon?: PfIconName | null;
  type?: 'label' | 'separator' | 'item';
  [key: string]: unknown;
}

export type PfSelectMenuItem = PfSelectMenuPrimitive | PfSelectMenuItemObject;

export type PfSelectMenuItems =
  | readonly PfSelectMenuItem[]
  | readonly (readonly PfSelectMenuItem[])[];

export type PfSelectMenuModelValue = unknown | unknown[] | undefined;

export interface PfSelectMenuSearchInputProps {
  placeholder?: string;
  icon?: PfIconName;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost' | 'none';
}

export interface PfSelectMenuUi extends PfSelectUi {
  search?: string;
}

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    form?: string;
    items?: PfSelectMenuItems;
    modelValue?: PfSelectMenuModelValue;
    defaultValue?: PfSelectMenuModelValue;
    placeholder?: string;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
    highlight?: boolean;
    color?: PfSelectColor;
    variant?: PfSelectVariant;
    size?: PfSelectSize;
    valueKey?: string;
    labelKey?: string;
    descriptionKey?: string;
    filterFields?: string[];
    ignoreFilter?: boolean;
    searchInput?: boolean | PfSelectMenuSearchInputProps;
    searchTerm?: string;
    resetSearchTermOnBlur?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    clearable?: boolean;
    menuGap?: number;
    chevronIcon?: PfIconName;
    selectedOptionIcon?: PfIconName | null;
    leadingIcon?: PfIconName;
    leadingAvatar?: PfSelectOptionAvatarConfig;
    loading?: boolean;
    loadingIcon?: PfIconName;
    allowEmptyPanel?: boolean;
    /** Text when search returns no results (empty `panelEmpty` slot overrides). */
    emptyText?: string;
    /** Per-character animation in the search field (like PfInput). */
    animatedInput?: boolean;
    by?: string | ((a: unknown, b: unknown) => boolean);
    ui?: PfSelectMenuUi;
  }>(),
  {
    items: () => [],
    labelKey: 'label',
    descriptionKey: 'description',
    multiple: false,
    disabled: false,
    required: false,
    highlight: false,
    color: 'primary',
    variant: 'outline',
    size: 'md',
    ignoreFilter: false,
    searchInput: true,
    resetSearchTermOnBlur: true,
    clearable: true,
    menuGap: 8,
    loading: false,
    animatedInput: true,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: PfSelectMenuModelValue];
  'update:open': [value: boolean];
  'update:search-term': [value: string];
  change: [event: Event];
  blur: [event: FocusEvent];
}>();

const modelBound = usePfVModelBound();
const localModel = ref<PfSelectMenuModelValue>(props.defaultValue);

const userModel = computed<PfSelectMenuModelValue>({
  get: () => (modelBound.value ? props.modelValue : localModel.value),
  set: (v) => {
    if (modelBound.value) {
      emit('update:modelValue', v);
    } else {
      localModel.value = v;
    }
  },
});

const searchTermBound = computed(() => {
  const p = getCurrentInstance()?.vnode.props as
    | Record<string, unknown>
    | undefined;
  return (
    p != null &&
    (typeof p['onUpdate:searchTerm'] === 'function' ||
      typeof p['onUpdateSearchTerm'] === 'function')
  );
});

const localSearchTerm = ref(props.searchTerm ?? '');

const searchTermWritable = computed({
  get: () =>
    searchTermBound.value ? (props.searchTerm ?? '') : localSearchTerm.value,
  set: (v: string) => {
    emit('update:search-term', v);
    if (!searchTermBound.value) {
      localSearchTerm.value = v;
    }
  },
});

watch(
  () => props.searchTerm,
  (s) => {
    if (searchTermBound.value && s !== undefined) {
      localSearchTerm.value = s;
    }
  }
);

const localOpen = ref(!!props.defaultOpen);

watch(
  () => props.defaultOpen,
  (d) => {
    if (props.open === undefined && d != null) {
      localOpen.value = !!d;
    }
  },
  { immediate: true }
);

const mergedOpen = computed(() =>
  props.open !== undefined ? props.open : localOpen.value
);

function setOpen(v: boolean) {
  emit('update:open', v);
  if (props.open === undefined) {
    localOpen.value = v;
  }
}

function onSelectMenuOpen(v: boolean) {
  setOpen(v);
}

type PfSelectVm = InstanceType<typeof PfSelect> & {
  open?: () => void;
  close?: () => void;
};

watch(mergedOpen, (o, prev) => {
  if (prev === true && o === false && props.resetSearchTermOnBlur !== false) {
    searchTermWritable.value = '';
  }
});

const autoId = useId();
const listId = computed(() => props.id ?? autoId);
const searchInputId = computed(() => `${listId.value}-search`);

let objectKeySeq = 0;
function nextObjectKey(): string {
  objectKeySeq += 1;
  return `__pfSelectMenu_o_${objectKeySeq}`;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isSeparatorItem(item: unknown): boolean {
  return isRecord(item) && item.type === 'separator';
}

function isLabelItem(item: unknown): boolean {
  return isRecord(item) && item.type === 'label';
}

function isNestedItems(
  x: readonly unknown[]
): x is readonly (readonly PfSelectMenuItem[])[] {
  return x.length > 0 && Array.isArray(x[0]);
}

function sameUser(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (props.by) {
    if (typeof props.by === 'function') return props.by(a, b);
    if (isRecord(a) && isRecord(b)) {
      return a[props.by] === b[props.by];
    }
  }
  if (a == null || b == null) return false;
  if (typeof a === 'object' && typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return String(a) === String(b);
}

interface NormalizedEntry {
  option: PfSelectOption;
  raw: unknown;
  searchBlob: string;
}

function primitiveLabel(v: PfSelectMenuPrimitive): string {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

function normalizeOne(raw: PfSelectMenuItem): NormalizedEntry | null {
  if (isSeparatorItem(raw) || isLabelItem(raw)) {
    return null;
  }

  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    const v = raw as PfSelectMenuPrimitive;
    return {
      raw: v,
      option: {
        value: typeof v === 'boolean' ? (v ? '__pf_bool_t' : '__pf_bool_f') : v,
        label: primitiveLabel(v),
      },
      searchBlob: primitiveLabel(v).toLowerCase(),
    };
  }

  if (!isRecord(raw)) return null;

  const label = String(raw[props.labelKey] ?? raw.label ?? '');
  const desc = raw[props.descriptionKey];
  const descStr = desc !== undefined && desc !== null ? String(desc) : '';

  let innerValue: string | number;
  const storedRaw: unknown = raw;

  if (props.valueKey !== undefined && raw[props.valueKey] !== undefined) {
    const vk = raw[props.valueKey];
    if (typeof vk === 'string' || typeof vk === 'number') {
      innerValue = vk;
    } else {
      innerValue = nextObjectKey();
    }
  } else if (typeof raw.value === 'string' || typeof raw.value === 'number') {
    innerValue = raw.value;
  } else {
    innerValue = nextObjectKey();
  }

  const opt: PfSelectOption = {
    value: innerValue,
    label: label || String(innerValue),
    disabled: !!raw.disabled,
    icon: raw.icon as PfIconName | undefined,
    imageSrc: raw.imageSrc as string | undefined,
    imageAlt: raw.imageAlt as string | undefined,
    avatar: raw.avatar as PfSelectOptionAvatarConfig | undefined,
    chip: raw.chip,
    selectedIcon: raw.selectedIcon as PfIconName | null | undefined,
  };

  const blob = [label, descStr].join(' ').toLowerCase();

  return {
    option: opt,
    raw: storedRaw,
    searchBlob: blob,
  };
}

function splitFlatBySeparators(
  flat: readonly PfSelectMenuItem[]
): PfSelectMenuItem[][] {
  const groups: PfSelectMenuItem[][] = [];
  let cur: PfSelectMenuItem[] = [];
  for (const item of flat) {
    if (isSeparatorItem(item)) {
      if (cur.length) groups.push(cur);
      cur = [];
    } else {
      cur.push(item);
    }
  }
  if (cur.length) groups.push(cur);
  return groups.length ? groups : [[]];
}

const normalizedGroups = computed((): NormalizedEntry[][] => {
  const items = props.items ?? [];
  const rawGroups: readonly PfSelectMenuItem[][] = Array.isArray(items)
    ? isNestedItems(items)
      ? items
      : splitFlatBySeparators(items as PfSelectMenuItem[])
    : [];

  return rawGroups.map((g) =>
    g
      .map((it) => normalizeOne(it))
      .filter((x): x is NormalizedEntry => x != null)
  );
});

const flatEntries = computed((): NormalizedEntry[] =>
  normalizedGroups.value.flat()
);

const optionGroupsForSelect = computed((): PfSelectOptionGroups | undefined => {
  const gr = normalizedGroups.value;
  if (gr.length <= 1) {
    return undefined;
  }
  return gr.map((g) => g.map((e) => e.option));
});

const optionsForSelect = computed((): PfSelectOption[] => {
  if (optionGroupsForSelect.value) {
    return [];
  }
  return flatEntries.value.map((e) => e.option);
});

const filterKeys = computed((): string[] => {
  if (props.filterFields?.length) return [...props.filterFields];
  return [props.labelKey];
});

function fieldBlob(raw: unknown, key: string): string {
  if (raw == null) return '';
  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    return key === props.labelKey
      ? primitiveLabel(raw as PfSelectMenuPrimitive)
      : '';
  }
  if (!isRecord(raw)) return '';
  const v = raw[key];
  if (v === undefined || v === null) return '';
  return String(v);
}

function optionFilterResolved(index: number, _opt: PfSelectOption): boolean {
  const e = flatEntries.value[index];
  if (!e) return true;
  if (props.ignoreFilter) return true;
  const needle = searchTermWritable.value.trim().toLowerCase();
  if (!needle) return true;
  for (const key of filterKeys.value) {
    const t = fieldBlob(e.raw, key);
    if (t.toLowerCase().includes(needle)) return true;
  }
  if (e.searchBlob.includes(needle)) return true;
  return false;
}

const showSearch = computed(() => props.searchInput !== false);

const searchInputProps = computed(
  (): PfSelectMenuSearchInputProps =>
    typeof props.searchInput === 'object' && props.searchInput
      ? props.searchInput
      : {}
);

const allowEmpty = computed(() => props.allowEmptyPanel ?? showSearch.value);

function userToInnerSingle(u: unknown): string | number | undefined {
  if (u === undefined || u === null || u === '') return undefined;
  for (const e of flatEntries.value) {
    if (sameUser(e.raw, u)) return e.option.value;
  }
  return undefined;
}

function innerToUserSingle(v: string | number | undefined): unknown {
  if (v === undefined || v === null) return undefined;
  const e = flatEntries.value.find((x) => String(x.option.value) === String(v));
  return e?.raw;
}

const innerModelValue = computed((): PfSelectModelValue => {
  const v = userModel.value;
  if (props.multiple) {
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => userToInnerSingle(x))
      .filter((x): x is string | number => x !== undefined);
  }
  return userToInnerSingle(v);
});

function onInnerUpdate(v: PfSelectModelValue) {
  if (props.multiple) {
    if (!Array.isArray(v)) {
      userModel.value = [];
      return;
    }
    userModel.value = v.map((x) => innerToUserSingle(x));
    return;
  }
  userModel.value = innerToUserSingle(v as string | number | undefined);
}

const selectRef = ref<InstanceType<typeof PfSelect> | null>(null);

watch(
  () => props.open,
  async (v) => {
    if (v === undefined) return;
    await nextTick();
    const sel = selectRef.value as PfSelectVm | null;
    if (v) sel?.open?.();
    else sel?.close?.();
  }
);

type PfSelectExposed = {
  triggerRef?: { value: HTMLButtonElement | null };
  panelRef?: { value: HTMLElement | null };
};

const triggerRefExpose = shallowRef<HTMLButtonElement | null>(null);
const viewportRefExpose = shallowRef<HTMLElement | null>(null);

watchEffect(() => {
  const x = selectRef.value as unknown as PfSelectExposed | null;
  triggerRefExpose.value = x?.triggerRef?.value ?? null;
  viewportRefExpose.value = x?.panelRef?.value ?? null;
});

const mergedSelectUi = computed((): PfSelectUi | undefined => {
  const u = props.ui;
  if (!u) return undefined;
  const { search: _s, ...rest } = u;
  return rest;
});

defineExpose({
  triggerRef: triggerRefExpose,
  viewportRef: viewportRefExpose,
  selectRef,
});
</script>

<template>
  <PfSelect
    :id="listId"
    ref="selectRef"
    :default-open="defaultOpen"
    :name="name"
    :form="form"
    :model-value="innerModelValue"
    :options="optionGroupsForSelect ? undefined : optionsForSelect"
    :option-groups="optionGroupsForSelect"
    :placeholder="placeholder"
    :multiple="multiple"
    :disabled="disabled"
    :required="required"
    :highlight="highlight"
    :color="color"
    :variant="variant"
    :size="size"
    :chevron-icon="chevronIcon"
    :selected-option-icon="selectedOptionIcon"
    :leading-icon="leadingIcon"
    :leading-avatar="leadingAvatar"
    :loading="loading"
    :loading-icon="loadingIcon"
    :menu-gap="menuGap"
    :clearable="clearable"
    :allow-empty-panel="allowEmpty"
    :option-filter="optionFilterResolved"
    :empty-text="emptyText"
    :ui="mergedSelectUi"
    @update:model-value="onInnerUpdate"
    @update:menu-open="onSelectMenuOpen"
    @change="(e) => emit('change', e)"
    @blur="(e) => emit('blur', e)"
  >
    <template v-if="slots.panelEmpty" #panelEmpty>
      <slot name="panelEmpty" />
    </template>
    <template v-if="showSearch" #panelTop>
      <div class="pfSelectMenu__search" :class="ui?.search">
        <PfInput
          :id="searchInputId"
          v-model="searchTermWritable"
          class="pfSelectMenu__searchInput"
          type="search"
          enter-key-hint="search"
          autocomplete="off"
          :placeholder="searchInputProps.placeholder ?? 'Search…'"
          :icon="searchInputProps.icon"
          :loading="searchInputProps.loading"
          :disabled="disabled || searchInputProps.disabled"
          :variant="searchInputProps.variant ?? 'outline'"
          :color="color"
          :size="size"
          :fixed="true"
          :animated-text="animatedInput"
          @keydown.stop
        />
      </div>
    </template>
  </PfSelect>
</template>

<style scoped lang="scss">
.pfSelectMenu {
  &__search {
    border-block-end: var(--pf-stroke-width) solid
      var(--pf-input-border, var(--pf-border-color));

    margin-block-end: var(--pf-space-xs);

    padding-block-end: var(--pf-space-xs);
  }

  &__searchInput {
    margin: 0;

    width: 100%;
  }
}
</style>
