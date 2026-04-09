<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';
import { getPfKbdKey } from '../../../composables/usePfKbd';

export type PfKbdColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfKbdVariant = 'outline' | 'soft' | 'subtle' | 'solid';

export type PfKbdSize = 'sm' | 'md' | 'lg';

export type PfKbdUi = Partial<{
  base: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    value?: string;
    color?: PfKbdColor;
    variant?: PfKbdVariant;
    size?: PfKbdSize;
    ui?: PfKbdUi;
  }>(),
  {
    color: 'neutral',
    variant: 'outline',
    size: 'md',
  }
);

const attrs = useAttrs();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const a = props.as ?? 'kbd';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const controlClass = computed(() => [
  'pfKbd',
  `pfKbd_color_${props.color}`,
  `pfKbd_variant_${props.variant}`,
  `pfKbd_size_${props.size}`,
  attrs.class,
  props.ui?.base,
]);

const resolvedLabel = computed(() => {
  if (props.value === undefined) return null;
  return getPfKbdKey(props.value);
});
</script>

<template>
  <component :is="resolvedTag" :class="controlClass" v-bind="passthroughAttrs">
    <template v-if="value !== undefined">{{ resolvedLabel }}</template>
    <slot v-else />
  </component>
</template>

<style scoped lang="scss">
.pfKbd {
  margin: 0;

  padding: 0 var(--pf-kbd-pad-x);
  min-width: var(--pf-kbd-min-width);
  height: var(--pf-kbd-height);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);
  font-size: var(--pf-kbd-font-size);
  font-weight: var(--pf-font-weight-medium);
  line-height: 1;
  vertical-align: middle;

  border-width: 0;
  border-style: solid;
  border-radius: var(--pf-radius-sm);

  user-select: none;

  &_color_primary {
    --pf-kbd-accent: var(--pf-color-primary);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_color_secondary {
    --pf-kbd-accent: var(--pf-color-secondary);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_color_success {
    --pf-kbd-accent: var(--pf-color-success);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_color_info {
    --pf-kbd-accent: var(--pf-color-info);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_color_warning {
    --pf-kbd-accent: var(--pf-color-warning);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_color_error {
    --pf-kbd-accent: var(--pf-color-error);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_color_neutral {
    --pf-kbd-accent: var(--pf-color-neutral);
    --pf-kbd-on-accent: var(--pf-color-surface);
  }

  &_variant_solid:not(&_color_neutral) {
    color: var(--pf-kbd-on-accent);

    background-color: var(--pf-kbd-accent);
    border-color: transparent;
  }

  &_variant_outline:not(&_color_neutral) {
    color: var(--pf-kbd-accent);

    background-color: transparent;
    border-width: var(--pf-stroke-width);
    border-color: color-mix(in srgb, var(--pf-kbd-accent) 50%, transparent);
  }

  &_variant_soft:not(&_color_neutral) {
    color: var(--pf-kbd-accent);

    background-color: color-mix(in srgb, var(--pf-kbd-accent) 10%, transparent);
    border-color: transparent;
  }

  &_variant_subtle:not(&_color_neutral) {
    color: var(--pf-kbd-accent);

    background-color: color-mix(in srgb, var(--pf-kbd-accent) 10%, transparent);
    border-width: var(--pf-stroke-width);
    border-color: color-mix(in srgb, var(--pf-kbd-accent) 25%, transparent);
  }

  &_size_sm {
    --pf-kbd-font-size: var(--pf-kbd-font-size-sm);
    --pf-kbd-height: var(--pf-kbd-height-sm);
    --pf-kbd-min-width: var(--pf-kbd-min-width-sm);
  }

  &_size_md {
    --pf-kbd-font-size: var(--pf-kbd-font-size-md);
    --pf-kbd-height: var(--pf-kbd-height-md);
    --pf-kbd-min-width: var(--pf-kbd-min-width-md);
  }

  &_size_lg {
    --pf-kbd-font-size: var(--pf-kbd-font-size-lg);
    --pf-kbd-height: var(--pf-kbd-height-lg);
    --pf-kbd-min-width: var(--pf-kbd-min-width-lg);
  }
}

.pfKbd_color_neutral.pfKbd_variant_solid {
  color: var(--pf-color-surface);

  background-color: var(--pf-color-text);
  border-color: transparent;
}

.pfKbd_color_neutral.pfKbd_variant_outline {
  color: var(--pf-color-text);

  background-color: var(--pf-color-surface);
  border-width: var(--pf-stroke-width);
  border-color: var(--pf-border-color);
}

.pfKbd_color_neutral.pfKbd_variant_soft {
  color: var(--pf-color-text);

  background-color: color-mix(
    in srgb,
    var(--pf-color-muted) 12%,
    var(--pf-color-surface)
  );
  border-color: transparent;
}

.pfKbd_color_neutral.pfKbd_variant_subtle {
  color: var(--pf-color-text);

  background-color: color-mix(
    in srgb,
    var(--pf-color-muted) 12%,
    var(--pf-color-surface)
  );
  border-width: var(--pf-stroke-width);
  border-color: var(--pf-border-color);
}
</style>
