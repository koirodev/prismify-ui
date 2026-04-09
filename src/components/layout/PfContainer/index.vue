<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';

export type PfContainerUi = Partial<{
  base: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or Vue component. */
    as?: string | Component;
    /** Extra classes on the root (e.g. for app-level overrides). */
    ui?: PfContainerUi;
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
  const tag = props.as ?? 'div';
  return typeof tag === 'string' ? resolveDynamicComponent(tag) : tag;
});

const rootClass = computed(() => ['pfContainer', attrs.class, props.ui?.base]);
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.pfContainer {
  margin-inline: auto;

  padding-inline: var(--pf-container-padding-x);
  width: 100%;
  max-width: var(--pf-container-max-width);
  box-sizing: border-box;
}

@media (min-width: 40rem) {
  .pfContainer {
    padding-inline: var(--pf-container-padding-x-sm);
  }
}

@media (min-width: 64rem) {
  .pfContainer {
    padding-inline: var(--pf-container-padding-x-lg);
  }
}
</style>
