<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';

export type PfMainUi = Partial<{
  base: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or Vue component. */
    as?: string | Component;
    /** Extra classes on the root (e.g. for app-level overrides). */
    ui?: PfMainUi;
  }>(),
  {}
);

const attrs = useAttrs();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const tag = props.as ?? 'main';
  return typeof tag === 'string' ? resolveDynamicComponent(tag) : tag;
});

const rootClass = computed(() => ['pfMain', attrs.class, props.ui?.base]);
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.pfMain {
  width: 100%;
  min-height: calc(100vh - var(--pf-header-height));
  box-sizing: border-box;
}
</style>
