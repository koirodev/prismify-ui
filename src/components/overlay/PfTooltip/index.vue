<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  watch,
} from 'vue';
import PfKbd, {
  type PfKbdColor,
  type PfKbdSize,
  type PfKbdUi,
  type PfKbdVariant,
} from '../../element/PfKbd/index.vue';
import { usePfApp } from '../../../composables/usePfApp';

export type PfTooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type PfTooltipAlign = 'start' | 'center' | 'end';

export interface PfTooltipReferenceElement {
  getBoundingClientRect: () => DOMRect;
}

export interface PfTooltipContentProps {
  side?: PfTooltipSide;
  align?: PfTooltipAlign;
  sideOffset?: number;
  alignOffset?: number;
  updatePositionStrategy?: 'optimized' | 'always';
}

export interface PfTooltipArrowProps {
  width?: number;
  height?: number;
}

export interface PfTooltipKbdProps {
  value?: string;
  color?: PfKbdColor;
  variant?: PfKbdVariant;
  size?: PfKbdSize;
  ui?: PfKbdUi;
  class?: string;
}

export type PfTooltipKbd = string | undefined | PfTooltipKbdProps;

export interface PfTooltipUi {
  content?: string;
  arrow?: string;
  text?: string;
  kbds?: string;
  kbdsSize?: PfKbdSize;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    text?: string;
    kbds?: PfTooltipKbd[];
    content?: PfTooltipContentProps;
    arrow?: boolean | PfTooltipArrowProps;
    portal?: string | boolean | HTMLElement;
    reference?: PfTooltipReferenceElement;
    ui?: PfTooltipUi;
    defaultOpen?: boolean;
    open?: boolean;
    delayDuration?: number;
    disableHoverableContent?: boolean;
    disableClosingTrigger?: boolean;
    disabled?: boolean;
    ignoreNonKeyboardFocus?: boolean;
  }>(),
  {
    kbds: () => [],
    content: () => ({}),
    arrow: false,
    portal: true,
    defaultOpen: false,
    disabled: false,
    ignoreNonKeyboardFocus: false,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const attrs = useAttrs();
const app = usePfApp();
const autoId = useId();
const vnodeProps = computed(
  () => getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
);

const triggerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const pointerOverTrigger = ref(false);
const pointerOverContent = ref(false);

const localOpen = ref(!!props.defaultOpen || props.open === true);
const contentTop = ref(0);
const contentLeft = ref(0);
const contentSide = ref<PfTooltipSide>('top');

let openTimer: number | null = null;
let closeTimer: number | null = null;
let rafId: number | null = null;

const tooltipId = computed(() => `pf-tooltip-${autoId}`);

const mergedDelayDuration = computed(() => {
  if (props.delayDuration != null) return props.delayDuration;
  if (app.value.tooltip?.delayDuration != null) {
    return app.value.tooltip.delayDuration;
  }
  return 700;
});

const mergedDisableHoverableContent = computed(() => {
  if (props.disableHoverableContent != null) {
    return props.disableHoverableContent;
  }
  return app.value.tooltip?.disableHoverableContent ?? false;
});

const mergedDisableClosingTrigger = computed(() => {
  if (props.disableClosingTrigger != null) {
    return props.disableClosingTrigger;
  }
  return app.value.tooltip?.disableClosingTrigger ?? false;
});

const resolvedContent = computed<PfTooltipContentProps>(() => ({
  side: props.content?.side ?? 'top',
  align: props.content?.align ?? 'center',
  sideOffset: props.content?.sideOffset ?? 8,
  alignOffset: props.content?.alignOffset ?? 0,
  updatePositionStrategy: props.content?.updatePositionStrategy ?? 'optimized',
}));

const resolvedArrow = computed<PfTooltipArrowProps | null>(() => {
  if (!props.arrow) return null;
  if (props.arrow === true) {
    return { width: 8, height: 8 };
  }
  return {
    width: props.arrow.width ?? 8,
    height: props.arrow.height ?? 8,
  };
});

const hasContent = computed(() => {
  return Boolean(props.text) || props.kbds.length > 0;
});

const rootClass = computed(() => ['pfTooltip', attrs.class]);

const contentClass = computed(() => [
  'pfTooltip__content',
  `pfTooltip__content_side_${contentSide.value}`,
  props.ui?.content,
]);

const arrowClass = computed(() => ['pfTooltip__arrow', props.ui?.arrow]);
const textClass = computed(() => ['pfTooltip__text', props.ui?.text]);
const kbdsClass = computed(() => ['pfTooltip__kbds', props.ui?.kbds]);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const teleportTarget = computed((): string | HTMLElement => {
  if (props.portal && typeof props.portal === 'object') {
    return props.portal as HTMLElement;
  }
  if (typeof props.portal === 'string' && props.portal.trim() !== '') {
    return props.portal;
  }
  const t = app.value.portalTarget;
  if (t === false) return 'body';
  if (typeof t === 'string') return t;
  return t;
});

const usePortal = computed(() => props.portal !== false);

const contentStyle = computed(() => ({
  top: `${contentTop.value}px`,
  left: `${contentLeft.value}px`,
}));

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

function setOpen(v: boolean) {
  if (props.disabled) v = false;
  emit('update:open', v);
  if (!isOpenControlled()) {
    localOpen.value = v;
  }
}

const mergedOpen = computed(() =>
  props.disabled
    ? false
    : isOpenControlled()
      ? Boolean(props.open)
      : localOpen.value
);

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
  (open) => {
    if (!isOpenControlled() && open === true) {
      localOpen.value = true;
    }
  },
  { immediate: true }
);

watch(
  () => props.disabled,
  (v) => {
    if (v) setOpen(false);
  }
);

function clearOpenTimer() {
  if (openTimer != null) {
    clearTimeout(openTimer);
    openTimer = null;
  }
}

function clearCloseTimer() {
  if (closeTimer != null) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function startOpenTimer() {
  clearOpenTimer();
  const delay = Math.max(0, mergedDelayDuration.value);
  if (delay === 0) {
    setOpen(true);
    return;
  }
  openTimer = window.setTimeout(() => {
    openTimer = null;
    setOpen(true);
  }, delay);
}

function startCloseTimer() {
  clearCloseTimer();
  closeTimer = window.setTimeout(() => {
    closeTimer = null;
    if (pointerOverTrigger.value) return;
    if (pointerOverContent.value && !mergedDisableHoverableContent.value)
      return;
    setOpen(false);
  }, 50);
}

function getAnchorRect(): DOMRect | null {
  if (props.reference) {
    return props.reference.getBoundingClientRect();
  }
  return triggerRef.value?.getBoundingClientRect() ?? null;
}

function contentDimensions() {
  const el = contentRef.value;
  if (!el) return { width: 0, height: 0 };
  return { width: el.offsetWidth, height: el.offsetHeight };
}

function placeForSide(
  side: PfTooltipSide,
  rect: DOMRect,
  width: number,
  height: number
): { left: number; top: number } {
  const align = resolvedContent.value.align ?? 'center';
  const sideOffset = resolvedContent.value.sideOffset ?? 8;
  const alignOffset = resolvedContent.value.alignOffset ?? 0;

  let left = rect.left;
  let top = rect.top;

  if (side === 'top') {
    top = rect.top - height - sideOffset;
    if (align === 'start') left = rect.left + alignOffset;
    if (align === 'center')
      left = rect.left + rect.width / 2 - width / 2 + alignOffset;
    if (align === 'end') left = rect.right - width + alignOffset;
  } else if (side === 'bottom') {
    top = rect.bottom + sideOffset;
    if (align === 'start') left = rect.left + alignOffset;
    if (align === 'center')
      left = rect.left + rect.width / 2 - width / 2 + alignOffset;
    if (align === 'end') left = rect.right - width + alignOffset;
  } else if (side === 'left') {
    left = rect.left - width - sideOffset;
    if (align === 'start') top = rect.top + alignOffset;
    if (align === 'center')
      top = rect.top + rect.height / 2 - height / 2 + alignOffset;
    if (align === 'end') top = rect.bottom - height + alignOffset;
  } else {
    left = rect.right + sideOffset;
    if (align === 'start') top = rect.top + alignOffset;
    if (align === 'center')
      top = rect.top + rect.height / 2 - height / 2 + alignOffset;
    if (align === 'end') top = rect.bottom - height + alignOffset;
  }

  return { left, top };
}

function overflowScore(
  left: number,
  top: number,
  width: number,
  height: number
): number {
  const viewportPadding = 8;
  const right = left + width;
  const bottom = top + height;

  return (
    Math.max(0, viewportPadding - left) +
    Math.max(0, viewportPadding - top) +
    Math.max(0, right - (window.innerWidth - viewportPadding)) +
    Math.max(0, bottom - (window.innerHeight - viewportPadding))
  );
}

function clampToViewport(
  left: number,
  top: number,
  width: number,
  height: number
) {
  const viewportPadding = 8;
  const clampedLeft = Math.min(
    Math.max(left, viewportPadding),
    window.innerWidth - width - viewportPadding
  );
  const clampedTop = Math.min(
    Math.max(top, viewportPadding),
    window.innerHeight - height - viewportPadding
  );
  return { left: clampedLeft, top: clampedTop };
}

function updatePosition() {
  if (!mergedOpen.value) return;
  const rect = getAnchorRect();
  if (!rect) return;
  const { width, height } = contentDimensions();
  if (width === 0 || height === 0) return;

  const preferred = resolvedContent.value.side ?? 'top';
  const candidates: PfTooltipSide[] = [preferred];
  if (preferred === 'top') candidates.push('bottom', 'right', 'left');
  if (preferred === 'bottom') candidates.push('top', 'right', 'left');
  if (preferred === 'left') candidates.push('right', 'top', 'bottom');
  if (preferred === 'right') candidates.push('left', 'top', 'bottom');

  let bestSide = candidates[0]!;
  let best = placeForSide(bestSide, rect, width, height);
  let bestScore = overflowScore(best.left, best.top, width, height);

  for (const c of candidates.slice(1)) {
    const p = placeForSide(c, rect, width, height);
    const s = overflowScore(p.left, p.top, width, height);
    if (s < bestScore) {
      bestScore = s;
      bestSide = c;
      best = p;
    }
  }

  const clamped = clampToViewport(best.left, best.top, width, height);
  contentSide.value = bestSide;
  contentTop.value = clamped.top;
  contentLeft.value = clamped.left;
}

function stopRaf() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function startRaf() {
  stopRaf();
  const loop = () => {
    updatePosition();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}

function onGlobalEscape(e: KeyboardEvent) {
  if (!mergedOpen.value) return;
  if (e.key !== 'Escape') return;
  e.preventDefault();
  setOpen(false);
}

function onGlobalScrollOrResize() {
  updatePosition();
}

function bindGlobalListeners() {
  document.addEventListener('keydown', onGlobalEscape, true);
  window.addEventListener('scroll', onGlobalScrollOrResize, true);
  window.addEventListener('resize', onGlobalScrollOrResize, true);
}

function unbindGlobalListeners() {
  document.removeEventListener('keydown', onGlobalEscape, true);
  window.removeEventListener('scroll', onGlobalScrollOrResize, true);
  window.removeEventListener('resize', onGlobalScrollOrResize, true);
}

watch(
  () => mergedOpen.value,
  async (open) => {
    clearOpenTimer();
    clearCloseTimer();
    unbindGlobalListeners();
    stopRaf();

    if (!open) return;

    await nextTick();
    updatePosition();
    bindGlobalListeners();

    if (resolvedContent.value.updatePositionStrategy === 'always') {
      startRaf();
    }
  },
  { immediate: true }
);

watch(
  () => props.content,
  () => {
    if (mergedOpen.value) {
      void nextTick(updatePosition);
    }
  },
  { deep: true }
);

function onTriggerPointerEnter() {
  if (props.disabled) return;
  pointerOverTrigger.value = true;
  clearCloseTimer();
  startOpenTimer();
}

function onTriggerPointerLeave() {
  pointerOverTrigger.value = false;
  clearOpenTimer();
  if (mergedDisableClosingTrigger.value) return;
  startCloseTimer();
}

function onTriggerFocusIn(e: FocusEvent) {
  if (props.disabled) return;
  if (
    props.ignoreNonKeyboardFocus &&
    e.target instanceof HTMLElement &&
    !e.target.matches(':focus-visible')
  ) {
    return;
  }
  clearCloseTimer();
  setOpen(true);
}

function onTriggerFocusOut() {
  if (mergedDisableClosingTrigger.value) return;
  startCloseTimer();
}

function onContentPointerEnter() {
  pointerOverContent.value = true;
  clearCloseTimer();
}

function onContentPointerLeave() {
  pointerOverContent.value = false;
  if (mergedDisableHoverableContent.value) return;
  startCloseTimer();
}

onBeforeUnmount(() => {
  clearOpenTimer();
  clearCloseTimer();
  unbindGlobalListeners();
  stopRaf();
});
</script>

<template>
  <span class="pfTooltip" v-bind="passthroughAttrs" :class="rootClass">
    <span
      ref="triggerRef"
      class="pfTooltip__trigger"
      :aria-describedby="mergedOpen ? tooltipId : undefined"
      @pointerenter="onTriggerPointerEnter"
      @pointerleave="onTriggerPointerLeave"
      @focusin="onTriggerFocusIn"
      @focusout="onTriggerFocusOut"
    >
      <slot />
    </span>
  </span>

  <Teleport :to="teleportTarget" :disabled="!usePortal">
    <Transition name="pfTooltipLayer">
      <div
        v-if="mergedOpen && (hasContent || $slots.content)"
        :id="tooltipId"
        ref="contentRef"
        role="tooltip"
        :class="contentClass"
        :style="contentStyle"
        @pointerenter="onContentPointerEnter"
        @pointerleave="onContentPointerLeave"
      >
        <slot name="content">
          <span v-if="text" :class="textClass">{{ text }}</span>
          <span v-if="kbds.length > 0" :class="kbdsClass">
            <PfKbd
              v-for="(kbd, index) in kbds"
              :key="`kbd-${index}`"
              :size="ui?.kbdsSize ?? 'sm'"
              v-bind="typeof kbd === 'object' && kbd != null ? kbd : {}"
              :value="typeof kbd === 'string' ? kbd : kbd?.value"
            />
          </span>
        </slot>
        <span
          v-if="resolvedArrow"
          :class="arrowClass"
          :style="{
            '--pf-tooltip-arrow-size': `${Math.max(
              resolvedArrow.width ?? 8,
              resolvedArrow.height ?? 8
            )}px`,
          }"
          aria-hidden="true"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.pfTooltip {
  max-width: 100%;
  display: inline-flex;
}

.pfTooltip__trigger {
  max-width: 100%;
  display: inline-flex;
}

.pfTooltip__content {
  --pf-tooltip-arrow-size: 8px;

  position: fixed;
  z-index: var(--pf-tooltip-z-index);

  padding: var(--pf-tooltip-padding-y) var(--pf-tooltip-padding-x);
  max-width: min(var(--pf-tooltip-max-width), calc(100vw - 1rem));
  min-height: var(--pf-tooltip-min-height);
  display: inline-flex;
  align-items: center;
  gap: var(--pf-tooltip-gap);
  box-sizing: border-box;

  color: var(--pf-tooltip-text);
  font-family: var(--pf-font-sans);
  font-size: var(--pf-tooltip-font-size);
  line-height: var(--pf-line-height-sm);
  white-space: nowrap;

  box-shadow: var(--pf-tooltip-shadow);
  background: var(--pf-tooltip-surface);
  border: var(--pf-stroke-width) solid var(--pf-tooltip-border);
  border-radius: var(--pf-tooltip-radius);

  pointer-events: auto;
  user-select: none;
}

.pfTooltip__text {
  text-overflow: ellipsis;

  overflow: hidden;
}

.pfTooltip__kbds {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.pfTooltip__arrow {
  position: absolute;

  width: var(--pf-tooltip-arrow-size);
  height: var(--pf-tooltip-arrow-size);

  background: var(--pf-tooltip-surface);

  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.pfTooltip__content_side_top .pfTooltip__arrow {
  bottom: calc(var(--pf-tooltip-arrow-size) * -1 + 1px);
  left: calc(50% - var(--pf-tooltip-arrow-size) / 2);
}

.pfTooltip__content_side_bottom .pfTooltip__arrow {
  top: calc(var(--pf-tooltip-arrow-size) * -1 + 1px);
  left: calc(50% - var(--pf-tooltip-arrow-size) / 2);

  transform: rotate(180deg);
}

.pfTooltip__content_side_left .pfTooltip__arrow {
  top: calc(50% - var(--pf-tooltip-arrow-size) / 2);
  right: calc(var(--pf-tooltip-arrow-size) * -1 + 1px);

  transform: rotate(90deg);
}

.pfTooltip__content_side_right .pfTooltip__arrow {
  top: calc(50% - var(--pf-tooltip-arrow-size) / 2);
  left: calc(var(--pf-tooltip-arrow-size) * -1 + 1px);

  transform: rotate(-90deg);
}

.pfTooltipLayer-enter-active,
.pfTooltipLayer-leave-active {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfTooltipLayer-enter-from,
.pfTooltipLayer-leave-to {
  opacity: 0;

  transform: scale(0.98);
}
</style>
