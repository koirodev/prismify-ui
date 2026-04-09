<script setup lang="ts">
import type { Component } from 'vue';
import { computed, ref, useAttrs, watch } from 'vue';
import { RouterLink } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import PfButton from '../../element/PfButton/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfPaginationColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfPaginationVariant =
  | 'solid'
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'link';

export type PfPaginationSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfPaginationUi = Partial<{
  root: string;
  list: string;
  ellipsis: string;
  label: string;
  first: string;
  prev: string;
  item: string;
  next: string;
  last: string;
}>;

export type PfPaginationItem =
  | { type: 'ellipsis' }
  | { type: 'page'; value: number };

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    firstIcon?: PfIconName;
    prevIcon?: PfIconName;
    nextIcon?: PfIconName;
    lastIcon?: PfIconName;
    ellipsisIcon?: PfIconName;
    color?: PfPaginationColor;
    variant?: PfPaginationVariant;
    activeColor?: PfPaginationColor;
    activeVariant?: PfPaginationVariant;
    showControls?: boolean;
    size?: PfPaginationSize;
    /** Route for each page number (requires `vue-router`). */
    to?: (page: number) => RouteLocationRaw | string | undefined;
    ui?: PfPaginationUi;
    defaultPage?: number;
    disabled?: boolean;
    itemsPerPage?: number;
    page?: number;
    showEdges?: boolean;
    siblingCount?: number;
    total?: number;
  }>(),
  {
    color: 'neutral',
    variant: 'outline',
    activeColor: 'primary',
    activeVariant: 'solid',
    showControls: true,
    size: 'md',
    defaultPage: 1,
    disabled: false,
    itemsPerPage: 10,
    showEdges: false,
    siblingCount: 2,
    total: 0,
  }
);

const emit = defineEmits<{
  'update:page': [value: number];
}>();

defineSlots<{
  first(): unknown;
  prev(): unknown;
  next(): unknown;
  last(): unknown;
  ellipsis(): unknown;
  item(props: {
    page: number;
    pageCount: number;
    item: PfPaginationItem;
    index: number;
  }): unknown;
}>();

const attrs = useAttrs();

const vModelBound = usePfVModelBound();

const localPage = ref(props.defaultPage);

watch(
  () => props.page,
  (v) => {
    if (!vModelBound.value && v !== undefined) {
      localPage.value = v;
    }
  },
  { immediate: true }
);

const currentPage = computed({
  get: () => {
    if (vModelBound.value) {
      return props.page ?? 1;
    }
    return props.page !== undefined ? props.page : localPage.value;
  },
  set: (v: number) => {
    if (vModelBound.value || props.page !== undefined) {
      emit('update:page', v);
    } else {
      localPage.value = v;
    }
  },
});

const itemsPerPageSafe = computed(() => Math.max(1, props.itemsPerPage ?? 10));

const totalPages = computed(() => {
  const t = props.total ?? 0;
  return Math.max(1, Math.ceil(t / itemsPerPageSafe.value));
});

watch(totalPages, (tp) => {
  const cur = currentPage.value;
  if (cur > tp) {
    currentPage.value = tp;
  }
  if (cur < 1) {
    currentPage.value = 1;
  }
});

const siblingSafe = computed(() => Math.max(0, props.siblingCount ?? 2));

const cells = computed((): PfPaginationItem[] => {
  const tp = totalPages.value;
  const cur = Math.min(Math.max(1, currentPage.value), tp);
  const sib = siblingSafe.value;
  const edges = props.showEdges === true;

  const set = new Set<number>();
  const lo = Math.max(1, cur - sib);
  const hi = Math.min(tp, cur + sib);
  for (let p = lo; p <= hi; p++) {
    set.add(p);
  }
  if (edges) {
    set.add(1);
    set.add(tp);
  }

  const sorted = [...set].sort((a, b) => a - b);
  const out: PfPaginationItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]!;
    const prev = sorted[i - 1];
    if (i > 0 && p - prev! > 1) {
      out.push({ type: 'ellipsis' });
    }
    out.push({ type: 'page', value: p });
  }
  return out;
});

const resolvedFirstIcon = computed(
  (): PfIconName => props.firstIcon ?? 'angleDoubleSmallLeft'
);
const resolvedPrevIcon = computed(
  (): PfIconName => props.prevIcon ?? 'angleSmallLeft'
);
const resolvedNextIcon = computed(
  (): PfIconName => props.nextIcon ?? 'angleSmallRight'
);
const resolvedLastIcon = computed(
  (): PfIconName => props.lastIcon ?? 'angleDoubleSmallRight'
);

const iconSize = computed((): PfIconSize => {
  switch (props.size) {
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

function resolveLink(page: number): RouteLocationRaw | string | undefined {
  const fn = props.to;
  if (fn == null) {
    return undefined;
  }
  return fn(page);
}

function setPage(page: number) {
  const tp = totalPages.value;
  const next = Math.min(Math.max(1, page), tp);
  currentPage.value = next;
}

const isPrevDisabled = computed(() => props.disabled || currentPage.value <= 1);
const isNextDisabled = computed(
  () => props.disabled || currentPage.value >= totalPages.value
);

const controlProps = computed(() => ({
  color: props.color,
  variant: props.variant,
  size: props.size,
  square: true as const,
  iconOnly: true as const,
}));

const passthroughRoot = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() => ['pfPagination', props.ui?.root, attrs.class]);

const listClass = computed(() => ['pfPagination__list', props.ui?.list]);
</script>

<template>
  <component
    :is="as ?? 'nav'"
    :class="rootClass"
    aria-label="Pagination"
    v-bind="passthroughRoot"
  >
    <ul :class="listClass">
      <li v-if="showControls" class="pfPagination__control">
        <slot name="first">
          <template v-if="to && resolveLink(1) != null && !isPrevDisabled">
            <RouterLink v-slot="{ navigate }" :to="resolveLink(1)!" custom>
              <PfButton
                v-bind="controlProps"
                :class="props.ui?.first"
                aria-label="First page"
                :icon="resolvedFirstIcon"
                @click="
                  (e: MouseEvent) => {
                    navigate(e);
                    setPage(1);
                  }
                "
              />
            </RouterLink>
          </template>
          <PfButton
            v-else
            v-bind="controlProps"
            :class="props.ui?.first"
            aria-label="First page"
            :icon="resolvedFirstIcon"
            :disabled="isPrevDisabled"
            @click="setPage(1)"
          />
        </slot>
      </li>

      <li v-if="showControls" class="pfPagination__control">
        <slot name="prev">
          <template
            v-if="
              to &&
              resolveLink(Math.max(1, currentPage - 1)) != null &&
              !isPrevDisabled
            "
          >
            <RouterLink
              v-slot="{ navigate }"
              :to="resolveLink(Math.max(1, currentPage - 1))!"
              custom
            >
              <PfButton
                v-bind="controlProps"
                :class="props.ui?.prev"
                aria-label="Previous page"
                :icon="resolvedPrevIcon"
                @click="
                  (e: MouseEvent) => {
                    navigate(e);
                    setPage(currentPage - 1);
                  }
                "
              />
            </RouterLink>
          </template>
          <PfButton
            v-else
            v-bind="controlProps"
            :class="props.ui?.prev"
            aria-label="Previous page"
            :icon="resolvedPrevIcon"
            :disabled="isPrevDisabled"
            @click="setPage(currentPage - 1)"
          />
        </slot>
      </li>

      <template
        v-for="(cell, index) in cells"
        :key="cell.type === 'page' ? `p-${cell.value}` : `e-${index}`"
      >
        <li
          v-if="cell.type === 'ellipsis'"
          class="pfPagination__cell pfPagination__cell_ellipsis"
          aria-hidden="true"
        >
          <slot name="ellipsis">
            <span :class="['pfPagination__ellipsis', props.ui?.ellipsis]">
              <PfIcon
                v-if="ellipsisIcon"
                :name="ellipsisIcon"
                :size="iconSize"
              />
              <template v-else>…</template>
            </span>
          </slot>
        </li>
        <li v-else class="pfPagination__cell pfPagination__cell_page">
          <slot
            name="item"
            :page="currentPage"
            :page-count="totalPages"
            :item="cell"
            :index="index"
          >
            <template
              v-if="
                to &&
                resolveLink(cell.value) != null &&
                !(disabled || cell.value === currentPage)
              "
            >
              <RouterLink
                v-slot="{ navigate }"
                :to="resolveLink(cell.value)!"
                custom
              >
                <PfButton
                  :color="color"
                  :variant="variant"
                  :active-color="activeColor"
                  :active-variant="activeVariant"
                  :size="size"
                  :square="true"
                  :disabled="disabled"
                  :active="cell.value === currentPage"
                  :class="['pfPagination__pageBtn', props.ui?.item]"
                  :aria-label="`Page ${cell.value}`"
                  :aria-current="
                    cell.value === currentPage ? 'page' : undefined
                  "
                  @click="
                    (e: MouseEvent) => {
                      navigate(e);
                      setPage(cell.value);
                    }
                  "
                >
                  <span :class="['pfPagination__label', props.ui?.label]">
                    {{ cell.value }}
                  </span>
                </PfButton>
              </RouterLink>
            </template>
            <PfButton
              v-else
              :color="color"
              :variant="variant"
              :active-color="activeColor"
              :active-variant="activeVariant"
              :size="size"
              :square="true"
              :disabled="disabled || cell.value === currentPage"
              :active="cell.value === currentPage"
              :class="['pfPagination__pageBtn', props.ui?.item]"
              :aria-label="`Page ${cell.value}`"
              :aria-current="cell.value === currentPage ? 'page' : undefined"
              @click="setPage(cell.value)"
            >
              <span :class="['pfPagination__label', props.ui?.label]">
                {{ cell.value }}
              </span>
            </PfButton>
          </slot>
        </li>
      </template>

      <li v-if="showControls" class="pfPagination__control">
        <slot name="next">
          <template
            v-if="
              to &&
              resolveLink(Math.min(totalPages, currentPage + 1)) != null &&
              !isNextDisabled
            "
          >
            <RouterLink
              v-slot="{ navigate }"
              :to="resolveLink(Math.min(totalPages, currentPage + 1))!"
              custom
            >
              <PfButton
                v-bind="controlProps"
                :class="props.ui?.next"
                aria-label="Next page"
                :icon="resolvedNextIcon"
                @click="
                  (e: MouseEvent) => {
                    navigate(e);
                    setPage(currentPage + 1);
                  }
                "
              />
            </RouterLink>
          </template>
          <PfButton
            v-else
            v-bind="controlProps"
            :class="props.ui?.next"
            aria-label="Next page"
            :icon="resolvedNextIcon"
            :disabled="isNextDisabled"
            @click="setPage(currentPage + 1)"
          />
        </slot>
      </li>

      <li v-if="showControls" class="pfPagination__control">
        <slot name="last">
          <template
            v-if="to && resolveLink(totalPages) != null && !isNextDisabled"
          >
            <RouterLink
              v-slot="{ navigate }"
              :to="resolveLink(totalPages)!"
              custom
            >
              <PfButton
                v-bind="controlProps"
                :class="props.ui?.last"
                aria-label="Last page"
                :icon="resolvedLastIcon"
                @click="
                  (e: MouseEvent) => {
                    navigate(e);
                    setPage(totalPages);
                  }
                "
              />
            </RouterLink>
          </template>
          <PfButton
            v-else
            v-bind="controlProps"
            :class="props.ui?.last"
            aria-label="Last page"
            :icon="resolvedLastIcon"
            :disabled="isNextDisabled"
            @click="setPage(totalPages)"
          />
        </slot>
      </li>
    </ul>
  </component>
</template>

<style scoped lang="scss">
.pfPagination {
  font-family: var(--pf-font-sans);

  &__list {
    margin: 0;

    padding: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--pf-space-xs);

    list-style: none;
  }

  &__cell {
    display: flex;
    align-items: center;

    &_ellipsis {
      user-select: none;
    }
  }

  &__ellipsis {
    min-width: 1.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    color: var(--pf-color-muted);
    font: inherit;
    font-size: var(--pf-font-size-sm);
    line-height: 1;
  }

  &__label {
    min-width: 1.25rem;

    text-align: center;
  }

  &__pageBtn {
    min-width: 2.25rem;
  }
}
</style>
