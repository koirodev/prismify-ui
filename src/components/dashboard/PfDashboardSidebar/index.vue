<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue';
import PfDrawer from '../../overlay/PfDrawer/index.vue';
import PfModal from '../../overlay/PfModal/index.vue';
import PfDashboardResizeHandle from '../PfDashboardResizeHandle/index.vue';
import PfDashboardSidebarToggle from '../PfDashboardSidebarToggle/index.vue';
import {
  PF_DASHBOARD_GROUP_KEY,
  type PfDashboardSidebarApi,
} from '../shared/injection';
import { clampSize, pxToUnit, toUnit, unitToPx } from '../shared/resize';

export type PfDashboardSidebarMode = 'drawer' | 'slideover' | 'modal';

export interface PfDashboardSidebarUi {
  root?: string;
  header?: string;
  body?: string;
  footer?: string;
  toggle?: string;
  handle?: string;
  content?: string;
  overlay?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    mode?: PfDashboardSidebarMode;
    menu?: Record<string, unknown>;
    toggle?:
      | boolean
      | Partial<{
          color:
            | 'primary'
            | 'secondary'
            | 'success'
            | 'info'
            | 'warning'
            | 'error'
            | 'neutral';
          variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
          class: string;
        }>;
    toggleSide?: 'left' | 'right';
    autoClose?: boolean;
    ui?: PfDashboardSidebarUi;
    id?: string;
    side?: 'left' | 'right';
    minSize?: number;
    maxSize?: number;
    defaultSize?: number;
    resizable?: boolean;
    collapsible?: boolean;
    collapsedSize?: number;
    open?: boolean;
    collapsed?: boolean;
  }>(),
  {
    mode: 'slideover',
    menu: undefined,
    toggle: true,
    toggleSide: 'left',
    autoClose: true,
    ui: undefined,
    id: 'sidebar',
    side: 'left',
    minSize: 10,
    maxSize: 20,
    defaultSize: 15,
    resizable: false,
    collapsible: false,
    collapsedSize: 0,
    open: undefined,
    collapsed: undefined,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'update:collapsed': [value: boolean];
}>();

const attrs = useAttrs();
const group = inject(PF_DASHBOARD_GROUP_KEY, null);

const localOpen = ref(false);
const localCollapsed = ref(false);
const localSize = ref(props.defaultSize);

const sidebarId = computed(() => props.id || 'sidebar');

const controlledOpen = computed(() => props.open !== undefined);
const controlledCollapsed = computed(() => props.collapsed !== undefined);

const openState = computed(() =>
  controlledOpen.value ? !!props.open : localOpen.value
);
const collapsedState = computed(() =>
  controlledCollapsed.value ? !!props.collapsed : localCollapsed.value
);

const persisted = computed(() => group?.readState(sidebarId.value) ?? {});

watch(
  () => persisted.value,
  (entry) => {
    if (!controlledOpen.value && typeof entry.open === 'boolean') {
      localOpen.value = entry.open;
    }
    if (!controlledCollapsed.value && typeof entry.collapsed === 'boolean') {
      localCollapsed.value = entry.collapsed;
    }
    if (typeof entry.size === 'number' && Number.isFinite(entry.size)) {
      localSize.value = entry.size;
    }
  },
  { immediate: true, deep: true }
);

function setOpen(value: boolean): void {
  emit('update:open', value);
  if (!controlledOpen.value) {
    localOpen.value = value;
  }
  group?.writeState(sidebarId.value, { open: value });
}

function setCollapsed(value: boolean): void {
  emit('update:collapsed', value);
  if (!controlledCollapsed.value) {
    localCollapsed.value = value;
  }
  group?.writeState(sidebarId.value, { collapsed: value });
}

function toggleOpen(): void {
  setOpen(!openState.value);
}

function toggleCollapsed(): void {
  if (!props.collapsible) return;
  setCollapsed(!collapsedState.value);
}

const effectiveSize = computed(() =>
  collapsedState.value ? props.collapsedSize : localSize.value
);

watch(
  () => effectiveSize.value,
  (size) => {
    group?.writeState(sidebarId.value, { size });
  }
);

const desktopWidth = computed(() => {
  const unit = group?.unit.value ?? '%';
  return toUnit(effectiveSize.value, unit);
});

const rootClass = computed(() => [
  'pfDashboardSidebar',
  `pfDashboardSidebar_side_${props.side}`,
  collapsedState.value && 'pfDashboardSidebar_collapsed',
  attrs.class,
  props.ui?.root,
]);

const showMobileToggle = computed(() => props.toggle !== false);

const drawerDirection = computed(() =>
  props.side === 'left' ? 'left' : 'right'
);

function onMobileClose(): void {
  setOpen(false);
}

function onResizePointerStart(clientX: number): void {
  if (!props.resizable) return;
  if (typeof window === 'undefined') return;

  const container =
    group?.groupRef.value?.getBoundingClientRect().width ?? window.innerWidth;
  const unit = group?.unit.value ?? '%';
  const currentPx = unitToPx(localSize.value, unit, container);
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
    const delta = props.side === 'left' ? x - startX : startX - x;
    const nextPx = clampSize(currentPx + delta, minPx, maxPx);
    const nextUnitValue = pxToUnit(nextPx, unit, container);
    localSize.value = nextUnitValue;
    if (props.collapsible && nextPx <= minPx * 0.75) {
      setCollapsed(true);
    } else if (props.collapsible && collapsedState.value) {
      setCollapsed(false);
    }
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

function onHandleDoubleClick(): void {
  if (!props.collapsible) return;
  toggleCollapsed();
}

const sidebarApi: PfDashboardSidebarApi = {
  side: props.side,
  open: computed(() => openState.value),
  collapsed: computed(() => collapsedState.value),
  setOpen,
  setCollapsed,
  toggleOpen,
  toggleCollapsed,
};

onMounted(() => {
  group?.registerSidebar(sidebarId.value, sidebarApi);
});

onBeforeUnmount(() => {
  group?.unregisterSidebar(sidebarId.value);
});

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});

const mobileToggleProps = computed(() => {
  if (props.toggle && typeof props.toggle === 'object') {
    return props.toggle;
  }
  return {};
});
</script>

<template>
  <aside
    :class="rootClass"
    :style="{ '--width': desktopWidth }"
    v-bind="passthroughAttrs"
  >
    <div class="pfDashboardSidebar__desktop">
      <template v-if="$slots.content">
        <slot name="content" :collapsed="collapsedState" />
      </template>
      <template v-else>
        <header class="pfDashboardSidebar__header" :class="ui?.header">
          <slot name="header" :collapsed="collapsedState" />
        </header>
        <div class="pfDashboardSidebar__body" :class="ui?.body">
          <slot :collapsed="collapsedState" />
        </div>
        <footer class="pfDashboardSidebar__footer" :class="ui?.footer">
          <slot name="footer" :collapsed="collapsedState" />
        </footer>
      </template>
    </div>
    <div
      v-if="resizable"
      class="pfDashboardSidebar__handle"
      :class="ui?.handle"
    >
      <slot
        name="resize-handle"
        :on-mouse-down="onHandleMouseDown"
        :on-touch-start="onHandleTouchStart"
        :on-double-click="onHandleDoubleClick"
      >
        <PfDashboardResizeHandle
          @mousedown="onHandleMouseDown"
          @touchstart="onHandleTouchStart"
          @dblclick="onHandleDoubleClick"
        />
      </slot>
    </div>

    <div
      v-if="showMobileToggle"
      class="pfDashboardSidebar__toggle"
      :class="ui?.toggle"
    >
      <slot name="toggle">
        <PfDashboardSidebarToggle
          :side="toggleSide"
          v-bind="mobileToggleProps"
          @click="toggleOpen"
        />
      </slot>
    </div>
  </aside>

  <PfModal
    v-if="mode === 'modal'"
    :open="openState"
    :ui="{ content: ['pfDashboardSidebar__modal', ui?.content].join(' ') }"
    :overlay="true"
    :dismissible="true"
    @update:open="setOpen"
  >
    <template #content>
      <div class="pfDashboardSidebar__mobileContent">
        <slot name="content" :collapsed="false">
          <header class="pfDashboardSidebar__headerMobile">
            <slot name="header" :collapsed="false" />
          </header>
          <div class="pfDashboardSidebar__bodyMobile">
            <slot :collapsed="false" />
          </div>
          <footer class="pfDashboardSidebar__footerMobile">
            <slot name="footer" :collapsed="false" />
          </footer>
        </slot>
      </div>
    </template>
  </PfModal>

  <PfDrawer
    v-else
    :open="openState"
    :direction="drawerDirection"
    :overlay="true"
    :dismissible="true"
    :inset="mode === 'slideover'"
    :ui="{
      content: ['pfDashboardSidebar__drawer', ui?.content].join(' '),
      overlay: ui?.overlay,
    }"
    @update:open="setOpen"
    @close="onMobileClose"
  >
    <template #content>
      <div class="pfDashboardSidebar__mobileContent">
        <slot name="content" :collapsed="false">
          <header class="pfDashboardSidebar__headerMobile">
            <slot name="header" :collapsed="false" />
          </header>
          <div class="pfDashboardSidebar__bodyMobile">
            <slot :collapsed="false" />
          </div>
          <footer class="pfDashboardSidebar__footerMobile">
            <slot name="footer" :collapsed="false" />
          </footer>
        </slot>
      </div>
    </template>
  </PfDrawer>
</template>

<style scoped lang="scss">
.pfDashboardSidebar {
  position: relative;

  width: var(--width);
  min-width: 4rem;
  min-height: 100dvh;
  display: none;
  flex-shrink: 0;
}

.pfDashboardSidebar_side_left {
  border-inline-end: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfDashboardSidebar__desktop {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;

  background: var(--pf-color-surface);
}

.pfDashboardSidebar__header {
  padding-inline: var(--pf-dashboard-sidebar-pad-x);
  min-height: var(--pf-dashboard-header-height);
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);
}

.pfDashboardSidebar__body {
  padding: var(--pf-dashboard-sidebar-pad-y) var(--pf-dashboard-sidebar-pad-x);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--pf-space-md);

  overflow-y: auto;
}

.pfDashboardSidebar__footer {
  padding: var(--pf-dashboard-sidebar-pad-y) var(--pf-dashboard-sidebar-pad-x);
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);
}

.pfDashboardSidebar__handle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
}

.pfDashboardSidebar_side_right .pfDashboardSidebar__handle {
  right: auto;
  left: 0;
}

.pfDashboardSidebar__toggle {
  display: block;
}

.pfDashboardSidebar__mobileContent {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-sm);
}

.pfDashboardSidebar__headerMobile {
  padding-inline: var(--pf-dashboard-sidebar-pad-x);
  min-height: var(--pf-dashboard-header-height);
  display: flex;
  align-items: center;
}

.pfDashboardSidebar__bodyMobile {
  padding: var(--pf-dashboard-sidebar-pad-y) var(--pf-dashboard-sidebar-pad-x);
  flex: 1;

  overflow-y: auto;
}

.pfDashboardSidebar__footerMobile {
  padding: var(--pf-dashboard-sidebar-pad-y) var(--pf-dashboard-sidebar-pad-x);
}

@media (min-width: 64rem) {
  .pfDashboardSidebar {
    display: flex;
  }

  .pfDashboardSidebar__toggle {
    display: none;
  }
}
</style>
