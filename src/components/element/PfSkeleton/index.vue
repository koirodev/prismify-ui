<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';

export type PfSkeletonUi = Partial<{
  /** Extra classes on the root (on top of `pfSkeleton`). */
  base: string;
}>;

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /**
   * Root tag or component (`div` by default).
   * For a component object in `setup`, use `markRaw(Comp)`.
   */
  as?: string | Component;
  /** Extra classes via object (like Nuxt UI theme customization). */
  ui?: PfSkeletonUi;
}>();

const attrs = useAttrs();

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => ['pfSkeleton', attrs.class, props.ui?.base]);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});
</script>

<template>
  <component
    :is="resolvedTag"
    :class="rootClass"
    role="presentation"
    aria-hidden="true"
    v-bind="passthroughAttrs"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
@keyframes pfSkeletonPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: var(--pf-skeleton-pulse-mid-opacity);
  }
}

.pfSkeleton {
  display: block;
  box-sizing: border-box;

  background-color: var(--pf-skeleton-bg);
  border-radius: var(--pf-skeleton-radius);

  animation: pfSkeletonPulse var(--pf-skeleton-pulse-duration)
    var(--pf-animation-easing) infinite;
}
</style>
