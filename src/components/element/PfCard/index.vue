<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
  type Slots,
} from 'vue';

export type PfCardVariant = 'solid' | 'outline' | 'soft' | 'subtle';

export type PfCardUi = Partial<{
  root: string;
  header: string;
  body: string;
  footer: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    variant?: PfCardVariant;
    ui?: PfCardUi;
  }>(),
  {
    variant: 'outline',
  }
);

const attrs = useAttrs();
const slots: Slots = useSlots();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const a = props.as ?? 'div';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const showDividers = computed(
  () =>
    props.variant === 'outline' ||
    props.variant === 'soft' ||
    props.variant === 'subtle'
);

const rootClass = computed(() => [
  'pfCard',
  `pfCard_variant_${props.variant}`,
  showDividers.value ? 'pfCard_divided' : null,
  attrs.class,
  props.ui?.root,
]);
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div v-if="slots.header" class="pfCard__header" :class="ui?.header">
      <slot name="header" />
    </div>
    <div v-if="slots.default" class="pfCard__body" :class="ui?.body">
      <slot />
    </div>
    <div v-if="slots.footer" class="pfCard__footer" :class="ui?.footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfCard {
  box-sizing: border-box;

  color: var(--pf-card-fg, var(--pf-color-text));
  font-family: var(--pf-font-sans);

  border-radius: var(--pf-radius-md);
  overflow: hidden;

  &_divided > * + * {
    border-top: var(--pf-stroke-width) solid var(--pf-border-color);
  }

  &_variant_solid {
    --pf-card-fg: var(--pf-color-surface);

    box-shadow: none;
    background-color: var(--pf-color-text);
  }

  &_variant_outline {
    box-shadow: 0 0 0 var(--pf-stroke-width) var(--pf-border-color);
    background-color: var(--pf-color-surface);
  }

  &_variant_soft {
    box-shadow: none;
    background-color: color-mix(
      in srgb,
      var(--pf-color-muted) 12%,
      var(--pf-color-surface)
    );
  }

  &_variant_subtle {
    box-shadow: 0 0 0 var(--pf-stroke-width) var(--pf-border-color);
    background-color: color-mix(
      in srgb,
      var(--pf-color-muted) 12%,
      var(--pf-color-surface)
    );
  }
}

.pfCard__header,
.pfCard__footer {
  padding: var(--pf-space-lg);
}

.pfCard__body {
  padding: var(--pf-space-lg);
  min-width: 0;
}

@media (min-width: 40rem) {
  .pfCard__header,
  .pfCard__footer {
    padding-right: var(--pf-space-xl);
    padding-left: var(--pf-space-xl);
  }

  .pfCard__body {
    padding: var(--pf-space-xl);
  }
}
</style>
