<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';

export interface PfDashboardResizeHandleUi {
  base?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    ui?: PfDashboardResizeHandleUi;
  }>(),
  {
    as: 'div',
    ui: undefined,
  }
);

const attrs = useAttrs();

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});

const rootClass = computed(() => [
  'pfDashboardResizeHandle',
  attrs.class,
  props.ui?.base,
]);

const resolvedTag = computed(() => resolveDynamicComponent(props.as));
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.pfDashboardResizeHandle {
  position: relative;

  display: none;

  box-sizing: border-box;
  min-width: var(--pf-space-xs);
  flex-shrink: 0;

  cursor: ew-resize;
  user-select: none;
  touch-action: none;
}

.pfDashboardResizeHandle::before {
  content: '';

  position: absolute;
  top: 0;
  right: -0.375rem;
  bottom: 0;
  left: -0.375rem;
  z-index: 1;
}

.pfDashboardResizeHandle::after {
  content: '';

  position: absolute;
  top: var(--pf-space-md);
  bottom: var(--pf-space-md);
  left: 50%;
  z-index: 0;

  width: var(--pf-stroke-width);
  border-radius: var(--pf-radius-xs);

  background: var(--pf-border-color);
  transform: translateX(-50%);
  pointer-events: none;
}

@media (min-width: 64rem) {
  .pfDashboardResizeHandle {
    display: block;
  }
}
</style>
