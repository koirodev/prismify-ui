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
import type {
  PfSelectColor,
  PfSelectOptionAvatarConfig,
} from '../../form/PfSelect/index.vue';
import PfContextMenuItems from './PfContextMenuItems.vue';
import type {
  PfContextMenuItem,
  PfContextMenuSize,
  PfContextMenuUi,
} from './types';

const props = withDefaults(
  defineProps<{
    groups: PfContextMenuItem[][];
    mode: 'root' | 'sub';
    rootTop?: number;
    rootLeft?: number;
    anchorEl?: HTMLElement | null;
    size: PfContextMenuSize;
    ui?: PfContextMenuUi;
    closeRoot: (reason?: 'select' | 'outside' | 'escape') => void;
    checkedIcon?: PfIconName;
    pressOpenDelay?: number;
    submenuCloseDelay?: number;
    externalIcon?: PfIconName | false;
  }>(),
  {
    checkedIcon: 'check',
    pressOpenDelay: 200,
    submenuCloseDelay: 200,
    externalIcon: false,
  }
);

const slots: Slots = useSlots();
const router = useRouter();

const surfaceRef = ref<HTMLElement | null>(null);
const pos = ref({ top: 0, left: 0 });

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
  ch: PfContextMenuItem[] | PfContextMenuItem[][]
): PfContextMenuItem[][] {
  if (!ch.length) return [];
  if (Array.isArray(ch[0])) {
    return ch as PfContextMenuItem[][];
  }
  return [ch as PfContextMenuItem[]];
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

function onRowPointerEnter(key: string, item: PfContextMenuItem) {
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

function hasChildren(item: PfContextMenuItem): boolean {
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

function avatarBindings(
  avatar: PfSelectOptionAvatarConfig | undefined,
  _icon: PfIconName | undefined
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
  return `pfContextMenuItems__item_color_${color}`;
}

function isExternalItem(item: PfContextMenuItem): boolean {
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

function navigateTo(item: PfContextMenuItem) {
  const t = item.to;
  if (t == null) return;
  if (typeof t === 'string' && isExternalItem(item)) {
    const w = window.open(t, item.target ?? '_blank');
    if (w) w.opener = null;
    return;
  }
  void router.push(t).catch(() => {});
}

function onItemActivate(e: Event, item: PfContextMenuItem) {
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

function updatePos() {
  if (props.mode === 'root') {
    const t = props.rootTop ?? 0;
    const l = props.rootLeft ?? 0;
    pos.value = { top: t, left: l };
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
  () => [props.mode, props.rootTop, props.rootLeft, props.anchorEl],
  () => updatePos(),
  { immediate: true }
);

function onScrollResize() {
  updatePos();
}

function groupItems(groupIndex: number): PfContextMenuItem[] {
  return props.groups[groupIndex] ?? [];
}

function itemAt(groupIndex: number, itemIndex: number): PfContextMenuItem {
  return groupItems(groupIndex)[itemIndex]!;
}

watch(
  () => props.anchorEl,
  (el, prev) => {
    if (prev) {
      window.removeEventListener('scroll', onScrollResize, true);
    }
    if (el) {
      window.addEventListener('scroll', onScrollResize, true);
      window.addEventListener('resize', onScrollResize);
    }
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
    class="pfContextMenuItems"
    :class="[
      `pfContextMenuItems_size_${size}`,
      mode === 'root' && 'pfContextMenuItems_root',
      mode === 'sub' && 'pfContextMenuItems_sub',
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
    <div class="pfContextMenuItems__viewport" :class="ui?.viewport">
      <template v-for="gi in groups.length" :key="`g-${gi - 1}`">
        <div
          v-if="gi > 1"
          class="pfContextMenuItems__divider"
          :class="ui?.separator"
          role="separator"
          aria-hidden="true"
        />
        <div class="pfContextMenuItems__group" :class="ui?.group" role="group">
          <template
            v-for="ii in groupItems(gi - 1).length"
            :key="itemKey(gi - 1, ii - 1)"
          >
            <div
              v-if="itemAt(gi - 1, ii - 1).type === 'separator'"
              class="pfContextMenuItems__divider"
              :class="[ui?.separator, itemAt(gi - 1, ii - 1).class]"
              role="separator"
              aria-hidden="true"
            />
            <div
              v-else-if="itemAt(gi - 1, ii - 1).type === 'label'"
              class="pfContextMenuItems__groupLabel"
              :class="[ui?.label, itemAt(gi - 1, ii - 1).class]"
              role="presentation"
            >
              {{ itemAt(gi - 1, ii - 1).label }}
            </div>
            <div
              :ref="(el) => setRowEl(itemKey(gi - 1, ii - 1), el as Element)"
              class="pfContextMenuItems__row"
              @pointerenter="
                onRowPointerEnter(itemKey(gi - 1, ii - 1), itemAt(gi - 1, ii - 1))
              "
              @pointerleave="onRowLeave()"
            >
              <button
                type="button"
                class="pfContextMenuItems__item pfContextMenuItems__item_interactive"
                :class="[
                  ui?.item,
                  itemAt(gi - 1, ii - 1).class,
                  itemAt(gi - 1, ii - 1).disabled &&
                    'pfContextMenuItems__item_disabled',
                  itemColorClass(itemAt(gi - 1, ii - 1).color),
                ]"
                :role="
                  itemAt(gi - 1, ii - 1).type === 'checkbox'
                    ? 'menuitemcheckbox'
                    : 'menuitem'
                "
                :aria-checked="
                  itemAt(gi - 1, ii - 1).type === 'checkbox'
                    ? itemAt(gi - 1, ii - 1).checked
                      ? 'true'
                      : 'false'
                    : undefined
                "
                :aria-disabled="
                  itemAt(gi - 1, ii - 1).disabled ? 'true' : undefined
                "
                :disabled="itemAt(gi - 1, ii - 1).disabled"
                @click="onItemActivate($event, itemAt(gi - 1, ii - 1))"
              >
                <template v-if="slots.item">
                  <span class="pfContextMenuItems__slotItem">
                    <slot name="item" :item="itemAt(gi - 1, ii - 1)" />
                  </span>
                </template>
                <template v-else>
                  <span
                    v-if="
                      itemAt(gi - 1, ii - 1).slot &&
                      slots[`${itemAt(gi - 1, ii - 1).slot}-leading`]
                    "
                    class="pfContextMenuItems__leading"
                    :class="ui?.itemLeadingIcon"
                  >
                    <slot :name="`${itemAt(gi - 1, ii - 1).slot}-leading`" />
                  </span>
                  <span
                    v-else-if="slots['item-leading']"
                    class="pfContextMenuItems__leading"
                    :class="ui?.itemLeadingIcon"
                  >
                    <slot name="item-leading" :item="itemAt(gi - 1, ii - 1)" />
                  </span>
                  <span
                    v-else-if="
                      avatarBindings(
                        itemAt(gi - 1, ii - 1).avatar,
                        itemAt(gi - 1, ii - 1).icon
                      )
                    "
                    class="pfContextMenuItems__leading"
                    :class="ui?.itemLeadingAvatar"
                  >
                    <PfAvatar
                      v-bind="
                        avatarBindings(
                          itemAt(gi - 1, ii - 1).avatar,
                          itemAt(gi - 1, ii - 1).icon
                        )!
                      "
                    />
                  </span>
                  <span
                    v-else-if="itemAt(gi - 1, ii - 1).icon"
                    class="pfContextMenuItems__leading"
                    :class="ui?.itemLeadingIcon"
                  >
                    <PfIcon :name="itemAt(gi - 1, ii - 1).icon!" :size="iconSize" />
                  </span>
                  <span
                    v-if="itemAt(gi - 1, ii - 1).type === 'checkbox'"
                    class="pfContextMenuItems__check"
                    aria-hidden="true"
                  >
                    <PfIcon
                      v-if="itemAt(gi - 1, ii - 1).checked"
                      :name="checkedIcon"
                      :size="iconSize"
                    />
                  </span>
                  <span
                    class="pfContextMenuItems__labelWrap"
                    :class="ui?.itemLabel"
                  >
                    <span
                    v-if="
                      itemAt(gi - 1, ii - 1).slot &&
                      slots[`${itemAt(gi - 1, ii - 1).slot}-label`]
                    "
                      class="pfContextMenuItems__itemLabel"
                    >
                      <slot :name="`${itemAt(gi - 1, ii - 1).slot}-label`" />
                    </span>
                    <span
                      v-else-if="slots['item-label']"
                      class="pfContextMenuItems__itemLabel"
                    >
                      <slot name="item-label" :item="itemAt(gi - 1, ii - 1)" />
                    </span>
                    <span v-else class="pfContextMenuItems__itemLabel">
                      {{ itemAt(gi - 1, ii - 1).label }}
                    </span>
                  </span>
                  <span
                    v-if="
                      itemAt(gi - 1, ii - 1).slot &&
                      slots[`${itemAt(gi - 1, ii - 1).slot}-trailing`]
                    "
                    class="pfContextMenuItems__trailing"
                    :class="ui?.itemTrailing"
                  >
                    <slot :name="`${itemAt(gi - 1, ii - 1).slot}-trailing`" />
                  </span>
                  <span
                    v-else-if="slots['item-trailing']"
                    class="pfContextMenuItems__trailing"
                    :class="ui?.itemTrailing"
                  >
                    <slot
                      name="item-trailing"
                      :item="itemAt(gi - 1, ii - 1)"
                    />
                  </span>
                  <span
                    v-else
                    class="pfContextMenuItems__trailing"
                    :class="ui?.itemTrailing"
                  >
                    <PfIcon
                      v-if="
                        externalIcon &&
                        itemAt(gi - 1, ii - 1).to != null &&
                        isExternalItem(itemAt(gi - 1, ii - 1)) &&
                        itemAt(gi - 1, ii - 1).external !== false
                      "
                      :name="externalIcon"
                      :size="iconSize"
                      class="pfContextMenuItems__external"
                      :class="ui?.itemLabelExternalIcon"
                    />
                    <span
                      v-if="itemAt(gi - 1, ii - 1).kbds?.length"
                      class="pfContextMenuItems__kbds"
                      :class="ui?.itemTrailingKbds"
                    >
                      <PfKbd
                        v-for="(k, ki) in itemAt(gi - 1, ii - 1).kbds"
                        :key="ki"
                        :value="k"
                        :size="kbdSize"
                        :class="ui?.itemTrailingKbdsSize"
                      />
                    </span>
                    <PfIcon
                      v-if="hasChildren(itemAt(gi - 1, ii - 1))"
                      name="angleSmallRight"
                      :size="iconSize"
                      class="pfContextMenuItems__subChevron"
                    />
                  </span>
                </template>
              </button>
              <Transition name="pfContextMenuSubmenu">
                <PfContextMenuItems
                  v-if="
                    hasChildren(itemAt(gi - 1, ii - 1)) &&
                    openSubKey === itemKey(gi - 1, ii - 1) &&
                    itemAt(gi - 1, ii - 1).children
                  "
                  mode="sub"
                  :groups="normalizeChildGroups(itemAt(gi - 1, ii - 1).children!)"
                  :size="size"
                  :ui="ui"
                  :close-root="closeRoot"
                  :checked-icon="checkedIcon"
                  :press-open-delay="pressOpenDelay"
                  :submenu-close-delay="submenuCloseDelay"
                  :external-icon="externalIcon"
                  :anchor-el="rowEls[itemKey(gi - 1, ii - 1)] ?? null"
                />
              </Transition>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfContextMenuItems {
  --pf-cmi-border: var(--pf-context-menu-border, var(--pf-input-border));
  --pf-cmi-font: var(--pf-input-font-size);
  --pf-cmi-hover: var(
    --pf-context-menu-item-hover,
    color-mix(in srgb, var(--pf-cmi-muted) 14%, transparent)
  );
  --pf-cmi-line: var(--pf-input-line-height);
  --pf-cmi-muted: var(--pf-context-menu-muted, var(--pf-input-muted));
  --pf-cmi-pad-x: var(--pf-space-sm);
  --pf-cmi-pad-y: var(--pf-space-xs);
  --pf-cmi-radius: var(--pf-context-menu-radius);
  --pf-cmi-surface: var(--pf-context-menu-surface, var(--pf-input-surface));
  --pf-cmi-text: var(--pf-context-menu-text, var(--pf-input-text));

  position: fixed;
  z-index: var(--pf-context-menu-z-index);

  min-width: var(--pf-context-menu-min-width);
  max-height: var(--pf-context-menu-max-height);
  box-sizing: border-box;

  pointer-events: auto;

  &_size_xs {
    --pf-cmi-font: var(--pf-font-size-xs);
    --pf-cmi-pad-x: var(--pf-space-xs);
    --pf-cmi-pad-y: var(--pf-space-xs);
  }

  &_size_sm {
    --pf-cmi-font: var(--pf-font-size-xs);
    --pf-cmi-pad-x: var(--pf-space-sm);
    --pf-cmi-pad-y: var(--pf-space-xs);
  }

  &_size_md {
    --pf-cmi-font: var(--pf-input-font-size);
    --pf-cmi-pad-x: var(--pf-space-sm);
    --pf-cmi-pad-y: var(--pf-space-xs);
  }

  &_size_lg {
    --pf-cmi-font: var(--pf-font-size-sm);
    --pf-cmi-pad-x: var(--pf-space-md);
    --pf-cmi-pad-y: var(--pf-space-sm);
  }

  &_size_xl {
    --pf-cmi-font: var(--pf-font-size-md);
    --pf-cmi-pad-x: var(--pf-space-md);
    --pf-cmi-pad-y: var(--pf-space-sm);
  }

  &_sub {
    margin-left: calc(-1 * var(--pf-context-menu-submenu-gap));

    padding-left: var(--pf-context-menu-submenu-gap);
  }

  &__viewport {
    box-shadow:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-cmi-border),
      var(
        --pf-context-menu-shadow,
        0 var(--pf-space-xs) var(--pf-space-lg)
          color-mix(in srgb, var(--pf-cmi-text) 12%, transparent)
      );
    background: var(--pf-cmi-surface);
    border-radius: var(--pf-cmi-radius);
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
      var(--pf-cmi-text) 12%,
      var(--pf-cmi-border)
    );
  }

  &__groupLabel {
    padding: var(--pf-cmi-pad-y) var(--pf-cmi-pad-x);
    display: flex;
    align-items: center;

    color: var(--pf-cmi-muted);
    font-size: calc(var(--pf-cmi-font) * 0.92);
    font-weight: var(--pf-font-weight-bold);
    line-height: var(--pf-cmi-line);
  }

  &__row {
    position: relative;

    display: block;
  }

  &__item {
    margin: 0;

    padding: var(--pf-cmi-pad-y) var(--pf-cmi-pad-x);
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--pf-context-menu-gap);

    color: var(--pf-cmi-text);
    font-family: var(--pf-font-sans);
    font-size: var(--pf-cmi-font);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-cmi-line);
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
      background: var(--pf-cmi-hover);
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
    flex: 1 1 auto;
  }

  &__itemLabel {
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

  &__external {
    opacity: 0.65;
  }

  &__subChevron {
    flex-shrink: 0;

    opacity: 0.65;
  }

  &__slotItem {
    min-width: 0;
    flex: 1 1 auto;
  }
}

.pfContextMenuSubmenu-enter-active,
.pfContextMenuSubmenu-leave-active {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfContextMenuSubmenu-enter-from,
.pfContextMenuSubmenu-leave-to {
  opacity: 0;

  transform: translateX(var(--pf-space-xs)) scale(0.985);
}

.pfContextMenuSubmenu-enter-to,
.pfContextMenuSubmenu-leave-from {
  opacity: 1;

  transform: translateX(0) scale(1);
}
</style>
