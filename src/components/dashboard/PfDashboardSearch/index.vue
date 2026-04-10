<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import PfModal from '../../overlay/PfModal/index.vue';
import PfInput from '../../form/PfInput/index.vue';
import PfButton from '../../element/PfButton/index.vue';
import PfKbd from '../../element/PfKbd/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

export interface PfDashboardSearchItem {
  id?: string;
  label: string;
  icon?: PfIconName;
  description?: string;
  kbds?: string[];
  onSelect?: (() => void | Promise<void>) | undefined;
  [key: string]: unknown;
}

export interface PfDashboardSearchGroup {
  id?: string;
  label?: string;
  items: PfDashboardSearchItem[];
}

export interface PfDashboardSearchUi {
  modal?: string;
  input?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    icon?: PfIconName;
    placeholder?: string;
    autofocus?: boolean;
    loading?: boolean;
    loadingIcon?: PfIconName;
    close?: boolean | Record<string, unknown>;
    closeIcon?: PfIconName;
    shortcut?: string;
    groups?: PfDashboardSearchGroup[];
    fuse?: Record<string, unknown>;
    colorMode?: boolean;
    ui?: PfDashboardSearchUi;
    title?: string;
    transition?: boolean;
    description?: string;
    overlay?: boolean;
    content?: Record<string, unknown>;
    dismissible?: boolean;
    fullscreen?: boolean;
    modal?: boolean;
    portal?: string | boolean | HTMLElement;
    open?: boolean;
    searchTerm?: string;
  }>(),
  {
    size: 'md',
    icon: 'search',
    placeholder: 'Search...',
    autofocus: true,
    loading: false,
    loadingIcon: 'spinner',
    close: true,
    closeIcon: 'crossSmall',
    shortcut: 'meta_k',
    groups: () => [],
    fuse: undefined,
    colorMode: true,
    ui: undefined,
    title: undefined,
    description: undefined,
    transition: true,
    overlay: true,
    content: undefined,
    dismissible: true,
    fullscreen: false,
    modal: true,
    portal: true,
    open: undefined,
    searchTerm: undefined,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'update:searchTerm': [value: string];
}>();

const commandPaletteRef = ref<HTMLDivElement | null>(null);

const vnodeProps = computed(
  () => getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
);

function isOpenControlled(): boolean {
  const p = vnodeProps.value;
  return (
    props.open !== undefined &&
    p != null &&
    (typeof p['onUpdate:open'] === 'function' ||
      typeof p.onUpdateOpen === 'function')
  );
}

function isSearchTermControlled(): boolean {
  const p = vnodeProps.value;
  return (
    props.searchTerm !== undefined &&
    p != null &&
    (typeof p['onUpdate:searchTerm'] === 'function' ||
      typeof p.onUpdateSearchTerm === 'function')
  );
}

const localOpen = ref(!!props.open);
const localSearchTerm = ref(props.searchTerm ?? '');

watch(
  () => props.open,
  (value) => {
    if (isOpenControlled()) {
      localOpen.value = !!value;
    }
  }
);

watch(
  () => props.searchTerm,
  (value) => {
    if (isSearchTermControlled()) {
      localSearchTerm.value = value ?? '';
    }
  }
);

const openState = computed(() =>
  isOpenControlled() ? !!props.open : localOpen.value
);
const searchTermState = computed(() =>
  isSearchTermControlled() ? (props.searchTerm ?? '') : localSearchTerm.value
);

function setOpen(value: boolean): void {
  emit('update:open', value);
  if (!isOpenControlled()) {
    localOpen.value = value;
  }
}

function setSearchTerm(value: string): void {
  emit('update:searchTerm', value);
  if (!isSearchTermControlled()) {
    localSearchTerm.value = value;
  }
}

function matchShortcut(event: KeyboardEvent): boolean {
  const shortcut = props.shortcut.trim().toLowerCase();
  const [modifier, key] = shortcut.split('_');
  const actualKey = event.key.toLowerCase();
  if (modifier === 'meta') {
    return event.metaKey && actualKey === key;
  }
  if (modifier === 'ctrl') {
    return event.ctrlKey && actualKey === key;
  }
  if (modifier === 'alt') {
    return event.altKey && actualKey === key;
  }
  if (modifier === 'shift') {
    return event.shiftKey && actualKey === key;
  }
  return actualKey === shortcut;
}

function onWindowKeyDown(event: KeyboardEvent): void {
  if (!matchShortcut(event)) return;
  event.preventDefault();
  setOpen(true);
}

function onOpenEvent(): void {
  setOpen(true);
}

function setColorMode(mode: 'light' | 'dark' | 'system'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    return;
  }
  if (mode === 'light') {
    root.classList.remove('dark');
    return;
  }
  root.classList.remove('dark');
}

const colorModeGroups = computed<PfDashboardSearchGroup[]>(() => {
  if (!props.colorMode) return [];
  return [
    {
      id: 'theme',
      label: 'Theme',
      items: [
        {
          id: 'theme-light',
          label: 'Light',
          onSelect: () => setColorMode('light'),
        },
        {
          id: 'theme-dark',
          label: 'Dark',
          onSelect: () => setColorMode('dark'),
        },
        {
          id: 'theme-system',
          label: 'System',
          onSelect: () => setColorMode('system'),
        },
      ],
    },
  ];
});

const resolvedGroups = computed(() => [
  ...props.groups,
  ...colorModeGroups.value,
]);

const filteredGroups = computed(() => {
  const term = searchTermState.value.trim().toLowerCase();
  if (!term) return resolvedGroups.value;
  return resolvedGroups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const label = String(item.label ?? '').toLowerCase();
        const description = String(item.description ?? '').toLowerCase();
        return label.includes(term) || description.includes(term);
      }),
    }))
    .filter((group) => group.items.length > 0);
});

async function onSelect(item: PfDashboardSearchItem): Promise<void> {
  await item.onSelect?.();
  setOpen(false);
}

onMounted(() => {
  if (typeof window === 'undefined') return;
  window.addEventListener('keydown', onWindowKeyDown);
  window.addEventListener(
    'pf-dashboard-search-open',
    onOpenEvent as EventListener
  );
});

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('keydown', onWindowKeyDown);
  window.removeEventListener(
    'pf-dashboard-search-open',
    onOpenEvent as EventListener
  );
});

defineExpose({
  commandPaletteRef,
});
</script>

<template>
  <PfModal
    :open="openState"
    :title="title"
    :description="description"
    :transition="transition"
    :overlay="overlay"
    :dismissible="dismissible"
    :fullscreen="fullscreen"
    :modal="modal"
    :portal="portal"
    :close="close"
    :close-icon="closeIcon"
    :ui="{ content: ['pfDashboardSearch__modal', ui?.modal].join(' ') }"
    @update:open="setOpen"
  >
    <template #content>
      <div ref="commandPaletteRef" class="pfDashboardSearch">
        <div class="pfDashboardSearch__input" :class="ui?.input">
          <PfInput
            :model-value="searchTermState"
            :icon="icon"
            :placeholder="placeholder"
            :autofocus="autofocus"
            :loading="loading"
            :loading-icon="loadingIcon"
            @update:model-value="setSearchTerm"
          />
        </div>
        <div class="pfDashboardSearch__content">
          <div
            v-for="group in filteredGroups"
            :key="group.id || group.label || 'group'"
            class="pfDashboardSearch__group"
          >
            <div v-if="group.label" class="pfDashboardSearch__label">
              {{ group.label }}
            </div>
            <PfButton
              v-for="item in group.items"
              :key="item.id || item.label"
              class="pfDashboardSearch__item"
              color="neutral"
              variant="ghost"
              block
              :label="item.label"
              :icon="item.icon"
              @click="void onSelect(item)"
            >
              <template v-if="item.description" #default>
                <div class="pfDashboardSearch__itemText">
                  <div>{{ item.label }}</div>
                  <div class="pfDashboardSearch__itemDescription">
                    {{ item.description }}
                  </div>
                </div>
              </template>
              <template v-if="item.kbds?.length" #trailing>
                <div class="pfDashboardSearch__kbds">
                  <PfKbd
                    v-for="kbd in item.kbds"
                    :key="kbd"
                    :value="kbd"
                    variant="subtle"
                  />
                </div>
              </template>
            </PfButton>
          </div>
          <div
            v-if="filteredGroups.length === 0"
            class="pfDashboardSearch__empty"
          >
            <slot name="empty">No results.</slot>
          </div>
        </div>
      </div>
    </template>
  </PfModal>
</template>

<style scoped lang="scss">
.pfDashboardSearch {
  width: min(100%, var(--pf-dashboard-search-max-width));
  min-height: 18rem;
  max-height: 70dvh;
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-md);

  background: var(--pf-color-surface);
  border: var(--pf-stroke-width) solid var(--pf-border-color);
  border-radius: var(--pf-radius-md);
  overflow: hidden;
}

.pfDashboardSearch__input {
  padding: var(--pf-space-md);

  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);

  > .pfInput {
    width: 100%;
  }
}

.pfDashboardSearch__content {
  padding: var(--pf-space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-sm);

  overflow-y: auto;
}

.pfDashboardSearch__group {
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-xs);
}

.pfDashboardSearch__label {
  padding-inline: var(--pf-space-sm);

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
  font-weight: var(--pf-font-weight-medium);
}

.pfDashboardSearch__itemText {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  text-align: left;
}

.pfDashboardSearch__itemDescription {
  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
}

.pfDashboardSearch__kbds {
  display: inline-flex;
  gap: 0.25rem;
}

.pfDashboardSearch__empty {
  padding: var(--pf-space-lg);

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-sm);
  text-align: center;
}
</style>
