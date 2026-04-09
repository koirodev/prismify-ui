<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
} from 'vue';

/** Extra classes for layout regions (like Nuxt UI theme slots). */
export type PfFooterUi = Partial<{
  root: string;
  top: string;
  bottom: string;
  container: string;
  left: string;
  center: string;
  right: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or Vue component. */
    as?: string | Component;
    /** Extra classes per region. */
    ui?: PfFooterUi;
  }>(),
  {}
);

const attrs = useAttrs();
const slots = useSlots();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const tag = props.as ?? 'footer';
  return typeof tag === 'string' ? resolveDynamicComponent(tag) : tag;
});

const rootClass = computed(() => ['pfFooter', attrs.class, props.ui?.root]);
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div v-if="slots.top" :class="['pfFooter__top', ui?.top]">
      <slot name="top" />
    </div>

    <div :class="['pfFooter__container', ui?.container]">
      <div :class="['pfFooter__right', ui?.right]">
        <slot name="right" />
      </div>
      <div :class="['pfFooter__center', ui?.center]">
        <slot />
      </div>
      <div :class="['pfFooter__left', ui?.left]">
        <slot name="left" />
      </div>
    </div>

    <div v-if="slots.bottom" :class="['pfFooter__bottom', ui?.bottom]">
      <slot name="bottom" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfFooter {
  width: 100%;
  box-sizing: border-box;

  color: var(--pf-color-text);
  font: var(--pf-font-sans);

  background: var(--pf-color-surface);
}

.pfFooter__top {
  padding-block: var(--pf-footer-section-padding-y);
  box-sizing: border-box;
}

.pfFooter__bottom {
  padding-block: var(--pf-footer-section-padding-y);
  box-sizing: border-box;
}

.pfFooter__container {
  margin-inline: auto;

  padding-block: var(--pf-footer-container-padding-y);
  padding-inline: var(--pf-container-padding-x);
  width: 100%;
  max-width: var(--pf-container-max-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pf-footer-stack-gap);
  box-sizing: border-box;
}

.pfFooter__left,
.pfFooter__right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--pf-footer-inline-gap);
}

.pfFooter__center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 40rem) {
  .pfFooter__container {
    padding-inline: var(--pf-container-padding-x-sm);
  }
}

@media (min-width: 64rem) {
  .pfFooter__top,
  .pfFooter__bottom {
    padding-block: var(--pf-footer-section-padding-y-lg);
  }

  .pfFooter__container {
    padding-block: var(--pf-footer-container-padding-y-lg);
    padding-inline: var(--pf-container-padding-x-lg);
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    column-gap: var(--pf-space-md);
  }

  .pfFooter__left {
    order: 1;

    min-width: 0;
    justify-content: flex-start;
    flex: 1 1 0;
  }

  .pfFooter__center {
    order: 2;
  }

  .pfFooter__right {
    order: 3;

    min-width: 0;
    justify-content: flex-end;
    flex: 1 1 0;
  }
}
</style>
