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
import { usePfApp } from '../../../composables/usePfApp';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfContextMenuItems from './PfContextMenuItems.vue';
import type {
  PfContextMenuItem,
  PfContextMenuItemsInput,
  PfContextMenuSize,
  PfContextMenuUi,
} from './types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    items?: PfContextMenuItemsInput;
    size?: PfContextMenuSize;
    disabled?: boolean;
    /** Block interaction with content behind the menu (backdrop captures clicks). */
    modal?: boolean;
    /**
     * Teleport target for the overlay. `false` — same as `PfApp`/`body` (still `body` for correct z-index).
     */
    portal?: string | boolean | HTMLElement | undefined;
    open?: boolean;
    defaultOpen?: boolean;
    checkedIcon?: PfIconName;
    /** External link icon; `false` — hide. */
    externalIcon?: PfIconName | false;
    pressOpenDelay?: number;
    ui?: PfContextMenuUi;
  }>(),
  {
    items: () => [],
    size: 'md',
    disabled: false,
    modal: true,
    portal: true,
    defaultOpen: false,
    checkedIcon: 'check',
    // eslint-disable-next-line vue/require-valid-default-prop
    externalIcon: 'arrowUpRight',
    pressOpenDelay: 200,
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
const itemsRef = ref<InstanceType<typeof PfContextMenuItems> | null>(null);

const point = ref({ x: 0, y: 0 });
const hasExplicitPoint = ref(false);

const localOpen = ref(!!props.defaultOpen || props.open === true);

/** Storybook and forms often pass `open: null` for an “empty” boolean — treat like `undefined` (uncontrolled). */
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
  (open) => {
    if (!isOpenControlled() && open === true) {
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

function close() {
  setOpen(false);
}

function syncPointFromTrigger() {
  const rect = triggerRef.value?.getBoundingClientRect();
  if (!rect) return;
  point.value = {
    x: rect.left,
    y: rect.bottom,
  };
}

const normalizedGroups = computed((): PfContextMenuItem[][] => {
  const raw = props.items;
  if (!raw.length) return [];
  const first = raw[0];
  if (Array.isArray(first)) {
    return (raw as readonly (readonly PfContextMenuItem[])[]).map((g) => [
      ...g,
    ]);
  }
  return [[...(raw as readonly PfContextMenuItem[])]];
});

/**
 * Always a valid Teleport target: iframe `body` gives a correct viewport for
 * `position: fixed`. Preview `#storybook-root` often has `transform` — breaks fixed.
 * Storybook sometimes serializes booleans to `"true"`/`"false"` strings — do not use as a selector.
 */
const teleportTarget = computed((): string | HTMLElement => {
  if (props.portal === false) return 'body';
  if (props.portal && typeof props.portal === 'object') {
    return props.portal as HTMLElement;
  }
  if (typeof props.portal === 'string') {
    const s = props.portal.trim();
    if (s === '' || s === 'true' || s === 'false') {
      /* placeholder text from Controls — same as default */
    } else {
      return props.portal;
    }
  }
  const t = app.value.portalTarget;
  if (t === false) return 'body';
  if (typeof t === 'string') return t;
  return t;
});

function panelContains(target: Node): boolean {
  const el = itemsRef.value?.$el as HTMLElement | undefined;
  return !!el?.contains(target);
}

function onDocPointerDown(e: PointerEvent) {
  if (!mergedOpen.value) return;
  const t = e.target as Node | null;
  if (t == null) return;
  if (triggerRef.value?.contains(t)) {
    if (e.button === 0) {
      setOpen(false);
    }
    return;
  }
  if (panelContains(t)) return;
  setOpen(false);
}

function onBackdropPointerDown() {
  setOpen(false);
}

function onKeyDown(e: KeyboardEvent) {
  if (!mergedOpen.value) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    setOpen(false);
  }
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
      if (!hasExplicitPoint.value) {
        syncPointFromTrigger();
      }
      void nextTick(() => {
        bindListenersTimer = window.setTimeout(() => {
          bindListenersTimer = null;
          bindGlobalListeners();
        }, 50);
      });
      return;
    }
    hasExplicitPoint.value = false;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (bindListenersTimer != null) {
    clearTimeout(bindListenersTimer);
  }
  unbindGlobalListeners();
});

function onContextMenu(e: MouseEvent) {
  if (props.disabled) return;
  e.preventDefault();
  point.value = { x: e.clientX, y: e.clientY };
  hasExplicitPoint.value = true;
  setOpen(true);
}

const rootClass = computed(() => ['pfContextMenu', attrs.class]);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const layerId = computed(() => `pf-context-menu-${autoId}`);
</script>

<template>
  <div class="pfContextMenu" v-bind="passthroughAttrs" :class="rootClass">
    <div
      ref="triggerRef"
      class="pfContextMenu__trigger"
      data-pf-context-menu-trigger
      @contextmenu="onContextMenu"
    >
      <slot />
    </div>
  </div>

  <Teleport :to="teleportTarget">
    <Transition name="pfContextMenuLayer">
      <div v-if="mergedOpen" :id="layerId" class="pfContextMenu__stack">
        <div
          v-if="modal"
          class="pfContextMenu__backdrop"
          aria-hidden="true"
          @pointerdown="onBackdropPointerDown"
        />
        <PfContextMenuItems
          ref="itemsRef"
          mode="root"
          :groups="normalizedGroups"
          :root-top="point.y"
          :root-left="point.x"
          :size="size"
          :ui="ui"
          :close-root="close"
          :checked-icon="checkedIcon"
          :press-open-delay="pressOpenDelay"
          :external-icon="externalIcon"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.pfContextMenu {
  max-width: 100%;
  display: inline-block;

  vertical-align: top;
}

.pfContextMenu__stack {
  inset: 0;
  position: fixed;
  z-index: var(--pf-context-menu-z-index);

  pointer-events: none;
}

.pfContextMenu__backdrop {
  inset: 0;
  position: fixed;
  z-index: var(--pf-context-menu-backdrop-z-index);

  background: transparent;

  pointer-events: auto;
}

.pfContextMenu__trigger {
  display: block;
}

.pfContextMenuLayer-enter-active,
.pfContextMenuLayer-leave-active {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfContextMenuLayer-enter-from,
.pfContextMenuLayer-leave-to {
  opacity: 0;
}

.pfContextMenuLayer-enter-active .pfContextMenu__backdrop,
.pfContextMenuLayer-leave-active .pfContextMenu__backdrop {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfContextMenuLayer-enter-from .pfContextMenu__backdrop,
.pfContextMenuLayer-leave-to .pfContextMenu__backdrop {
  opacity: 0;
}

.pfContextMenuLayer-enter-active :deep(.pfContextMenuItems_root),
.pfContextMenuLayer-leave-active :deep(.pfContextMenuItems_root) {
  transform-origin: top left;
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfContextMenuLayer-enter-from :deep(.pfContextMenuItems_root),
.pfContextMenuLayer-leave-to :deep(.pfContextMenuItems_root) {
  opacity: 0;

  transform: translateY(calc(-1 * var(--pf-context-menu-submenu-gap)))
    scale(0.98);
}

.pfContextMenuLayer-enter-to :deep(.pfContextMenuItems_root),
.pfContextMenuLayer-leave-from :deep(.pfContextMenuItems_root) {
  opacity: 1;

  transform: translateY(0) scale(1);
}
</style>
