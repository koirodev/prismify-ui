<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';

export interface PfDashboardToolbarUi {
  root?: string;
  left?: string;
  right?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    ui?: PfDashboardToolbarUi;
  }>(),
  {
    as: 'div',
    ui: undefined,
  }
);

const attrs = useAttrs();

const rootClass = computed(() => [
  'pfDashboardToolbar',
  attrs.class,
  props.ui?.root,
]);
const resolvedTag = computed(() => resolveDynamicComponent(props.as));
const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div class="pfDashboardToolbar__left" :class="ui?.left">
      <slot name="left" />
    </div>
    <div class="pfDashboardToolbar__center">
      <slot />
    </div>
    <div class="pfDashboardToolbar__right" :class="ui?.right">
      <slot name="right" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfDashboardToolbar {
  padding-inline: var(--pf-dashboard-panel-pad-x);
  min-height: 3.0625rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: var(--pf-space-sm);

  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);
  overflow-x: auto;
}

.pfDashboardToolbar__left,
.pfDashboardToolbar__right {
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);
}

.pfDashboardToolbar__center {
  min-width: 0;
  display: flex;
  align-items: center;
  flex: 1;
  gap: var(--pf-space-sm);
}
</style>
