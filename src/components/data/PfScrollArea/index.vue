<script setup lang="ts" generic="T">
import {
  computed,
  onUnmounted,
  readonly,
  ref,
  toValue,
  useAttrs,
  watch,
  type Component,
  type Ref,
} from 'vue';
import {
  buildLinearOffsets,
  computeMasonryLayouts,
  findMasonryVisibleRange,
  findVisibleRangeLinear,
  linearTotalSize,
  type PfMasonryItemLayout,
} from '../../../composables/pfScrollAreaVirtual';

export type PfScrollAreaOrientation = 'vertical' | 'horizontal';

export type PfScrollAreaVirtualizeOptions = {
  gap?: number;
  lanes?: number | Ref<number>;
  estimateSize?: number | Ref<number>;
  paddingStart?: number;
  paddingEnd?: number;
  /** Extra pixels beyond the viewport along the scroll axis to render. */
  overscan?: number;
  skipMeasurement?: boolean;
};

export type PfScrollAreaUi = Partial<{
  root: string;
  viewport: string;
  item: string;
}>;

export type PfScrollAreaVirtualizer = {
  scrollToIndex: (
    index: number,
    options?: { align?: 'start' | 'center' | 'end'; behavior?: ScrollBehavior }
  ) => void;
  scrollOffset: Readonly<Ref<number>>;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    orientation?: PfScrollAreaOrientation;
    items?: readonly T[];
    virtualize?: boolean | PfScrollAreaVirtualizeOptions;
    ui?: PfScrollAreaUi;
  }>(),
  {
    as: 'div',
    orientation: 'vertical',
  }
);

const emit = defineEmits<{
  scroll: [isScrolling: boolean];
}>();

defineSlots<{
  default?(props?: { item: T; index: number }): unknown;
}>();

const attrs = useAttrs();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const scrollRootRef = ref<HTMLElement | null>(null);
const scrollOffset = ref(0);
const viewportMain = ref(0);
const viewportCross = ref(0);
const innerWidth = ref(0);

const itemSizes = ref<number[]>([]);

let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;

const measureObservers = new Map<number, ResizeObserver>();

const virtOptions = computed(() => {
  const v = props.virtualize;
  if (!v) {
    return null;
  }
  const base: Required<
    Pick<
      PfScrollAreaVirtualizeOptions,
      'gap' | 'paddingStart' | 'paddingEnd' | 'overscan' | 'skipMeasurement'
    >
  > & {
    lanes: number;
    estimateSize: number;
  } = {
    gap: 0,
    lanes: 1,
    estimateSize: 32,
    paddingStart: 0,
    paddingEnd: 0,
    overscan: 48,
    skipMeasurement: false,
  };
  if (v === true) {
    return base;
  }
  return {
    ...base,
    ...v,
    lanes: toValue(v.lanes ?? base.lanes),
    estimateSize: toValue(v.estimateSize ?? base.estimateSize),
  };
});

const useVirtual = computed(
  () => Boolean(props.items?.length) && virtOptions.value !== null
);

const lanesResolved = computed(() => {
  const o = virtOptions.value;
  if (!o) {
    return 1;
  }
  return Math.max(1, Math.floor(o.lanes));
});

watch(
  () => [props.items, virtOptions.value?.estimateSize] as const,
  ([items]) => {
    const n = items?.length ?? 0;
    const est = virtOptions.value?.estimateSize ?? 32;
    itemSizes.value = Array.from({ length: n }, () => est);
  },
  { immediate: true }
);

const isMasonry = computed(
  () =>
    props.orientation === 'vertical' &&
    useVirtual.value &&
    lanesResolved.value > 1
);

const linearOffsets = computed(() => {
  if (!useVirtual.value || isMasonry.value || !virtOptions.value) {
    return [];
  }
  const o = virtOptions.value;
  const axis = props.orientation === 'horizontal' ? 'horizontal' : 'vertical';
  return buildLinearOffsets(itemSizes.value, o.gap, o.paddingStart, axis);
});

const linearTotal = computed(() => {
  if (!useVirtual.value || isMasonry.value || !virtOptions.value) {
    return 0;
  }
  const o = virtOptions.value;
  return linearTotalSize(linearOffsets.value, itemSizes.value, o.paddingEnd);
});

const masonryState = computed(() => {
  if (!useVirtual.value || !isMasonry.value || !virtOptions.value) {
    return { layouts: [] as PfMasonryItemLayout[], totalHeight: 0 };
  }
  const o = virtOptions.value;
  const w = innerWidth.value || viewportMain.value || 1;
  return computeMasonryLayouts(
    itemSizes.value,
    lanesResolved.value,
    w,
    o.gap,
    o.paddingStart
  );
});

const masonryTotalHeight = computed(() => {
  if (!isMasonry.value || !virtOptions.value) {
    return 0;
  }
  return masonryState.value.totalHeight + virtOptions.value.paddingEnd;
});

const contentMainSize = computed(() => {
  if (!useVirtual.value || !virtOptions.value) {
    return 0;
  }
  if (isMasonry.value) {
    return masonryTotalHeight.value;
  }
  return linearTotal.value;
});

const visibleLinear = computed(() => {
  if (!useVirtual.value || isMasonry.value || !virtOptions.value) {
    return { start: 0, end: -1 };
  }
  const o = virtOptions.value;
  return findVisibleRangeLinear(
    linearOffsets.value,
    itemSizes.value,
    scrollOffset.value,
    viewportMain.value,
    o.overscan
  );
});

const visibleMasonry = computed(() => {
  if (!useVirtual.value || !isMasonry.value || !virtOptions.value) {
    return { start: 0, end: -1 };
  }
  const o = virtOptions.value;
  return findMasonryVisibleRange(
    masonryState.value.layouts,
    scrollOffset.value,
    viewportMain.value,
    o.overscan
  );
});

const visibleIndices = computed(() => {
  if (!useVirtual.value) {
    return [];
  }
  const r = isMasonry.value ? visibleMasonry.value : visibleLinear.value;
  if (r.end < r.start) {
    return [];
  }
  const out: number[] = [];
  for (let i = r.start; i <= r.end; i++) {
    out.push(i);
  }
  return out;
});

const viewportVirtualStyle = computed(() => {
  const s = contentMainSize.value;
  if (props.orientation === 'horizontal') {
    return {
      position: 'relative' as const,
      width: `${s}px`,
      minHeight: '100%',
      height: '100%',
    };
  }
  return {
    position: 'relative' as const,
    height: `${s}px`,
    width: '100%',
  };
});

function readScroll() {
  const el = scrollRootRef.value;
  if (!el) {
    return;
  }
  if (props.orientation === 'horizontal') {
    scrollOffset.value = el.scrollLeft;
  } else {
    scrollOffset.value = el.scrollTop;
  }
}

function readViewport() {
  const el = scrollRootRef.value;
  if (!el) {
    return;
  }
  if (props.orientation === 'horizontal') {
    viewportMain.value = el.clientWidth;
    viewportCross.value = el.clientHeight;
  } else {
    viewportMain.value = el.clientHeight;
    viewportCross.value = el.clientWidth;
  }
  innerWidth.value = el.clientWidth;
}

function onScroll() {
  readScroll();
  emit('scroll', true);
  if (scrollIdleTimer) {
    clearTimeout(scrollIdleTimer);
  }
  scrollIdleTimer = setTimeout(() => {
    scrollIdleTimer = null;
    emit('scroll', false);
  }, 120);
}

let ro: ResizeObserver | null = null;

function attachScrollRoot(el: HTMLElement | null) {
  scrollRootRef.value?.removeEventListener('scroll', onScroll);
  ro?.disconnect();
  ro = null;
  scrollRootRef.value = el;
  if (!el) {
    return;
  }
  readScroll();
  readViewport();
  el.addEventListener('scroll', onScroll, { passive: true });
  ro = new ResizeObserver(() => {
    readViewport();
  });
  ro.observe(el);
}

function setScrollRootRef(el: Element | Component | null) {
  let node: HTMLElement | null = null;
  if (el && typeof el === 'object') {
    if ('$el' in el) {
      const v = (el as { $el?: HTMLElement }).$el;
      if (v instanceof HTMLElement) {
        node = v;
      }
    } else if (el instanceof HTMLElement) {
      node = el;
    }
  }
  attachScrollRoot(node);
}

onUnmounted(() => {
  scrollRootRef.value?.removeEventListener('scroll', onScroll);
  ro?.disconnect();
  ro = null;
  measureObservers.forEach((o) => o.disconnect());
  measureObservers.clear();
  if (scrollIdleTimer) {
    clearTimeout(scrollIdleTimer);
  }
});

function measureAt(index: number, size: number) {
  if (virtOptions.value?.skipMeasurement) {
    return;
  }
  if (itemSizes.value[index] !== size) {
    const next = itemSizes.value.slice();
    next[index] = size;
    itemSizes.value = next;
  }
}

function bindMeasure(el: Element | null, index: number) {
  const prev = measureObservers.get(index);
  prev?.disconnect();
  measureObservers.delete(index);
  if (!el || virtOptions.value?.skipMeasurement) {
    return;
  }
  const htmlEl = el as HTMLElement;
  const roItem = new ResizeObserver((entries) => {
    const e = entries[0];
    if (!e) {
      return;
    }
    const main =
      props.orientation === 'horizontal'
        ? e.contentRect.width
        : e.contentRect.height;
    if (main > 0) {
      measureAt(index, main);
    }
  });
  roItem.observe(htmlEl);
  measureObservers.set(index, roItem);
}

function scrollToIndex(
  index: number,
  options?: { align?: 'start' | 'center' | 'end'; behavior?: ScrollBehavior }
) {
  const el = scrollRootRef.value;
  if (!el || !props.items?.length || !useVirtual.value) {
    return;
  }
  const align = options?.align ?? 'start';
  const behavior = options?.behavior ?? 'auto';
  const i = Math.max(0, Math.min(index, props.items.length - 1));

  let pos = 0;
  if (isMasonry.value) {
    const L = masonryState.value.layouts[i];
    if (!L) {
      return;
    }
    const start = L.top;
    const end = L.top + L.height;
    if (align === 'start') {
      pos = start;
    } else if (align === 'end') {
      pos = end - viewportMain.value;
    } else {
      pos = start + (L.height - viewportMain.value) / 2;
    }
    el.scrollTo({ top: Math.max(0, pos), behavior });
    return;
  }

  const o = virtOptions.value!;
  const off = linearOffsets.value[i] ?? o.paddingStart;
  const sz = itemSizes.value[i] ?? o.estimateSize;
  if (props.orientation === 'vertical') {
    if (align === 'start') {
      pos = off;
    } else if (align === 'end') {
      pos = off + sz - viewportMain.value;
    } else {
      pos = off + (sz - viewportMain.value) / 2;
    }
    el.scrollTo({ top: Math.max(0, pos), behavior });
  } else {
    if (align === 'start') {
      pos = off;
    } else if (align === 'end') {
      pos = off + sz - viewportMain.value;
    } else {
      pos = off + (sz - viewportMain.value) / 2;
    }
    el.scrollTo({ left: Math.max(0, pos), behavior });
  }
}

const virtualizerApi: PfScrollAreaVirtualizer = {
  scrollToIndex,
  scrollOffset: readonly(scrollOffset),
};

const virtualizer = computed(() =>
  useVirtual.value ? virtualizerApi : undefined
);

defineExpose({
  virtualizer,
  $el: scrollRootRef,
});

watch(visibleIndices, (indices, prev) => {
  if (!prev?.length) {
    return;
  }
  for (const p of prev) {
    if (!indices.includes(p)) {
      measureObservers.get(p)?.disconnect();
      measureObservers.delete(p);
    }
  }
});
</script>

<template>
  <component
    :is="as"
    :ref="setScrollRootRef"
    class="pfScrollArea"
    :class="[
      props.orientation === 'horizontal'
        ? 'pfScrollArea_horizontal'
        : 'pfScrollArea_vertical',
      props.ui?.root,
    ]"
    :data-orientation="props.orientation"
    v-bind="passthroughAttrs"
  >
    <div
      v-if="items && useVirtual"
      class="pfScrollArea__viewport pfScrollArea__viewport_virtual"
      :class="[props.ui?.viewport]"
      :style="viewportVirtualStyle"
    >
      <template v-for="i in visibleIndices" :key="i">
        <div
          v-if="!isMasonry"
          class="pfScrollArea__item"
          :class="[props.ui?.item]"
          :style="
            props.orientation === 'horizontal'
              ? {
                  position: 'absolute',
                  top: 0,
                  left: `${linearOffsets[i]}px`,
                  width: `${itemSizes[i]}px`,
                  height: viewportCross > 0 ? `${viewportCross}px` : '100%',
                  boxSizing: 'border-box',
                }
              : {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${linearOffsets[i]}px`,
                  minHeight: `${itemSizes[i]}px`,
                  boxSizing: 'border-box',
                }
          "
        >
          <div
            v-if="!virtOptions?.skipMeasurement"
            :ref="(el) => bindMeasure(el as Element | null, i)"
            class="pfScrollArea__itemInner"
          >
            <slot :item="items[i]!" :index="i" />
          </div>
          <slot v-else :item="items[i]!" :index="i" />
        </div>
        <div
          v-else
          class="pfScrollArea__item"
          :class="[props.ui?.item]"
          :style="{
            position: 'absolute',
            left: `${masonryState.layouts[i]!.left}px`,
            top: `${masonryState.layouts[i]!.top}px`,
            width: `${masonryState.layouts[i]!.width}px`,
            minHeight: `${masonryState.layouts[i]!.height}px`,
            boxSizing: 'border-box',
          }"
        >
          <div
            v-if="!virtOptions?.skipMeasurement"
            :ref="(el) => bindMeasure(el as Element | null, i)"
            class="pfScrollArea__itemInner"
          >
            <slot :item="items[i]!" :index="i" />
          </div>
          <slot v-else :item="items[i]!" :index="i" />
        </div>
      </template>
    </div>

    <div
      v-else-if="items && !useVirtual"
      class="pfScrollArea__viewport pfScrollArea__viewport_list"
      :class="[props.ui?.viewport]"
    >
      <div
        v-for="(_, i) in items"
        :key="i"
        class="pfScrollArea__item"
        :class="[props.ui?.item]"
      >
        <slot :item="items[i]!" :index="i" />
      </div>
    </div>

    <div
      v-else
      class="pfScrollArea__viewport pfScrollArea__viewport_custom"
      :class="[props.ui?.viewport]"
    >
      <slot />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfScrollArea {
  position: relative;

  max-width: 100%;
  max-height: 100%;
  display: block;
}

.pfScrollArea_vertical {
  -webkit-overflow-scrolling: touch;

  overflow-x: hidden;
  overflow-y: auto;
}

.pfScrollArea_horizontal {
  -webkit-overflow-scrolling: touch;

  overflow-x: auto;
  overflow-y: hidden;
}

.pfScrollArea__viewport_list {
  min-height: min-content;
  display: flex;
  flex-direction: column;
  gap: var(--pf-scroll-area-gap, 0);
}

.pfScrollArea_horizontal .pfScrollArea__viewport_list {
  width: max-content;
  min-height: 100%;
  flex-direction: row;
  align-items: stretch;
}

.pfScrollArea__viewport_custom {
  min-height: min-content;
  display: flex;
  flex-direction: column;
  gap: var(--pf-scroll-area-gap, 0);
}

.pfScrollArea_horizontal .pfScrollArea__viewport_custom {
  width: max-content;
  min-height: 100%;
  flex-direction: row;
}

.pfScrollArea__itemInner {
  min-width: 0;
  min-height: 0;
}
</style>
