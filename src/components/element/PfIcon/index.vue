<script setup lang="ts">
import { computed } from 'vue';
import type { PfIconSize } from './iconSizes';
import { PF_ICON_GLYPHS, type PfIconName } from './paths';

const props = withDefaults(
  defineProps<{
    name: PfIconName;
    size?: PfIconSize;
  }>(),
  { size: 'md' }
);

const glyph = computed(() => PF_ICON_GLYPHS[props.name]);

const sizeClass = computed(() => `pfIcon_${props.size}`);
</script>

<template>
  <svg
    v-if="glyph"
    class="pfIcon"
    :class="sizeClass"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    :viewBox="glyph.viewBox"
    aria-hidden="true"
  >
    <path
      v-for="(p, i) in glyph.paths"
      :key="i"
      :d="p.d"
      :fill="p.fill"
      :fill-rule="p.fillRule"
      :clip-rule="p.clipRule"
    />
  </svg>
</template>

<style scoped lang="scss">
.pfIcon {
  flex-shrink: 0;

  vertical-align: middle;

  &_3xs {
    width: var(--pf-icon-size-3xs);
    height: var(--pf-icon-size-3xs);
  }

  &_2xs {
    width: var(--pf-icon-size-2xs);
    height: var(--pf-icon-size-2xs);
  }

  &_xs {
    width: var(--pf-icon-size-xs);
    height: var(--pf-icon-size-xs);
  }

  &_sm {
    width: var(--pf-icon-size-sm);
    height: var(--pf-icon-size-sm);
  }

  &_md {
    width: var(--pf-icon-size-md);
    height: var(--pf-icon-size-md);
  }

  &_lg {
    width: var(--pf-icon-size-lg);
    height: var(--pf-icon-size-lg);
  }

  &_xl {
    width: var(--pf-icon-size-xl);
    height: var(--pf-icon-size-xl);
  }

  &_2xl {
    width: var(--pf-icon-size-2xl);
    height: var(--pf-icon-size-2xl);
  }

  &_3xl {
    width: var(--pf-icon-size-3xl);
    height: var(--pf-icon-size-3xl);
  }
}
</style>
