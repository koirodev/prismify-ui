<script setup lang="ts">
import { computed, useAttrs, useSlots, type Component, type Slots } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import PfAvatar from '../../element/PfAvatar/index.vue';
import type { PfBadgeAvatarProps } from '../../element/PfBadge/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfLink from '../PfLink/index.vue';

const ITEM_META_KEYS = new Set([
  'label',
  'icon',
  'avatar',
  'slot',
  'children',
  'ui',
  'class',
]);

export type PfBreadcrumbAvatarProps = PfBadgeAvatarProps;

export type PfBreadcrumbItemUi = Partial<{
  item: string;
  link: string;
  linkLeadingIcon: string;
  linkLeadingAvatar: string;
  linkLabel: string;
  separator: string;
  separatorIcon: string;
}>;

export type PfBreadcrumbUi = Partial<{
  root: string;
  list: string;
  item: string;
  link: string;
  linkLeadingIcon: string;
  linkLeadingAvatar: string;
  linkLabel: string;
  separator: string;
  separatorIcon: string;
}>;

export type PfBreadcrumbItem = {
  label?: string;
  icon?: PfIconName;
  avatar?: PfBreadcrumbAvatarProps;
  /** Slot name for a custom item (`#${slot}`, optionally `#${slot}-leading`, etc.) */
  slot?: string;
  /** Nested items for custom-slot scenarios (e.g. dropdown menu) */
  children?: PfBreadcrumbItem[];
  class?: string;
  ui?: PfBreadcrumbItemUi;
} & Partial<{
  to: RouteLocationRaw;
  href: RouteLocationRaw;
  external: boolean;
  target: (string & {}) | '_blank' | '_parent' | '_self' | '_top' | null;
  replace: boolean;
  disabled: boolean;
  /** Overrides auto-active state of the last item */
  active: boolean;
  exact: boolean;
  exactQuery: boolean | 'partial';
  exactHash: boolean;
  inactiveClass: string;
  raw: boolean;
  rel:
    | 'noopener'
    | 'noreferrer'
    | 'nofollow'
    | 'sponsored'
    | 'ugc'
    | (string & {})
    | null;
  noRel: boolean;
  activeClass: string;
  exactActiveClass: string;
  ariaCurrentValue:
    | 'step'
    | 'page'
    | 'true'
    | 'false'
    | 'location'
    | 'date'
    | 'time';
  viewTransition: boolean;
  prefetch: boolean;
  noPrefetch: boolean;
  trailingSlash: 'remove' | 'append';
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    items?: PfBreadcrumbItem[];
    /** Icon between items @default arrowSmallRight */
    separatorIcon?: PfIconName;
    /** Label key on the item @default label */
    labelKey?: string;
    /** Icon size for items and separator */
    iconSize?: PfIconSize;
    ui?: PfBreadcrumbUi;
  }>(),
  {
    as: 'nav',
    items: () => [],
    separatorIcon: 'arrowSmallRight',
    labelKey: 'label',
    iconSize: 'sm',
  }
);

const attrs = useAttrs();
const slots: Slots = useSlots();

const listItems = computed((): PfBreadcrumbItem[] => props.items ?? []);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() =>
  [attrs.class, props.ui?.root].filter(Boolean).join(' ')
);

function hasLink(item: PfBreadcrumbItem): boolean {
  return item.to != null || item.href != null;
}

function linkProps(item: PfBreadcrumbItem) {
  const out: Record<string, unknown> = {};
  const rec = item as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    if (!ITEM_META_KEYS.has(key)) {
      out[key] = rec[key];
    }
  }
  return out;
}

function isCurrent(index: number): boolean {
  const n = listItems.value.length;
  return n > 0 && index === n - 1;
}

function resolvedLinkActive(item: PfBreadcrumbItem, index: number): boolean {
  if (item.active !== undefined) {
    return item.active;
  }
  return isCurrent(index);
}

function itemLabel(item: PfBreadcrumbItem): string {
  const k = props.labelKey;
  const raw = (item as Record<string, unknown>)[k];
  return typeof raw === 'string' ? raw : '';
}

function mergeUi(
  slotKey: keyof PfBreadcrumbUi,
  item?: PfBreadcrumbItem
): string | undefined {
  const fromRoot = props.ui?.[slotKey];
  const itemUi = item?.ui;
  const itemKey = slotKey as keyof NonNullable<PfBreadcrumbItem['ui']>;
  const fromItem =
    itemUi != null && itemKey in itemUi ? itemUi[itemKey] : undefined;
  return [fromRoot, fromItem].filter(Boolean).join(' ') || undefined;
}

function defaultAvatarProps(
  avatar: PfBreadcrumbAvatarProps | undefined
): PfBreadcrumbAvatarProps {
  return { size: '2xs', ...avatar };
}

function slotNameLeading(name: string) {
  return `${name}-leading` as const;
}
function slotNameLabel(name: string) {
  return `${name}-label` as const;
}
function slotNameTrailing(name: string) {
  return `${name}-trailing` as const;
}

function hasSlot(name?: string): name is string {
  return name != null && slots[name] != null;
}
</script>

<template>
  <component
    :is="as"
    class="pfBreadcrumb"
    :class="rootClass"
    v-bind="passthroughAttrs"
  >
    <ol class="pfBreadcrumb__list" :class="ui?.list">
      <template v-for="(item, index) in listItems" :key="index">
        <li
          v-if="index > 0"
          class="pfBreadcrumb__separator"
          :class="mergeUi('separator', item)"
          aria-hidden="true"
        >
          <span
            class="pfBreadcrumb__separatorInner"
            :class="mergeUi('separatorIcon', item)"
          >
            <slot name="separator">
              <PfIcon
                :name="separatorIcon"
                :size="iconSize"
                class="pfBreadcrumb__separatorGlyph"
              />
            </slot>
          </span>
        </li>
        <li
          class="pfBreadcrumb__item"
          :class="[item.class, mergeUi('item', item)]"
        >
          <template v-if="item.slot && hasSlot(item.slot)">
            <slot :name="item.slot" :item="item" :index="index" />
          </template>
          <template v-else-if="slots.item">
            <slot
              name="item"
              :item="item"
              :index="index"
              :active="isCurrent(index)"
            />
          </template>
          <template v-else-if="hasLink(item)">
            <PfLink
              v-bind="linkProps(item)"
              class="pfBreadcrumb__link"
              :class="mergeUi('link', item)"
              :active="resolvedLinkActive(item, index)"
            >
              <span class="pfBreadcrumb__linkInner">
                <span
                  v-if="
                    slots['item-leading'] ||
                    (item.slot && hasSlot(slotNameLeading(item.slot)))
                  "
                  class="pfBreadcrumb__linkLeading"
                  :class="mergeUi('linkLeadingIcon', item)"
                >
                  <slot
                    v-if="slots['item-leading']"
                    name="item-leading"
                    :item="item"
                    :index="index"
                    :active="isCurrent(index)"
                  />
                  <slot
                    v-else-if="item.slot && hasSlot(slotNameLeading(item.slot))"
                    :name="slotNameLeading(item.slot)"
                    :item="item"
                    :index="index"
                    :active="isCurrent(index)"
                  />
                </span>
                <span
                  v-else-if="item.avatar"
                  class="pfBreadcrumb__linkLeading pfBreadcrumb__linkLeading_avatar"
                  :class="mergeUi('linkLeadingAvatar', item)"
                >
                  <PfAvatar v-bind="defaultAvatarProps(item.avatar)" />
                </span>
                <span
                  v-else-if="item.icon"
                  class="pfBreadcrumb__linkLeading"
                  :class="mergeUi('linkLeadingIcon', item)"
                >
                  <PfIcon :name="item.icon" :size="iconSize" />
                </span>
                <span
                  v-if="
                    slots['item-label'] ||
                    (item.slot && hasSlot(slotNameLabel(item.slot)))
                  "
                  class="pfBreadcrumb__linkLabel"
                  :class="mergeUi('linkLabel', item)"
                >
                  <slot
                    v-if="slots['item-label']"
                    name="item-label"
                    :item="item"
                    :index="index"
                    :active="isCurrent(index)"
                  />
                  <slot
                    v-else-if="item.slot && hasSlot(slotNameLabel(item.slot))"
                    :name="slotNameLabel(item.slot)"
                    :item="item"
                    :index="index"
                    :active="isCurrent(index)"
                  />
                </span>
                <span
                  v-else
                  class="pfBreadcrumb__linkLabel"
                  :class="mergeUi('linkLabel', item)"
                >
                  {{ itemLabel(item) }}
                </span>
                <span
                  v-if="
                    slots['item-trailing'] ||
                    (item.slot && hasSlot(slotNameTrailing(item.slot)))
                  "
                  class="pfBreadcrumb__linkTrailing"
                >
                  <slot
                    v-if="slots['item-trailing']"
                    name="item-trailing"
                    :item="item"
                    :index="index"
                    :active="isCurrent(index)"
                  />
                  <slot
                    v-else-if="
                      item.slot && hasSlot(slotNameTrailing(item.slot))
                    "
                    :name="slotNameTrailing(item.slot)"
                    :item="item"
                    :index="index"
                    :active="isCurrent(index)"
                  />
                </span>
              </span>
            </PfLink>
          </template>
          <span
            v-else
            class="pfBreadcrumb__text"
            :class="{
              pfBreadcrumb__text_current: isCurrent(index),
            }"
            :aria-current="isCurrent(index) ? 'page' : undefined"
          >
            <span class="pfBreadcrumb__linkInner">
              <span
                v-if="
                  slots['item-leading'] ||
                  (item.slot && hasSlot(slotNameLeading(item.slot)))
                "
                class="pfBreadcrumb__linkLeading"
                :class="mergeUi('linkLeadingIcon', item)"
              >
                <slot
                  v-if="slots['item-leading']"
                  name="item-leading"
                  :item="item"
                  :index="index"
                  :active="isCurrent(index)"
                />
                <slot
                  v-else-if="item.slot && hasSlot(slotNameLeading(item.slot))"
                  :name="slotNameLeading(item.slot)"
                  :item="item"
                  :index="index"
                  :active="isCurrent(index)"
                />
              </span>
              <span
                v-else-if="item.avatar"
                class="pfBreadcrumb__linkLeading pfBreadcrumb__linkLeading_avatar"
                :class="mergeUi('linkLeadingAvatar', item)"
              >
                <PfAvatar v-bind="defaultAvatarProps(item.avatar)" />
              </span>
              <span
                v-else-if="item.icon"
                class="pfBreadcrumb__linkLeading"
                :class="mergeUi('linkLeadingIcon', item)"
              >
                <PfIcon :name="item.icon" :size="iconSize" />
              </span>
              <span
                v-if="
                  slots['item-label'] ||
                  (item.slot && hasSlot(slotNameLabel(item.slot)))
                "
                class="pfBreadcrumb__linkLabel"
                :class="mergeUi('linkLabel', item)"
              >
                <slot
                  v-if="slots['item-label']"
                  name="item-label"
                  :item="item"
                  :index="index"
                  :active="isCurrent(index)"
                />
                <slot
                  v-else-if="item.slot && hasSlot(slotNameLabel(item.slot))"
                  :name="slotNameLabel(item.slot)"
                  :item="item"
                  :index="index"
                  :active="isCurrent(index)"
                />
              </span>
              <span
                v-else
                class="pfBreadcrumb__linkLabel"
                :class="mergeUi('linkLabel', item)"
              >
                {{ itemLabel(item) }}
              </span>
              <span
                v-if="
                  slots['item-trailing'] ||
                  (item.slot && hasSlot(slotNameTrailing(item.slot)))
                "
                class="pfBreadcrumb__linkTrailing"
              >
                <slot
                  v-if="slots['item-trailing']"
                  name="item-trailing"
                  :item="item"
                  :index="index"
                  :active="isCurrent(index)"
                />
                <slot
                  v-else-if="item.slot && hasSlot(slotNameTrailing(item.slot))"
                  :name="slotNameTrailing(item.slot)"
                  :item="item"
                  :index="index"
                  :active="isCurrent(index)"
                />
              </span>
            </span>
          </span>
        </li>
      </template>
    </ol>
  </component>
</template>

<style scoped lang="scss">
.pfBreadcrumb {
  min-width: 0;

  font-family: var(--pf-font-sans);

  &__list {
    margin: 0;

    padding: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--pf-breadcrumb-gap);

    list-style: none;
  }

  &__item {
    min-width: 0;
    display: flex;
  }

  &__separator {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__separatorInner {
    display: flex;
    align-items: center;

    color: var(--pf-breadcrumb-separator-color);
  }

  &__separatorGlyph {
    color: inherit;
  }

  &__item :deep(.pfBreadcrumb__link) {
    min-width: 0;
    max-width: 100%;
    display: inline-flex;

    font-size: var(--pf-breadcrumb-font-size);
    font-weight: var(--pf-breadcrumb-font-weight);
    text-decoration: none;

    transition: color var(--pf-animation-duration) var(--pf-animation-easing);

    &:focus-visible {
      border-radius: var(--pf-radius-xs);
      outline: 2px solid var(--pf-link-focus-ring-color);
      outline-offset: 2px;
    }

    &.pfLink_inactive:not(.pfLink_disabled) {
      color: var(--pf-breadcrumb-color-muted);

      &:hover {
        color: var(--pf-link-color-hover);
      }
    }

    &.pfLink_active {
      color: var(--pf-breadcrumb-color-current);
      font-weight: var(--pf-breadcrumb-font-weight-current);
    }

    &.pfLink_disabled {
      opacity: var(--pf-link-disabled-opacity);
    }
  }

  &__linkInner {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--pf-breadcrumb-link-gap);
  }

  &__linkLeading {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    /* Inherit from `.pfLink` / `.pfBreadcrumb__text` so the icon matches active and inactive text */

    color: currentColor;
  }

  &__linkLabel {
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__linkTrailing {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__text {
    min-width: 0;
    max-width: 100%;
    display: inline-flex;

    color: var(--pf-breadcrumb-color-muted);
    font-size: var(--pf-breadcrumb-font-size);
    font-weight: var(--pf-breadcrumb-font-weight);

    &_current {
      color: var(--pf-breadcrumb-color-current);
      font-weight: var(--pf-breadcrumb-font-weight-current);
    }
  }
}
</style>
