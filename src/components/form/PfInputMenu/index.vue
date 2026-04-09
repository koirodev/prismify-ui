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
import PfIcon from '../../element/PfIcon/index.vue';
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
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfInputMenuPrimitive = string | number | boolean;

export interface PfInputMenuItemObject {
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

export type PfInputMenuItem = PfInputMenuPrimitive | PfInputMenuItemObject;

export type PfInputMenuItems =
  | readonly PfInputMenuItem[]
  | readonly (readonly PfInputMenuItem[])[];

export type PfInputMenuModelValue = unknown | unknown[] | undefined;

export interface PfInputMenuUi extends PfSelectUi {
  triggerRow?: string;
  tags?: string;
  tag?: string;
  tagText?: string;
  tagRemove?: string;
  tagRemoveIcon?: string;
  chevron?: string;
}

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    form?: string;
    items?: PfInputMenuItems;
    modelValue?: PfInputMenuModelValue;
    defaultValue?: PfInputMenuModelValue;
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
    searchTerm?: string;
    resetSearchTermOnBlur?: boolean;
    resetSearchTermOnSelect?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    openOnFocus?: boolean;
    openOnClick?: boolean;
    clearable?: boolean;
    menuGap?: number;
    chevronIcon?: PfIconName;
    selectedOptionIcon?: PfIconName | null;
    leadingIcon?: PfIconName;
    leadingAvatar?: PfSelectOptionAvatarConfig;
    loading?: boolean;
    loadingIcon?: PfIconName;
    allowEmptyPanel?: boolean;
    emptyText?: string;
    animatedText?: boolean;
    deleteIcon?: PfIconName;
    by?: string | ((a: unknown, b: unknown) => boolean);
    ui?: PfInputMenuUi;
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
    resetSearchTermOnBlur: true,
    resetSearchTermOnSelect: true,
    openOnFocus: true,
    openOnClick: true,
    clearable: true,
    menuGap: 8,
    loading: false,
    animatedText: true,
    deleteIcon: 'crossSmall',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: PfInputMenuModelValue];
  'update:open': [value: boolean];
  'update:search-term': [value: string];
  change: [event: Event];
  blur: [event: FocusEvent];
  'remove-tag': [item: unknown];
}>();

const modelBound = usePfVModelBound();
const localModel = ref<PfInputMenuModelValue>(props.defaultValue);

const userModel = computed<PfInputMenuModelValue>({
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

const inputFocused = ref(false);

const autoId = useId();
const listId = computed(() => props.id ?? autoId);

let objectKeySeq = 0;
function nextObjectKey(): string {
  objectKeySeq += 1;
  return `__pfInputMenu_o_${objectKeySeq}`;
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
): x is readonly (readonly PfInputMenuItem[])[] {
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

function primitiveLabel(v: PfInputMenuPrimitive): string {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

function normalizeOne(raw: PfInputMenuItem): NormalizedEntry | null {
  if (isSeparatorItem(raw) || isLabelItem(raw)) {
    return null;
  }

  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    const v = raw as PfInputMenuPrimitive;
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
  flat: readonly PfInputMenuItem[]
): PfInputMenuItem[][] {
  const groups: PfInputMenuItem[][] = [];
  let cur: PfInputMenuItem[] = [];
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
  const rawGroups: readonly PfInputMenuItem[][] = Array.isArray(items)
    ? isNestedItems(items)
      ? items
      : splitFlatBySeparators(items as PfInputMenuItem[])
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
      ? primitiveLabel(raw as PfInputMenuPrimitive)
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

const allowEmpty = computed(() => props.allowEmptyPanel ?? true);

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
  if (props.resetSearchTermOnSelect !== false) {
    searchTermWritable.value = '';
  }
  if (props.multiple) {
    if (!Array.isArray(v)) {
      userModel.value = [];
      return;
    }
    userModel.value = v.map((x) => innerToUserSingle(x));
    return;
  }
  userModel.value = innerToUserSingle(v as string | number | undefined);
  inputFocused.value = false;
  void nextTick(() => {
    const inst = inputComponentRef.value as null | {
      inputRef?: { value: unknown };
    };
    const el = inst?.inputRef?.value;
    if (el instanceof HTMLElement) {
      el.blur();
    }
  });
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
  triggerRef?: { value: HTMLDivElement | null };
  panelRef?: { value: HTMLElement | null };
};

const triggerRefExpose = shallowRef<HTMLDivElement | null>(null);
const viewportRefExpose = shallowRef<HTMLElement | null>(null);

watchEffect(() => {
  const x = selectRef.value as unknown as PfSelectExposed | null;
  triggerRefExpose.value = x?.triggerRef?.value ?? null;
  viewportRefExpose.value = x?.panelRef?.value ?? null;
});

const mergedSelectUi = computed((): PfSelectUi | undefined => {
  const u = props.ui;
  if (!u) return undefined;
  const {
    triggerRow: _tr,
    tags: _tg,
    tag: _t,
    tagText: _tt,
    tagRemove: _trm,
    tagRemoveIcon: _tri,
    chevron: _ch,
    ...rest
  } = u;
  return rest;
});

const closedSingleLabel = computed(() => {
  if (props.multiple) return '';
  const v = userModel.value;
  if (v === undefined || v === null || v === '') return '';
  const e = flatEntries.value.find((x) => sameUser(x.raw, v));
  return e?.option.label ?? '';
});

const inputProxy = computed({
  get(): string {
    if (props.multiple) {
      if (inputFocused.value || mergedOpen.value) {
        return searchTermWritable.value;
      }
      return '';
    }
    const q = searchTermWritable.value;
    if (q !== '') return q;
    return closedSingleLabel.value;
  },
  set(v: string) {
    searchTermWritable.value = v;
  },
});

function onInputFocus() {
  inputFocused.value = true;
  if (props.openOnFocus) {
    const sel = selectRef.value as PfSelectVm | null;
    sel?.open?.();
  }
  searchTermWritable.value = '';
}

function onInputBlur() {
  inputFocused.value = false;
}

function onInputWrapClick() {
  if (props.openOnClick && !mergedOpen.value) {
    const sel = selectRef.value as PfSelectVm | null;
    sel?.open?.();
  }
}

const chevronIconResolved = computed(
  (): PfIconName => props.chevronIcon ?? 'angleSmallDown'
);

const chevronIconSize = computed((): PfIconSize => {
  switch (props.size) {
    case 'xs':
      return '2xs';
    case 'sm':
      return 'xs';
    case 'md':
      return 'sm';
    case 'lg':
      return 'sm';
    case 'xl':
      return 'md';
    default:
      return 'sm';
  }
});

const selectedItemsForTags = computed((): unknown[] => {
  const v = userModel.value;
  if (!props.multiple || !Array.isArray(v)) return [];
  return v;
});

function labelForRaw(raw: unknown): string {
  const e = flatEntries.value.find((x) => sameUser(x.raw, raw));
  return e?.option.label ?? String(raw ?? '');
}

function removeTagAt(index: number) {
  const v = userModel.value;
  if (!Array.isArray(v)) return;
  const next = [...v];
  const [removed] = next.splice(index, 1);
  userModel.value = next;
  emit('remove-tag', removed);
  emit('change', new Event('change', { bubbles: true }));
}

const inputComponentRef = ref<InstanceType<typeof PfInput> | null>(null);

const inputRefExpose = shallowRef<HTMLInputElement | null>(null);

watchEffect(() => {
  const inst = inputComponentRef.value as null | {
    inputRef?: { value: HTMLInputElement | null };
  };
  inputRefExpose.value = inst?.inputRef?.value ?? null;
});

defineExpose({
  triggerRef: triggerRefExpose,
  viewportRef: viewportRefExpose,
  selectRef,
  inputRef: inputRefExpose,
});
</script>

<template>
  <div class="pfInputMenu">
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
      :focus-trigger-after-single-select="false"
      @update:model-value="onInnerUpdate"
      @update:menu-open="onSelectMenuOpen"
      @change="(e) => emit('change', e)"
      @blur="(e) => emit('blur', e)"
    >
      <template v-if="slots.panelEmpty" #panelEmpty>
        <slot name="panelEmpty" />
      </template>
      <template #trigger="{ comboboxAttrs, togglePanel }">
        <div
          class="pfInputMenu__triggerRow"
          :class="ui?.triggerRow"
          @click="onInputWrapClick"
        >
          <div
            v-if="multiple && selectedItemsForTags.length"
            class="pfInputMenu__tags"
            :class="ui?.tags"
          >
            <span
              v-for="(raw, i) in selectedItemsForTags"
              :key="`tag-${i}-${String(raw)}`"
              class="pfInputMenu__tag"
              :class="ui?.tag"
            >
              <span class="pfInputMenu__tagText" :class="ui?.tagText">
                {{ labelForRaw(raw) }}
              </span>
              <button
                type="button"
                class="pfInputMenu__tagRemove"
                :class="ui?.tagRemove"
                :disabled="disabled"
                :aria-label="'Remove'"
                @click.stop="removeTagAt(i)"
              >
                <PfIcon
                  :name="deleteIcon"
                  size="xs"
                  :class="ui?.tagRemoveIcon"
                />
              </button>
            </span>
          </div>
          <PfInput
            ref="inputComponentRef"
            v-bind="comboboxAttrs"
            v-model="inputProxy"
            class="pfInputMenu__input"
            type="text"
            :placeholder="placeholder"
            :disabled="disabled"
            :color="color"
            variant="none"
            :size="size"
            :fixed="true"
            :highlight="false"
            :animated-text="animatedText"
            :loading="false"
            trailing
            enter-key-hint="search"
            autocomplete="off"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @click.stop
          >
            <template #trailing>
              <PfIcon
                :name="chevronIconResolved"
                :size="chevronIconSize"
                class="pfInputMenu__chevron"
                :class="[
                  ui?.chevron,
                  mergedOpen && 'pfInputMenu__chevron_open',
                ]"
                aria-hidden="true"
                @click.stop="
                  () => {
                    togglePanel();
                  }
                "
              />
            </template>
          </PfInput>
        </div>
      </template>
    </PfSelect>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles/mixins/input-tag-pill' as tagPill;

.pfInputMenu {
  &__triggerRow {
    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    min-width: 0;
    display: flex;
    align-items: center;
    flex: 1;
    flex-wrap: wrap;
    gap: var(--pf-space-sm);
    box-sizing: border-box;
  }

  :deep(.pfSelect__shell:has(> .pfSelect__leading)) .pfInputMenu__triggerRow {
    padding-inline-start: var(--pf-space-sm);
  }

  &__input :deep(.pfInput__placeholder),
  &__input :deep(.pfInput__falling),
  &__input :deep(.pfInput__native) {
    padding: 0;
    width: calc(
      100% - (var(--pf-input-trailing-pad) - var(--pf-input-pad-inline))
    );
  }

  &__input :deep(.pfInput__visual) {
    padding-block: 0;
  }

  &__input :deep(.pfInput__visualGutter_start) {
    width: 0 !important;
  }

  &__input :deep(.pfInput__visualGutter_end) {
    width: calc(
      var(--pf-input-trailing-pad) - var(--pf-input-pad-inline)
    ) !important;
  }

  &__input :deep(.pfInput__trailing) {
    padding-inline-end: 0;
  }

  &__tags {
    @include tagPill.pf-input-tags-cluster;
  }

  &__tag {
    @include tagPill.pf-input-tag-pill;
  }

  &__tagText {
    @include tagPill.pf-input-tag-text;
  }

  &__tagRemove {
    @include tagPill.pf-input-tag-remove;
  }

  &__input {
    min-width: 6rem;
    flex: 1;
  }

  &__input :deep(.pfInput__shell) {
    box-shadow: none;
    background: transparent;
    outline: none;
  }

  &__input :deep(.pfInput__shell:focus-within) {
    box-shadow: none;
    outline: none;
  }

  &__input :deep(.pfInput_highlight .pfInput__shell) {
    box-shadow: none;
  }

  &__chevron {
    flex-shrink: 0;

    color: var(--pf-input-muted, var(--pf-color-muted));

    transition: transform var(--pf-animation-duration)
      var(--pf-animation-easing);

    cursor: pointer;

    &_open {
      transform: rotate(180deg);
    }
  }
}
</style>
