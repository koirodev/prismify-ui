<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  watch,
  type Component,
} from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfBadge from '../../element/PfBadge/index.vue';
import PfChip from '../../element/PfChip/index.vue';
import PfCollapsible from '../../element/PfCollapsible/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfLink from '../PfLink/index.vue';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfNavigationMenuColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfNavigationMenuVariant = 'pill' | 'link';

export type PfNavigationMenuOrientation = 'horizontal' | 'vertical';

export type PfNavigationMenuContentOrientation = 'horizontal' | 'vertical';

export type PfNavigationMenuType = 'single' | 'multiple';

export type PfNavigationMenuItemType = 'label' | 'trigger' | 'link';

export type PfNavigationMenuItemAvatar = {
  src?: string;
  alt?: string;
  icon?: PfIconName;
  text?: string;
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  chip?:
    | boolean
    | { color?: import('../../element/PfAvatar/index.vue').PfAvatarChipColor };
};

export type PfNavigationMenuItemBadge =
  | string
  | number
  | {
      label?: string | number;
      color?:
        | 'error'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'info'
        | 'warning'
        | 'neutral';
      variant?: 'solid' | 'outline' | 'soft' | 'subtle';
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    };

export type PfNavigationMenuItemChip =
  | boolean
  | {
      color?: import('../../element/PfChip/index.vue').PfChipColor;
      text?: string | number;
      show?: boolean;
    };

type PfNavigationMenuSlots = Readonly<
  Record<string, ((props?: Record<string, unknown>) => unknown) | undefined>
>;

export interface PfNavigationMenuChildUi {
  link?: string;
  icon?: string;
  label?: string;
  description?: string;
}

export interface PfNavigationMenuChildItem {
  label?: string;
  description?: string;
  icon?: PfIconName;
  disabled?: boolean;
  class?: unknown;
  ui?: PfNavigationMenuChildUi;
  onSelect?: (e: Event) => void;
  to?: RouteLocationRaw;
  href?: RouteLocationRaw;
  target?: string | null;
  external?: boolean;
  [key: string]: unknown;
}

export interface PfNavigationMenuItem extends PfNavigationMenuChildItem {
  children?: readonly PfNavigationMenuChildItem[];
  type?: PfNavigationMenuItemType;
  badge?: PfNavigationMenuItemBadge;
  avatar?: PfNavigationMenuItemAvatar;
  chip?: PfNavigationMenuItemChip;
  trailingIcon?: PfIconName;
  defaultOpen?: boolean;
  open?: boolean;
  value?: string;
  active?: boolean;
  slot?: string;
}

export type PfNavigationMenuItemsInput =
  | readonly PfNavigationMenuItem[]
  | readonly (readonly PfNavigationMenuItem[])[];

export type PfNavigationMenuUi = Partial<{
  root: string;
  list: string;
  group: string;
  label: string;
  item: string;
  link: string;
  linkLeadingIcon: string;
  linkLeadingAvatar: string;
  linkLeadingAvatarSize: string;
  linkLabel: string;
  linkTrailing: string;
  linkTrailingBadge: string;
  linkTrailingBadgeSize: string;
  linkTrailingIcon: string;
  childList: string;
  childItem: string;
  childLink: string;
  childLinkIcon: string;
  childLinkLabel: string;
  childLinkLabelExternalIcon: string;
  childLinkDescription: string;
  dropdown: string;
  separator: string;
  arrow: string;
  viewport: string;
}>;

const LINK_PROP_KEYS = new Set([
  'to',
  'href',
  'target',
  'external',
  'exact',
  'exactQuery',
  'exactHash',
  'inactiveClass',
  'raw',
  'replace',
  'viewTransition',
  'prefetch',
  'noPrefetch',
  'trailingSlash',
  'activeClass',
  'exactActiveClass',
  'ariaCurrentValue',
  'name',
  'rel',
  'noRel',
]);

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    items?: PfNavigationMenuItemsInput;
    color?: PfNavigationMenuColor;
    variant?: PfNavigationMenuVariant;
    orientation?: PfNavigationMenuOrientation;
    contentOrientation?: PfNavigationMenuContentOrientation;
    collapsed?: boolean;
    highlight?: boolean;
    highlightColor?: PfNavigationMenuColor;
    trailingIcon?: PfIconName;
    /** Show external-link icon on child items; `false` — hide. */
    externalIcon?: boolean | PfIconName;
    arrow?: boolean;
    unmountOnHide?: boolean;
    type?: PfNavigationMenuType;
    collapsible?: boolean;
    valueKey?: string;
    labelKey?: string;
    modelValue?: string | string[];
    defaultValue?: string | string[];
    tooltip?: boolean;
    popover?: boolean;
    ui?: PfNavigationMenuUi;
    disabled?: boolean;
    disableHoverTrigger?: boolean;
    disableClickTrigger?: boolean;
    delayDuration?: number;
  }>(),
  {
    items: () => [] as unknown as PfNavigationMenuItemsInput,
    color: 'primary',
    variant: 'pill',
    orientation: 'horizontal',
    contentOrientation: 'horizontal',
    collapsed: false,
    highlight: false,
    highlightColor: 'primary',
    trailingIcon: 'angleSmallDown',
    externalIcon: true,
    arrow: false,
    unmountOnHide: true,
    type: 'multiple',
    collapsible: true,
    valueKey: 'value',
    labelKey: 'label',
    tooltip: true,
    popover: false,
    disabled: false,
    disableHoverTrigger: false,
    disableClickTrigger: false,
    delayDuration: 0,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

defineSlots<{
  'item-leading'(props: Record<string, unknown>): unknown;
  'item-label'(props: Record<string, unknown>): unknown;
  'item-trailing'(props: Record<string, unknown>): unknown;
  'item-content'(props: Record<string, unknown>): unknown;
  'list-leading'(): unknown;
  'list-trailing'(): unknown;
  [key: string]:
    | ((props: Record<string, unknown>) => unknown)
    | (() => unknown);
}>();

const attrs = useAttrs();
const slots = useSlots() as PfNavigationMenuSlots;
const modelBound = usePfVModelBound();

const rootRef = ref<HTMLElement | null>(null);
const horizontalOpenValue = ref<string | null>(null);
const closeTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const verticalOpenSet = ref<Set<string>>(new Set());

const internalModel = ref<string | string[] | undefined>(undefined);

if (!modelBound.value) {
  internalModel.value = props.defaultValue;
}

const activeModel = computed((): string | string[] | undefined => {
  if (modelBound.value) {
    return props.modelValue;
  }
  return internalModel.value;
});

function updateModel(next: string | string[] | undefined) {
  if (modelBound.value) {
    emit('update:modelValue', next);
  } else {
    internalModel.value = next;
  }
}

function onTopLevelLeafActivate(
  item: PfNavigationMenuItem,
  groupIndex: number,
  index: number
) {
  if (props.disabled || item.disabled) return;
  const v = itemValue(item, groupIndex, index);
  if (props.orientation === 'vertical' && props.type === 'multiple') {
    const cur = activeModel.value;
    const arr = Array.isArray(cur) ? [...cur] : [];
    const i = arr.indexOf(v);
    if (i >= 0) {
      arr.splice(i, 1);
    } else {
      arr.push(v);
    }
    updateModel(arr);
    return;
  }
  updateModel(v);
}

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'nav';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => [
  'pfNavigationMenu',
  `pfNavigationMenu_orientation_${props.orientation}`,
  `pfNavigationMenu_variant_${props.variant}`,
  `pfNavigationMenu_color_${props.color}`,
  props.highlight ? 'pfNavigationMenu_highlight' : null,
  props.highlight
    ? `pfNavigationMenu_highlightColor_${props.highlightColor}`
    : null,
  props.collapsed ? 'pfNavigationMenu_collapsed' : null,
  attrs.class,
  props.ui?.root,
]);

const groups = computed((): PfNavigationMenuItem[][] => {
  const raw = props.items;
  if (!raw || raw.length === 0) return [];
  const first = raw[0] as unknown;
  if (Array.isArray(first)) {
    return (raw as readonly PfNavigationMenuItem[][]).map((g) => [...g]);
  }
  return [raw as PfNavigationMenuItem[]];
});

function itemRecord(
  item: PfNavigationMenuItem | PfNavigationMenuChildItem
): Record<string, unknown> {
  return item as Record<string, unknown>;
}

function itemValue(
  item: PfNavigationMenuItem,
  groupIndex: number,
  index: number
): string {
  const raw = itemRecord(item)[props.valueKey];
  if (raw !== undefined && raw !== null && String(raw) !== '') {
    return String(raw);
  }
  return `item-${groupIndex}-${index}`;
}

function itemLabel(
  item: PfNavigationMenuItem | PfNavigationMenuChildItem
): string {
  const raw = itemRecord(item)[props.labelKey];
  return raw !== undefined && raw !== null ? String(raw) : '';
}

function hasChildren(item: PfNavigationMenuItem): boolean {
  return Boolean(item.children && item.children.length > 0);
}

function isLabelRow(item: PfNavigationMenuItem): boolean {
  return item.type === 'label';
}

function linkProps(
  item: PfNavigationMenuItem | PfNavigationMenuChildItem,
  activeOverride?: boolean
): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  const rec = itemRecord(item);
  for (const k of LINK_PROP_KEYS) {
    if (k in rec) r[k] = rec[k];
  }
  if (activeOverride !== undefined) {
    r.active = activeOverride;
  } else if ('active' in rec) {
    r.active = rec.active;
  }
  r.disabled = props.disabled || Boolean(rec.disabled);
  return r;
}

function isItemHighlighted(
  item: PfNavigationMenuItem,
  groupIndex: number,
  index: number
): boolean {
  if (item.active) return true;
  const v = itemValue(item, groupIndex, index);
  const mv = activeModel.value;
  if (mv === undefined) return false;
  if (props.orientation === 'vertical' && props.type === 'multiple') {
    return Array.isArray(mv) && mv.includes(v);
  }
  return mv === v;
}

function isExternalChild(child: PfNavigationMenuChildItem): boolean {
  const t = child.target;
  if (t === '_blank') return true;
  if (child.external === true) return true;
  const to = child.to ?? child.href;
  if (typeof to === 'string') {
    return /^(https?:)?\/\//i.test(to) || /^mailto:/i.test(to);
  }
  return false;
}

function externalIconName(child: PfNavigationMenuChildItem): PfIconName | null {
  const ex = props.externalIcon;
  if (ex === false) return null;
  if (typeof ex === 'string') return ex;
  if (!isExternalChild(child)) return null;
  return 'arrowUpRight';
}

function badgeBind(item: PfNavigationMenuItem): Record<string, unknown> | null {
  const b = item.badge;
  if (b === undefined || b === null) return null;
  if (typeof b === 'string' || typeof b === 'number') {
    return { label: b, size: 'sm' };
  }
  const o = b as Record<string, unknown>;
  return {
    ...o,
    size: (o.size as string | undefined) ?? 'sm',
  };
}

function chipPropsFor(item: PfNavigationMenuItem): {
  color: import('../../element/PfChip/index.vue').PfChipColor;
  text?: string | number;
  show: boolean;
} | null {
  const c = item.chip;
  if (!c) return null;
  if (c === true) {
    return { color: 'primary', show: true };
  }
  return {
    color: c.color ?? 'primary',
    text: c.text,
    show: c.show !== false,
  };
}

const iconSize = computed((): PfIconSize => 'md');

function initVerticalOpenFromItems() {
  const next = new Set<string>();
  groups.value.forEach((g, gi) => {
    g.forEach((item, ii) => {
      if (hasChildren(item) && item.defaultOpen) {
        next.add(itemValue(item, gi, ii));
      }
    });
  });
  verticalOpenSet.value = next;
}

initVerticalOpenFromItems();

watch(
  () => groups.value,
  () => initVerticalOpenFromItems(),
  { deep: true }
);

function isVerticalOpen(val: string): boolean {
  return verticalOpenSet.value.has(val);
}

function setVerticalOpen(val: string, open: boolean) {
  if (!open && !props.collapsible && props.type === 'single') {
    return;
  }
  const next = new Set(verticalOpenSet.value);
  if (props.type === 'single') {
    if (open) {
      next.clear();
      next.add(val);
    } else {
      next.delete(val);
    }
  } else {
    if (open) next.add(val);
    else next.delete(val);
  }
  verticalOpenSet.value = next;
}

function onVerticalCollapsibleUpdate(
  item: PfNavigationMenuItem,
  val: string,
  next: boolean
) {
  if (item.open !== undefined) {
    return;
  }
  setVerticalOpen(val, next);
}

function clearCloseTimer() {
  if (closeTimer.value) {
    clearTimeout(closeTimer.value);
    closeTimer.value = null;
  }
}

function scheduleCloseHorizontal() {
  clearCloseTimer();
  closeTimer.value = setTimeout(() => {
    horizontalOpenValue.value = null;
  }, 150);
}

function openHorizontal(val: string | null) {
  clearCloseTimer();
  horizontalOpenValue.value = val;
}

function onTriggerEnter(val: string) {
  if (props.disabled || props.disableHoverTrigger) return;
  if (props.delayDuration > 0) {
    clearCloseTimer();
    closeTimer.value = setTimeout(() => {
      horizontalOpenValue.value = val;
    }, props.delayDuration);
    return;
  }
  openHorizontal(val);
}

function onTriggerLeave() {
  if (props.disableHoverTrigger) return;
  scheduleCloseHorizontal();
}

function onDropdownEnter() {
  clearCloseTimer();
}

function onTriggerClick(val: string, item: PfNavigationMenuItem) {
  if (props.disabled || item.disabled) return;
  if (props.disableClickTrigger) {
    if (!props.disableHoverTrigger) {
      onTriggerEnter(val);
    }
    return;
  }
  if (horizontalOpenValue.value === val) {
    horizontalOpenValue.value = null;
  } else {
    horizontalOpenValue.value = val;
  }
}

function onDocClick(e: MouseEvent) {
  const t = e.target;
  if (!(t instanceof Node)) return;
  if (rootRef.value?.contains(t)) return;
  horizontalOpenValue.value = null;
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    horizontalOpenValue.value = null;
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick, true);
  document.addEventListener('keydown', onDocKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, true);
  document.removeEventListener('keydown', onDocKeydown);
  clearCloseTimer();
  slideShellHeightRo?.disconnect();
  slideShellHeightRo = null;
});

function hasNamedSlot(name: string | undefined): boolean {
  if (!name) return false;
  return Boolean(slots[name]);
}

function leadingForItem(item: PfNavigationMenuItem) {
  const chip = chipPropsFor(item);
  if (item.avatar) {
    return { kind: 'avatar' as const, item };
  }
  if (item.icon) {
    if (chip) {
      return { kind: 'iconChip' as const, item, chip };
    }
    return { kind: 'icon' as const, item };
  }
  return { kind: 'none' as const, item };
}

function trailingIconFor(item: PfNavigationMenuItem): PfIconName | null {
  if (!hasChildren(item)) return null;
  return item.trailingIcon ?? props.trailingIcon;
}

function dropdownOpen(
  groupIndex: number,
  index: number,
  item: PfNavigationMenuItem
): boolean {
  const v = itemValue(item, groupIndex, index);
  return horizontalOpenValue.value === v;
}

function showHorizontalDropdown(item: PfNavigationMenuItem): boolean {
  return hasChildren(item) && !isLabelRow(item);
}

function childListClass(): string[] {
  const base: string[] = [
    'pfNavigationMenu__childList',
    ...(props.ui?.childList ? [props.ui.childList] : []),
  ];
  if (props.contentOrientation === 'vertical') {
    base.push('pfNavigationMenu__childList_vertical');
  } else {
    base.push('pfNavigationMenu__childList_horizontal');
  }
  return base;
}

function titleForCollapsed(item: PfNavigationMenuItem): string | undefined {
  if (!props.collapsed || props.orientation !== 'vertical') return undefined;
  if (!props.tooltip) return undefined;
  return itemLabel(item) || undefined;
}

const hasHorizontalDropdownItems = computed(() => {
  for (const g of groups.value) {
    for (const item of g) {
      if (showHorizontalDropdown(item)) return true;
    }
  }
  return false;
});

/** While the plank close animation runs, keep value for content */
const frozenHorizontalPlankValue = ref<string | null>(null);

const showHorizontalPlank = ref(false);

const horizontalPlankActiveValue = computed(
  () => horizontalOpenValue.value ?? frozenHorizontalPlankValue.value
);

const openHorizontalContext = computed(
  (): {
    item: PfNavigationMenuItem;
    groupIndex: number;
    index: number;
  } | null => {
    const v = horizontalPlankActiveValue.value;
    if (v == null) return null;
    for (let gi = 0; gi < groups.value.length; gi++) {
      const g = groups.value[gi]!;
      for (let ii = 0; ii < g.length; ii++) {
        const item = g[ii]!;
        if (itemValue(item, gi, ii) === v && showHorizontalDropdown(item)) {
          return { item, groupIndex: gi, index: ii };
        }
      }
    }
    return null;
  }
);

/** Order of `value` for items with submenus (as in markup) — animation direction on change */
const dropdownItemValuesInOrder = computed(() => {
  const out: string[] = [];
  groups.value.forEach((g, gi) => {
    g.forEach((item, ii) => {
      if (showHorizontalDropdown(item)) {
        out.push(itemValue(item, gi, ii));
      }
    });
  });
  return out;
});

type HorizontalPaneTransitionKind = 'open' | 'next' | 'prev';

const horizontalPaneTransitionKind = ref<HorizontalPaneTransitionKind>('open');

/** Only first open from closed — no height transition (when changing item we animate) */
const heightTransitionInstant = ref(false);

watch(horizontalOpenValue, (val, oldVal) => {
  if (val != null) {
    frozenHorizontalPlankValue.value = val;
    showHorizontalPlank.value = true;
    if (oldVal == null) {
      horizontalPaneTransitionKind.value = 'open';
      heightTransitionInstant.value = true;
    } else {
      heightTransitionInstant.value = false;
      const order = dropdownItemValuesInOrder.value;
      const iOld = order.indexOf(oldVal);
      const iNew = order.indexOf(val);
      if (iOld < 0 || iNew < 0) {
        horizontalPaneTransitionKind.value = 'open';
      } else {
        horizontalPaneTransitionKind.value = iNew > iOld ? 'next' : 'prev';
      }
    }
  } else {
    showHorizontalPlank.value = false;
    heightTransitionInstant.value = false;
  }
});

const horizontalPaneTransitionName = computed(() => {
  switch (horizontalPaneTransitionKind.value) {
    case 'next':
      return 'pfNavPaneNext';
    case 'prev':
      return 'pfNavPanePrev';
    default:
      return 'pfNavPaneOpen';
  }
});

const slideShellMeasureRef = ref<HTMLElement | null>(null);
const slideShellOuterHeightPx = ref<number | undefined>(undefined);
let slideShellHeightRo: ResizeObserver | null = null;

function cappedViewportContentHeight(raw: number): number {
  if (typeof window === 'undefined') return raw;
  return Math.min(raw, window.innerHeight * 0.7);
}

function slideShellVerticalPaddingPx(shell: HTMLElement): number {
  const cs = getComputedStyle(shell);
  return (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
}

function applySlideShellOuterHeight() {
  const shell = slideShellMeasureRef.value;
  if (!shell) return;
  const panes = shell.querySelectorAll('.pfNavigationMenu__slidePane');
  let raw: number;
  if (panes.length > 1) {
    const entering =
      shell.querySelector(
        [
          '.pfNavigationMenu__slidePane.pfNavPaneNext-enter-active',
          '.pfNavigationMenu__slidePane.pfNavPanePrev-enter-active',
          '.pfNavigationMenu__slidePane.pfNavPaneOpen-enter-active',
        ].join(', ')
      ) ?? panes[panes.length - 1];
    const paneH = Math.ceil((entering as HTMLElement).scrollHeight);
    raw = paneH + slideShellVerticalPaddingPx(shell);
    if (raw <= 0) {
      raw = Math.ceil(shell.scrollHeight);
    }
  } else {
    /* slideShell padding is included in the shell scrollHeight */
    raw = Math.ceil(shell.scrollHeight);
  }
  if (raw > 0) {
    slideShellOuterHeightPx.value = cappedViewportContentHeight(raw);
  }
}

function attachSlideShellHeightObserver() {
  slideShellHeightRo?.disconnect();
  slideShellHeightRo = null;
  const el = slideShellMeasureRef.value;
  if (!el) return;
  slideShellHeightRo = new ResizeObserver(() => {
    const shell = slideShellMeasureRef.value;
    if (!shell) return;
    if (shell.querySelectorAll('.pfNavigationMenu__slidePane').length > 1) {
      return;
    }
    applySlideShellOuterHeight();
  });
  slideShellHeightRo.observe(el);
}

/** After content layout — outer height = slideShell (with padding), not pane only */
function onHorizontalDropdownPaneEnter(_el: Element) {
  const run = () => applySlideShellOuterHeight();
  nextTick(() => {
    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(() => {
        run();
        heightTransitionInstant.value = false;
      });
    });
  });
}

watch(slideShellMeasureRef, (el) => {
  attachSlideShellHeightObserver();
  if (el) {
    nextTick(() => applySlideShellOuterHeight());
  }
});

function onHorizontalPlankAfterLeave() {
  frozenHorizontalPlankValue.value = null;
  slideShellOuterHeightPx.value = undefined;
  slideShellHeightRo?.disconnect();
  slideShellHeightRo = null;
}

const slideShellOuterStyle = computed(() => {
  if (horizontalPlankActiveValue.value == null) return undefined;
  if (slideShellOuterHeightPx.value == null) return undefined;
  return { height: `${slideShellOuterHeightPx.value}px` };
});

defineExpose({
  /** Close the expanded horizontal submenu. */
  closeDropdown: () => {
    horizontalOpenValue.value = null;
  },
});
</script>

<template>
  <component
    :is="resolvedTag"
    ref="rootRef"
    :class="rootClass"
    role="navigation"
    :data-orientation="orientation"
    v-bind="passthroughAttrs"
  >
    <div v-if="slots['list-leading']" class="pfNavigationMenu__listSlot">
      <slot name="list-leading" />
    </div>

    <template v-if="orientation === 'horizontal'">
      <div
        class="pfNavigationMenu__horizontalSurface"
        @mouseleave="onTriggerLeave"
      >
        <div class="pfNavigationMenu__bar" :class="props.ui?.list">
          <div
            v-for="(group, groupIndex) in groups"
            :key="`g-${groupIndex}`"
            class="pfNavigationMenu__group"
            :class="props.ui?.group"
          >
            <template
              v-for="(item, index) in group"
              :key="itemValue(item, groupIndex, index)"
            >
              <div
                v-if="isLabelRow(item)"
                class="pfNavigationMenu__sectionLabel"
                :class="[props.ui?.label, item.class]"
              >
                {{ itemLabel(item) }}
              </div>

              <div
                v-else-if="showHorizontalDropdown(item)"
                class="pfNavigationMenu__item pfNavigationMenu__item_dropdown"
                :class="[
                  props.ui?.item,
                  item.class,
                  dropdownOpen(groupIndex, index, item)
                    ? 'pfNavigationMenu__item_open'
                    : null,
                ]"
                :data-state="
                  dropdownOpen(groupIndex, index, item) ? 'open' : 'closed'
                "
              >
                <button
                  type="button"
                  class="pfNavigationMenu__trigger"
                  :class="[
                    props.ui?.link,
                    isItemHighlighted(item, groupIndex, index)
                      ? 'pfNavigationMenu__trigger_active'
                      : null,
                    item.disabled || disabled
                      ? 'pfNavigationMenu__trigger_disabled'
                      : null,
                  ]"
                  :disabled="disabled || item.disabled"
                  :aria-expanded="dropdownOpen(groupIndex, index, item)"
                  :title="titleForCollapsed(item)"
                  @mouseenter="
                    onTriggerEnter(itemValue(item, groupIndex, index))
                  "
                  @click="
                    onTriggerClick(itemValue(item, groupIndex, index), item)
                  "
                >
                  <template
                    v-if="item.slot && hasNamedSlot(`${item.slot}-leading`)"
                  >
                    <slot
                      :name="`${item.slot}-leading`"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </template>
                  <template v-else-if="slots['item-leading']">
                    <slot
                      name="item-leading"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </template>
                  <span
                    v-else-if="leadingForItem(item).kind === 'avatar'"
                    class="pfNavigationMenu__leadingAvatar"
                    :class="props.ui?.linkLeadingAvatar"
                  >
                    <PfAvatar
                      v-bind="item.avatar!"
                      :size="item.avatar!.size ?? '2xs'"
                      :class="props.ui?.linkLeadingAvatarSize"
                    />
                  </span>
                  <span
                    v-else-if="leadingForItem(item).kind === 'iconChip'"
                    class="pfNavigationMenu__leadingIcon"
                    :class="props.ui?.linkLeadingIcon"
                  >
                    <PfChip standalone v-bind="chipPropsFor(item)!">
                      <PfIcon :name="item.icon!" :size="iconSize" />
                    </PfChip>
                  </span>
                  <PfIcon
                    v-else-if="leadingForItem(item).kind === 'icon'"
                    class="pfNavigationMenu__leadingIcon"
                    :class="props.ui?.linkLeadingIcon"
                    :name="item.icon!"
                    :size="iconSize"
                  />

                  <span
                    v-if="item.slot && hasNamedSlot(`${item.slot}-label`)"
                    class="pfNavigationMenu__label"
                    :class="props.ui?.linkLabel"
                  >
                    <slot
                      :name="`${item.slot}-label`"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else-if="slots['item-label']"
                    class="pfNavigationMenu__label"
                    :class="props.ui?.linkLabel"
                  >
                    <slot
                      name="item-label"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else
                    class="pfNavigationMenu__label"
                    :class="props.ui?.linkLabel"
                  >
                    {{ itemLabel(item) }}
                  </span>

                  <span
                    v-if="item.slot && hasNamedSlot(`${item.slot}-trailing`)"
                    class="pfNavigationMenu__trailing"
                    :class="props.ui?.linkTrailing"
                  >
                    <slot
                      :name="`${item.slot}-trailing`"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else-if="slots['item-trailing']"
                    class="pfNavigationMenu__trailing"
                    :class="props.ui?.linkTrailing"
                  >
                    <slot
                      name="item-trailing"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else
                    class="pfNavigationMenu__trailing"
                    :class="props.ui?.linkTrailing"
                  >
                    <PfBadge
                      v-if="badgeBind(item)"
                      v-bind="badgeBind(item)!"
                      :class="props.ui?.linkTrailingBadge"
                    />
                    <PfIcon
                      v-if="trailingIconFor(item)"
                      class="pfNavigationMenu__chevron"
                      :class="[
                        props.ui?.linkTrailingIcon,
                        dropdownOpen(groupIndex, index, item)
                          ? 'pfNavigationMenu__chevron_open'
                          : null,
                      ]"
                      :name="trailingIconFor(item)!"
                      :size="iconSize"
                    />
                  </span>
                </button>
              </div>

              <div
                v-else-if="item.slot && hasNamedSlot(item.slot)"
                class="pfNavigationMenu__item"
                :class="[props.ui?.item, item.class]"
              >
                <slot
                  :name="item.slot"
                  :item="item"
                  :group-index="groupIndex"
                  :index="index"
                />
              </div>

              <PfLink
                v-else
                class="pfNavigationMenu__link"
                :class="[
                  props.ui?.link,
                  item.class,
                  isItemHighlighted(item, groupIndex, index)
                    ? 'pfNavigationMenu__link_active'
                    : null,
                ]"
                v-bind="
                  linkProps(item, isItemHighlighted(item, groupIndex, index))
                "
                :title="titleForCollapsed(item)"
                @click="onTopLevelLeafActivate(item, groupIndex, index)"
              >
                <template #default>
                  <span
                    v-if="item.slot && hasNamedSlot(`${item.slot}-leading`)"
                    class="pfNavigationMenu__leadingWrap"
                  >
                    <slot
                      :name="`${item.slot}-leading`"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else-if="slots['item-leading']"
                    class="pfNavigationMenu__leadingWrap"
                  >
                    <slot
                      name="item-leading"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else-if="leadingForItem(item).kind === 'avatar'"
                    class="pfNavigationMenu__leadingAvatar"
                    :class="props.ui?.linkLeadingAvatar"
                  >
                    <PfAvatar
                      v-bind="item.avatar!"
                      :size="item.avatar!.size ?? '2xs'"
                    />
                  </span>
                  <span
                    v-else-if="leadingForItem(item).kind === 'iconChip'"
                    class="pfNavigationMenu__leadingIcon"
                    :class="props.ui?.linkLeadingIcon"
                  >
                    <PfChip standalone v-bind="chipPropsFor(item)!">
                      <PfIcon :name="item.icon!" :size="iconSize" />
                    </PfChip>
                  </span>
                  <PfIcon
                    v-else-if="leadingForItem(item).kind === 'icon'"
                    class="pfNavigationMenu__leadingIcon"
                    :class="props.ui?.linkLeadingIcon"
                    :name="item.icon!"
                    :size="iconSize"
                  />

                  <span
                    v-if="item.slot && hasNamedSlot(`${item.slot}-label`)"
                    class="pfNavigationMenu__label"
                    :class="props.ui?.linkLabel"
                  >
                    <slot
                      :name="`${item.slot}-label`"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else-if="slots['item-label']"
                    class="pfNavigationMenu__label"
                    :class="props.ui?.linkLabel"
                  >
                    <slot
                      name="item-label"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else
                    class="pfNavigationMenu__linkInner"
                    :class="props.ui?.linkLabel"
                  >
                    {{ itemLabel(item) }}
                  </span>

                  <span
                    v-if="item.slot && hasNamedSlot(`${item.slot}-trailing`)"
                    class="pfNavigationMenu__trailing"
                    :class="props.ui?.linkTrailing"
                  >
                    <slot
                      :name="`${item.slot}-trailing`"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else-if="slots['item-trailing']"
                    class="pfNavigationMenu__trailing"
                    :class="props.ui?.linkTrailing"
                  >
                    <slot
                      name="item-trailing"
                      :item="item"
                      :group-index="groupIndex"
                      :index="index"
                    />
                  </span>
                  <span
                    v-else
                    class="pfNavigationMenu__trailing"
                    :class="props.ui?.linkTrailing"
                  >
                    <PfBadge
                      v-if="badgeBind(item)"
                      v-bind="badgeBind(item)!"
                      :class="props.ui?.linkTrailingBadge"
                    />
                  </span>
                </template>
              </PfLink>
            </template>
          </div>
        </div>
        <div
          v-if="hasHorizontalDropdownItems"
          class="pfNavigationMenu__viewportRegion"
          :data-state="horizontalOpenValue ? 'open' : 'closed'"
          @mouseenter="onDropdownEnter"
        >
          <Transition
            name="pfNavDropdownPlank"
            @after-leave="onHorizontalPlankAfterLeave"
          >
            <div
              v-if="showHorizontalPlank"
              class="pfNavigationMenu__dropdown pfNavigationMenu__dropdown_viewport"
              :class="[props.ui?.dropdown, props.ui?.viewport]"
            >
              <div
                v-if="arrow"
                class="pfNavigationMenu__arrow"
                :class="props.ui?.arrow"
                aria-hidden="true"
              />
              <div
                class="pfNavigationMenu__slideShellOuter"
                :class="{
                  pfNavigationMenu__slideShellOuter_instantHeight:
                    heightTransitionInstant,
                }"
                :style="slideShellOuterStyle"
              >
                <div
                  ref="slideShellMeasureRef"
                  class="pfNavigationMenu__slideShell"
                >
                  <Transition
                    :name="horizontalPaneTransitionName"
                    @enter="onHorizontalDropdownPaneEnter"
                  >
                    <div
                      v-if="openHorizontalContext && horizontalPlankActiveValue"
                      :key="horizontalPlankActiveValue"
                      class="pfNavigationMenu__slidePane"
                    >
                      <div
                        v-if="
                          openHorizontalContext.item.slot &&
                          hasNamedSlot(
                            `${openHorizontalContext.item.slot}-content`
                          )
                        "
                        class="pfNavigationMenu__customContent"
                      >
                        <slot
                          :name="`${openHorizontalContext.item.slot}-content`"
                          :item="openHorizontalContext.item"
                          :group-index="openHorizontalContext.groupIndex"
                          :index="openHorizontalContext.index"
                        />
                      </div>
                      <ul
                        v-else-if="openHorizontalContext.item.children?.length"
                        :class="childListClass()"
                      >
                        <li
                          v-for="(child, ci) in openHorizontalContext.item
                            .children"
                          :key="`${horizontalPlankActiveValue}-c-${ci}`"
                          class="pfNavigationMenu__childItem"
                          :class="[props.ui?.childItem, child.class]"
                        >
                          <PfLink
                            class="pfNavigationMenu__childLink"
                            :class="props.ui?.childLink"
                            v-bind="linkProps(child)"
                            @click="child.onSelect?.($event)"
                          >
                            <PfIcon
                              v-if="child.icon"
                              class="pfNavigationMenu__childIcon"
                              :class="props.ui?.childLinkIcon"
                              :name="child.icon"
                              :size="iconSize"
                            />
                            <span class="pfNavigationMenu__childText">
                              <span
                                class="pfNavigationMenu__childLabel"
                                :class="props.ui?.childLinkLabel"
                              >
                                {{ itemLabel(child) }}
                                <PfIcon
                                  v-if="externalIconName(child)"
                                  class="pfNavigationMenu__childExternal"
                                  :class="props.ui?.childLinkLabelExternalIcon"
                                  :name="externalIconName(child)!"
                                  size="sm"
                                />
                              </span>
                              <span
                                v-if="child.description"
                                class="pfNavigationMenu__childDescription"
                                :class="props.ui?.childLinkDescription"
                              >
                                {{ child.description }}
                              </span>
                            </span>
                          </PfLink>
                        </li>
                      </ul>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </template>

    <template v-else>
      <div
        v-for="(group, groupIndex) in groups"
        :key="`vg-${groupIndex}`"
        class="pfNavigationMenu__verticalGroup"
        :class="props.ui?.group"
      >
        <div
          v-if="groupIndex > 0"
          class="pfNavigationMenu__separator"
          :class="props.ui?.separator"
          role="separator"
        />

        <template
          v-for="(item, index) in group"
          :key="itemValue(item, groupIndex, index)"
        >
          <div
            v-if="isLabelRow(item)"
            class="pfNavigationMenu__sectionLabel"
            :class="[props.ui?.label, item.class]"
          >
            {{ itemLabel(item) }}
          </div>

          <PfCollapsible
            v-else-if="showHorizontalDropdown(item)"
            :unmount-on-hide="unmountOnHide"
            :open="
              item.open !== undefined
                ? item.open
                : isVerticalOpen(itemValue(item, groupIndex, index))
            "
            class="pfNavigationMenu__collapsible"
            :ui="{ root: 'pfNavigationMenu__collapsibleRoot' }"
            @update:open="
              (o) =>
                onVerticalCollapsibleUpdate(
                  item,
                  itemValue(item, groupIndex, index),
                  o
                )
            "
          >
            <button
              type="button"
              class="pfNavigationMenu__trigger pfNavigationMenu__trigger_vertical"
              :class="[
                props.ui?.link,
                isItemHighlighted(item, groupIndex, index)
                  ? 'pfNavigationMenu__trigger_active'
                  : null,
                item.disabled || disabled
                  ? 'pfNavigationMenu__trigger_disabled'
                  : null,
              ]"
              :disabled="disabled || item.disabled"
              :aria-expanded="
                item.open !== undefined
                  ? item.open
                  : isVerticalOpen(itemValue(item, groupIndex, index))
              "
              :title="titleForCollapsed(item)"
            >
              <PfIcon
                v-if="item.icon"
                class="pfNavigationMenu__leadingIcon"
                :class="props.ui?.linkLeadingIcon"
                :name="item.icon"
                :size="iconSize"
              />
              <span
                class="pfNavigationMenu__label"
                :class="props.ui?.linkLabel"
              >
                {{ itemLabel(item) }}
              </span>
              <PfIcon
                v-if="trailingIconFor(item)"
                class="pfNavigationMenu__chevron pfNavigationMenu__chevron_vertical"
                :class="[
                  props.ui?.linkTrailingIcon,
                  isVerticalOpen(itemValue(item, groupIndex, index))
                    ? 'pfNavigationMenu__chevron_open'
                    : null,
                ]"
                :name="trailingIconFor(item)!"
                :size="iconSize"
              />
            </button>
            <template #content>
              <ul :class="childListClass()">
                <li
                  v-for="(child, ci) in item.children"
                  :key="`${itemValue(item, groupIndex, index)}-vc-${ci}`"
                  class="pfNavigationMenu__childItem"
                  :class="[props.ui?.childItem, child.class]"
                >
                  <PfLink
                    class="pfNavigationMenu__childLink"
                    :class="[
                      props.ui?.childLink,
                      child.to || child.href
                        ? null
                        : 'pfNavigationMenu__childLink_static',
                    ]"
                    v-bind="linkProps(child)"
                    @click="child.onSelect?.($event)"
                  >
                    <PfIcon
                      v-if="child.icon"
                      class="pfNavigationMenu__childIcon"
                      :class="props.ui?.childLinkIcon"
                      :name="child.icon"
                      :size="iconSize"
                    />
                    <span class="pfNavigationMenu__childText">
                      <span
                        class="pfNavigationMenu__childLabel"
                        :class="props.ui?.childLinkLabel"
                      >
                        {{ itemLabel(child) }}
                      </span>
                      <span
                        v-if="child.description"
                        class="pfNavigationMenu__childDescription"
                        :class="props.ui?.childLinkDescription"
                      >
                        {{ child.description }}
                      </span>
                    </span>
                  </PfLink>
                </li>
              </ul>
            </template>
          </PfCollapsible>

          <PfLink
            v-else
            class="pfNavigationMenu__link pfNavigationMenu__link_vertical"
            :class="[
              props.ui?.link,
              item.class,
              isItemHighlighted(item, groupIndex, index)
                ? 'pfNavigationMenu__link_active'
                : null,
            ]"
            v-bind="linkProps(item, isItemHighlighted(item, groupIndex, index))"
            :title="titleForCollapsed(item)"
            @click="onTopLevelLeafActivate(item, groupIndex, index)"
          >
            <template #default>
              <PfIcon
                v-if="item.icon"
                class="pfNavigationMenu__leadingIcon"
                :class="props.ui?.linkLeadingIcon"
                :name="item.icon"
                :size="iconSize"
              />
              <span
                class="pfNavigationMenu__linkInner"
                :class="props.ui?.linkLabel"
              >
                {{ itemLabel(item) }}
              </span>
              <span
                v-if="badgeBind(item)"
                class="pfNavigationMenu__trailing"
                :class="props.ui?.linkTrailing"
              >
                <PfBadge
                  v-bind="badgeBind(item)!"
                  :class="props.ui?.linkTrailingBadge"
                />
              </span>
            </template>
          </PfLink>
        </template>
      </div>
    </template>

    <div v-if="slots['list-trailing']" class="pfNavigationMenu__listSlot">
      <slot name="list-trailing" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfNavigationMenu {
  position: relative;

  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pf-navigation-menu-gap);
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  &_orientation_horizontal {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    flex-wrap: nowrap;
  }

  &_orientation_vertical {
    flex-direction: column;
    align-items: stretch;
  }

  &_collapsed.pfNavigationMenu_orientation_vertical {
    width: var(--pf-navigation-menu-collapsed-width);
  }
}

.pfNavigationMenu__horizontalSurface {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.pfNavigationMenu__viewportRegion {
  position: relative;
  z-index: 0;

  padding-top: var(--pf-navigation-menu-viewport-margin-top);
  width: 100%;
  min-width: 0;

  overflow: visible;
}

.pfNavigationMenu__slideShellOuter {
  width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;

  overflow: hidden;
  /* Matches list slide so height changes over the same interval */

  transition: height var(--pf-navigation-menu-slide-duration)
    var(--pf-navigation-menu-viewport-easing);

  &_instantHeight {
    transition: none;
  }
}

.pfNavigationMenu__slideShell {
  position: relative;

  padding: var(--pf-navigation-menu-dropdown-padding);
  width: 100%;
  min-height: 0;
  max-height: 100%;
  display: grid;
  align-items: start;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, auto);
  box-sizing: border-box;

  overflow-x: hidden;
  overflow-y: auto;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.pfNavigationMenu__slideShell .pfNavigationMenu__slidePane {
  grid-column: 1;
  grid-row: 1;

  width: 100%;
  min-width: 0;
  align-self: start;
}

/* First submenu open — no animation */
.pfNavPaneOpen-enter-active,
.pfNavPaneOpen-leave-active {
  transition: none;
}

.pfNavPaneOpen-enter-from,
.pfNavPaneOpen-leave-to {
  opacity: 1;

  transform: none;
}

/* Item change: next in order */
.pfNavPaneNext-enter-active,
.pfNavPaneNext-leave-active {
  transition:
    opacity var(--pf-navigation-menu-slide-duration)
      var(--pf-navigation-menu-viewport-easing),
    transform var(--pf-navigation-menu-slide-duration)
      var(--pf-navigation-menu-viewport-easing);
}

.pfNavPaneNext-enter-from {
  opacity: 0;

  transform: translateX(-48%);
}

.pfNavPaneNext-leave-to {
  opacity: 0;

  transform: translateX(48%);
}

.pfNavPaneNext-enter-active {
  z-index: 2;
}

.pfNavPaneNext-leave-active {
  z-index: 1;
}

/* Item change: previous in order */
.pfNavPanePrev-enter-active,
.pfNavPanePrev-leave-active {
  transition:
    opacity var(--pf-navigation-menu-slide-duration)
      var(--pf-navigation-menu-viewport-easing),
    transform var(--pf-navigation-menu-slide-duration)
      var(--pf-navigation-menu-viewport-easing);
}

.pfNavPanePrev-enter-from {
  opacity: 0;

  transform: translateX(48%);
}

.pfNavPanePrev-leave-to {
  opacity: 0;

  transform: translateX(-48%);
}

.pfNavPanePrev-enter-active {
  z-index: 2;
}

.pfNavPanePrev-leave-active {
  z-index: 1;
}

.pfNavigationMenu__bar {
  padding: var(--pf-navigation-menu-bar-padding-y) 0;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pf-navigation-menu-group-gap);
  box-sizing: border-box;
}

.pfNavigationMenu__group {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pf-navigation-menu-gap);
}

.pfNavigationMenu__verticalGroup {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-navigation-menu-vertical-group-gap);
}

.pfNavigationMenu__separator {
  margin: var(--pf-space-xs, 0.25rem) 0;

  height: 1px;
  align-self: stretch;

  background: var(--pf-border-color);
}

.pfNavigationMenu__sectionLabel {
  padding: var(--pf-navigation-menu-section-label-padding-y)
    var(--pf-navigation-menu-link-padding-x);
  width: 100%;

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
  font-weight: var(--pf-font-weight-bold);
  line-height: var(--pf-line-height-sm);
}

.pfNavigationMenu__item_dropdown {
  position: relative;
}

.pfNavigationMenu__dropdown_viewport {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: var(--pf-navigation-menu-dropdown-z-index);

  width: 100%;
  min-width: min(100%, var(--pf-navigation-menu-dropdown-min-width));
  max-height: var(--pf-navigation-menu-dropdown-max-height);
  box-sizing: border-box;

  box-shadow: var(--pf-navigation-menu-dropdown-shadow);
  background: var(--pf-color-surface);
  border: var(--pf-navigation-menu-dropdown-border);
  border-radius: var(--pf-radius-md);
  overflow: hidden;

  transform-origin: top center;
}

/* Smooth show / hide of the whole submenu plank */
.pfNavDropdownPlank-enter-active,
.pfNavDropdownPlank-leave-active {
  transition:
    opacity var(--pf-navigation-menu-dropdown-plank-duration)
      var(--pf-navigation-menu-viewport-easing),
    transform var(--pf-navigation-menu-dropdown-plank-duration)
      var(--pf-navigation-menu-viewport-easing);
}

.pfNavDropdownPlank-enter-from,
.pfNavDropdownPlank-leave-to {
  opacity: 0;

  transform: translateY(var(--pf-navigation-menu-dropdown-plank-translate-y))
    scale(var(--pf-navigation-menu-dropdown-plank-scale));
}

.pfNavigationMenu__dropdown_viewport .pfNavigationMenu__arrow {
  position: absolute;
  top: calc(-0.5 * var(--pf-navigation-menu-arrow-size));
  left: 50%;

  width: var(--pf-navigation-menu-arrow-size);
  height: var(--pf-navigation-menu-arrow-size);

  background: var(--pf-color-surface);
  border-top: var(--pf-navigation-menu-dropdown-border);
  border-left: var(--pf-navigation-menu-dropdown-border);

  transform: translateX(-50%) rotate(45deg);
}

.pfNavigationMenu__childList {
  margin: 0;

  padding: 0;
  display: grid;
  gap: var(--pf-navigation-menu-child-gap);

  list-style: none;

  &_horizontal {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &_vertical {
    grid-template-columns: minmax(0, 1fr);
  }
}

.pfNavigationMenu__childItem {
  margin: 0;

  min-width: 0;
}

.pfNavigationMenu__childLink {
  padding: var(--pf-navigation-menu-child-link-padding-y)
    var(--pf-navigation-menu-child-link-padding-x);
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--pf-navigation-menu-child-link-gap);
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
  text-decoration: none;

  border-radius: var(--pf-navigation-menu-link-radius);

  transition:
    color var(--pf-animation-duration) var(--pf-animation-easing),
    background var(--pf-animation-duration) var(--pf-animation-easing);

  &:hover:not(.pfLink_disabled) {
    background: var(--pf-navigation-menu-item-hover-bg);
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    outline: none;
  }
}

.pfNavigationMenu__childLink_static {
  cursor: default;
}

.pfNavigationMenu__childIcon {
  margin-top: 0.125rem;

  flex-shrink: 0;

  color: var(--pf-color-muted);
}

.pfNavigationMenu__childText {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 0.25rem;
}

.pfNavigationMenu__childLabel {
  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-medium);
}

.pfNavigationMenu__childExternal {
  margin-left: 0.25rem;

  display: inline-block;

  vertical-align: middle;

  opacity: 0.75;
}

.pfNavigationMenu__childDescription {
  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
}

.pfNavigationMenu__trigger {
  padding: var(--pf-navigation-menu-link-padding-y)
    var(--pf-navigation-menu-link-padding-x);
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  color: var(--pf-color-muted);
  font: inherit;
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
  text-align: left;

  background: transparent;
  border: none;
  border-radius: var(--pf-navigation-menu-link-radius);

  transition:
    color var(--pf-animation-duration) var(--pf-animation-easing),
    background var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: pointer;

  &::before {
    content: '';

    inset: 0;
    position: absolute;
    z-index: -1;

    border-radius: var(--pf-navigation-menu-link-radius);

    pointer-events: none;
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    outline: none;
  }

  &_disabled {
    opacity: 0.75;

    cursor: not-allowed;
  }

  &:not(.pfNavigationMenu__trigger_disabled):hover {
    background: var(--pf-navigation-menu-item-hover-bg);
  }
}

.pfNavigationMenu__trigger_vertical {
  position: relative;

  width: 100%;
  justify-content: flex-start;
}

.pfNavigationMenu_variant_pill
  .pfNavigationMenu__trigger:not(.pfNavigationMenu__trigger_disabled):hover {
  color: var(--pf-color-text);
}

.pfNavigationMenu_variant_link
  .pfNavigationMenu__trigger:not(.pfNavigationMenu__trigger_disabled):hover {
  color: var(--pf-color-text);
}

.pfNavigationMenu__chevron {
  flex-shrink: 0;

  transition: transform var(--pf-animation-duration) var(--pf-animation-easing);

  &_open {
    transform: rotate(180deg);
  }

  &_vertical {
    margin-left: auto;
  }
}

.pfNavigationMenu__label {
  min-width: 0;
  flex: 1 1 auto;

  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfNavigationMenu_collapsed .pfNavigationMenu__label,
.pfNavigationMenu_collapsed .pfNavigationMenu__trailing {
  position: absolute;
  margin: -1px;

  padding: 0;
  width: 1px;
  height: 1px;

  white-space: nowrap;

  border: 0;
  overflow: hidden;

  clip: rect(0, 0, 0, 0);
}

.pfNavigationMenu_collapsed .pfNavigationMenu__trigger,
.pfNavigationMenu_collapsed .pfNavigationMenu__link {
  justify-content: center;
}

.pfNavigationMenu__link {
  position: relative;

  padding: var(--pf-navigation-menu-link-padding-y)
    var(--pf-navigation-menu-link-padding-x);
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
  text-decoration: none;

  border-radius: var(--pf-navigation-menu-link-radius);

  transition:
    color var(--pf-animation-duration) var(--pf-animation-easing),
    background var(--pf-animation-duration) var(--pf-animation-easing);

  &::before {
    content: '';

    inset: 0;
    position: absolute;
    z-index: -1;

    border-radius: var(--pf-navigation-menu-link-radius);

    pointer-events: none;
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    outline: none;
  }

  &:hover:not(.pfLink_disabled) {
    background: var(--pf-navigation-menu-item-hover-bg);
  }
}

.pfNavigationMenu__link_vertical {
  width: 100%;
  justify-content: flex-start;
}

.pfNavigationMenu__linkInner {
  min-width: 0;
  flex: 1 1 auto;

  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfNavigationMenu__trailing {
  margin-left: auto;

  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.25rem;
}

.pfNavigationMenu__leadingIcon {
  flex-shrink: 0;
}

.pfNavigationMenu__leadingAvatar {
  flex-shrink: 0;
}

.pfNavigationMenu_variant_pill {
  .pfNavigationMenu__link {
    color: var(--pf-color-muted);
  }

  .pfNavigationMenu__link_active {
    color: var(--pf-color-surface);

    &::before {
      background: var(--pf-color-primary);
    }
  }

  &.pfNavigationMenu_color_secondary .pfNavigationMenu__link_active {
    &::before {
      background: var(--pf-color-secondary);
    }
  }

  &.pfNavigationMenu_color_neutral .pfNavigationMenu__link_active {
    color: var(--pf-color-text);

    &::before {
      background: color-mix(
        in srgb,
        var(--pf-color-muted) 14%,
        var(--pf-color-surface)
      );
    }
  }
}

.pfNavigationMenu_variant_link {
  .pfNavigationMenu__link {
    color: var(--pf-color-muted);
  }

  .pfNavigationMenu__link_active {
    color: var(--pf-color-primary);
    font-weight: var(--pf-font-weight-bold);
  }

  &.pfNavigationMenu_color_secondary .pfNavigationMenu__link_active {
    color: var(--pf-color-secondary);
  }

  &.pfNavigationMenu_color_neutral .pfNavigationMenu__link_active {
    color: var(--pf-color-text);
  }
}

.pfNavigationMenu_color_primary .pfNavigationMenu__trigger_active {
  color: var(--pf-color-primary);
}

.pfNavigationMenu_color_secondary .pfNavigationMenu__trigger_active {
  color: var(--pf-color-secondary);
}

.pfNavigationMenu_color_neutral .pfNavigationMenu__trigger_active {
  color: var(--pf-color-text);
}

.pfNavigationMenu_highlight.pfNavigationMenu_orientation_horizontal {
  .pfNavigationMenu__link_active::after,
  .pfNavigationMenu__trigger_active::after {
    content: '';

    position: absolute;
    right: var(--pf-navigation-menu-link-padding-x);
    bottom: -2px;
    left: var(--pf-navigation-menu-link-padding-x);

    height: var(--pf-navigation-menu-indicator-size);

    background: var(--pf-color-primary);
    border-radius: 999px;

    pointer-events: none;
  }

  &.pfNavigationMenu_highlightColor_secondary {
    .pfNavigationMenu__link_active::after,
    .pfNavigationMenu__trigger_active::after {
      background: var(--pf-color-secondary);
    }
  }

  &.pfNavigationMenu_highlightColor_neutral {
    .pfNavigationMenu__link_active::after,
    .pfNavigationMenu__trigger_active::after {
      background: var(--pf-color-muted);
    }
  }
}

.pfNavigationMenu_highlight.pfNavigationMenu_orientation_vertical {
  .pfNavigationMenu__childLink.pfLink_active {
    box-shadow: inset var(--pf-navigation-menu-indicator-size) 0 0 0
      var(--pf-color-primary);
  }

  &.pfNavigationMenu_highlightColor_secondary
    .pfNavigationMenu__childLink.pfLink_active {
    box-shadow: inset var(--pf-navigation-menu-indicator-size) 0 0 0
      var(--pf-color-secondary);
  }
}

.pfNavigationMenu__collapsibleRoot {
  min-width: 0;
}

.pfNavigationMenu_orientation_vertical .pfNavigationMenu__childList {
  margin-top: 0.25rem;
  margin-left: 0.5rem;

  padding-left: 0.5rem;

  border-left: 1px solid var(--pf-border-color);
}
</style>
