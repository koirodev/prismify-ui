<script setup lang="ts">
import {
  computed,
  provide,
  ref,
  resolveDynamicComponent,
  useAttrs,
  watch,
  type Component,
} from 'vue';
import {
  PF_DASHBOARD_GROUP_KEY,
  type PfDashboardGroupContext,
  type PfDashboardSidebarApi,
  type PfDashboardStateEntry,
} from '../shared/injection';
import {
  readDashboardBucket,
  writeDashboardBucket,
  type PfDashboardStateBucket,
  type PfDashboardStorage,
} from '../shared/storage';
import type { PfDashboardUnit } from '../shared/resize';

export interface PfDashboardGroupUi {
  base?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    ui?: PfDashboardGroupUi;
    storage?: PfDashboardStorage;
    storageKey?: string;
    persistent?: boolean;
    unit?: PfDashboardUnit;
  }>(),
  {
    as: 'div',
    ui: undefined,
    storage: 'cookie',
    storageKey: 'dashboard',
    persistent: true,
    unit: '%',
  }
);

const attrs = useAttrs();
const groupRef = ref<HTMLElement | null>(null);

const unitRef = computed(() => props.unit);
const storageRef = computed(() => props.storage);
const storageKeyRef = computed(() => props.storageKey);
const persistentRef = computed(() => props.persistent);

const sidebars = new Map<string, PfDashboardSidebarApi>();

const bucket = ref<PfDashboardStateBucket>(
  readDashboardBucket(props.storage, props.storageKey, props.persistent)
);

watch(
  () => [props.storage, props.storageKey, props.persistent] as const,
  ([storage, storageKey, persistent]) => {
    bucket.value = readDashboardBucket(storage, storageKey, persistent);
  },
  { immediate: true }
);

function readState(id: string): PfDashboardStateEntry {
  return bucket.value[id] ?? {};
}

function writeState(id: string, entry: PfDashboardStateEntry): void {
  bucket.value = {
    ...bucket.value,
    [id]: {
      ...(bucket.value[id] ?? {}),
      ...entry,
    },
  };
  writeDashboardBucket(
    props.storage,
    props.storageKey,
    props.persistent,
    bucket.value
  );
}

function registerSidebar(id: string, api: PfDashboardSidebarApi): void {
  sidebars.set(id, api);
}

function unregisterSidebar(id: string): void {
  sidebars.delete(id);
}

function getSidebarBySide(
  side: 'left' | 'right'
): PfDashboardSidebarApi | null {
  for (const api of sidebars.values()) {
    if (api.side === side) return api;
  }
  return null;
}

const context: PfDashboardGroupContext = {
  unit: unitRef,
  storage: storageRef,
  storageKey: storageKeyRef,
  persistent: persistentRef,
  groupRef,
  readState,
  writeState,
  registerSidebar,
  unregisterSidebar,
  getSidebarBySide,
};

provide(PF_DASHBOARD_GROUP_KEY, context);

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});

const resolvedTag = computed(() => resolveDynamicComponent(props.as));

const rootClass = computed(() => [
  'pfDashboardGroup',
  attrs.class,
  props.ui?.base,
]);
</script>

<template>
  <component
    :is="resolvedTag"
    ref="groupRef"
    :class="rootClass"
    v-bind="passthroughAttrs"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.pfDashboardGroup {
  inset: 0;
  position: fixed;

  width: 100%;
  height: 100dvh;
  display: flex;

  overflow: hidden;
}
</style>
