<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue';
import { usePfApp } from '../../../composables/usePfApp';
import PfButton from '../../element/PfButton/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfModalCloseButtonProps = Partial<{
  label: string;
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
  block: boolean;
  icon: PfIconName;
  leading: boolean;
  leadingIcon: PfIconName;
  trailing: boolean;
  trailingIcon: PfIconName;
  iconOnly: boolean;
  ariaLabel: string;
  disabled: boolean;
  loading: boolean;
  loadingIcon: PfIconName;
  loadingAuto: boolean;
  type: 'button' | 'submit' | 'reset';
  active: boolean;
  activeColor:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  activeVariant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
}>;

export interface PfModalUi {
  overlay?: string;
  content?: string;
  header?: string;
  wrapper?: string;
  body?: string;
  footer?: string;
  title?: string;
  description?: string;
  actions?: string;
  close?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    overlay?: boolean;
    scrollable?: boolean;
    transition?: boolean;
    fullscreen?: boolean;
    portal?: string | boolean | HTMLElement | undefined;
    close?: boolean | PfModalCloseButtonProps;
    closeIcon?: PfIconName;
    dismissible?: boolean;
    ui?: PfModalUi;
    open?: boolean;
    defaultOpen?: boolean;
    modal?: boolean;
  }>(),
  {
    overlay: true,
    scrollable: false,
    transition: true,
    fullscreen: false,
    portal: true,
    close: true,
    closeIcon: 'crossSmall',
    dismissible: true,
    defaultOpen: false,
    modal: true,
  }
);

const emit = defineEmits<{
  'after:leave': [];
  'after:enter': [];
  'close:prevent': [];
  'update:open': [value: boolean];
}>();

const attrs = useAttrs();
const slots = useSlots();
const app = usePfApp();
const autoId = useId();
const vnodeProps = computed(
  () => getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
);

const triggerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const localOpen = ref(!!props.defaultOpen || props.open === true);

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

function requestClose() {
  if (!props.dismissible) {
    emit('close:prevent');
    return;
  }
  setOpen(false);
}

function closeModal() {
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
const hasActionsSlot = computed(() => slots.actions != null);

const hasTitle = computed(
  () => hasTitleSlot.value || (props.title != null && props.title !== '')
);
const hasDescription = computed(
  () =>
    hasDescriptionSlot.value ||
    (props.description != null && props.description !== '')
);

const showCloseButton = computed(
  () => !hasContentSlot.value && props.close !== false
);
const showHeader = computed(
  () =>
    !hasContentSlot.value &&
    (hasHeaderSlot.value ||
      hasTitle.value ||
      hasDescription.value ||
      hasActionsSlot.value ||
      showCloseButton.value)
);
const showBody = computed(
  () => !hasContentSlot.value && (hasBodySlot.value || slots.default != null)
);
const showFooter = computed(() => !hasContentSlot.value && hasFooterSlot.value);

const closeButtonBind = computed(() => {
  const base = {
    size: 'md' as const,
    color: 'neutral' as const,
    variant: 'ghost' as const,
    iconOnly: true as const,
    icon: props.closeIcon,
    ariaLabel: 'Close modal',
    type: 'button' as const,
  };
  if (typeof props.close === 'object') {
    return {
      ...base,
      ...props.close,
      iconOnly: true as const,
      icon: props.closeIcon,
      ariaLabel: props.close.ariaLabel ?? base.ariaLabel,
    };
  }
  return base;
});

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

function onDocPointerDown(e: PointerEvent) {
  if (!mergedOpen.value) return;
  const t = e.target as Node | null;
  if (t == null) return;
  if (triggerRef.value?.contains(t)) return;
  if (contentRef.value?.contains(t)) return;
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

function onAfterEnter() {
  emit('after:enter');
}

function onAfterLeave() {
  emit('after:leave');
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
});

const rootClass = computed(() => ['pfModal', attrs.class]);
const contentClass = computed(() => [
  'pfModal__content',
  props.fullscreen && 'pfModal__content_fullscreen',
  props.scrollable && 'pfModal__content_scrollable',
  props.ui?.content,
]);

const stackClass = computed(() => [
  'pfModal__stack',
  props.scrollable ? 'pfModal__stack_scrollable' : 'pfModal__stack_fixed',
  props.ui?.wrapper,
]);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const titleId = computed(() => `pf-modal-${autoId}-title`);
const descriptionId = computed(() => `pf-modal-${autoId}-description`);
</script>

<template>
  <div class="pfModal" v-bind="passthroughAttrs" :class="rootClass">
    <div
      ref="triggerRef"
      class="pfModal__trigger"
      data-pf-modal-trigger
      @click="onTriggerClick"
    >
      <slot />
    </div>
  </div>

  <Teleport :to="teleportTarget">
    <Transition
      :name="transition ? 'pfModalLayer' : undefined"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div v-if="mergedOpen" :class="stackClass">
        <div
          v-if="showOverlay"
          class="pfModal__overlay"
          :class="ui?.overlay"
          aria-hidden="true"
          @pointerdown="onOverlayPointerDown"
        />
        <div class="pfModal__viewport">
          <div
            ref="contentRef"
            :class="contentClass"
            role="dialog"
            :aria-modal="modal !== false ? 'true' : 'false'"
            :aria-labelledby="hasTitle ? titleId : undefined"
            :aria-describedby="hasDescription ? descriptionId : undefined"
          >
            <slot v-if="hasContentSlot" name="content" :close="closeModal" />

            <template v-else>
              <div
                v-if="showHeader"
                class="pfModal__header"
                :class="ui?.header"
              >
                <slot name="header" :close="closeModal">
                  <div class="pfModal__headerMain">
                    <div
                      v-if="hasTitle"
                      :id="titleId"
                      class="pfModal__title"
                      :class="ui?.title"
                    >
                      <slot name="title">{{ title }}</slot>
                    </div>
                    <div
                      v-if="hasDescription"
                      :id="descriptionId"
                      class="pfModal__description"
                      :class="ui?.description"
                    >
                      <slot name="description">{{ description }}</slot>
                    </div>
                  </div>
                  <div
                    v-if="hasActionsSlot"
                    class="pfModal__actions"
                    :class="ui?.actions"
                  >
                    <slot name="actions" :close="closeModal" />
                  </div>
                  <div
                    v-if="showCloseButton"
                    class="pfModal__close"
                    :class="ui?.close"
                  >
                    <slot name="close" :close="closeModal">
                      <PfButton v-bind="closeButtonBind" @click="closeModal" />
                    </slot>
                  </div>
                </slot>
              </div>

              <div v-if="showBody" class="pfModal__body" :class="ui?.body">
                <slot name="body">
                  <slot />
                </slot>
              </div>

              <div
                v-if="showFooter"
                class="pfModal__footer"
                :class="ui?.footer"
              >
                <slot name="footer" :close="closeModal" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.pfModal {
  max-width: 100%;
  display: inline-block;
}

.pfModal__trigger {
  max-width: 100%;
  display: inline-flex;
}

.pfModal__stack {
  inset: 0;
  position: fixed;
  z-index: var(--pf-modal-z-index);
}

.pfModal__stack_fixed .pfModal__viewport {
  inset: 0;
  position: fixed;

  padding: var(--pf-modal-viewport-padding);
  display: grid;
  place-items: center;

  pointer-events: none;
}

.pfModal__stack_scrollable {
  overflow-y: auto;
}

.pfModal__stack_scrollable .pfModal__viewport {
  padding: var(--pf-modal-viewport-padding);
  min-height: 100%;
  display: grid;
  place-items: center;

  pointer-events: none;
}

.pfModal__overlay {
  inset: 0;
  position: fixed;
  z-index: 0;

  background: var(--pf-modal-overlay-bg);
}

.pfModal__content {
  position: relative;
  z-index: 1;

  width: min(100%, var(--pf-modal-max-width));
  max-height: var(--pf-modal-max-height);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-family: var(--pf-font-sans);

  box-shadow: var(--pf-modal-shadow);
  background: var(--pf-color-surface);
  border: var(--pf-stroke-width) solid var(--pf-border-color);
  border-radius: var(--pf-modal-radius);
  overflow: hidden;

  pointer-events: auto;
}

.pfModal__content_fullscreen {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;

  border-radius: 0;
}

.pfModal__content_scrollable {
  max-height: none;
}

.pfModal__header {
  position: relative;

  padding: var(--pf-modal-header-padding-y) var(--pf-modal-padding-x);
  display: flex;
  align-items: flex-start;
  gap: var(--pf-space-sm);

  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfModal__headerMain {
  min-width: 0;
  flex: 1;
}

.pfModal__title {
  font-size: var(--pf-font-size-md);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-md);
}

.pfModal__description {
  margin-top: var(--pf-space-xs);

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-md);
}

.pfModal__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--pf-space-xs);
}

.pfModal__close {
  margin-inline-start: auto;

  flex-shrink: 0;
}

.pfModal__body {
  padding: var(--pf-modal-padding-y) var(--pf-modal-padding-x);
  min-height: 0;

  overflow: auto;
}

.pfModal__footer {
  padding: var(--pf-modal-footer-padding-y) var(--pf-modal-padding-x);
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);

  border-top: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfModalLayer-enter-active,
.pfModalLayer-leave-active {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfModalLayer-enter-from,
.pfModalLayer-leave-to {
  opacity: 0;
}

.pfModalLayer-enter-active .pfModal__overlay,
.pfModalLayer-leave-active .pfModal__overlay {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfModalLayer-enter-from .pfModal__overlay,
.pfModalLayer-leave-to .pfModal__overlay {
  opacity: 0;
}

.pfModalLayer-enter-active .pfModal__content,
.pfModalLayer-leave-active .pfModal__content {
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfModalLayer-enter-from .pfModal__content,
.pfModalLayer-leave-to .pfModal__content {
  opacity: 0;

  transform: translateY(var(--pf-modal-enter-shift)) scale(0.98);
}

.pfModalLayer-enter-to .pfModal__content,
.pfModalLayer-leave-from .pfModal__content {
  opacity: 1;

  transform: translateY(0) scale(1);
}
</style>
