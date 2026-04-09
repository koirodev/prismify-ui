<script setup lang="ts">
import { computed, inject, ref, useAttrs, watch } from 'vue';
import PfDashboardResizeHandle from '../PfDashboardResizeHandle/index.vue';
import { PF_DASHBOARD_GROUP_KEY } from '../shared/injection';
import { clampSize, pxToUnit, toUnit, unitToPx } from '../shared/resize';

export interface PfDashboardPanelUi {
  root?: string;
  body?: string;
  handle?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    ui?: PfDashboardPanelUi;
    id?: string;
    minSize?: number;
    maxSize?: number;
    defaultSize?: number;
    resizable?: boolean;
  }>(),
  {
    ui: undefined,
    id: undefined,
    minSize: 15,
    maxSize: undefined,
    defaultSize: undefined,
    resizable: false,
  }
);

const attrs = useAttrs();
const group = inject(PF_DASHBOARD_GROUP_KEY, null);

const panelId = computed(
  () => props.id || `panel-${Math.random().toString(36).slice(2, 8)}`
);
const localSize = ref<number | undefined>(props.defaultSize);

watch(
  () => group?.readState(panelId.value),
  (entry) => {
    if (entry && typeof entry.size === 'number') {
      localSize.value = entry.size;
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => localSize.value,
  (size) => {
    if (size == null) return;
    group?.writeState(panelId.value, { size });
  }
);

function onResizePointerStart(clientX: number): void {
  if (!props.resizable) return;
  if (typeof window === 'undefined') return;
  const container =
    group?.groupRef.value?.getBoundingClientRect().width ?? window.innerWidth;
  const unit = group?.unit.value ?? '%';
  const start = localSize.value ?? props.defaultSize ?? 50;
  const startPx = unitToPx(start, unit, container);
  const minPx = unitToPx(props.minSize, unit, container);
  const maxPx =
    props.maxSize != null
      ? unitToPx(props.maxSize, unit, container)
      : Number.POSITIVE_INFINITY;

  const startX = clientX;

  const onMove = (event: MouseEvent | TouchEvent) => {
    const x =
      'touches' in event
        ? (event.touches[0]?.clientX ?? startX)
        : event.clientX;
    const delta = x - startX;
    const nextPx = clampSize(startPx + delta, minPx, maxPx);
    localSize.value = pxToUnit(nextPx, unit, container);
  };

  const onEnd = () => {
    window.removeEventListener('mousemove', onMove as (e: MouseEvent) => void);
    window.removeEventListener('touchmove', onMove as (e: TouchEvent) => void);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchend', onEnd);
  };

  window.addEventListener('mousemove', onMove as (e: MouseEvent) => void);
  window.addEventListener('touchmove', onMove as (e: TouchEvent) => void, {
    passive: true,
  });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

function onHandleMouseDown(event: MouseEvent): void {
  event.preventDefault();
  onResizePointerStart(event.clientX);
}

function onHandleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0];
  if (!touch) return;
  onResizePointerStart(touch.clientX);
}

const panelWidth = computed(() => {
  if (!props.resizable || localSize.value == null) return undefined;
  const unit = group?.unit.value ?? '%';
  return toUnit(localSize.value, unit);
});

const rootClass = computed(() => [
  'pfDashboardPanel',
  props.resizable
    ? 'pfDashboardPanel_size_true'
    : 'pfDashboardPanel_size_false',
  attrs.class,
  props.ui?.root,
]);

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});
</script>

<template>
  <section
    :class="rootClass"
    :style="{ '--width': panelWidth }"
    v-bind="passthroughAttrs"
  >
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      <header v-if="$slots.header" class="pfDashboardPanel__header">
        <slot name="header" />
      </header>
      <div class="pfDashboardPanel__body" :class="ui?.body">
        <slot name="body" />
      </div>
      <footer v-if="$slots.footer" class="pfDashboardPanel__footer">
        <slot name="footer" />
      </footer>
    </template>
    <div v-if="resizable" class="pfDashboardPanel__handle" :class="ui?.handle">
      <slot
        name="resize-handle"
        :on-mouse-down="onHandleMouseDown"
        :on-touch-start="onHandleTouchStart"
        :on-double-click="() => undefined"
      >
        <PfDashboardResizeHandle
          @mousedown="onHandleMouseDown"
          @touchstart="onHandleTouchStart"
        />
      </slot>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pfDashboardPanel {
  position: relative;

  min-width: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.pfDashboardPanel_size_true {
  width: 100%;

  @media (min-width: 64rem) {
    width: var(--width);
  }
}

.pfDashboardPanel_size_false {
  flex: 1;
}

.pfDashboardPanel__body {
  padding: var(--pf-dashboard-panel-pad-y) var(--pf-dashboard-panel-pad-x);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--pf-space-md);

  overflow-y: auto;
}

.pfDashboardPanel__handle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
