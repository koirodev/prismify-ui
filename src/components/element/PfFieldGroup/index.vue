<script setup lang="ts">
import {
  computed,
  provide,
  resolveDynamicComponent,
  useAttrs,
  type Component,
  type PropType,
} from 'vue';
import {
  PF_FIELD_GROUP_INJECTION_KEY,
  type PfFieldGroupSize,
} from './injection';

export type PfFieldGroupUi = Partial<{
  root: string;
}>;

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** Root tag or component */
  as: [String, Object] as PropType<string | Component | undefined>,
  /**
   * Size for child `PfButton` / `PfBadge` / `PfInput` when they have no own `size`.
   */
  size: String as PropType<PfFieldGroupSize | undefined>,
  orientation: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  ui: Object as PropType<PfFieldGroupUi | undefined>,
});

const attrs = useAttrs();

provide(
  PF_FIELD_GROUP_INJECTION_KEY,
  computed(() => ({ size: props.size }))
);

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => [
  'pfFieldGroup',
  `pfFieldGroup_orientation_${props.orientation}`,
  attrs.class,
  props.ui?.root,
]);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.pfFieldGroup {
  position: relative;

  box-sizing: border-box;

  &_orientation_horizontal {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    flex-wrap: nowrap;
  }

  &_orientation_vertical {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    flex-wrap: nowrap;
  }

  &_orientation_horizontal > :deep(.pfButton),
  &_orientation_horizontal > :deep(.pfBadge) {
    position: relative;

    flex-shrink: 0;
  }

  &_orientation_horizontal > :deep(.pfInput:not(:first-child)) {
    margin-inline-start: calc(-1 * var(--pf-stroke-width));
  }

  &_orientation_horizontal > :deep(.pfInput:not(:first-child) .pfInput__shell) {
    border-end-start-radius: 0;
    border-start-start-radius: 0;
  }

  &_orientation_horizontal > :deep(.pfInput:not(:last-child) .pfInput__shell) {
    border-end-end-radius: 0;
    border-start-end-radius: 0;
  }

  &_orientation_horizontal > :deep(.pfInput:hover),
  &_orientation_horizontal > :deep(.pfInput:focus-within) {
    z-index: 1;
  }

  &_orientation_horizontal > :deep(.pfButton:not(:first-child)),
  &_orientation_horizontal > :deep(.pfBadge:not(:first-child)) {
    margin-inline-start: calc(-1 * var(--pf-stroke-width));
  }

  &_orientation_horizontal > :deep(.pfButton:not(:first-child)),
  &_orientation_horizontal > :deep(.pfBadge:not(:first-child)) {
    border-end-start-radius: 0;
    border-start-start-radius: 0;
  }

  &_orientation_horizontal > :deep(.pfButton:not(:last-child)),
  &_orientation_horizontal > :deep(.pfBadge:not(:last-child)) {
    border-end-end-radius: 0;
    border-start-end-radius: 0;
  }

  &_orientation_horizontal > :deep(.pfButton:hover),
  &_orientation_horizontal > :deep(.pfButton:focus-visible),
  &_orientation_horizontal > :deep(.pfBadge:hover) {
    z-index: 1;
  }

  &_orientation_vertical > :deep(.pfButton),
  &_orientation_vertical > :deep(.pfBadge) {
    position: relative;

    flex-shrink: 0;
  }

  &_orientation_vertical > :deep(.pfInput:not(:first-child)) {
    margin-block-start: calc(-1 * var(--pf-stroke-width));
  }

  &_orientation_vertical > :deep(.pfInput:not(:first-child) .pfInput__shell) {
    border-start-end-radius: 0;
    border-start-start-radius: 0;
  }

  &_orientation_vertical > :deep(.pfInput:not(:last-child) .pfInput__shell) {
    border-end-end-radius: 0;
    border-end-start-radius: 0;
  }

  &_orientation_vertical > :deep(.pfInput:hover),
  &_orientation_vertical > :deep(.pfInput:focus-within) {
    z-index: 1;
  }

  &_orientation_vertical > :deep(.pfButton:not(:first-child)),
  &_orientation_vertical > :deep(.pfBadge:not(:first-child)) {
    margin-block-start: calc(-1 * var(--pf-stroke-width));
  }

  &_orientation_vertical > :deep(.pfButton:not(:first-child)),
  &_orientation_vertical > :deep(.pfBadge:not(:first-child)) {
    border-start-end-radius: 0;
    border-start-start-radius: 0;
  }

  &_orientation_vertical > :deep(.pfButton:not(:last-child)),
  &_orientation_vertical > :deep(.pfBadge:not(:last-child)) {
    border-end-end-radius: 0;
    border-end-start-radius: 0;
  }

  &_orientation_vertical > :deep(.pfButton:hover),
  &_orientation_vertical > :deep(.pfButton:focus-visible),
  &_orientation_vertical > :deep(.pfBadge:hover) {
    z-index: 1;
  }
}
</style>
