<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfChip from '../../element/PfChip/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import type { PfChipColor, PfChipSize } from '../../element/PfChip/index.vue';
import { usePfApp } from '../../../composables/usePfApp';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfSelectColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfSelectVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none';

export type PfSelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfSelectOptionAvatarSize =
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl';

/** `PfAvatar` props to the left of the item (or via `imageSrc`). */
export interface PfSelectOptionAvatarConfig {
  src?: string;
  alt?: string;
  icon?: PfIconName;
  text?: string;
  size?: PfSelectOptionAvatarSize;
}

/** `PfChip` props (`standalone` mode) instead of plain label text. */
export interface PfSelectOptionChipConfig {
  color?: PfChipColor;
  size?: PfChipSize;
  show?: boolean;
}

export interface PfSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  /** Icon to the left of the label (if no `avatar` / `imageSrc`). */
  icon?: PfIconName;
  /** Image on the left (circular via `PfAvatar`). */
  imageSrc?: string;
  imageAlt?: string;
  /** Avatar/icon/initials on the left; takes precedence over `imageSrc` and `icon`. */
  avatar?: PfSelectOptionAvatarConfig;
  /** Color indicator on the left (empty `PfChip`); label aligns with icon rows. */
  chip?: PfSelectOptionChipConfig;
  /** Selected-item icon in the panel for this option; `null` — hide. */
  selectedIcon?: PfIconName | null;
}

/** Group item: string (`value` and label match) or full option. */
export type PfSelectGroupItem = string | PfSelectOption;

/** Option groups; flattened into one list, dividers between groups in the panel. */
export type PfSelectOptionGroups = readonly (readonly PfSelectGroupItem[])[];

type PfSelectPanelRow =
  | { kind: 'divider'; beforeOptionIndex: number }
  | { kind: 'option'; opt: PfSelectOption; index: number };

export type PfSelectModelValue =
  | string
  | number
  | undefined
  | (string | number)[];

export interface PfSelectUi {
  root?: string;
  shell?: string;
  native?: string;
  trailing?: string;
  icon?: string;
  leading?: string;
  leadingIcon?: string;
  leadingAvatar?: string;
  trigger?: string;
  panel?: string;
  option?: string;
  optionLabel?: string;
  optionIcon?: string;
  optionLeading?: string;
  optionChip?: string;
  /** Divider between groups in the custom panel. */
  groupDivider?: string;
  /** Empty list after filtering (e.g. search). */
  panelEmpty?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    modelValue?: PfSelectModelValue;
    defaultValue?: PfSelectModelValue;
    options?: readonly PfSelectOption[];
    /**
     * Option groups (e.g. `[['A','B'], ['C']]`). Use instead of flat `options`;
     * `v-model` still comes from option `value` fields or from the string when the item is a string.
     */
    optionGroups?: PfSelectOptionGroups;
    /** `<optgroup>` labels in native mode by group index. */
    optionGroupLabels?: readonly (string | undefined)[];
    placeholder?: string;
    multiple?: boolean;
    /** Native `size` on `<select multiple>` — number of visible rows. */
    listboxRows?: number;
    /**
     * Native `<select>`. Without `options` (slot) or with `native: true` — native UI;
     * otherwise custom trigger and panel (single and multiple selection with `options`).
     */
    native?: boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: string;
    autofocus?: boolean;
    form?: string;
    color?: PfSelectColor;
    variant?: PfSelectVariant;
    size?: PfSelectSize;
    highlight?: boolean;
    /** Expand icon on the trigger (and native mode on the right). */
    chevronIcon?: PfIconName;
    /** @deprecated Use `chevronIcon`; if only this is set, behavior is unchanged. */
    trailingIcon?: PfIconName;
    /**
     * Icon for the selected row in the panel (default for all options).
     * Per-option `selectedIcon` overrides.
     * `null` — hide globally (options with their own `selectedIcon` still show it).
     */
    selectedOptionIcon?: PfIconName | null;
    /** Icon to the left of the field (custom and native UI). */
    leadingIcon?: PfIconName;
    /** Avatar on the left; hidden when `loading`, spinner shown. */
    leadingAvatar?: PfSelectOptionAvatarConfig;
    /** Loading: spinner on the left instead of `leadingIcon` / `leadingAvatar`. */
    loading?: boolean;
    /** Loading icon on the left. */
    loadingIcon?: PfIconName;
    /** Gap between panel and trigger (px). */
    menuGap?: number;
    /** Clear value: row in panel (single) or clear all (multi). */
    clearable?: boolean;
    /** Label for the clear row in the panel; default «—». */
    clearOptionLabel?: string;
    /** Initial panel open state (without external `v-model` on `PfSelect`). */
    defaultOpen?: boolean;
    /**
     * Show the panel even when the option list is empty (e.g. search with no matches).
     */
    allowEmptyPanel?: boolean;
    /**
     * Hides panel rows; hidden rows stay in the native `<select>` for the form.
     */
    optionFilter?: (index: number, option: PfSelectOption) => boolean;
    /**
     * Text when filtering leaves no rows (empty `panelEmpty` slot overrides).
     */
    emptyText?: string;
    /**
     * After selecting an option in single mode, return focus to the trigger.
     * For PfInputMenu set `false` to avoid leaving focus on the input field.
     */
    focusTriggerAfterSingleSelect?: boolean;
    ui?: PfSelectUi;
  }>(),
  {
    color: 'primary',
    variant: 'outline',
    multiple: false,
    native: false,
    required: false,
    disabled: false,
    highlight: false,
    autocomplete: 'off',
    menuGap: 8,
    clearable: true,
    loading: false,
    allowEmptyPanel: false,
    emptyText: 'No matches',
    focusTriggerAfterSingleSelect: true,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: PfSelectModelValue];
  'update:menuOpen': [value: boolean];
  change: [event: Event];
  blur: [event: FocusEvent];
}>();

const attrs = useAttrs();
const slots = useSlots();
const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);
const app = usePfApp();

const effectiveSize = computed(
  (): PfSelectSize => props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const modelBound = usePfVModelBound();

const localModel = ref<PfSelectModelValue>(props.defaultValue);

const currentValue = computed<PfSelectModelValue>({
  get: () => (modelBound.value ? props.modelValue : localModel.value),
  set: (v) => {
    if (modelBound.value) {
      emit('update:modelValue', v);
    } else {
      localModel.value = v;
    }
  },
});

function setValue(v: PfSelectModelValue) {
  currentValue.value = v;
}

const selectRef = ref<HTMLSelectElement | null>(null);
const shellRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

/** Panel open state; with `v-model:open` synced to the prop via `watch`. */
const panelOpen = ref(!!props.defaultOpen);

function setPanelOpen(v: boolean) {
  panelOpen.value = v;
  emit('update:menuOpen', v);
}
/** Highlighted row for keyboard / hover; `-1` — no active row when opened. */
const highlightIndex = ref(-1);

const autoId = useId();
const selectId = computed(() => props.id ?? autoId);
const listboxId = computed(() => `${selectId.value}-listbox`);

function optionDomId(i: number): string {
  return `${selectId.value}-opt-${i}`;
}

const usesGroupedOptions = computed(
  () => !!(props.optionGroups && props.optionGroups.length > 0)
);

const usesOptionsProp = computed(
  () =>
    props.options !== undefined ||
    (props.optionGroups !== undefined && props.optionGroups.length > 0)
);

function normalizeGroupItem(raw: PfSelectGroupItem): PfSelectOption {
  if (typeof raw === 'string') return { value: raw, label: raw };
  return raw;
}

const resolvedOptions = computed((): readonly PfSelectOption[] => {
  if (usesGroupedOptions.value && props.optionGroups) {
    const out: PfSelectOption[] = [];
    for (const g of props.optionGroups) {
      for (const item of g) {
        out.push(normalizeGroupItem(item));
      }
    }
    return out;
  }
  return props.options ?? [];
});

const optionGroupDividerBeforeIndex = computed((): ReadonlySet<number> => {
  const set = new Set<number>();
  if (!usesGroupedOptions.value || !props.optionGroups) return set;
  let idx = 0;
  for (let gi = 0; gi < props.optionGroups.length; gi++) {
    const g = props.optionGroups[gi];
    if (gi > 0 && g.length > 0) set.add(idx);
    idx += g.length;
  }
  return set;
});

const nativeGroupFlatRanges = computed(() => {
  if (!props.optionGroups?.length) {
    return [] as { start: number; items: readonly PfSelectGroupItem[] }[];
  }
  let start = 0;
  return props.optionGroups.map((items) => {
    const s = start;
    start += items.length;
    return { start: s, items };
  });
});

function optionGroupLabelFor(gi: number): string {
  const L = props.optionGroupLabels;
  if (L && L[gi] !== undefined && L[gi] !== '') return String(L[gi]);
  return '\u00A0';
}

const panelRows = computed((): PfSelectPanelRow[] => {
  const opts = resolvedOptions.value;
  const before = optionGroupDividerBeforeIndex.value;
  const rows: PfSelectPanelRow[] = [];
  for (let i = 0; i < opts.length; i++) {
    if (before.has(i)) {
      rows.push({ kind: 'divider', beforeOptionIndex: i });
    }
    rows.push({ kind: 'option', opt: opts[i]!, index: i });
  }
  return rows;
});

function filterPanelRows(
  rows: readonly PfSelectPanelRow[],
  filter: (index: number, opt: PfSelectOption) => boolean
): PfSelectPanelRow[] {
  const mapped: PfSelectPanelRow[] = [];
  for (const row of rows) {
    if (row.kind === 'divider') {
      mapped.push(row);
      continue;
    }
    if (filter(row.index, row.opt)) {
      mapped.push(row);
    }
  }
  const out: PfSelectPanelRow[] = [];
  for (let i = 0; i < mapped.length; i++) {
    const row = mapped[i]!;
    if (row.kind === 'divider') {
      const nextOpt = mapped.slice(i + 1).find((r) => r.kind === 'option');
      if (!nextOpt) break;
      if (out.length === 0) continue;
      if (out[out.length - 1]!.kind === 'divider') continue;
      out.push(row);
      continue;
    }
    out.push(row);
  }
  while (out.length > 0 && out[0]!.kind === 'divider') {
    out.shift();
  }
  while (out.length > 0 && out[out.length - 1]!.kind === 'divider') {
    out.pop();
  }
  return out;
}

const filteredPanelRows = computed((): PfSelectPanelRow[] => {
  const f = props.optionFilter;
  if (typeof f !== 'function') return panelRows.value;
  return filterPanelRows(panelRows.value, f);
});

const visibleOptionIndices = computed((): number[] => {
  return filteredPanelRows.value
    .filter(
      (r): r is Extract<PfSelectPanelRow, { kind: 'option' }> =>
        r.kind === 'option'
    )
    .map((r) => r.index);
});

const hasVisiblePanelOptions = computed(() =>
  typeof props.optionFilter === 'function'
    ? visibleOptionIndices.value.length > 0
    : resolvedOptions.value.length > 0
);

const panelRowsForTemplate = computed((): PfSelectPanelRow[] =>
  typeof props.optionFilter === 'function'
    ? filteredPanelRows.value
    : panelRows.value
);

watch(visibleOptionIndices, (vis) => {
  if (typeof props.optionFilter !== 'function') return;
  const h = highlightIndex.value;
  if (h >= 0 && !vis.includes(h)) {
    highlightIndex.value = -1;
  }
});

const isNativeMode = computed(() => props.native || !usesOptionsProp.value);

const isCustomUi = computed(() => !isNativeMode.value);

const teleportTarget = computed((): string | HTMLElement => {
  const t = app.value.portalTarget;
  if (t === false) return 'body';
  if (typeof t === 'string') return t;
  return t;
});

function sameOption(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

const singleSelectValue = computed((): string => {
  if (props.multiple) return '';
  const v = currentValue.value;
  const opts = resolvedOptions.value;
  if (usesOptionsProp.value && opts.length) {
    if (props.placeholder && (v === undefined || v === null || v === '')) {
      return '';
    }
    const idx = opts.findIndex((o) => sameOption(o.value, v));
    return idx >= 0 ? String(idx) : '';
  }
  if (v === undefined || v === null) return '';
  return String(v);
});

function optionSelectedIndex(i: number): boolean {
  if (!props.multiple) return false;
  const opts = resolvedOptions.value;
  if (!opts[i]) return false;
  const v = opts[i]!.value;
  const m = currentValue.value;
  if (!Array.isArray(m)) return false;
  return m.some((x) => sameOption(x, v));
}

function optionIsSelected(i: number): boolean {
  const opts = resolvedOptions.value;
  if (!opts[i]) return false;
  const opt = opts[i]!;
  const v = currentValue.value;
  if (props.multiple) {
    if (!Array.isArray(v)) return false;
    return v.some((x) => sameOption(x, opt.value));
  }
  return sameOption(opt.value, v);
}

const hasSingleValue = computed(() => {
  const v = currentValue.value;
  if (v === undefined || v === null || v === '') return false;
  return true;
});

const hasMultiSelection = computed(() => {
  const v = currentValue.value;
  return Array.isArray(v) && v.length > 0;
});

const showClearRow = computed(
  () =>
    props.clearable &&
    !props.required &&
    isCustomUi.value &&
    (props.multiple ? hasMultiSelection.value : hasSingleValue.value)
);

const clearRowLabel = computed(() => props.clearOptionLabel ?? '—');

function clearOptionDomId(): string {
  return `${selectId.value}-clear`;
}

function focusTriggerEl() {
  const root = triggerRef.value;
  if (!root) return;
  const el = root.querySelector<HTMLElement>(
    'input:not([type="hidden"]), button, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  (el ?? root).focus();
}

function clearSelection() {
  setValue(props.multiple ? [] : undefined);
  emit('change', new Event('change', { bubbles: true }));
  if (!props.multiple) closePanel();
  void nextTick(() => focusTriggerEl());
}

function onClearPointerDown() {
  clearSelection();
}

function onClearPointerEnter() {
  highlightIndex.value = -1;
}

function onNativeChange(e: Event) {
  const el = e.target as HTMLSelectElement;
  const opts = resolvedOptions.value;
  if (props.multiple && opts.length) {
    const next = Array.from(el.selectedOptions).map((o) => {
      const i = Number(o.value);
      return opts[i]!.value;
    });
    setValue(next);
  } else if (opts.length) {
    if (el.value === '') {
      setValue(undefined);
    } else {
      const i = Number(el.value);
      const opt = opts[i];
      setValue(opt ? opt.value : undefined);
    }
  } else {
    if (props.multiple) {
      const next = Array.from(el.selectedOptions).map((o) => o.value);
      setValue(next);
    } else {
      setValue(el.value === '' ? undefined : el.value);
    }
  }
  emit('change', e);
}

function onNativeBlur(e: FocusEvent) {
  emit('blur', e);
}

const displayLabel = computed(() => {
  const opts = resolvedOptions.value;
  if (!opts.length && !usesOptionsProp.value) return '';
  const v = currentValue.value;
  if (props.multiple) {
    if (!Array.isArray(v) || v.length === 0) return props.placeholder ?? '';
    const labels = opts
      .filter((o) => v.some((x) => sameOption(x, o.value)))
      .map((o) => o.label);
    return labels.length ? labels.join(', ') : (props.placeholder ?? '');
  }
  if (v === undefined || v === null || v === '') {
    return props.placeholder ?? '';
  }
  const opt = opts.find((o) => sameOption(o.value, v));
  return opt?.label ?? String(v);
});

/** Empty value in trigger (placeholder or empty string) — different color from selected text. */
const triggerShowsPlaceholder = computed(() => {
  if (!usesOptionsProp.value || !isCustomUi.value) return false;
  const v = currentValue.value;
  const opts = resolvedOptions.value;
  if (props.multiple) {
    if (!Array.isArray(v) || v.length === 0) return true;
    return !opts.some((o) => v.some((x) => sameOption(x, o.value)));
  }
  return v === undefined || v === null || v === '';
});

const selectedMarkIcon = computed((): PfIconName | null => {
  if (props.selectedOptionIcon === null) return null;
  return props.selectedOptionIcon ?? 'check';
});

function optionAvatarBindingsForOption(
  opt: PfSelectOption
): Record<string, unknown> | null {
  if (opt.avatar && (opt.avatar.src || opt.avatar.icon || opt.avatar.text)) {
    return { ...opt.avatar, size: opt.avatar.size ?? optionAvatarSize.value };
  }
  if (opt.imageSrc) {
    return {
      src: opt.imageSrc,
      alt: opt.imageAlt ?? '',
      size: optionAvatarSize.value,
    };
  }
  return null;
}

function resolvedSelectedMarkForOption(opt: PfSelectOption): PfIconName | null {
  if (opt.selectedIcon === null) return null;
  if (opt.selectedIcon) return opt.selectedIcon;
  return selectedMarkIcon.value;
}

const chevronIconName = computed(
  (): PfIconName => props.chevronIcon ?? props.trailingIcon ?? 'angleSmallDown'
);

const iconSize = computed((): PfIconSize => {
  switch (effectiveSize.value) {
    case 'xs':
      return '2xs';
    case 'sm':
      return 'sm';
    case 'md':
      return 'md';
    case 'lg':
      return 'lg';
    case 'xl':
      return 'xl';
    default:
      return 'md';
  }
});

const optionIconSize = computed((): PfIconSize => {
  switch (effectiveSize.value) {
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

const optionAvatarSize = computed((): PfSelectOptionAvatarSize => {
  switch (effectiveSize.value) {
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

const leadingAvatarBindings = computed((): Record<string, unknown> | null => {
  const a = props.leadingAvatar;
  if (!a || (!a.src && !a.icon && !a.text)) return null;
  return { ...a, size: a.size ?? optionAvatarSize.value };
});

/** First selected option: leading visuals in the trigger (icon/avatar/cover as in the row). */
const primarySelectedOptionForTrigger = computed((): PfSelectOption | null => {
  if (!usesOptionsProp.value || !isCustomUi.value) return null;
  const opts = resolvedOptions.value;
  const v = currentValue.value;
  if (props.multiple) {
    if (!Array.isArray(v) || v.length === 0) return null;
    for (const val of v) {
      const o = opts.find((x) => sameOption(x.value, val));
      if (o) return o;
    }
    return null;
  }
  if (v === undefined || v === null || v === '') return null;
  return opts.find((x) => sameOption(x.value, v)) ?? null;
});

const triggerRichLeadingAvatarBindings = computed(
  (): Record<string, unknown> | null => {
    const o = primarySelectedOptionForTrigger.value;
    if (!o) return null;
    return optionAvatarBindingsForOption(o);
  }
);

const triggerRichLeadingIcon = computed((): PfIconName | null => {
  const o = primarySelectedOptionForTrigger.value;
  if (!o || triggerRichLeadingAvatarBindings.value) return null;
  return o.icon ?? null;
});

/** Option with only `chip` (no icon/avatar/cover) — chip in the trigger leading slot. */
const triggerRichChipOption = computed((): PfSelectOption | null => {
  const o = primarySelectedOptionForTrigger.value;
  if (!o?.chip) return null;
  if (triggerRichLeadingAvatarBindings.value || triggerRichLeadingIcon.value)
    return null;
  return o;
});

const hasLeading = computed(
  () =>
    !!slots.leading ||
    props.loading ||
    !!props.leadingIcon ||
    !!leadingAvatarBindings.value ||
    !!triggerRichLeadingAvatarBindings.value ||
    !!triggerRichLeadingIcon.value ||
    !!triggerRichChipOption.value
);

const spinnerIconName = computed(
  (): PfIconName => props.loadingIcon ?? 'spinner'
);

const panelPos = ref({ top: 0, left: 0, width: 0 });

function updatePanelPosition() {
  const el = shellRef.value ?? triggerRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const gap = props.menuGap;
  panelPos.value = {
    top: r.bottom + gap,
    left: r.left,
    width: r.width,
  };
}

function onScrollOrResize() {
  if (panelOpen.value) updatePanelPosition();
}

function onDocPointerDown(e: PointerEvent) {
  if (!panelOpen.value) return;
  const t = e.target as Node;
  if (triggerRef.value?.contains(t) || panelRef.value?.contains(t)) return;
  closePanel();
}

function closePanel() {
  setPanelOpen(false);
}

function openPanel() {
  if (props.disabled) return;
  if (!resolvedOptions.value.length && !props.allowEmptyPanel) return;
  updatePanelPosition();
  setPanelOpen(true);
  highlightIndex.value = -1;
}

function togglePanel() {
  if (panelOpen.value) closePanel();
  else openPanel();
}

function selectHighlighted() {
  const opts = resolvedOptions.value;
  if (!opts.length) return;
  const i = highlightIndex.value;
  if (i < 0) return;
  const o = opts[i];
  if (o?.disabled) return;
  if (props.optionFilter && !props.optionFilter(i, o)) return;
  applySelection(i);
}

function applySelection(i: number) {
  const opts = resolvedOptions.value;
  const o = opts[i];
  if (!o || o.disabled) return;
  if (props.multiple) {
    const m = currentValue.value;
    const arr = Array.isArray(m) ? [...m] : [];
    const idx = arr.findIndex((x) => sameOption(x, o.value));
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(o.value);
    setValue(arr);
    emit('change', new Event('change', { bubbles: true }));
    return;
  }
  setValue(o.value);
  emit('change', new Event('change', { bubbles: true }));
  closePanel();
  if (props.focusTriggerAfterSingleSelect) {
    void nextTick(() => focusTriggerEl());
  }
}

function moveHighlight(delta: number) {
  const opts = resolvedOptions.value;
  if (!opts.length) return;

  if (props.optionFilter) {
    const vis = visibleOptionIndices.value;
    if (!vis.length) return;

    const posOf = (real: number) => vis.indexOf(real);
    let cur = highlightIndex.value;
    let p = cur < 0 ? -1 : posOf(cur);

    if (p < 0) {
      if (delta > 0) {
        const j = vis.findIndex((idx) => !opts[idx]!.disabled);
        if (j >= 0) highlightIndex.value = vis[j]!;
      } else {
        for (let k = vis.length - 1; k >= 0; k--) {
          const idx = vis[k]!;
          if (!opts[idx]!.disabled) {
            highlightIndex.value = idx;
            return;
          }
        }
      }
      return;
    }

    const n = vis.length;
    for (let step = 0; step < n; step++) {
      p = (p + delta + n) % n;
      const idx = vis[p]!;
      if (!opts[idx]!.disabled) {
        highlightIndex.value = idx;
        return;
      }
    }
    return;
  }

  const n = opts.length;
  let i = highlightIndex.value;

  if (i < 0) {
    if (delta > 0) {
      const j = opts.findIndex((o) => !o.disabled);
      if (j >= 0) highlightIndex.value = j;
    } else {
      for (let k = n - 1; k >= 0; k--) {
        if (!opts[k]!.disabled) {
          highlightIndex.value = k;
          return;
        }
      }
    }
    return;
  }

  for (let step = 0; step < n; step++) {
    i = (i + delta + n) % n;
    if (!opts[i]!.disabled) {
      highlightIndex.value = i;
      return;
    }
  }
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (props.disabled) return;
  if (!isCustomUi.value) return;

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!panelOpen.value) {
      openPanel();
      if (e.key === 'ArrowUp') moveHighlight(-1);
      else moveHighlight(1);
      return;
    }
    moveHighlight(e.key === 'ArrowDown' ? 1 : -1);
    return;
  }

  if (e.key === 'Enter' || e.key === ' ') {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (e.key === ' ' && tag === 'INPUT') {
      return;
    }
    if (panelOpen.value) {
      e.preventDefault();
      selectHighlighted();
    } else {
      e.preventDefault();
      openPanel();
    }
    return;
  }

  if (e.key === 'Escape') {
    if (panelOpen.value) {
      e.preventDefault();
      closePanel();
      void nextTick(() => focusTriggerEl());
    }
    return;
  }

  if (e.key === 'Home' && panelOpen.value) {
    e.preventDefault();
    const opts = resolvedOptions.value;
    if (!opts.length) return;
    if (props.optionFilter) {
      const vis = visibleOptionIndices.value;
      if (!vis.length) return;
      const j = vis.findIndex((idx) => !opts[idx]!.disabled);
      if (j >= 0) highlightIndex.value = vis[j]!;
      return;
    }
    const j = opts.findIndex((o) => !o.disabled);
    if (j >= 0) highlightIndex.value = j;
    return;
  }

  if (e.key === 'End' && panelOpen.value) {
    e.preventDefault();
    const opts = resolvedOptions.value;
    if (!opts.length) return;
    if (props.optionFilter) {
      const vis = visibleOptionIndices.value;
      if (!vis.length) return;
      for (let k = vis.length - 1; k >= 0; k--) {
        const idx = vis[k]!;
        if (!opts[idx]!.disabled) {
          highlightIndex.value = idx;
          return;
        }
      }
      return;
    }
    for (let k = opts.length - 1; k >= 0; k--) {
      if (!opts[k]!.disabled) {
        highlightIndex.value = k;
        return;
      }
    }
  }
}

function onOptionPointerEnter(i: number) {
  if (resolvedOptions.value[i]?.disabled) return;
  highlightIndex.value = i;
}

function onOptionPointerDown(i: number, e: PointerEvent) {
  if (resolvedOptions.value[i]?.disabled) return;
  e.preventDefault();
  applySelection(i);
}

watch(
  () => panelOpen.value,
  (o) => {
    if (o) {
      void nextTick(() => {
        updatePanelPosition();
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        document.addEventListener('pointerdown', onDocPointerDown, true);
      });
    } else {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('pointerdown', onDocPointerDown, true);
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollOrResize, true);
  window.removeEventListener('resize', onScrollOrResize);
  document.removeEventListener('pointerdown', onDocPointerDown, true);
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() => [
  'pfSelect',
  `pfSelect_size_${effectiveSize.value}`,
  `pfSelect_color_${props.color}`,
  `pfSelect_variant_${props.variant}`,
  isNativeMode.value && !props.multiple && 'pfSelect_hasTrailing',
  hasLeading.value && 'pfSelect_hasLeading',
  isCustomUi.value && 'pfSelect_mode_custom',
  panelOpen.value && isCustomUi.value && 'pfSelect_open',
  props.disabled && 'pfSelect_disabled',
  props.highlight && 'pfSelect_highlight',
  props.loading && 'pfSelect_loading',
  props.ui?.root,
  attrs.class,
]);

const shellClass = computed(() => ['pfSelect__shell', props.ui?.shell]);
const nativeClass = computed(() => ['pfSelect__native', props.ui?.native]);

/**
 * The Teleported panel is not a descendant of the root `.pfSelect` in the DOM, so without these
 * classes nested rules (`.pfSelect &__panel`) do not apply and `--pf-input-*` / typography
 * from the select root are not inherited.
 */
const panelPortalClass = computed(() => [
  'pfSelect',
  'pfSelect__panelAnchor',
  `pfSelect_size_${effectiveSize.value}`,
  `pfSelect_color_${props.color}`,
  `pfSelect_variant_${props.variant}`,
]);

const panelStyle = computed(() => ({
  position: 'fixed' as const,
  top: `${panelPos.value.top}px`,
  left: `${panelPos.value.left}px`,
  width: `${panelPos.value.width}px`,
  zIndex: 'var(--pf-select-panel-z-index)',
  '--pf-select-menu-gap': `${props.menuGap}px`,
}));

const triggerAriaInvalid = computed((): 'true' | undefined => {
  if (!props.required) return undefined;
  const v = currentValue.value;
  if (props.multiple) {
    return !Array.isArray(v) || v.length === 0 ? 'true' : undefined;
  }
  return v === undefined || v === null || v === '' ? 'true' : undefined;
});

const comboboxAttrs = computed(
  (): Record<string, string | boolean | undefined> => ({
    id: selectId.value,
    role: 'combobox',
    disabled: props.disabled,
    'aria-expanded': panelOpen.value,
    'aria-haspopup': 'listbox',
    'aria-controls': listboxId.value,
    'aria-activedescendant':
      panelOpen.value && highlightIndex.value >= 0
        ? optionDomId(highlightIndex.value)
        : undefined,
    'aria-invalid': triggerAriaInvalid.value,
    'aria-busy': props.loading ? 'true' : undefined,
  })
);

function onTriggerFocusOut(e: FocusEvent) {
  if (!isCustomUi.value) return;
  const rt = e.relatedTarget as Node | null;
  if (triggerRef.value?.contains(rt)) return;
  if (panelRef.value?.contains(rt)) return;
  void nextTick(() => {
    if (!panelOpen.value) emit('blur', e);
  });
}

const triggerSlotProps = computed(() => ({
  comboboxAttrs: comboboxAttrs.value,
  togglePanel,
  openPanel,
  closePanel,
}));

defineExpose({
  selectRef,
  triggerRef,
  panelRef,
  open: openPanel,
  close: closePanel,
});
</script>

<template>
  <div :class="rootClass">
    <!-- Custom UI -->
    <template v-if="isCustomUi">
      <div ref="shellRef" :class="shellClass">
        <span
          v-if="hasLeading"
          class="pfSelect__leading"
          :class="props.ui?.leading"
          aria-hidden="true"
        >
          <slot name="leading">
            <PfIcon
              v-if="loading"
              class="pfSelect__iconSpin"
              :name="spinnerIconName"
              :size="iconSize"
              :class="props.ui?.leadingIcon"
            />
            <PfAvatar
              v-else-if="triggerRichLeadingAvatarBindings"
              class="pfSelect__leadingAvatar"
              :class="props.ui?.leadingAvatar"
              v-bind="triggerRichLeadingAvatarBindings"
            />
            <PfIcon
              v-else-if="triggerRichLeadingIcon"
              :name="triggerRichLeadingIcon"
              :size="iconSize"
              :class="props.ui?.leadingIcon"
            />
            <PfChip
              v-else-if="triggerRichChipOption"
              standalone
              class="pfSelect__leadingChip"
              :color="triggerRichChipOption.chip!.color ?? 'primary'"
              :size="triggerRichChipOption.chip!.size ?? 'sm'"
              :show="triggerRichChipOption.chip!.show !== false"
              :class="props.ui?.optionChip"
            />
            <PfAvatar
              v-else-if="leadingAvatarBindings"
              class="pfSelect__leadingAvatar"
              :class="props.ui?.leadingAvatar"
              v-bind="leadingAvatarBindings"
            />
            <PfIcon
              v-else-if="leadingIcon"
              :name="leadingIcon"
              :size="iconSize"
              :class="props.ui?.leadingIcon"
            />
          </slot>
        </span>
        <div
          ref="triggerRef"
          class="pfSelect__triggerSlotWrap"
          @keydown.capture="onTriggerKeydown"
          @focusout="onTriggerFocusOut"
        >
          <slot name="trigger" v-bind="triggerSlotProps">
            <button
              type="button"
              class="pfSelect__trigger"
              :class="props.ui?.trigger"
              v-bind="comboboxAttrs"
              :autofocus="autofocus"
              @click="togglePanel"
            >
              <span
                class="pfSelect__triggerLabel"
                :class="
                  triggerShowsPlaceholder &&
                  'pfSelect__triggerLabel_placeholder'
                "
              >
                {{ displayLabel }}
              </span>
              <span class="pfSelect__trailing" aria-hidden="true">
                <PfIcon
                  :name="chevronIconName"
                  :size="iconSize"
                  :class="[
                    props.ui?.icon,
                    panelOpen && 'pfSelect__chevron_open',
                  ]"
                />
              </span>
            </button>
          </slot>
        </div>
      </div>

      <select
        v-if="!multiple"
        ref="selectRef"
        :name="name"
        :required="required"
        :disabled="disabled"
        :form="form"
        class="pfSelect__nativeOffscreen"
        tabindex="-1"
        aria-hidden="true"
        :value="singleSelectValue"
        @change="onNativeChange"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="(opt, i) in resolvedOptions"
          :key="i"
          :value="String(i)"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>
      <select
        v-else
        ref="selectRef"
        :name="name"
        :required="required"
        :disabled="disabled"
        :form="form"
        class="pfSelect__nativeOffscreen"
        multiple
        tabindex="-1"
        aria-hidden="true"
        @change="onNativeChange"
      >
        <option
          v-for="(opt, i) in resolvedOptions"
          :key="i"
          :value="String(i)"
          :disabled="opt.disabled"
          :selected="optionSelectedIndex(i)"
        >
          {{ opt.label }}
        </option>
      </select>

      <Teleport :to="teleportTarget">
        <Transition name="pfSelectDrop">
          <div
            v-if="panelOpen"
            ref="panelRef"
            :class="panelPortalClass"
            :style="panelStyle"
          >
            <div
              :id="listboxId"
              class="pfSelect__panel"
              :class="props.ui?.panel"
              role="listbox"
              tabindex="-1"
              :aria-multiselectable="multiple ? 'true' : undefined"
            >
              <slot name="panelTop" />
              <div
                v-if="showClearRow && !multiple"
                :id="clearOptionDomId()"
                role="option"
                class="pfSelect__option pfSelect__option_clear"
                aria-selected="false"
                @pointerenter="onClearPointerEnter"
                @pointerdown="onClearPointerDown"
              >
                <span
                  class="pfSelect__optionLabel"
                  :class="props.ui?.optionLabel"
                >
                  {{ clearRowLabel }}
                </span>
              </div>
              <div
                v-if="!hasVisiblePanelOptions"
                class="pfSelect__panelEmpty"
                :class="props.ui?.panelEmpty"
              >
                <slot name="panelEmpty">{{ emptyText }}</slot>
              </div>
              <template
                v-for="row in panelRowsForTemplate"
                :key="
                  row.kind === 'divider'
                    ? `d-${row.beforeOptionIndex}`
                    : `o-${row.index}`
                "
              >
                <div
                  v-if="row.kind === 'divider'"
                  class="pfSelect__groupDivider"
                  :class="props.ui?.groupDivider"
                  role="separator"
                  aria-hidden="true"
                />
                <div
                  v-else
                  :id="optionDomId(row.index)"
                  role="option"
                  class="pfSelect__option"
                  :class="[
                    props.ui?.option,
                    highlightIndex === row.index &&
                      'pfSelect__option_highlighted',
                    optionIsSelected(row.index) && 'pfSelect__option_active',
                  ]"
                  :aria-selected="optionIsSelected(row.index)"
                  :aria-disabled="row.opt.disabled ? 'true' : undefined"
                  @pointerenter="onOptionPointerEnter(row.index)"
                  @pointerdown="onOptionPointerDown(row.index, $event)"
                >
                  <span
                    v-if="optionAvatarBindingsForOption(row.opt)"
                    class="pfSelect__optionLeading"
                    :class="props.ui?.optionLeading"
                  >
                    <PfAvatar v-bind="optionAvatarBindingsForOption(row.opt)" />
                  </span>
                  <span
                    v-else-if="row.opt.icon"
                    class="pfSelect__optionLeading"
                    :class="props.ui?.optionLeading"
                  >
                    <PfIcon :name="row.opt.icon" :size="optionIconSize" />
                  </span>
                  <span
                    v-else-if="row.opt.chip"
                    class="pfSelect__optionLeading"
                    :class="props.ui?.optionLeading"
                  >
                    <PfChip
                      standalone
                      :color="row.opt.chip.color ?? 'primary'"
                      :size="row.opt.chip.size ?? 'sm'"
                      :show="row.opt.chip.show !== false"
                      :class="props.ui?.optionChip"
                    />
                  </span>
                  <span
                    class="pfSelect__optionLabel"
                    :class="props.ui?.optionLabel"
                  >
                    {{ row.opt.label }}
                  </span>
                  <PfIcon
                    v-if="
                      optionIsSelected(row.index) &&
                      resolvedSelectedMarkForOption(row.opt)
                    "
                    :name="resolvedSelectedMarkForOption(row.opt)!"
                    :size="optionIconSize"
                    class="pfSelect__optionIcon"
                    :class="props.ui?.optionIcon"
                  />
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>

    <!-- Native select -->
    <template v-else>
      <div ref="shellRef" :class="shellClass">
        <span
          v-if="hasLeading"
          class="pfSelect__leading"
          :class="props.ui?.leading"
          aria-hidden="true"
        >
          <slot name="leading">
            <PfIcon
              v-if="loading"
              class="pfSelect__iconSpin"
              :name="spinnerIconName"
              :size="iconSize"
              :class="props.ui?.leadingIcon"
            />
            <PfAvatar
              v-else-if="leadingAvatarBindings"
              class="pfSelect__leadingAvatar"
              :class="props.ui?.leadingAvatar"
              v-bind="leadingAvatarBindings"
            />
            <PfIcon
              v-else-if="leadingIcon"
              :name="leadingIcon"
              :size="iconSize"
              :class="props.ui?.leadingIcon"
            />
          </slot>
        </span>
        <div class="pfSelect__field">
          <select
            :id="selectId"
            ref="selectRef"
            :class="nativeClass"
            :name="name"
            :required="required"
            :disabled="disabled"
            :multiple="multiple"
            :size="multiple && listboxRows != null ? listboxRows : undefined"
            :autocomplete="autocomplete"
            :autofocus="autofocus"
            :form="form"
            :value="!multiple ? singleSelectValue : undefined"
            :aria-busy="loading ? 'true' : undefined"
            v-bind="passthroughAttrs"
            @change="onNativeChange"
            @blur="onNativeBlur"
          >
            <template v-if="usesOptionsProp && resolvedOptions.length">
              <option v-if="placeholder && !multiple" value="" disabled>
                {{ placeholder }}
              </option>
              <template v-if="usesGroupedOptions">
                <template v-for="(grp, gi) in nativeGroupFlatRanges" :key="gi">
                  <optgroup :label="optionGroupLabelFor(gi)">
                    <option
                      v-for="(raw, j) in grp.items"
                      :key="grp.start + j"
                      :value="String(grp.start + j)"
                      :disabled="normalizeGroupItem(raw).disabled"
                      :selected="
                        multiple
                          ? optionSelectedIndex(grp.start + j)
                          : undefined
                      "
                    >
                      {{ normalizeGroupItem(raw).label }}
                    </option>
                  </optgroup>
                </template>
              </template>
              <template v-else>
                <option
                  v-for="(opt, i) in resolvedOptions"
                  :key="i"
                  :value="String(i)"
                  :disabled="opt.disabled"
                  :selected="multiple ? optionSelectedIndex(i) : undefined"
                >
                  {{ opt.label }}
                </option>
              </template>
            </template>
            <slot v-else />
          </select>
        </div>

        <span
          v-if="!multiple"
          class="pfSelect__trailing"
          :class="props.ui?.trailing"
          aria-hidden="true"
        >
          <PfIcon
            :name="chevronIconName"
            :size="iconSize"
            :class="props.ui?.icon"
          />
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@keyframes pfSelect-spin {
  to {
    transform: rotate(360deg);
  }
}

.pfSelect {
  --pf-input-border: var(--pf-border-color);
  --pf-input-muted: var(--pf-color-muted);
  --pf-input-ring: var(--pf-color-primary);
  --pf-input-surface: var(--pf-color-surface);
  --pf-input-text: var(--pf-color-text);
  /** Square for icon/chip in panel rows (same as `optionIconSize`). */
  --pf-select-option-leading-size: var(--pf-icon-size-sm);

  position: relative;

  width: 100%;
  max-width: 100%;
  display: inline-flex;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing);

  &_color_primary {
    --pf-input-ring: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-input-ring: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-input-ring: var(--pf-color-success);
  }

  &_color_info {
    --pf-input-ring: var(--pf-color-info);
  }

  &_color_warning {
    --pf-input-ring: var(--pf-color-warning);
  }

  &_color_error {
    --pf-input-ring: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-input-ring: var(--pf-color-neutral);
  }

  &_disabled {
    opacity: 0.55;
  }

  &_disabled &__native,
  &_disabled &__trigger {
    cursor: not-allowed;
  }

  &__leading {
    padding-inline-end: var(--pf-space-xs);
    padding-inline-start: var(--pf-input-pad-inline);
    display: flex;
    align-items: center;
    flex-shrink: 0;

    color: var(--pf-input-muted);
  }

  &__leading :deep(.pfAvatar),
  &__leading :deep(.pfIcon) {
    flex-shrink: 0;
  }

  &__leading :deep(.pfChip) {
    flex-shrink: 0;
  }

  &__leadingChip {
    min-width: var(--pf-select-option-leading-size);
    min-height: var(--pf-select-option-leading-size);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  &__shell {
    position: relative;

    width: 100%;
    min-width: 0;
    display: flex;
    align-items: stretch;
    box-sizing: border-box;

    box-shadow: var(--pf-input-shadow);
    background: var(--pf-input-bg);
    border-radius: var(--pf-input-radius);
    outline: var(--pf-input-outline, none);
    outline-offset: 0;

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
      outline-color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__shell:focus-within {
    box-shadow: var(--pf-input-shadow-focus);
    outline: none;
  }

  &_mode_custom.pfSelect_open &__shell {
    box-shadow: var(--pf-input-shadow-focus);
    outline: none;
  }

  &_highlight &__shell:not(:focus-within) {
    box-shadow: var(--pf-input-shadow-highlight);
  }

  &_mode_custom.pfSelect_open.pfSelect_highlight &__shell {
    box-shadow: var(--pf-input-shadow-focus);
  }

  &__field {
    position: relative;

    min-width: 0;
    flex: 1;
    box-sizing: border-box;
  }

  &__trigger {
    margin: 0;

    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    padding-inline-end: var(--pf-input-trailing-pad);
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    gap: var(--pf-space-xs);

    color: var(--pf-input-text);
    font-family: inherit;
    font-size: var(--pf-input-font-size);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-input-line-height);
    text-align: start;

    background: transparent;
    border: none;
    border-radius: inherit;
    outline: none;

    transition:
      color var(--pf-animation-duration) var(--pf-animation-easing),
      background-color var(--pf-animation-duration) var(--pf-animation-easing);

    cursor: pointer;

    &:focus-visible {
      outline: none;
    }
  }

  /** In `mode_custom` chevron is in the flex flow — no duplicate “pocket” for absolute icon. */
  &__triggerSlotWrap {
    min-width: 0;
    display: flex;
    align-items: stretch;
    flex: 1;
    box-sizing: border-box;
  }

  &_mode_custom &__trigger {
    padding-inline-end: var(--pf-input-pad-inline);
  }

  &_hasLeading.pfSelect_mode_custom &__trigger {
    padding-inline-start: var(--pf-space-sm);
  }

  &_hasLeading.pfSelect_mode_custom &__triggerSlotWrap :deep(.pfInput) {
    min-width: 0;
    flex: 1;
  }

  &_hasLeading &__native:not([multiple]) {
    padding-inline-start: var(--pf-space-sm);
  }

  &__triggerLabel {
    min-width: 0;
    display: flex;
    flex: 1;

    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;

    &_placeholder {
      color: var(--pf-input-muted);
    }

    &::before {
      content: '.';

      width: 0;
      display: flex;

      color: transparent;

      overflow: hidden;
      opacity: 0;
    }
  }

  &__trailing {
    position: absolute;
    z-index: 2;
    inset-block: 0;
    inset-inline-end: 0;

    padding-inline-end: var(--pf-input-pad-inline);
    padding-inline-start: var(--pf-space-xs);
    display: flex;
    align-items: center;
    flex-shrink: 0;

    color: var(--pf-input-muted);

    pointer-events: none;
  }

  &_mode_custom &__trailing {
    position: static;

    padding-inline-end: 0;
    padding-inline-start: 0;

    color: inherit;
  }

  &__trailing :deep(.pfIcon) {
    flex-shrink: 0;

    transition: transform var(--pf-animation-duration)
      var(--pf-animation-easing);
  }

  :deep(.pfSelect__chevron_open) {
    transform: rotate(180deg);
  }

  &__iconSpin {
    animation: pfSelect-spin 0.85s linear infinite;
  }

  &__nativeOffscreen {
    position: absolute;
    margin: -1px;

    padding: 0;
    width: 1px;
    height: 1px;

    white-space: nowrap;

    border: 0;
    overflow: hidden;
    opacity: 0;

    pointer-events: none;
    clip: rect(0, 0, 0, 0);
  }

  &.pfSelect__panelAnchor {
    --pf-select-menu-gap-half: calc(var(--pf-select-menu-gap, 8px) / 2);

    box-sizing: border-box;
  }

  &__panelEmpty {
    padding: var(--pf-space-sm) var(--pf-space-md);

    color: var(--pf-input-muted);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);
    text-align: center;
  }

  &__panel {
    padding: var(--pf-space-xs);
    width: 100%;
    min-width: 100%;
    max-height: min(18rem, 70vh);
    box-sizing: border-box;

    box-shadow:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 var(--pf-space-xs) var(--pf-space-lg)
        color-mix(in srgb, var(--pf-color-text) 12%, transparent);
    background: var(--pf-input-surface);
    border-radius: var(--pf-input-radius);
    overflow-x: hidden;
    overflow-y: auto;
  }

  &__groupDivider {
    margin-block: var(--pf-space-sm);
    margin-inline: calc(-1 * var(--pf-space-xs));

    height: var(--pf-stroke-width);
    flex-shrink: 0;

    background: color-mix(
      in srgb,
      var(--pf-color-text) 12%,
      var(--pf-input-border)
    );
  }

  &__option {
    margin: 0;

    padding: var(--pf-space-xs) var(--pf-space-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--pf-space-sm);

    color: var(--pf-input-text);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);

    border-radius: var(--pf-radius-sm);

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing);

    cursor: pointer;

    &[aria-disabled='true'] {
      opacity: 0.45;

      cursor: not-allowed;
    }

    &_clear {
      color: var(--pf-input-muted);
      font-size: var(--pf-input-font-size);
      line-height: var(--pf-input-line-height);
    }

    &_highlighted:not(&__option[aria-disabled='true']) {
      background: color-mix(in srgb, var(--pf-input-muted) 14%, transparent);
    }
  }

  &__optionLeading {
    width: var(--pf-select-option-leading-size);
    min-width: var(--pf-select-option-leading-size);
    min-height: var(--pf-select-option-leading-size);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-sizing: border-box;

    color: var(--pf-input-text);
  }

  &__optionLeading :deep(.pfAvatar),
  &__optionLeading :deep(.pfIcon),
  &__optionLeading :deep(.pfChip) {
    flex-shrink: 0;
  }

  &__optionLabel {
    min-width: 0;
    display: flex;
    align-items: center;
    flex: 1;
  }

  &__optionIcon {
    flex-shrink: 0;

    color: var(--pf-input-text);
  }

  &__native {
    position: relative;
    z-index: 0;
    margin: 0;

    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    padding-inline-end: var(--pf-input-pad-inline);
    width: 100%;
    min-width: 0;
    display: block;
    box-sizing: border-box;

    color: var(--pf-input-text);
    font-family: inherit;
    font-size: var(--pf-input-font-size);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-input-line-height);

    background: transparent;
    border: none;
    border-radius: inherit;
    outline: none;

    transition:
      color var(--pf-animation-duration) var(--pf-animation-easing),
      background-color var(--pf-animation-duration) var(--pf-animation-easing);

    cursor: pointer;
    appearance: none;

    &:focus-visible {
      outline: none;
    }

    &:disabled {
      cursor: not-allowed;
    }

    &[multiple] {
      padding-inline-end: var(--pf-input-pad-inline);

      cursor: default;
    }
  }

  &_hasTrailing &__native:not([multiple]) {
    padding-inline-end: var(--pf-input-trailing-pad);
  }

  &_variant_outline {
    --pf-input-bg: var(--pf-input-surface);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border);
    --pf-input-shadow-focus:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-ring) 40%, transparent);
  }

  &_variant_soft {
    --pf-input-bg: color-mix(in srgb, var(--pf-input-muted) 10%, transparent);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) transparent;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_variant_subtle {
    --pf-input-bg: color-mix(in srgb, var(--pf-input-muted) 8%, transparent);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border);
    --pf-input-shadow-focus:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-ring) 40%, transparent);
  }

  &_variant_ghost {
    --pf-input-bg: transparent;
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) transparent;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_variant_none {
    --pf-input-bg: transparent;
    --pf-input-shadow: none;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_size_xs {
    --pf-input-font-size: var(--pf-font-size-xs);
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 1.75rem;
    --pf-select-option-leading-size: var(--pf-icon-size-2xs);
  }

  &_size_sm {
    --pf-input-font-size: var(--pf-font-size-sm);
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 2rem;
    --pf-select-option-leading-size: var(--pf-icon-size-xs);
  }

  &_size_md {
    --pf-input-font-size: var(--pf-font-size-md);
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-sm);
    --pf-input-pad-inline: var(--pf-space-md);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 2.25rem;
    --pf-select-option-leading-size: var(--pf-icon-size-sm);
  }

  &_size_lg {
    --pf-input-font-size: var(--pf-font-size-md);
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-sm);
    --pf-input-pad-inline: var(--pf-space-lg);
    --pf-input-radius: var(--pf-radius-md);
    --pf-input-trailing-pad: 2.5rem;
    --pf-select-option-leading-size: var(--pf-icon-size-sm);
  }

  &_size_xl {
    --pf-input-font-size: var(--pf-font-size-lg);
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-md);
    --pf-input-pad-inline: var(--pf-space-lg);
    --pf-input-radius: var(--pf-radius-md);
    --pf-input-trailing-pad: 2.75rem;
    --pf-select-option-leading-size: var(--pf-icon-size-md);
  }

  &:focus-within {
    z-index: 1;
  }

  &_open {
    z-index: 2;
  }
}

/* Transform on Transition root (anchor with position:fixed), not on .pfSelect__panel —
   otherwise on leave the inner block shifts up relative to the anchor. */
.pfSelectDrop-enter-active,
.pfSelectDrop-leave-active {
  transform-origin: top center;
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfSelectDrop-enter-from,
.pfSelectDrop-leave-to {
  opacity: 0;

  transform: translateY(calc(-1 * var(--pf-select-menu-gap-half))) scale(0.98);
}

.pfSelectDrop-enter-to,
.pfSelectDrop-leave-from {
  opacity: 1;

  transform: translateY(0) scale(1);
}
</style>
