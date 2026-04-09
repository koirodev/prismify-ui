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
import PfDropdownMenuItems from './PfDropdownMenuItems.vue';
import type {
  PfDropdownMenuContent,
  PfDropdownMenuFilter,
  PfDropdownMenuItemsInput,
  PfDropdownMenuItem,
  PfDropdownMenuSize,
  PfDropdownMenuUi,
} from './types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    items?: PfDropdownMenuItemsInput;
    size?: PfDropdownMenuSize;
    disabled?: boolean;
    modal?: boolean;
    portal?: string | boolean | HTMLElement | undefined;
    open?: boolean;
    defaultOpen?: boolean;
    checkedIcon?: PfIconName;
    externalIcon?: PfIconName;
    pressOpenDelay?: number;
    content?: PfDropdownMenuContent;
    arrow?: boolean;
    filter?: PfDropdownMenuFilter;
    filterFields?: string[];
    ignoreFilter?: boolean;
    searchTerm?: string;
    ui?: PfDropdownMenuUi;
  }>(),
  {
    items: () => [],
    size: 'md',
    disabled: false,
    modal: true,
    portal: true,
    defaultOpen: false,
    checkedIcon: 'check',
    externalIcon: 'arrowUpRight',
    pressOpenDelay: 200,
    content: () => ({
      side: 'bottom',
      align: 'start',
      sideOffset: 6,
      alignOffset: 0,
    }),
    arrow: false,
    filter: false,
    filterFields: () => ['label'],
    ignoreFilter: false,
    searchTerm: '',
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'update:searchTerm': [value: string];
}>();

const attrs = useAttrs();
const app = usePfApp();
const autoId = useId();
const vnodeProps = computed(
  () => getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
);

const triggerRef = ref<HTMLElement | null>(null);
const itemsRef = ref<InstanceType<typeof PfDropdownMenuItems> | null>(null);

const localOpen = ref(!!props.defaultOpen || props.open === true);
const localSearchTerm = ref(props.searchTerm ?? '');

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

function isSearchControlled(): boolean {
  const p = vnodeProps.value;
  return (
    props.searchTerm !== undefined &&
    props.searchTerm !== null &&
    p != null &&
    (typeof p['onUpdate:searchTerm'] === 'function' ||
      typeof p.onUpdateSearchTerm === 'function')
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

watch(
  () => props.searchTerm,
  (value) => {
    if (value == null) return;
    localSearchTerm.value = value;
  },
  { immediate: true }
);

const mergedOpen = computed(() =>
  isOpenControlled() ? Boolean(props.open) : localOpen.value
);

const mergedSearchTerm = computed(() =>
  isSearchControlled() ? String(props.searchTerm ?? '') : localSearchTerm.value
);

function setOpen(v: boolean) {
  emit('update:open', v);
  if (!isOpenControlled()) {
    localOpen.value = v;
  }
}

function setSearchTerm(value: string) {
  emit('update:searchTerm', value);
  if (!isSearchControlled()) {
    localSearchTerm.value = value;
  }
}

function close() {
  setOpen(false);
}

const normalizedGroups = computed((): PfDropdownMenuItem[][] => {
  const raw = props.items;
  if (!raw.length) return [];
  const first = raw[0];
  if (Array.isArray(first)) {
    return (raw as readonly (readonly PfDropdownMenuItem[])[]).map((g) => [
      ...g,
    ]);
  }
  return [[...(raw as readonly PfDropdownMenuItem[])]];
});

const teleportTarget = computed((): string | HTMLElement => {
  if (props.portal === false) return 'body';
  if (props.portal && typeof props.portal === 'object') {
    return props.portal as HTMLElement;
  }
  if (typeof props.portal === 'string') {
    const s = props.portal.trim();
    if (s === '' || s === 'true' || s === 'false') {
      // noop
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
  if (triggerRef.value?.contains(t)) return;
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
      void nextTick(() => {
        bindListenersTimer = window.setTimeout(() => {
          bindListenersTimer = null;
          bindGlobalListeners();
        }, 50);
      });
      return;
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

function onTriggerClick() {
  if (props.disabled) return;
  setOpen(!mergedOpen.value);
}

const rootClass = computed(() => ['pfDropdownMenu', attrs.class]);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const layerId = computed(() => `pf-dropdown-menu-${autoId}`);

const triggerWidth = computed(
  () => triggerRef.value?.getBoundingClientRect().width ?? 0
);
</script>

<template>
  <div class="pfDropdownMenu" v-bind="passthroughAttrs" :class="rootClass">
    <div
      ref="triggerRef"
      class="pfDropdownMenu__trigger"
      data-pf-dropdown-menu-trigger
      @click="onTriggerClick"
    >
      <slot />
    </div>
  </div>

  <Teleport :to="teleportTarget">
    <Transition name="pfDropdownMenuLayer">
      <div v-if="mergedOpen" :id="layerId" class="pfDropdownMenu__stack">
        <div
          v-if="modal"
          class="pfDropdownMenu__backdrop"
          aria-hidden="true"
          @pointerdown="onBackdropPointerDown"
        />
        <PfDropdownMenuItems
          ref="itemsRef"
          mode="root"
          :groups="normalizedGroups"
          :root-anchor-el="triggerRef"
          :size="size"
          :ui="ui"
          :close-root="close"
          :checked-icon="checkedIcon"
          :press-open-delay="pressOpenDelay"
          :external-icon="externalIcon"
          :content="content"
          :show-arrow="arrow"
          :filter="filter"
          :filter-fields="filterFields"
          :ignore-filter="ignoreFilter"
          :search-term="mergedSearchTerm"
          :root-min-width="triggerWidth"
          :on-root-search-update="setSearchTerm"
        >
          <template v-if="$slots.item" #item="slotProps">
            <slot name="item" v-bind="slotProps" />
          </template>
          <template v-if="$slots['item-leading']" #item-leading="slotProps">
            <slot name="item-leading" v-bind="slotProps" />
          </template>
          <template v-if="$slots['item-label']" #item-label="slotProps">
            <slot name="item-label" v-bind="slotProps" />
          </template>
          <template
            v-if="$slots['item-description']"
            #item-description="slotProps"
          >
            <slot name="item-description" v-bind="slotProps" />
          </template>
          <template v-if="$slots['item-trailing']" #item-trailing="slotProps">
            <slot name="item-trailing" v-bind="slotProps" />
          </template>
          <template v-if="$slots.empty" #empty>
            <slot name="empty" />
          </template>
          <template v-if="$slots['content-top']" #content-top>
            <slot name="content-top" />
          </template>
          <template v-if="$slots['content-bottom']" #content-bottom>
            <slot name="content-bottom" />
          </template>
        </PfDropdownMenuItems>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.pfDropdownMenu {
  max-width: 100%;
  display: inline-block;

  vertical-align: top;

  &__trigger {
    max-width: 100%;
    display: inline-flex;

    cursor: pointer;
  }

  &__stack {
    inset: 0;
    position: fixed;
    z-index: var(--pf-context-menu-z-index);

    pointer-events: none;
  }

  &__backdrop {
    inset: 0;
    position: fixed;
    z-index: var(--pf-context-menu-backdrop-z-index);

    background: transparent;

    pointer-events: auto;
  }
}

.pfDropdownMenuLayer-enter-active,
.pfDropdownMenuLayer-leave-active {
  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfDropdownMenuLayer-enter-from,
.pfDropdownMenuLayer-leave-to {
  opacity: 0;
}

.pfDropdownMenuLayer-enter-active :deep(.pfDropdownMenuItems_root),
.pfDropdownMenuLayer-leave-active :deep(.pfDropdownMenuItems_root) {
  transform-origin: top left;
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfDropdownMenuLayer-enter-from :deep(.pfDropdownMenuItems_root),
.pfDropdownMenuLayer-leave-to :deep(.pfDropdownMenuItems_root) {
  opacity: 0;

  transform: translateY(calc(-1 * var(--pf-context-menu-submenu-gap)))
    scale(0.98);
}

.pfDropdownMenuLayer-enter-to :deep(.pfDropdownMenuItems_root),
.pfDropdownMenuLayer-leave-from :deep(.pfDropdownMenuItems_root) {
  opacity: 1;

  transform: translateY(0) scale(1);
}
</style>
