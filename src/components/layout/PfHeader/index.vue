<script setup lang="ts">
import {
  computed,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  useAttrs,
  useId,
  useSlots,
  watch,
  type Component,
} from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import { usePfApp } from '../../../composables/usePfApp';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfHeaderUi = Partial<{
  root: string;
  container: string;
  left: string;
  center: string;
  right: string;
  title: string;
  toggle: string;
  overlay: string;
  panel: string;
  panelHeader: string;
  body: string;
}>;

/** Menu button fields (`href` / `to` not supported on the toggle — no link in toggle). */
export type PfHeaderToggleButtonProps = Partial<{
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  square: boolean;
  icon: PfIconName;
  ariaLabel: string;
  disabled: boolean;
  loading: boolean;
  class: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or component. */
    as?: string | Component;
    /** Brand link text (if no `title` slot). */
    title?: string;
    /** Brand link URL. */
    to?: string;
    /**
     * Mobile menu mode (reserved; currently fullscreen panel only).
     * @default 'modal'
     */
    mode?: 'modal';
    /**
     * Menu open button on narrow viewports. `true` — default styles, object — `PfButton` props, `false` — hide.
     * Shown by default when `body` or `content` slot is set.
     */
    toggle?: boolean | PfHeaderToggleButtonProps;
    /** Menu button side on mobile. */
    toggleSide?: 'left' | 'right';
    /**
     * Close menu when `routeKey` changes (e.g. pass `route.fullPath` from the app).
     */
    routeKey?: string | number;
    /** Close menu on `routeKey` change. */
    autoClose?: boolean;
    /** Extra classes for layout regions. */
    ui?: PfHeaderUi;
    /** “Open menu” button label. */
    openMenuAriaLabel?: string;
    /** “Close menu” button label. */
    closeMenuAriaLabel?: string;
  }>(),
  {
    as: undefined,
    title: '',
    to: '/',
    mode: 'modal',
    toggle: undefined,
    toggleSide: 'right',
    routeKey: undefined,
    autoClose: true,
    ui: undefined,
    openMenuAriaLabel: undefined,
    closeMenuAriaLabel: undefined,
  }
);

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** After panel opens (move focus inside if needed). */
  opened: [];
  /** After panel closes. */
  closed: [];
}>();

const slots = useSlots();
const attrs = useAttrs();
const app = usePfApp();
const panelId = useId();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const hasMobileMenu = computed(() =>
  Boolean(slots.body?.({}) ?? slots.content?.({}))
);

const showToggle = computed(() => {
  if (!hasMobileMenu.value) return false;
  if (props.toggle === false) return false;
  return true;
});

const toggleBindings = computed(() => {
  const base: Record<string, unknown> = {
    type: 'button',
    iconOnly: true,
    color: 'neutral',
    variant: 'ghost',
    size: 'md',
    icon: (open.value ? 'cross' : 'hamburger') as PfIconName,
    ariaLabel: open.value
      ? (props.closeMenuAriaLabel ?? 'Close menu')
      : (props.openMenuAriaLabel ?? 'Open menu'),
    'aria-expanded': open.value,
    'aria-controls': panelId,
  };
  if (props.toggle === true || props.toggle === undefined) {
    return base;
  }
  const o = props.toggle as PfHeaderToggleButtonProps;
  const merged: Record<string, unknown> = { ...base, ...o };
  merged.icon = (
    open.value ? 'cross' : ((o.icon ?? 'hamburger') as PfIconName)
  ) as PfIconName;
  merged.ariaLabel = open.value
    ? (props.closeMenuAriaLabel ?? o.ariaLabel ?? 'Close menu')
    : (props.openMenuAriaLabel ?? o.ariaLabel ?? 'Open menu');
  merged['aria-expanded'] = open.value;
  merged['aria-controls'] = panelId;
  return merged;
});

const toggleClass = computed(() => [
  'pfHeader__toggle',
  props.ui?.toggle,
  typeof props.toggle === 'object' && props.toggle.class
    ? props.toggle.class
    : undefined,
]);

const resolvedTag = computed(() => {
  const t = props.as ?? 'header';
  return typeof t === 'string' ? t : t;
});

const rootClass = computed(() => [
  'pfHeader',
  props.ui?.root,
  attrs.class as string | undefined,
]);

const portalTarget = computed(() => app.value.portalTarget);
const teleportDisabled = computed(() => portalTarget.value === false);

const teleportTo = computed(() =>
  portalTarget.value === false ? 'body' : portalTarget.value
);

watch(
  () => props.routeKey,
  (next, prev) => {
    if (!props.autoClose || !open.value) return;
    if (prev !== undefined && next !== prev) {
      open.value = false;
    }
  }
);

let bodyOverflowPrev = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  bodyOverflowPrev = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = bodyOverflowPrev;
}

function onGlobalEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false;
  }
}

watch(open, (isOpen, wasOpen) => {
  if (isOpen) {
    lockBodyScroll();
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onGlobalEscape);
    }
    void nextTick(() => {
      if (!wasOpen) emit('opened');
    });
  } else {
    unlockBodyScroll();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onGlobalEscape);
    }
    void nextTick(() => {
      if (wasOpen) emit('closed');
    });
  }
});

onBeforeUnmount(() => {
  if (open.value) {
    unlockBodyScroll();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onGlobalEscape);
    }
  }
});

function onToggleClick() {
  open.value = !open.value;
}

function onOverlayClick() {
  open.value = false;
}

const titleBindings = computed(() => ({
  class: ['pfHeader__titleLink', props.ui?.title],
  href: props.to,
  'aria-label': props.title || undefined,
}));
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div v-if="slots.top" class="pfHeader__top">
      <slot name="top" />
    </div>

    <div :class="['pfHeader__bar', props.ui?.container]">
      <div
        v-if="showToggle && toggleSide === 'left'"
        :class="['pfHeader__toggleWrap', 'pfHeader__toggleWrap_left']"
      >
        <slot name="toggle">
          <PfButton
            v-bind="mergeProps(toggleBindings, { class: toggleClass })"
            @click="onToggleClick"
          />
        </slot>
      </div>

      <div v-if="slots.left" :class="['pfHeader__left', props.ui?.left]">
        <slot name="left" />
      </div>
      <div v-else :class="['pfHeader__left', props.ui?.left]">
        <slot name="title">
          <a v-bind="titleBindings">
            {{ title || '\u00a0' }}
          </a>
        </slot>
      </div>

      <div :class="['pfHeader__center', props.ui?.center]">
        <slot />
      </div>

      <div :class="['pfHeader__right', props.ui?.right]">
        <slot name="right" />
      </div>

      <div
        v-if="showToggle && toggleSide === 'right'"
        :class="['pfHeader__toggleWrap', 'pfHeader__toggleWrap_right']"
      >
        <slot name="toggle">
          <PfButton
            v-bind="mergeProps(toggleBindings, { class: toggleClass })"
            @click="onToggleClick"
          />
        </slot>
      </div>
    </div>

    <div v-if="slots.bottom" class="pfHeader__bottom">
      <slot name="bottom" />
    </div>

    <Teleport :to="teleportTo" :disabled="teleportDisabled">
      <Transition name="pfHeaderOverlay">
        <div
          v-if="open && hasMobileMenu"
          :class="['pfHeader__overlay', props.ui?.overlay]"
          aria-hidden="true"
          @click="onOverlayClick"
        />
      </Transition>
      <Transition name="pfHeaderPanel">
        <div
          v-if="open && hasMobileMenu"
          :id="panelId"
          role="dialog"
          aria-modal="true"
          :class="['pfHeader__panel', props.ui?.panel]"
        >
          <template v-if="slots.content">
            <slot name="content" />
          </template>
          <template v-else>
            <div :class="['pfHeader__panelHeader', props.ui?.panelHeader]">
              <div class="pfHeader__panelHeaderInner">
                <div v-if="slots.left" class="pfHeader__panelTitle">
                  <slot name="left" />
                </div>
                <div v-else class="pfHeader__panelTitle">
                  <slot name="title">
                    <a v-bind="titleBindings">
                      {{ title || '\u00a0' }}
                    </a>
                  </slot>
                </div>
                <PfButton
                  type="button"
                  icon-only
                  color="neutral"
                  variant="ghost"
                  size="md"
                  icon="cross"
                  :aria-label="props.closeMenuAriaLabel ?? 'Close menu'"
                  class="pfHeader__panelClose"
                  @click="open = false"
                />
              </div>
            </div>
            <div :class="['pfHeader__body', props.ui?.body]">
              <slot name="body" />
            </div>
          </template>
        </div>
      </Transition>
    </Teleport>
  </component>
</template>

<style scoped lang="scss">
.pfHeader {
  position: sticky;
  top: 0;
  z-index: var(--pf-header-z-index);

  height: var(--pf-header-height);
  min-height: 3.5rem;
  box-sizing: border-box;

  background: color-mix(in srgb, var(--pf-color-surface) 78%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);

  transition:
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    background-color var(--pf-animation-duration) var(--pf-animation-easing);

  @supports not (backdrop-filter: blur(1px)) {
    background: var(--pf-color-surface);
  }
}

.pfHeader__top,
.pfHeader__bottom {
  box-sizing: border-box;
}

.pfHeader__bar {
  padding-inline: var(--pf-container-padding-x);
  height: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-space-md);
  box-sizing: border-box;
}

@media (min-width: 40rem) {
  .pfHeader__bar {
    padding-inline: var(--pf-container-padding-x-sm);
  }
}

@media (min-width: 64rem) {
  .pfHeader__bar {
    padding-inline: var(--pf-container-padding-x-lg);
  }
}

.pfHeader__left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);
}

@media (min-width: 64rem) {
  .pfHeader__left {
    flex: 1 1 0;
  }
}

.pfHeader__titleLink {
  max-width: 12rem;

  color: var(--pf-color-text);
  font: var(--pf-font-sans);
  font-size: var(--pf-font-size-lg);
  font-weight: var(--pf-font-weight-bold);
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;

  transition: color var(--pf-animation-duration) var(--pf-animation-easing);

  @media (min-width: 64rem) {
    max-width: none;
  }

  &:hover {
    color: var(--pf-color-primary);
  }

  &:focus-visible {
    box-shadow: var(--pf-focus-ring);
    border-radius: var(--pf-radius-sm);
    outline: none;
  }
}

.pfHeader__center {
  min-width: 0;
  display: none;
  align-items: center;
  justify-content: center;

  @media (min-width: 64rem) {
    display: flex;
  }
}

.pfHeader__right {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--pf-space-sm);
}

@media (min-width: 64rem) {
  .pfHeader__right {
    flex: 1 1 0;
  }
}

.pfHeader__toggleWrap {
  display: flex;
  flex-shrink: 0;

  @media (min-width: 64rem) {
    display: none;
  }
}

.pfHeader__toggleWrap_left {
  margin-inline-end: calc(var(--pf-space-sm) * -1);
}

.pfHeader__toggleWrap_right {
  margin-inline-start: calc(var(--pf-space-sm) * -1);
}

.pfHeader__overlay {
  inset: 0;
  position: fixed;
  z-index: var(--pf-header-overlay-z-index);

  background: color-mix(in srgb, var(--pf-color-text) 38%, transparent);

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfHeader__panel {
  inset: 0;
  position: fixed;
  z-index: var(--pf-header-panel-z-index);

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  color: var(--pf-color-text);

  background: var(--pf-color-surface);

  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfHeader__panelHeader {
  min-height: max(3.5rem, var(--pf-header-height));
  flex-shrink: 0;

  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfHeader__panelHeaderInner {
  padding-inline: var(--pf-container-padding-x);
  height: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-space-md);
  box-sizing: border-box;
}

@media (min-width: 40rem) {
  .pfHeader__panelHeaderInner {
    padding-inline: var(--pf-container-padding-x-sm);
  }
}

@media (min-width: 64rem) {
  .pfHeader__panelHeaderInner {
    padding-inline: var(--pf-container-padding-x-lg);
  }
}

.pfHeader__panelTitle {
  min-width: 0;
  flex: 1 1 auto;

  font: var(--pf-font-sans);
  font-size: var(--pf-font-size-lg);
  font-weight: var(--pf-font-weight-bold);

  :deep(a) {
    color: inherit;
    text-decoration: none;

    &:focus-visible {
      box-shadow: var(--pf-focus-ring);
      border-radius: var(--pf-radius-sm);
      outline: none;
    }
  }
}

.pfHeader__panelClose {
  flex-shrink: 0;
}

.pfHeader__body {
  -webkit-overflow-scrolling: touch;

  padding: var(--pf-space-lg);
  flex: 1 1 auto;

  overflow: auto;
}

@media (min-width: 40rem) {
  .pfHeader__body {
    padding: var(--pf-space-xl);
  }
}

.pfHeaderOverlay-enter-from,
.pfHeaderOverlay-leave-to {
  opacity: 0;
}

.pfHeaderPanel-enter-from,
.pfHeaderPanel-leave-to {
  opacity: 0;

  transform: translateY(0.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .pfHeader__overlay,
  .pfHeader__panel {
    transition-duration: 0.01ms;
  }

  .pfHeaderPanel-enter-from,
  .pfHeaderPanel-leave-to {
    transform: none;
  }
}
</style>
