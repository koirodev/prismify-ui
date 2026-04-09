<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  useSlots,
  watch,
} from 'vue';
import type { Slots } from 'vue';
import { useRouter } from 'vue-router';
import PfAvatar from '../../element/PfAvatar/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfKbd from '../../element/PfKbd/index.vue';
import PfInput from '../../form/PfInput/index.vue';
import type {
  PfSelectColor,
  PfSelectOptionAvatarConfig,
} from '../../form/PfSelect/index.vue';
import type {
  PfDropdownMenuContent,
  PfDropdownMenuFilter,
  PfDropdownMenuItem,
  PfDropdownMenuSize,
  PfDropdownMenuUi,
} from './types';
import PfDropdownMenuItems from './PfDropdownMenuItems.vue';

const props = withDefaults(
  defineProps<{
    groups: PfDropdownMenuItem[][];
    mode: 'root' | 'sub';
    rootAnchorEl?: HTMLElement | null;
    anchorEl?: HTMLElement | null;
    size: PfDropdownMenuSize;
    ui?: PfDropdownMenuUi;
    closeRoot: (reason?: 'select' | 'outside' | 'escape') => void;
    checkedIcon?: PfIconName;
    pressOpenDelay?: number;
    submenuCloseDelay?: number;
    externalIcon?: PfIconName;
    filter?: PfDropdownMenuFilter;
    filterFields?: string[];
    ignoreFilter?: boolean;
    searchTerm?: string;
    content?: PfDropdownMenuContent;
    rootMinWidth?: number;
    showArrow?: boolean;
    onRootSearchUpdate?: (value: string) => void;
  }>(),
  {
    checkedIcon: 'check',
    pressOpenDelay: 200,
    submenuCloseDelay: 200,
    externalIcon: 'arrowUpRight',
    filter: false,
    filterFields: () => ['label'],
    ignoreFilter: false,
    searchTerm: '',
    content: () => ({
      side: 'bottom',
      align: 'start',
      sideOffset: 6,
      alignOffset: 0,
    }),
    rootMinWidth: 0,
    showArrow: false,
    onRootSearchUpdate: undefined,
  }
);

const slots: Slots = useSlots();
const router = useRouter();

const surfaceRef = ref<HTMLElement | null>(null);
const pos = ref({ top: 0, left: 0 });
const panelSearch = ref('');

const openSubKey = ref<string | null>(null);
const rowEls = shallowRef<Record<string, HTMLElement | null>>({});

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function itemKey(g: number, i: number): string {
  return `${g}:${i}`;
}

function setRowEl(key: string, el: Element | null) {
  if (el instanceof HTMLElement) {
    if (rowEls.value[key] === el) return;
    rowEls.value = { ...rowEls.value, [key]: el };
    return;
  }
  if (!(key in rowEls.value)) return;
  const next = { ...rowEls.value };
  delete next[key];
  rowEls.value = next;
}

function normalizeChildGroups(
  ch: PfDropdownMenuItem[] | PfDropdownMenuItem[][]
): PfDropdownMenuItem[][] {
  if (!ch.length) return [];
  if (Array.isArray(ch[0])) {
    return ch as PfDropdownMenuItem[][];
  }
  return [ch as PfDropdownMenuItem[]];
}

function clearTimers() {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function scheduleCloseSub() {
  clearTimers();
  closeTimer = setTimeout(() => {
    openSubKey.value = null;
    closeTimer = null;
  }, props.submenuCloseDelay);
}

function onRowPointerEnter(key: string, item: PfDropdownMenuItem) {
  clearTimers();
  if (!hasChildren(item)) {
    openSubKey.value = null;
    return;
  }
  if (openSubKey.value != null && openSubKey.value !== key) {
    openSubKey.value = key;
    void nextTick(() => updatePos());
    return;
  }
  openTimer = setTimeout(() => {
    openSubKey.value = key;
    openTimer = null;
    void nextTick(() => updatePos());
  }, props.pressOpenDelay);
}

function onRowLeave() {
  scheduleCloseSub();
}

function onSubPanelEnter() {
  clearTimers();
}

function onSubPanelLeave() {
  scheduleCloseSub();
}

function hasChildren(item: PfDropdownMenuItem): boolean {
  const ch = item.children;
  return Array.isArray(ch) && ch.length > 0;
}

const iconSize = computed((): PfIconSize => {
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

const kbdSize = computed(() => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'sm' as const;
    case 'xl':
      return 'lg' as const;
    default:
      return 'md' as const;
  }
});

const inputSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'xs' as const;
    case 'sm':
      return 'sm' as const;
    case 'lg':
      return 'lg' as const;
    case 'xl':
      return 'xl' as const;
    default:
      return 'md' as const;
  }
});

function avatarBindings(
  avatar: PfSelectOptionAvatarConfig | undefined
): Record<string, unknown> | null {
  if (avatar) {
    return {
      src: avatar.src,
      alt: avatar.alt,
      icon: avatar.icon,
      text: avatar.text,
      size: avatar.size ?? '2xs',
    };
  }
  return null;
}

function itemColorClass(color: PfSelectColor | undefined): string | null {
  if (!color) return null;
  return `pfDropdownMenuItems__item_color_${color}`;
}

function isExternalItem(item: PfDropdownMenuItem): boolean {
  if (item.external === true) return true;
  const t = item.to;
  if (t == null) return false;
  if (typeof t === 'string') {
    return (
      /^(https?:)?\/\//i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t)
    );
  }
  return false;
}

function navigateTo(item: PfDropdownMenuItem) {
  const t = item.to;
  if (t == null) return;
  if (typeof t === 'string' && isExternalItem(item)) {
    const w = window.open(t, item.target ?? '_blank');
    if (w) w.opener = null;
    return;
  }
  void router.push(t).catch(() => {});
}

function onItemActivate(e: Event, item: PfDropdownMenuItem) {
  if (item.disabled) {
    e.preventDefault();
    return;
  }
  if (hasChildren(item)) {
    e.preventDefault();
    return;
  }
  if (item.type === 'checkbox') {
    item.onUpdateChecked?.(!(item.checked === true));
  }
  item.onSelect?.(e);
  if (e.defaultPrevented) return;
  if (item.to != null && item.type !== 'checkbox') {
    navigateTo(item);
  }
  props.closeRoot('select');
}

function normalizeText(value: unknown): string {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
}

function isFilterEnabled(value: PfDropdownMenuFilter | undefined): boolean {
  return value === true || (!!value && typeof value === 'object');
}

const effectiveSearch = computed(() =>
  props.mode === 'root' ? (props.searchTerm ?? '') : panelSearch.value
);

function getItemSearchValue(
  item: PfDropdownMenuItem,
  filterFields: string[]
): string {
  const chunks = filterFields.map((field) => normalizeText(item[field]));
  return chunks.join(' ');
}

const filteredGroups = computed(() => {
  const source = props.groups;
  const panelFilterEnabled = isFilterEnabled(props.filter);
  const search = normalizeText(effectiveSearch.value);
  if (!panelFilterEnabled || props.ignoreFilter || search === '') {
    return source;
  }
  const fields = props.filterFields?.length ? props.filterFields : ['label'];
  return source
    .map((group) =>
      group.filter((item) => {
        if (item.ignoreFilter) return true;
        if (item.type === 'separator' || item.type === 'label') return true;
        return getItemSearchValue(item, fields).includes(search);
      })
    )
    .filter((group) =>
      group.some((item) => item.type !== 'separator' && item.type !== 'label')
    );
});

const hasVisibleItems = computed(() =>
  filteredGroups.value.some((group) =>
    group.some((item) => item.type !== 'separator' && item.type !== 'label')
  )
);

const filterBindings = computed(() => {
  if (!isFilterEnabled(props.filter) || props.filter === true) {
    return {};
  }
  return props.filter;
});

const indexedGroups = computed(() =>
  filteredGroups.value.map((group, gi) => ({ group, gi }))
);

function updatePos() {
  if (props.mode === 'root') {
    const el = props.rootAnchorEl;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const side = props.content?.side ?? 'bottom';
    const align = props.content?.align ?? 'start';
    const sideOffset = props.content?.sideOffset ?? 6;
    const alignOffset = props.content?.alignOffset ?? 0;

    let top = r.bottom + sideOffset;
    let left = r.left;
    if (side === 'top') top = r.top - sideOffset;
    if (side === 'left') left = r.left - sideOffset;
    if (side === 'right') left = r.right + sideOffset;

    if (side === 'left' || side === 'right') {
      if (align === 'center') {
        top = r.top + r.height / 2;
      } else if (align === 'end') {
        top = r.bottom;
      } else {
        top = r.top;
      }
    } else if (align === 'center') {
      left = r.left + r.width / 2;
    } else if (align === 'end') {
      left = r.right;
    }

    if (side === 'left') left -= alignOffset;
    if (side === 'right') left += alignOffset;
    if (side === 'top' || side === 'bottom') left += alignOffset;
    if (side === 'left' || side === 'right') top += alignOffset;

    pos.value = { top, left };
    void nextTick(() => clampIntoViewport());
    return;
  }

  const el = props.anchorEl;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const gapVar =
    typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement)
          .getPropertyValue('--pf-context-menu-submenu-gap')
          .trim()
      : '';
  const gap = gapVar ? Number.parseFloat(gapVar) || 4 : 4;
  pos.value = {
    top: r.top,
    left: r.right + gap,
  };
  void nextTick(() => clampIntoViewport());
}

function clampIntoViewport() {
  const el = surfaceRef.value;
  if (!el || typeof window === 'undefined') return;
  const m = el.getBoundingClientRect();
  let { top, left } = pos.value;
  const pad = 8;

  if (props.mode === 'root' && props.rootMinWidth > 0) {
    el.style.minWidth = `${props.rootMinWidth}px`;
  }

  if (left + m.width > window.innerWidth - pad) {
    left = Math.max(pad, window.innerWidth - m.width - pad);
  }
  if (top + m.height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - m.height - pad);
  }
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  pos.value = { top, left };
}

watch(
  () => [
    props.mode,
    props.rootAnchorEl,
    props.anchorEl,
    props.content?.side,
    props.content?.align,
    props.content?.sideOffset,
    props.content?.alignOffset,
    props.groups,
    filteredGroups.value.length,
  ],
  () => updatePos(),
  { immediate: true }
);

function onScrollResize() {
  updatePos();
}

watch(
  () => props.anchorEl ?? props.rootAnchorEl,
  (el, prev) => {
    if (prev) {
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    }
    if (el) {
      window.addEventListener('scroll', onScrollResize, true);
      window.addEventListener('resize', onScrollResize);
    }
  },
  { immediate: true }
);

watch(
  () => props.searchTerm,
  (value) => {
    if (props.mode === 'root') return;
    if (value == null) return;
    panelSearch.value = '';
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollResize, true);
  window.removeEventListener('resize', onScrollResize);
  clearTimers();
});
</script>

<template>
  <div
    ref="surfaceRef"
    class="pfDropdownMenuItems"
    :class="[
      `pfDropdownMenuItems_size_${size}`,
      mode === 'root' && 'pfDropdownMenuItems_root',
      mode === 'sub' && 'pfDropdownMenuItems_sub',
      ui?.content,
    ]"
    :style="{
      top: `${pos.top}px`,
      left: `${pos.left}px`,
    }"
    role="menu"
    @pointerenter="mode === 'sub' ? onSubPanelEnter() : undefined"
    @pointerleave="mode === 'sub' ? onSubPanelLeave() : undefined"
  >
    <div
      v-if="showArrow && mode === 'root'"
      class="pfDropdownMenuItems__arrow"
      :class="ui?.arrow"
      aria-hidden="true"
    />
    <PfInput
      v-if="isFilterEnabled(filter)"
      :model-value="effectiveSearch"
      v-bind="filterBindings"
      :size="inputSize"
      class="pfDropdownMenuItems__input"
      :class="ui?.input"
      placeholder="Search..."
      @update:model-value="
        (value) =>
          mode === 'root'
            ? onRootSearchUpdate?.(String(value ?? ''))
            : (panelSearch = String(value ?? ''))
      "
    />

    <div class="pfDropdownMenuItems__viewport" :class="ui?.viewport">
      <slot name="content-top" />

      <template v-if="hasVisibleItems">
        <template v-for="{ group, gi } in indexedGroups" :key="`g-${gi}`">
          <div
            v-if="gi > 0"
            class="pfDropdownMenuItems__divider"
            :class="ui?.separator"
            role="separator"
            aria-hidden="true"
          />
          <div
            class="pfDropdownMenuItems__group"
            :class="ui?.group"
            role="group"
          >
            <template v-for="(item, ii) in group" :key="itemKey(gi, ii)">
              <div
                v-if="item.type === 'separator'"
                class="pfDropdownMenuItems__divider"
                :class="[ui?.separator, item.class]"
                role="separator"
                aria-hidden="true"
              />
              <div
                v-else-if="item.type === 'label'"
                class="pfDropdownMenuItems__groupLabel"
                :class="[ui?.label, item.class]"
                role="presentation"
              >
                {{ item.label }}
              </div>
              <div
                :ref="(el) => setRowEl(itemKey(gi, ii), el as Element)"
                class="pfDropdownMenuItems__row"
                @pointerenter="onRowPointerEnter(itemKey(gi, ii), item)"
                @pointerleave="onRowLeave()"
              >
                <button
                  type="button"
                  class="pfDropdownMenuItems__item pfDropdownMenuItems__item_interactive"
                  :class="[
                    ui?.item,
                    item.class,
                    item.disabled && 'pfDropdownMenuItems__item_disabled',
                    itemColorClass(item.color),
                  ]"
                  :role="
                    item.type === 'checkbox' ? 'menuitemcheckbox' : 'menuitem'
                  "
                  :aria-checked="
                    item.type === 'checkbox'
                      ? item.checked
                        ? 'true'
                        : 'false'
                      : undefined
                  "
                  :aria-disabled="item.disabled ? 'true' : undefined"
                  :disabled="item.disabled"
                  @click="onItemActivate($event, item)"
                >
                  <template v-if="slots.item">
                    <span class="pfDropdownMenuItems__slotItem">
                      <slot name="item" :item="item" />
                    </span>
                  </template>
                  <template v-else>
                    <span
                      v-if="item.slot && slots[`${item.slot}-leading`]"
                      class="pfDropdownMenuItems__leading"
                      :class="ui?.itemLeadingIcon"
                    >
                      <slot :name="`${item.slot}-leading`" />
                    </span>
                    <span
                      v-else-if="slots['item-leading']"
                      class="pfDropdownMenuItems__leading"
                      :class="ui?.itemLeadingIcon"
                    >
                      <slot name="item-leading" :item="item" />
                    </span>
                    <span
                      v-else-if="avatarBindings(item.avatar)"
                      class="pfDropdownMenuItems__leading"
                      :class="ui?.itemLeadingAvatar"
                    >
                      <PfAvatar v-bind="avatarBindings(item.avatar)!" />
                    </span>
                    <span
                      v-else-if="item.icon"
                      class="pfDropdownMenuItems__leading"
                      :class="ui?.itemLeadingIcon"
                    >
                      <PfIcon :name="item.icon" :size="iconSize" />
                    </span>
                    <span
                      v-if="item.type === 'checkbox'"
                      class="pfDropdownMenuItems__check"
                      aria-hidden="true"
                    >
                      <PfIcon
                        v-if="item.checked"
                        :name="checkedIcon"
                        :size="iconSize"
                      />
                    </span>
                    <span
                      class="pfDropdownMenuItems__labelWrap"
                      :class="[ui?.itemWrapper]"
                    >
                      <span
                        v-if="item.slot && slots[`${item.slot}-label`]"
                        class="pfDropdownMenuItems__itemLabel"
                        :class="ui?.itemLabel"
                      >
                        <slot :name="`${item.slot}-label`" />
                      </span>
                      <span
                        v-else-if="slots['item-label']"
                        class="pfDropdownMenuItems__itemLabel"
                        :class="ui?.itemLabel"
                      >
                        <slot name="item-label" :item="item" />
                      </span>
                      <span
                        v-else
                        class="pfDropdownMenuItems__itemLabel"
                        :class="ui?.itemLabel"
                      >
                        {{ item.label }}
                      </span>
                      <span
                        v-if="item.description"
                        class="pfDropdownMenuItems__itemDescription"
                        :class="ui?.itemDescription"
                      >
                        {{ item.description }}
                      </span>
                    </span>
                    <span
                      v-if="item.slot && slots[`${item.slot}-trailing`]"
                      class="pfDropdownMenuItems__trailing"
                      :class="ui?.itemTrailing"
                    >
                      <slot :name="`${item.slot}-trailing`" :item="item" />
                    </span>
                    <span
                      v-else-if="slots['item-trailing']"
                      class="pfDropdownMenuItems__trailing"
                      :class="ui?.itemTrailing"
                    >
                      <slot name="item-trailing" :item="item" />
                    </span>
                    <span
                      v-else
                      class="pfDropdownMenuItems__trailing"
                      :class="ui?.itemTrailing"
                    >
                      <PfIcon
                        v-if="
                          externalIcon &&
                          item.to != null &&
                          isExternalItem(item) &&
                          item.external !== false
                        "
                        :name="externalIcon"
                        :size="iconSize"
                        class="pfDropdownMenuItems__external"
                        :class="ui?.itemLabelExternalIcon"
                      />
                      <span
                        v-if="item.kbds?.length"
                        class="pfDropdownMenuItems__kbds"
                        :class="ui?.itemTrailingKbds"
                      >
                        <PfKbd
                          v-for="(k, ki) in item.kbds"
                          :key="ki"
                          :value="k"
                          :size="kbdSize"
                          :class="ui?.itemTrailingKbdsSize"
                        />
                      </span>
                      <PfIcon
                        v-if="hasChildren(item)"
                        name="angleSmallRight"
                        :size="iconSize"
                        class="pfDropdownMenuItems__subChevron"
                      />
                    </span>
                  </template>
                </button>

                <Transition name="pfDropdownMenuSubmenu">
                  <PfDropdownMenuItems
                    v-if="
                      hasChildren(item) &&
                      openSubKey === itemKey(gi, ii) &&
                      item.children
                    "
                    mode="sub"
                    :groups="normalizeChildGroups(item.children)"
                    :size="size"
                    :ui="ui"
                    :close-root="closeRoot"
                    :checked-icon="checkedIcon"
                    :press-open-delay="pressOpenDelay"
                    :submenu-close-delay="submenuCloseDelay"
                    :external-icon="externalIcon"
                    :anchor-el="rowEls[itemKey(gi, ii)] ?? null"
                    :filter="item.filter ?? false"
                    :filter-fields="item.filterFields ?? filterFields"
                    :ignore-filter="item.ignoreFilter ?? false"
                  />
                </Transition>
              </div>
            </template>
          </div>
        </template>
      </template>

      <div v-else class="pfDropdownMenuItems__empty" :class="ui?.empty">
        <slot name="empty">No results.</slot>
      </div>

      <slot name="content-bottom" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfDropdownMenuItems {
  --pf-dmi-border: var(--pf-context-menu-border, var(--pf-input-border));
  --pf-dmi-font: var(--pf-context-menu-font-size, var(--pf-input-font-size));
  --pf-dmi-hover: var(
    --pf-context-menu-item-hover,
    color-mix(in srgb, var(--pf-dmi-muted) 14%, transparent)
  );
  --pf-dmi-line: var(
    --pf-context-menu-line-height,
    var(--pf-input-line-height)
  );
  --pf-dmi-muted: var(--pf-context-menu-muted, var(--pf-input-muted));
  --pf-dmi-pad-x: var(--pf-space-sm);
  --pf-dmi-pad-y: var(--pf-space-xs);
  --pf-dmi-radius: var(--pf-context-menu-radius);
  --pf-dmi-surface: var(--pf-context-menu-surface, var(--pf-input-surface));
  --pf-dmi-text: var(--pf-context-menu-text, var(--pf-input-text));

  position: fixed;
  z-index: var(--pf-context-menu-z-index);

  min-width: var(--pf-context-menu-min-width);
  max-height: var(--pf-context-menu-max-height);
  box-sizing: border-box;

  pointer-events: auto;

  &_size_xs {
    --pf-dmi-font: var(--pf-font-size-xs);
    --pf-dmi-pad-x: var(--pf-space-xs);
    --pf-dmi-pad-y: var(--pf-space-xs);
  }

  &_size_sm {
    --pf-dmi-font: var(--pf-font-size-xs);
    --pf-dmi-pad-x: var(--pf-space-sm);
    --pf-dmi-pad-y: var(--pf-space-xs);
  }

  &_size_md {
    --pf-dmi-font: var(--pf-input-font-size);
    --pf-dmi-pad-x: var(--pf-space-sm);
    --pf-dmi-pad-y: var(--pf-space-xs);
  }

  &_size_lg {
    --pf-dmi-font: var(--pf-font-size-sm);
    --pf-dmi-pad-x: var(--pf-space-md);
    --pf-dmi-pad-y: var(--pf-space-sm);
  }

  &_size_xl {
    --pf-dmi-font: var(--pf-font-size-md);
    --pf-dmi-pad-x: var(--pf-space-md);
    --pf-dmi-pad-y: var(--pf-space-sm);
  }

  &_sub {
    margin-left: calc(-1 * var(--pf-context-menu-submenu-gap));

    padding-left: var(--pf-context-menu-submenu-gap);
  }

  &__arrow {
    position: absolute;
    top: -5px;
    left: var(--pf-space-md);

    width: 10px;
    height: 10px;

    background: var(--pf-dmi-surface);
    border-top: var(--pf-stroke-width) solid var(--pf-dmi-border);
    border-left: var(--pf-stroke-width) solid var(--pf-dmi-border);

    transform: rotate(45deg);
  }

  &__input {
    margin-bottom: var(--pf-space-2xs);
  }

  &__viewport {
    box-shadow:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-dmi-border),
      var(
        --pf-context-menu-shadow,
        0 var(--pf-space-xs) var(--pf-space-lg)
          color-mix(in srgb, var(--pf-dmi-text) 12%, transparent)
      );
    background: var(--pf-dmi-surface);
    border-radius: var(--pf-dmi-radius);
    overflow-x: hidden;
    overflow-y: auto;
  }

  &__group {
    padding: var(--pf-context-menu-padding);
  }

  &__divider {
    margin-block: var(--pf-space-xs);
    margin-inline: calc(-1 * var(--pf-context-menu-padding));

    height: var(--pf-stroke-width);

    background: color-mix(
      in srgb,
      var(--pf-dmi-text) 12%,
      var(--pf-dmi-border)
    );
  }

  &__groupLabel {
    padding: var(--pf-dmi-pad-y) var(--pf-dmi-pad-x);
    display: flex;
    align-items: center;

    color: var(--pf-dmi-muted);
    font-size: var(
      --pf-context-menu-group-label-font-size,
      var(--pf-font-size-xs)
    );
    font-weight: var(
      --pf-context-menu-group-label-font-weight,
      var(--pf-font-weight-bold)
    );
    line-height: var(--pf-dmi-line);
  }

  &__row {
    position: relative;

    display: block;
  }

  &__item {
    margin: 0;

    padding: var(--pf-dmi-pad-y) var(--pf-dmi-pad-x);
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--pf-context-menu-gap);

    color: var(--pf-dmi-text);
    font-family: var(--pf-font-sans);
    font-size: var(--pf-dmi-font);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-dmi-line);
    text-align: start;

    background: transparent;
    border: none;
    border-radius: var(--pf-radius-sm);

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing),
      opacity calc(var(--pf-animation-duration) * 0.6)
        var(--pf-animation-easing);

    cursor: pointer;

    &_interactive:not(:disabled):hover,
    &_interactive:not(:disabled):focus-visible {
      background: var(--pf-dmi-hover);
      outline: none;
    }

    &_disabled {
      opacity: 0.45;

      cursor: not-allowed;
    }

    &_color_primary {
      color: var(--pf-color-primary);
    }

    &_color_secondary {
      color: var(--pf-color-secondary);
    }

    &_color_success {
      color: var(--pf-color-success);
    }

    &_color_info {
      color: var(--pf-color-info);
    }

    &_color_warning {
      color: var(--pf-color-warning);
    }

    &_color_error {
      color: var(--pf-color-error);
    }

    &_color_neutral {
      color: var(--pf-color-muted);
    }
  }

  &__leading {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__check {
    width: 1.25em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__labelWrap {
    min-width: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }

  &__itemLabel {
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__itemDescription {
    margin-top: 1px;

    color: var(--pf-dmi-muted);
    font-size: var(
      --pf-context-menu-item-description-font-size,
      var(--pf-font-size-xs)
    );
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__trailing {
    margin-inline-start: auto;

    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: var(--pf-space-xs);
  }

  &__kbds {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  &__external,
  &__subChevron {
    opacity: 0.65;
  }

  &__slotItem {
    min-width: 0;
    flex: 1 1 auto;
  }

  &__empty {
    padding: var(--pf-space-sm) var(--pf-space-md);

    color: var(--pf-dmi-muted);
    font-size: var(--pf-context-menu-empty-font-size, var(--pf-font-size-sm));
    text-align: center;
  }
}

.pfDropdownMenuSubmenu-enter-active,
.pfDropdownMenuSubmenu-leave-active {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfDropdownMenuSubmenu-enter-from,
.pfDropdownMenuSubmenu-leave-to {
  opacity: 0;

  transform: translateX(var(--pf-space-xs)) scale(0.985);
}

.pfDropdownMenuSubmenu-enter-to,
.pfDropdownMenuSubmenu-leave-from {
  opacity: 1;

  transform: translateX(0) scale(1);
}
</style>
