<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import PfBadge from '../../element/PfBadge/index.vue';
import PfButton from '../../element/PfButton/index.vue';
import PfInput from '../../form/PfInput/index.vue';
import type {
  PfInputColor,
  PfInputVariant,
} from '../../form/PfInput/index.vue';
import PfKbd from '../../element/PfKbd/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfModal from '../PfModal/index.vue';
import type { PfContentNavigationItem } from '../../navigation/PfContentNavigation/index.vue';
import { usePfContentSearch } from '../../../composables/usePfContentSearch';

export interface PfContentSearchLink {
  id?: string;
  label: string;
  icon?: PfIconName;
  description?: string;
  to?: string;
  href?: string;
  target?: string;
  external?: boolean;
  kbds?: string[];
  onSelect?: (() => void | Promise<void>) | undefined;
  [key: string]: unknown;
}

export interface PfContentSearchFile {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  path?: string;
  hash?: string;
  to?: string;
  href?: string;
  [key: string]: unknown;
}

export interface PfContentSearchItem extends PfContentSearchLink {
  badge?: string | number;
  keywords?: string[];
}

export interface PfContentSearchGroup {
  id?: string;
  label?: string;
  items: PfContentSearchItem[];
}

export type PfContentSearchUi = Partial<{
  modal: string;
  input: string;
  group: string;
  item: string;
  itemLabel: string;
  itemDescription: string;
  itemTrailing: string;
}>;

defineOptions({ inheritAttrs: false });

defineSlots<{
  empty(): unknown;
  footer(): unknown;
  back(): unknown;
  close(): unknown;
  item(props: { item: PfContentSearchItem }): unknown;
  'item-leading'(props: { item: PfContentSearchItem }): unknown;
  'item-label'(props: { item: PfContentSearchItem }): unknown;
  'item-description'(props: { item: PfContentSearchItem }): unknown;
  'item-trailing'(props: { item: PfContentSearchItem }): unknown;
  content(): unknown;
}>();

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
    links?: PfContentSearchLink[];
    navigation?: PfContentNavigationItem[];
    groups?: PfContentSearchGroup[];
    files?: PfContentSearchFile[];
    fuse?: Record<string, unknown>;
    colorMode?: boolean;
    ui?: PfContentSearchUi;
    title?: string;
    description?: string;
    overlay?: boolean;
    transition?: boolean;
    dismissible?: boolean;
    fullscreen?: boolean;
    modal?: boolean;
    portal?: string | boolean | HTMLElement;
    open?: boolean;
    searchTerm?: string;
    inputColor?: PfInputColor;
    inputVariant?: PfInputVariant;
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
    links: () => [],
    navigation: () => [],
    groups: () => [],
    files: () => [],
    fuse: undefined,
    colorMode: true,
    ui: undefined,
    title: 'Search',
    description: undefined,
    overlay: true,
    transition: true,
    dismissible: true,
    fullscreen: false,
    modal: true,
    portal: true,
    open: undefined,
    searchTerm: undefined,
    inputColor: 'primary',
    inputVariant: 'outline',
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'update:searchTerm': [value: string];
}>();

const searchState = usePfContentSearch();
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

const localOpen = ref(props.open ?? searchState.isOpen.value);
const localSearchTerm = ref(props.searchTerm ?? searchState.searchTerm.value);

const openState = computed(() =>
  isOpenControlled() ? Boolean(props.open) : localOpen.value
);
const searchTermState = computed(() =>
  isSearchTermControlled() ? (props.searchTerm ?? '') : localSearchTerm.value
);

watch(
  () => props.open,
  (next) => {
    if (isOpenControlled()) localOpen.value = Boolean(next);
  }
);

watch(
  () => props.searchTerm,
  (next) => {
    if (isSearchTermControlled()) localSearchTerm.value = next ?? '';
  }
);

watch(
  () => searchState.isOpen.value,
  (next) => {
    if (!isOpenControlled()) localOpen.value = next;
  }
);

watch(
  () => searchState.searchTerm.value,
  (next) => {
    if (!isSearchTermControlled()) localSearchTerm.value = next;
  }
);

function setOpen(value: boolean) {
  emit('update:open', value);
  if (!isOpenControlled()) {
    localOpen.value = value;
  }
  if (value) searchState.open();
  else searchState.close();
}

function setSearchTerm(value: string) {
  emit('update:searchTerm', value);
  if (!isSearchTermControlled()) {
    localSearchTerm.value = value;
  }
  searchState.setSearchTerm(value);
}

function matchShortcut(event: KeyboardEvent): boolean {
  const normalized = props.shortcut.trim().toLowerCase();
  const [modifier, key] = normalized.split('_');
  const pressed = event.key.toLowerCase();
  if (modifier === 'meta') return event.metaKey && pressed === key;
  if (modifier === 'ctrl') return event.ctrlKey && pressed === key;
  if (modifier === 'alt') return event.altKey && pressed === key;
  if (modifier === 'shift') return event.shiftKey && pressed === key;
  return pressed === normalized;
}

function onWindowKeyDown(event: KeyboardEvent) {
  if (!matchShortcut(event)) return;
  event.preventDefault();
  setOpen(true);
}

function setColorMode(mode: 'light' | 'dark' | 'system') {
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

function flattenNavigation(
  items: readonly PfContentNavigationItem[],
  parents: string[] = []
): PfContentSearchItem[] {
  const out: PfContentSearchItem[] = [];
  for (const item of items) {
    const label = String(item.label ?? '').trim();
    if (!label) continue;
    const pathLabel =
      parents.length > 0 ? `${parents.join(' / ')} / ${label}` : label;
    out.push({
      id: item.id,
      label: pathLabel,
      description: item.description as string | undefined,
      icon: item.icon,
      to: item.to,
      href: item.href,
      target: item.target as string | undefined,
      external: item.external as boolean | undefined,
      keywords: parents,
    });
    if (Array.isArray(item.children) && item.children.length > 0) {
      out.push(...flattenNavigation(item.children, [...parents, label]));
    }
  }
  return out;
}

const linksGroup = computed<PfContentSearchGroup | null>(() => {
  if (!props.links.length) return null;
  return {
    id: 'links',
    label: 'Links',
    items: props.links.map((link) => ({ ...link })),
  };
});

const navigationGroup = computed<PfContentSearchGroup | null>(() => {
  if (!props.navigation.length) return null;
  return {
    id: 'navigation',
    label: 'Navigation',
    items: flattenNavigation(props.navigation),
  };
});

const filesGroup = computed<PfContentSearchGroup | null>(() => {
  if (!props.files.length) return null;
  return {
    id: 'files',
    label: 'Pages',
    items: props.files.map((file, index) => ({
      id: file.id ?? file.path ?? String(index),
      label: file.title ?? file.path ?? 'Untitled',
      description: file.description ?? file.content,
      to: file.to ?? (file.path ? `${file.path}${file.hash ?? ''}` : undefined),
      href: file.href,
      icon: 'file',
    })),
  };
});

const colorModeGroup = computed<PfContentSearchGroup | null>(() => {
  if (!props.colorMode) return null;
  return {
    id: 'theme',
    label: 'Theme',
    items: [
      {
        id: 'theme-light',
        label: 'Switch to light',
        icon: 'sun',
        onSelect: () => setColorMode('light'),
      },
      {
        id: 'theme-dark',
        label: 'Switch to dark',
        icon: 'moon',
        onSelect: () => setColorMode('dark'),
      },
      {
        id: 'theme-system',
        label: 'Use system theme',
        icon: 'palette',
        onSelect: () => setColorMode('system'),
      },
    ],
  };
});

const allGroups = computed<PfContentSearchGroup[]>(() => {
  const list: PfContentSearchGroup[] = [];
  if (linksGroup.value) list.push(linksGroup.value);
  if (navigationGroup.value) list.push(navigationGroup.value);
  if (filesGroup.value) list.push(filesGroup.value);
  list.push(...props.groups);
  if (colorModeGroup.value) list.push(colorModeGroup.value);
  return list;
});

const filteredGroups = computed(() => {
  const term = searchTermState.value.trim().toLowerCase();
  if (!term) return allGroups.value;
  return allGroups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const label = String(item.label ?? '').toLowerCase();
        const description = String(item.description ?? '').toLowerCase();
        const keywordBlob = (item.keywords ?? []).join(' ').toLowerCase();
        return (
          label.includes(term) ||
          description.includes(term) ||
          keywordBlob.includes(term)
        );
      }),
    }))
    .filter((group) => group.items.length > 0);
});

async function onSelect(item: PfContentSearchItem) {
  await item.onSelect?.();

  const link = item.to ?? item.href;
  if (
    typeof link === 'string' &&
    link.length > 0 &&
    typeof window !== 'undefined'
  ) {
    if (link.startsWith('#')) {
      const id = link.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      history.replaceState(null, '', link);
    } else {
      window.location.assign(link);
    }
  }
  setOpen(false);
}

onMounted(() => {
  if (typeof window === 'undefined') return;
  window.addEventListener('keydown', onWindowKeyDown);
});

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('keydown', onWindowKeyDown);
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
    :ui="{ content: ['pfContentSearch__modal', ui?.modal].join(' ') }"
    @update:open="setOpen"
  >
    <template #content>
      <div ref="commandPaletteRef" class="pfContentSearch">
        <slot name="content">
          <div class="pfContentSearch__input" :class="ui?.input">
            <PfInput
              :model-value="searchTermState"
              :icon="icon"
              :placeholder="placeholder"
              :autofocus="autofocus"
              :loading="loading"
              :loading-icon="loadingIcon"
              :size="size"
              :color="inputColor"
              :variant="inputVariant"
              @update:model-value="setSearchTerm"
            />
          </div>

          <div class="pfContentSearch__content">
            <div
              v-for="group in filteredGroups"
              :key="group.id || group.label || 'group'"
              class="pfContentSearch__group"
              :class="ui?.group"
            >
              <div v-if="group.label" class="pfContentSearch__groupLabel">
                {{ group.label }}
              </div>

              <template
                v-for="item in group.items"
                :key="item.id || item.label"
              >
                <slot name="item" :item="item">
                  <PfButton
                    class="pfContentSearch__item"
                    :class="ui?.item"
                    color="neutral"
                    variant="ghost"
                    block
                    :icon="item.icon"
                    @click="void onSelect(item)"
                  >
                    <template #default>
                      <div class="pfContentSearch__itemLabelWrap">
                        <slot name="item-label" :item="item">
                          <span
                            class="pfContentSearch__itemLabel"
                            :class="ui?.itemLabel"
                          >
                            {{ item.label }}
                          </span>
                        </slot>
                        <slot
                          v-if="item.description"
                          name="item-description"
                          :item="item"
                        >
                          <span
                            class="pfContentSearch__itemDescription"
                            :class="ui?.itemDescription"
                          >
                            {{ item.description }}
                          </span>
                        </slot>
                      </div>
                    </template>
                    <template #trailing>
                      <slot name="item-trailing" :item="item">
                        <span
                          class="pfContentSearch__itemTrailing"
                          :class="ui?.itemTrailing"
                        >
                          <PfBadge
                            v-if="item.badge !== undefined"
                            color="neutral"
                            variant="subtle"
                            size="sm"
                            :label="String(item.badge)"
                          />
                          <PfKbd
                            v-for="kbd in item.kbds ?? []"
                            :key="kbd"
                            :value="kbd"
                            variant="subtle"
                          />
                        </span>
                      </slot>
                    </template>
                  </PfButton>
                </slot>
              </template>
            </div>

            <div
              v-if="filteredGroups.length === 0"
              class="pfContentSearch__empty"
            >
              <slot name="empty">No matching results.</slot>
            </div>
          </div>

          <div class="pfContentSearch__footer">
            <slot name="footer" />
          </div>
        </slot>
      </div>
    </template>
  </PfModal>
</template>

<style scoped lang="scss">
.pfContentSearch {
  width: min(100%, 52rem);
  min-height: 20rem;
  max-height: 72dvh;
  display: flex;
  flex-direction: column;

  font-family: var(--pf-font-sans);

  background: var(--pf-color-surface);
  border: var(--pf-stroke-width) solid var(--pf-border-color);
  border-radius: var(--pf-radius-md);
  overflow: hidden;
}

.pfContentSearch__input {
  padding: var(--pf-space-md);

  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfContentSearch__content {
  padding: var(--pf-space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-sm);

  overflow-y: auto;
}

.pfContentSearch__group {
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-2xs);
}

.pfContentSearch__groupLabel {
  padding-inline: var(--pf-space-sm);

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
  font-weight: var(--pf-font-weight-medium);
}

.pfContentSearch__itemLabelWrap {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  text-align: left;
}

.pfContentSearch__itemLabel {
  min-width: 0;

  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfContentSearch__itemDescription {
  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
}

.pfContentSearch__itemTrailing {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.pfContentSearch__empty {
  padding: var(--pf-space-xl) var(--pf-space-sm);

  color: var(--pf-color-muted);
  text-align: center;
}

.pfContentSearch__footer {
  padding: var(--pf-space-sm) var(--pf-space-md);

  border-top: var(--pf-stroke-width) solid var(--pf-border-color);
}
</style>
