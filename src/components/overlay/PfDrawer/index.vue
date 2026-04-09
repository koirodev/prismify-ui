<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue';
import { usePfApp } from '../../../composables/usePfApp';

export type PfDrawerDirection = 'top' | 'bottom' | 'left' | 'right';

export interface PfDrawerUi {
  overlay?: string;
  content?: string;
  handle?: string;
  container?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    inset?: boolean;
    overlay?: boolean;
    handle?: boolean;
    handleOnly?: boolean;
    portal?: string | boolean | HTMLElement | undefined;
    nested?: boolean;
    ui?: PfDrawerUi;
    modal?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    dismissible?: boolean;
    transition?: boolean;
    direction?: PfDrawerDirection;
    closeThreshold?: number;
    snapPoints?: (string | number)[];
    activeSnapPoint?: string | number | null;
    shouldScaleBackground?: boolean;
    setBackgroundColorOnScale?: boolean;
    noBodyStyles?: boolean;
  }>(),
  {
    overlay: true,
    handle: true,
    handleOnly: false,
    portal: true,
    nested: false,
    defaultOpen: false,
    dismissible: true,
    transition: true,
    direction: 'bottom',
    modal: true,
    closeThreshold: 0.35,
    setBackgroundColorOnScale: true,
    noBodyStyles: false,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'update:activeSnapPoint': [value: string | number];
  close: [];
  'close:prevent': [];
  drag: [percentageDragged: number];
  release: [open: boolean];
  animationEnd: [open: boolean];
}>();

const attrs = useAttrs();
const slots = useSlots();
const app = usePfApp();
const autoId = useId();
const vnodeProps = computed(
  () => getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
);

const DRAWER_DEPTH_KEY = Symbol('pfDrawerDepth');
const depth = inject(DRAWER_DEPTH_KEY, 0);
provide(DRAWER_DEPTH_KEY, depth + 1);

let bodyScrollLockCount = 0;
function lockBodyScroll() {
  if (props.noBodyStyles) return;
  bodyScrollLockCount++;
  if (bodyScrollLockCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}
function unlockBodyScroll() {
  if (props.noBodyStyles) return;
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount === 0) {
    document.documentElement.style.overflow = '';
  }
}

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const localOpen = ref(!!props.defaultOpen || props.open === true);

const dragPx = ref(0);
const isDragging = ref(false);
let dragStart = 0;
let dragActive = false;

function isOpenControlled(): boolean {
  const p = vnodeProps.value;
  return (
    props.open !== undefined &&
    props.open !== null &&
    p != null &&
    (typeof p['onUpdate:open'] === 'function' ||
      typeof p.onUpdateOpen === 'function')
  );
}

watch(
  () => props.defaultOpen,
  (d) => {
    if (!isOpenControlled() && props.open !== true && d != null) {
      localOpen.value = !!d;
    }
  },
  { immediate: true }
);

watch(
  () => props.open,
  (o) => {
    if (!isOpenControlled() && o === true) {
      localOpen.value = true;
    }
  },
  { immediate: true }
);

const mergedOpen = computed(() =>
  isOpenControlled() ? Boolean(props.open) : localOpen.value
);

function setOpen(v: boolean) {
  emit('update:open', v);
  if (!isOpenControlled()) {
    localOpen.value = v;
  }
}

watch(
  () => mergedOpen.value,
  (o, prev) => {
    if (prev === true && o === false) {
      emit('close');
    }
  }
);

function requestClose() {
  if (!props.dismissible) {
    emit('close:prevent');
    return;
  }
  setOpen(false);
}

function close() {
  setOpen(false);
}

function onTriggerClick() {
  if (mergedOpen.value) {
    requestClose();
    return;
  }
  setOpen(true);
}

const hasContentSlot = computed(() => slots.content != null);
const hasHeaderSlot = computed(() => slots.header != null);
const hasBodySlot = computed(() => slots.body != null);
const hasFooterSlot = computed(() => slots.footer != null);
const hasTitleSlot = computed(() => slots.title != null);
const hasDescriptionSlot = computed(() => slots.description != null);

const hasTitle = computed(
  () => hasTitleSlot.value || (props.title != null && props.title !== '')
);
const hasDescription = computed(
  () =>
    hasDescriptionSlot.value ||
    (props.description != null && props.description !== '')
);

const showHeader = computed(
  () =>
    !hasContentSlot.value &&
    (hasHeaderSlot.value || hasTitle.value || hasDescription.value)
);
const showBody = computed(
  () => !hasContentSlot.value && (hasBodySlot.value || slots.default != null)
);
const showFooter = computed(() => !hasContentSlot.value && hasFooterSlot.value);

const showOverlay = computed(
  () => props.modal !== false && props.overlay !== false
);

const teleportTarget = computed((): string | HTMLElement => {
  if (props.portal === false) return 'body';
  if (props.portal && typeof props.portal === 'object') {
    return props.portal as HTMLElement;
  }
  if (typeof props.portal === 'string') {
    const s = props.portal.trim();
    if (s !== '' && s !== 'true' && s !== 'false') return props.portal;
  }
  const t = app.value.portalTarget;
  if (t === false) return 'body';
  if (typeof t === 'string') return t;
  return t;
});

function parseSnapValue(v: string | number): number {
  if (typeof v === 'number') {
    if (v > 1 && v <= 100) return v;
    if (v > 0 && v <= 1) return v * 100;
    return Math.min(100, Math.max(0, v));
  }
  const s = String(v).trim();
  if (s.endsWith('%')) return parseFloat(s) || 0;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  if (n > 1 && n <= 100) return n;
  if (n > 0 && n <= 1) return n * 100;
  return Math.min(100, Math.max(0, n));
}

const snapPercents = computed(() =>
  (props.snapPoints ?? []).map((p) => parseSnapValue(p))
);

const internalSnap = ref<number | null>(null);

function defaultSnapPercent(): number {
  const pts = snapPercents.value;
  if (pts.length === 0) return 90;
  return pts[pts.length - 1] ?? 90;
}

const resolvedSnapPercent = computed(() => {
  if (snapPercents.value.length === 0) return null;
  if (props.activeSnapPoint != null && props.activeSnapPoint !== '') {
    const raw = props.activeSnapPoint;
    if (typeof raw === 'string' && snapPercents.value.length) {
      const idx = props.snapPoints!.indexOf(raw);
      if (idx >= 0) return snapPercents.value[idx] ?? null;
    }
    if (typeof raw === 'number') {
      const idx = Math.floor(raw);
      if (
        idx >= 0 &&
        idx < snapPercents.value.length &&
        raw === idx &&
        Number.isInteger(raw)
      ) {
        return snapPercents.value[idx] ?? null;
      }
      return parseSnapValue(raw);
    }
  }
  if (internalSnap.value != null) return internalSnap.value;
  return defaultSnapPercent();
});

watch(
  () => [mergedOpen.value, snapPercents.value.join(',')] as const,
  () => {
    if (mergedOpen.value && snapPercents.value.length) {
      internalSnap.value = resolvedSnapPercent.value;
    }
  },
  { immediate: true }
);

watch(
  () => props.activeSnapPoint,
  () => {
    if (snapPercents.value.length && props.activeSnapPoint != null) {
      const p = resolvedSnapPercent.value;
      if (p != null) internalSnap.value = p;
    }
  }
);

const panelMaxSize = computed(() => {
  const sp = resolvedSnapPercent.value;
  if (sp == null) return null;
  if (props.direction === 'left' || props.direction === 'right') {
    return `${sp}dvw`;
  }
  return `${sp}dvh`;
});

const stackZIndex = computed(() => 9010 + depth * 10);

function findScaleWrapper(): HTMLElement | null {
  return document.querySelector(
    '[data-pf-drawer-scale-wrapper]'
  ) as HTMLElement | null;
}

function applyBackgroundScale(open: boolean) {
  if (!props.shouldScaleBackground) return;
  const el = findScaleWrapper();
  if (!el) return;
  el.style.transition = `transform var(--pf-animation-duration) var(--pf-animation-easing), border-radius var(--pf-animation-duration) var(--pf-animation-easing), background-color var(--pf-animation-duration) var(--pf-animation-easing)`;
  if (open) {
    el.style.transform = 'scale(0.96)';
    el.style.transformOrigin = 'center center';
    el.style.borderRadius = 'var(--pf-drawer-radius)';
    if (props.setBackgroundColorOnScale) {
      el.style.backgroundColor = 'var(--pf-drawer-scale-bg)';
    }
  } else {
    el.style.transform = '';
    el.style.borderRadius = '';
    if (props.setBackgroundColorOnScale) {
      el.style.backgroundColor = '';
    }
  }
}

watch(
  () => [mergedOpen.value, props.modal] as const,
  ([o, modal]) => {
    if (props.shouldScaleBackground) {
      void nextTick(() => applyBackgroundScale(o));
    }
    if (o && modal !== false) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true }
);

function onDocPointerDown(e: PointerEvent) {
  if (!mergedOpen.value) return;
  const t = e.target as Node | null;
  if (t == null) return;
  if (triggerRef.value?.contains(t)) return;
  if (panelRef.value?.contains(t)) return;
  requestClose();
}

function onKeyDown(e: KeyboardEvent) {
  if (!mergedOpen.value) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    requestClose();
  }
}

function onOverlayPointerDown() {
  requestClose();
}

function bindGlobalListeners() {
  document.addEventListener('pointerdown', onDocPointerDown, true);
  document.addEventListener('keydown', onKeyDown, true);
}

function unbindGlobalListeners() {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
  document.removeEventListener('keydown', onKeyDown, true);
}

let bindListenersTimer: number | null = null;

watch(
  () => mergedOpen.value,
  (o) => {
    unbindGlobalListeners();
    if (bindListenersTimer != null) {
      clearTimeout(bindListenersTimer);
      bindListenersTimer = null;
    }
    if (o) {
      void nextTick(() => {
        bindListenersTimer = window.setTimeout(() => {
          bindListenersTimer = null;
          bindGlobalListeners();
        }, 50);
      });
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (bindListenersTimer != null) {
    clearTimeout(bindListenersTimer);
  }
  unbindGlobalListeners();
  unlockBodyScroll();
  if (props.shouldScaleBackground) {
    applyBackgroundScale(false);
  }
});

function dragAxis(): 'x' | 'y' {
  return props.direction === 'left' || props.direction === 'right' ? 'x' : 'y';
}

function closeDirectionSign(): number {
  switch (props.direction) {
    case 'bottom':
      return 1;
    case 'top':
      return -1;
    case 'right':
      return 1;
    case 'left':
      return -1;
    default:
      return 1;
  }
}

function pointerDelta(e: PointerEvent): number {
  const axis = dragAxis();
  if (axis === 'y') {
    return e.clientY - dragStart;
  }
  return e.clientX - dragStart;
}

function rawCloseDelta(e: PointerEvent): number {
  const d = pointerDelta(e);
  const sign = closeDirectionSign();
  return sign * d;
}

function onHandlePointerDown(e: PointerEvent) {
  if (!mergedOpen.value || !props.dismissible) return;
  startDrag(e);
}

const containerRef = ref<HTMLElement | null>(null);

function onPanelPointerDown(e: PointerEvent) {
  if (!mergedOpen.value || !props.dismissible) return;
  if (props.handleOnly) return;
  const t = e.target as Node | null;
  if (t == null) return;
  if (props.handle && handleRef.value?.contains(t)) return;
  if (containerRef.value?.contains(t)) return;
  startDrag(e);
}

function startDrag(e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();
  dragActive = true;
  isDragging.value = true;
  dragStart = dragAxis() === 'y' ? e.clientY : e.clientX;
  dragPx.value = 0;
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
  try {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  } catch {
    /* noop */
  }
}

function panelSizePx(): number {
  const el = panelRef.value;
  if (!el) return 300;
  const r = el.getBoundingClientRect();
  if (dragAxis() === 'y') return Math.max(1, r.height);
  return Math.max(1, r.width);
}

function onWindowPointerMove(e: PointerEvent) {
  if (!dragActive) return;
  const raw = rawCloseDelta(e);
  const px = Math.max(0, raw);
  dragPx.value = px;
  const size = panelSizePx();
  emit('drag', Math.min(1, px / size));
}

function onWindowPointerUp(e: PointerEvent) {
  if (!dragActive) return;
  dragActive = false;
  isDragging.value = false;
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);

  const raw = rawCloseDelta(e);
  const px = Math.max(0, raw);
  const size = panelSizePx();
  const pct = px / size;
  emit('drag', Math.min(1, pct));

  if (pct >= props.closeThreshold) {
    dragPx.value = 0;
    setOpen(false);
    emit('release', false);
    return;
  }

  dragPx.value = 0;
  emit('release', true);
}

const transformStyle = computed(() => {
  const px = dragPx.value;
  if (px === 0 && !isDragging.value) {
    return {};
  }
  const d = props.direction;
  if (d === 'bottom') return { transform: `translateY(${px}px)` };
  if (d === 'top') return { transform: `translateY(${-px}px)` };
  if (d === 'right') return { transform: `translateX(${px}px)` };
  return { transform: `translateX(${-px}px)` };
});

const rootClass = computed(() => ['pfDrawer', attrs.class]);
const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const titleId = computed(() => `pf-drawer-${autoId}-title`);
const descriptionId = computed(() => `pf-drawer-${autoId}-description`);

function onTransitionAfterEnter() {
  emit('animationEnd', true);
}

function onTransitionAfterLeave() {
  emit('animationEnd', false);
}
</script>

<template>
  <div class="pfDrawer" v-bind="passthroughAttrs" :class="rootClass">
    <div
      ref="triggerRef"
      class="pfDrawer__trigger"
      data-pf-drawer-trigger
      @click="onTriggerClick"
    >
      <slot />
    </div>
  </div>

  <Teleport :to="teleportTarget">
    <Transition
      :name="transition ? 'pfDrawerLayer' : undefined"
      @after-enter="onTransitionAfterEnter"
      @after-leave="onTransitionAfterLeave"
    >
      <div
        v-if="mergedOpen"
        class="pfDrawer__stack"
        :data-pf-drawer-nested="nested ? '' : undefined"
        :style="{ zIndex: stackZIndex }"
      >
        <div
          v-if="showOverlay"
          class="pfDrawer__overlay"
          :class="ui?.overlay"
          aria-hidden="true"
          @pointerdown="onOverlayPointerDown"
        />
        <div class="pfDrawer__viewport">
          <div
            ref="panelRef"
            class="pfDrawer__panel"
            :class="[
              `pfDrawer__panel_${direction}`,
              inset && `pfDrawer__panel_${direction}Inset`,
              isDragging && 'pfDrawer__panel_dragging',
              ui?.content,
            ]"
            role="dialog"
            :aria-modal="modal !== false ? 'true' : 'false'"
            :aria-labelledby="hasTitle ? titleId : undefined"
            :aria-describedby="hasDescription ? descriptionId : undefined"
            :style="{
              ...transformStyle,
              maxHeight: panelMaxSize ?? undefined,
              maxWidth:
                direction === 'left' || direction === 'right'
                  ? (panelMaxSize ?? undefined)
                  : undefined,
            }"
            @pointerdown="onPanelPointerDown"
          >
            <div
              v-if="!handle && !handleOnly"
              class="pfDrawer__edgeDrag"
              :class="`pfDrawer__edgeDrag_${direction}`"
              aria-hidden="true"
              @pointerdown="onHandlePointerDown"
            />
            <div
              v-if="handle"
              ref="handleRef"
              class="pfDrawer__handle"
              :class="ui?.handle"
              aria-hidden="true"
              @pointerdown="onHandlePointerDown"
            />

            <div
              ref="containerRef"
              class="pfDrawer__container"
              :class="ui?.container"
            >
              <slot v-if="hasContentSlot" name="content" :close="close" />

              <template v-else>
                <div
                  v-if="showHeader"
                  class="pfDrawer__header"
                  :class="ui?.header"
                >
                  <slot name="header" :close="close">
                    <div class="pfDrawer__headerMain">
                      <div
                        v-if="hasTitle"
                        :id="titleId"
                        class="pfDrawer__title"
                        :class="ui?.title"
                      >
                        <slot name="title">{{ title }}</slot>
                      </div>
                      <div
                        v-if="hasDescription"
                        :id="descriptionId"
                        class="pfDrawer__description"
                        :class="ui?.description"
                      >
                        <slot name="description">{{ description }}</slot>
                      </div>
                    </div>
                  </slot>
                </div>

                <div v-if="showBody" class="pfDrawer__body" :class="ui?.body">
                  <slot name="body">
                    <slot />
                  </slot>
                </div>

                <div
                  v-if="showFooter"
                  class="pfDrawer__footer"
                  :class="ui?.footer"
                >
                  <slot name="footer" :close="close" />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.pfDrawer {
  max-width: 100%;
  display: inline-block;
}

.pfDrawer__trigger {
  max-width: 100%;
  display: inline-flex;
}

.pfDrawer__stack {
  inset: 0;
  position: fixed;

  pointer-events: none;
}

.pfDrawer__overlay {
  inset: 0;
  position: fixed;
  z-index: 0;

  background: var(--pf-drawer-overlay-bg);

  pointer-events: auto;
}

.pfDrawer__viewport {
  inset: 0;
  position: fixed;
  z-index: 1;

  display: flex;
  align-items: stretch;
  justify-content: stretch;

  pointer-events: none;
}

.pfDrawer__panel {
  position: absolute;

  max-height: var(--pf-drawer-max-size);
  display: flex;
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-family: var(--pf-font-sans);

  box-shadow: var(--pf-drawer-shadow);
  background: var(--pf-color-surface);
  border: var(--pf-stroke-width) solid var(--pf-border-color);
  outline: none;
  overflow: hidden;

  pointer-events: auto;
}

.pfDrawer__panel_dragging {
  transition: none !important;
}

.pfDrawer__edgeDrag {
  position: absolute;
  z-index: 2;

  cursor: grab;
  touch-action: none;
}

.pfDrawer__edgeDrag_bottom {
  top: 0;
  right: 0;
  left: 0;

  height: 1.5rem;
}

.pfDrawer__edgeDrag_top {
  right: 0;
  bottom: 0;
  left: 0;

  height: 1.5rem;
}

.pfDrawer__edgeDrag_left {
  top: 0;
  bottom: 0;
  left: 0;

  width: 1.5rem;
}

.pfDrawer__edgeDrag_right {
  top: 0;
  right: 0;
  bottom: 0;

  width: 1.5rem;
}

.pfDrawer__panel_bottom {
  right: 0;
  bottom: 0;
  left: 0;

  width: 100%;
  flex-direction: column;

  border-radius: var(--pf-drawer-radius) var(--pf-drawer-radius) 0 0;
}

.pfDrawer__panel_bottomInset {
  right: var(--pf-drawer-inset);
  bottom: var(--pf-drawer-inset);
  left: var(--pf-drawer-inset);

  max-height: min(
    var(--pf-drawer-max-size),
    calc(100% - 2 * var(--pf-drawer-inset))
  );

  border-radius: var(--pf-drawer-radius);
}

.pfDrawer__panel_top {
  top: 0;
  right: 0;
  left: 0;

  width: 100%;
  flex-direction: column-reverse;

  border-radius: 0 0 var(--pf-drawer-radius) var(--pf-drawer-radius);
}

.pfDrawer__panel_topInset {
  top: var(--pf-drawer-inset);
  right: var(--pf-drawer-inset);
  left: var(--pf-drawer-inset);

  max-height: min(
    var(--pf-drawer-max-size),
    calc(100% - 2 * var(--pf-drawer-inset))
  );

  border-radius: var(--pf-drawer-radius);
}

.pfDrawer__panel_left {
  top: 0;
  bottom: 0;
  left: 0;

  max-width: var(--pf-drawer-side-max-size);
  height: 100%;
  flex-direction: row-reverse;

  border-radius: 0 var(--pf-drawer-radius) var(--pf-drawer-radius) 0;
}

.pfDrawer__panel_leftInset {
  top: var(--pf-drawer-inset);
  bottom: var(--pf-drawer-inset);
  left: var(--pf-drawer-inset);

  max-width: min(
    var(--pf-drawer-side-max-size),
    calc(100% - 2 * var(--pf-drawer-inset))
  );

  border-radius: var(--pf-drawer-radius);
}

.pfDrawer__panel_right {
  top: 0;
  right: 0;
  bottom: 0;

  max-width: var(--pf-drawer-side-max-size);
  height: 100%;
  flex-direction: row;

  border-radius: var(--pf-drawer-radius) 0 0 var(--pf-drawer-radius);
}

.pfDrawer__panel_rightInset {
  top: var(--pf-drawer-inset);
  right: var(--pf-drawer-inset);
  bottom: var(--pf-drawer-inset);

  max-width: min(
    var(--pf-drawer-side-max-size),
    calc(100% - 2 * var(--pf-drawer-inset))
  );

  border-radius: var(--pf-drawer-radius);
}

.pfDrawer__handle {
  margin: var(--pf-drawer-handle-gap) auto 0;

  width: var(--pf-drawer-handle-width);
  height: var(--pf-drawer-handle-thickness);
  flex-shrink: 0;

  background: var(--pf-color-muted);
  border-radius: var(--pf-drawer-handle-radius);

  cursor: grab;
  touch-action: none;
}

.pfDrawer__panel_top .pfDrawer__handle {
  margin: 0 auto var(--pf-drawer-handle-gap);
}

.pfDrawer__panel_left .pfDrawer__handle,
.pfDrawer__panel_right .pfDrawer__handle {
  margin: auto var(--pf-drawer-handle-gap) auto 0;

  width: var(--pf-drawer-handle-thickness);
  height: var(--pf-drawer-handle-width);
}

.pfDrawer__panel_right .pfDrawer__handle {
  margin: auto 0 auto var(--pf-drawer-handle-gap);
}

.pfDrawer__container {
  padding: var(--pf-drawer-padding-y) var(--pf-drawer-padding-x);
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--pf-space-md);

  overflow: auto;
}

.pfDrawer__header {
  flex-shrink: 0;
}

.pfDrawer__headerMain {
  min-width: 0;
}

.pfDrawer__title {
  font-size: var(--pf-font-size-md);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-md);
}

.pfDrawer__description {
  margin-top: var(--pf-space-xs);

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfDrawer__body {
  min-height: 0;
  flex: 1;
}

.pfDrawer__footer {
  padding-top: var(--pf-drawer-footer-padding-y);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: var(--pf-space-sm);

  border-top: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfDrawerLayer-enter-active,
.pfDrawerLayer-leave-active {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfDrawerLayer-enter-from,
.pfDrawerLayer-leave-to {
  opacity: 0;
}

.pfDrawerLayer-enter-active .pfDrawer__overlay,
.pfDrawerLayer-leave-active .pfDrawer__overlay {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfDrawerLayer-enter-from .pfDrawer__overlay,
.pfDrawerLayer-leave-to .pfDrawer__overlay {
  opacity: 0;
}

.pfDrawerLayer-enter-active .pfDrawer__panel,
.pfDrawerLayer-leave-active .pfDrawer__panel {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfDrawerLayer-enter-from .pfDrawer__panel_bottom,
.pfDrawerLayer-leave-to .pfDrawer__panel_bottom {
  opacity: 0;

  transform: translateY(100%);
}

.pfDrawerLayer-enter-from .pfDrawer__panel_top,
.pfDrawerLayer-leave-to .pfDrawer__panel_top {
  opacity: 0;

  transform: translateY(-100%);
}

.pfDrawerLayer-enter-from .pfDrawer__panel_left,
.pfDrawerLayer-leave-to .pfDrawer__panel_left {
  opacity: 0;

  transform: translateX(-100%);
}

.pfDrawerLayer-enter-from .pfDrawer__panel_right,
.pfDrawerLayer-leave-to .pfDrawer__panel_right {
  opacity: 0;

  transform: translateX(100%);
}
</style>
