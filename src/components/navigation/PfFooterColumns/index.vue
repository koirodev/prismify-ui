<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
} from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfLink from '../PfLink/index.vue';

const LINK_META_KEYS = new Set(['label', 'icon', 'class', 'ui']);

export type PfFooterColumnsUi = Partial<{
  root: string;
  left: string;
  center: string;
  right: string;
  label: string;
  list: string;
  item: string;
  link: string;
  linkLeadingIcon: string;
  linkLabel: string;
  linkLabelExternalIcon: string;
}>;

export type PfFooterColumnUi = Partial<
  Pick<PfFooterColumnsUi, 'label' | 'list'>
>;

export type PfFooterColumnLinkUi = Partial<
  Pick<
    PfFooterColumnsUi,
    'item' | 'link' | 'linkLeadingIcon' | 'linkLabel' | 'linkLabelExternalIcon'
  >
>;

export type PfFooterColumnLink = {
  label?: string;
  icon?: PfIconName;
  class?: string;
  ui?: PfFooterColumnLinkUi;
} & Partial<{
  to: RouteLocationRaw;
  href: RouteLocationRaw;
  external: boolean;
  target: (string & {}) | '_blank' | '_parent' | '_self' | '_top' | null;
  replace: boolean;
  disabled: boolean;
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

export type PfFooterColumn = {
  label: string;
  children?: PfFooterColumnLink[];
  class?: string;
  ui?: PfFooterColumnUi;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    columns?: PfFooterColumn[];
    /** Leading icon size for the link */
    iconSize?: PfIconSize;
    ui?: PfFooterColumnsUi;
  }>(),
  {
    as: 'nav',
    columns: () => [],
    iconSize: 'sm',
  }
);

defineSlots<{
  left(): unknown;
  default(): unknown;
  right(): unknown;
  'column-label'(props: {
    column: PfFooterColumn;
    columnIndex: number;
  }): unknown;
  link(props: {
    column: PfFooterColumn;
    columnIndex: number;
    link: PfFooterColumnLink;
    linkIndex: number;
    active: boolean;
  }): unknown;
  'link-leading'(props: {
    column: PfFooterColumn;
    columnIndex: number;
    link: PfFooterColumnLink;
    linkIndex: number;
    active: boolean;
  }): unknown;
  'link-label'(props: { link: PfFooterColumnLink; active: boolean }): unknown;
  'link-trailing'(props: {
    column: PfFooterColumn;
    columnIndex: number;
    link: PfFooterColumnLink;
    linkIndex: number;
    active: boolean;
  }): unknown;
}>();

const attrs = useAttrs();
const slots = useSlots();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const tag = props.as ?? 'nav';
  return typeof tag === 'string' ? resolveDynamicComponent(tag) : tag;
});

const rootClass = computed(() => [attrs.class, props.ui?.root]);

const columnList = computed((): PfFooterColumn[] => props.columns ?? []);

const hasLeft = computed(() => 'left' in slots);
const hasRight = computed(() => 'right' in slots);

const rootMods = computed(() => ({
  pfFooterColumns_hasLeft: hasLeft.value,
  pfFooterColumns_hasRight: hasRight.value,
}));

function mergeUi(
  slotKey: keyof PfFooterColumnsUi,
  column?: PfFooterColumn,
  link?: PfFooterColumnLink
): string | undefined {
  const parts: string[] = [];
  const root = props.ui?.[slotKey];
  if (root) {
    parts.push(root);
  }
  if (column?.ui) {
    const k = slotKey as keyof PfFooterColumnUi;
    const v = column.ui[k];
    if (typeof v === 'string') {
      parts.push(v);
    }
  }
  if (link?.ui) {
    const k = slotKey as keyof PfFooterColumnLinkUi;
    const v = link.ui[k];
    if (typeof v === 'string') {
      parts.push(v);
    }
  }
  return parts.length ? parts.join(' ') : undefined;
}

function hasLink(item: PfFooterColumnLink): boolean {
  return item.to != null || item.href != null;
}

function linkProps(item: PfFooterColumnLink) {
  const out: Record<string, unknown> = {};
  const rec = item as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    if (!LINK_META_KEYS.has(key)) {
      out[key] = rec[key];
    }
  }
  return out;
}

function isExternalForIcon(item: PfFooterColumnLink): boolean {
  if (item.external === true) {
    return true;
  }
  if (item.target === '_blank') {
    return true;
  }
  const t = item.to ?? item.href;
  if (t == null) {
    return false;
  }
  if (typeof t === 'string') {
    return /^(https?:)?\/\//i.test(t);
  }
  return false;
}

function linkLabelText(item: PfFooterColumnLink): string {
  return typeof item.label === 'string' ? item.label : '';
}

function slotActive(item: PfFooterColumnLink): boolean {
  return item.active === true;
}
</script>

<template>
  <component
    :is="resolvedTag"
    class="pfFooterColumns"
    :class="[rootClass, rootMods]"
    v-bind="passthroughAttrs"
  >
    <div v-if="hasLeft" class="pfFooterColumns__left" :class="ui?.left">
      <slot name="left" />
    </div>

    <div class="pfFooterColumns__center" :class="ui?.center">
      <div
        v-for="(column, columnIndex) in columnList"
        :key="columnIndex"
        class="pfFooterColumns__column"
        :class="column.class"
      >
        <div
          class="pfFooterColumns__labelWrap"
          :class="mergeUi('label', column)"
        >
          <slot
            name="column-label"
            :column="column"
            :column-index="columnIndex"
          >
            <h3 class="pfFooterColumns__label">
              {{ column.label }}
            </h3>
          </slot>
        </div>

        <ul
          v-if="column.children?.length"
          class="pfFooterColumns__list"
          :class="mergeUi('list', column)"
        >
          <li
            v-for="(child, linkIndex) in column.children"
            :key="linkIndex"
            class="pfFooterColumns__item"
            :class="[child.class, mergeUi('item', column, child)]"
          >
            <template v-if="'link' in slots">
              <slot
                name="link"
                :column="column"
                :column-index="columnIndex"
                :link="child"
                :link-index="linkIndex"
                :active="slotActive(child)"
              />
            </template>
            <template v-else-if="hasLink(child)">
              <PfLink
                v-bind="linkProps(child)"
                class="pfFooterColumns__link"
                :class="mergeUi('link', column, child)"
                :active="child.active"
              >
                <span class="pfFooterColumns__linkInner">
                  <span
                    v-if="slots['link-leading']"
                    class="pfFooterColumns__linkLeading"
                    :class="mergeUi('linkLeadingIcon', column, child)"
                  >
                    <slot
                      name="link-leading"
                      :column="column"
                      :column-index="columnIndex"
                      :link="child"
                      :link-index="linkIndex"
                      :active="slotActive(child)"
                    />
                  </span>
                  <span
                    v-else-if="child.icon"
                    class="pfFooterColumns__linkLeading"
                    :class="mergeUi('linkLeadingIcon', column, child)"
                  >
                    <PfIcon :name="child.icon" :size="iconSize" />
                  </span>

                  <span
                    v-if="slots['link-label']"
                    class="pfFooterColumns__linkLabel"
                    :class="mergeUi('linkLabel', column, child)"
                  >
                    <slot
                      name="link-label"
                      :link="child"
                      :active="slotActive(child)"
                    />
                  </span>
                  <span
                    v-else
                    class="pfFooterColumns__linkLabel"
                    :class="mergeUi('linkLabel', column, child)"
                  >
                    {{ linkLabelText(child) }}
                  </span>

                  <span
                    v-if="slots['link-trailing'] || isExternalForIcon(child)"
                    class="pfFooterColumns__linkTrailing"
                  >
                    <slot
                      v-if="slots['link-trailing']"
                      name="link-trailing"
                      :column="column"
                      :column-index="columnIndex"
                      :link="child"
                      :link-index="linkIndex"
                      :active="slotActive(child)"
                    />
                    <PfIcon
                      v-else-if="isExternalForIcon(child)"
                      name="arrowUpRight"
                      size="2xs"
                      class="pfFooterColumns__externalIcon"
                      :class="mergeUi('linkLabelExternalIcon', column, child)"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </PfLink>
            </template>
            <span
              v-else
              class="pfFooterColumns__text"
              :class="{
                pfFooterColumns__text_current: slotActive(child),
              }"
            >
              <span class="pfFooterColumns__linkInner">
                <span
                  v-if="slots['link-leading']"
                  class="pfFooterColumns__linkLeading"
                  :class="mergeUi('linkLeadingIcon', column, child)"
                >
                  <slot
                    name="link-leading"
                    :column="column"
                    :column-index="columnIndex"
                    :link="child"
                    :link-index="linkIndex"
                    :active="slotActive(child)"
                  />
                </span>
                <span
                  v-else-if="child.icon"
                  class="pfFooterColumns__linkLeading"
                  :class="mergeUi('linkLeadingIcon', column, child)"
                >
                  <PfIcon :name="child.icon" :size="iconSize" />
                </span>
                <span
                  v-if="slots['link-label']"
                  class="pfFooterColumns__linkLabel"
                  :class="mergeUi('linkLabel', column, child)"
                >
                  <slot
                    name="link-label"
                    :link="child"
                    :active="slotActive(child)"
                  />
                </span>
                <span
                  v-else
                  class="pfFooterColumns__linkLabel"
                  :class="mergeUi('linkLabel', column, child)"
                >
                  {{ linkLabelText(child) }}
                </span>
              </span>
            </span>
          </li>
        </ul>
      </div>

      <slot />
    </div>

    <div v-if="hasRight" class="pfFooterColumns__right" :class="ui?.right">
      <slot name="right" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfFooterColumns {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-footer-columns-stack-gap);
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  @media (min-width: 80rem) {
    display: grid;
    align-items: start;
    gap: var(--pf-footer-columns-gap-lg);

    &_hasLeft:not(&_hasRight) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    }

    &_hasRight:not(&_hasLeft) {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    }

    &_hasLeft &_hasRight {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
    }

    &:not(&_hasLeft):not(&_hasRight) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__left {
    min-width: 0;
  }

  &__center {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--pf-footer-columns-inner-gap);

    @media (min-width: 64rem) {
      display: grid;
      grid-auto-columns: minmax(0, 1fr);
      grid-auto-flow: column;
      gap: var(--pf-footer-columns-inner-gap);
    }
  }

  &__right {
    margin-top: var(--pf-footer-columns-right-margin-top);

    min-width: 0;

    @media (min-width: 80rem) {
      margin-top: var(--pf-footer-columns-right-margin-top-lg);
    }
  }

  &__column {
    min-width: 0;
  }

  &__label {
    margin: 0;

    color: var(--pf-footer-columns-label-color);
    font-size: var(--pf-footer-columns-label-font-size);
    font-weight: var(--pf-footer-columns-label-font-weight);
    line-height: var(--pf-line-height-md);
  }

  &__list {
    margin: 0;
    margin-top: var(--pf-footer-columns-list-gap);

    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--pf-footer-columns-list-gap);

    list-style: none;
  }

  &__item {
    position: relative;
  }

  &__link {
    max-width: 100%;
    display: inline-flex;

    font-size: var(--pf-footer-columns-link-font-size);
    line-height: var(--pf-line-height-md);
    text-decoration: none;

    &:focus-visible {
      border-radius: var(--pf-radius-xs);
      outline: 2px solid var(--pf-link-focus-ring-color);
      outline-offset: 2px;
    }
  }

  &__linkInner {
    position: relative;

    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--pf-footer-columns-link-gap);
  }

  &__linkLeading {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;

    color: currentColor;

    :deep(.pfIcon) {
      color: currentColor;

      transition: color var(--pf-animation-duration) var(--pf-animation-easing);
    }
  }

  &__linkLabel {
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__linkTrailing {
    position: relative;

    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    flex-shrink: 0;

    color: currentColor;

    :deep(.pfIcon) {
      color: currentColor;

      transition: color var(--pf-animation-duration) var(--pf-animation-easing);
    }
  }

  &__externalIcon {
    width: var(--pf-footer-columns-external-icon-size);
    height: var(--pf-footer-columns-external-icon-size);
    flex-shrink: 0;

    color: currentColor;

    transition: color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__text {
    max-width: 100%;
    display: inline-flex;

    color: var(--pf-color-muted);
    font-size: var(--pf-footer-columns-link-font-size);
    line-height: var(--pf-line-height-md);

    &_current {
      color: var(--pf-color-primary);
      font-weight: var(--pf-font-weight-medium);
    }
  }

  :deep(.pfFooterColumns__link) {
    &.pfLink_inactive:not(.pfLink_disabled) {
      color: var(--pf-color-muted);

      &:hover {
        color: var(--pf-link-color-hover);
      }
    }

    &.pfLink_active {
      color: var(--pf-color-primary);
      font-weight: var(--pf-font-weight-medium);
    }

    &.pfLink_disabled {
      opacity: var(--pf-link-disabled-opacity);
    }
  }
}
</style>
