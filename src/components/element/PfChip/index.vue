<script setup lang="ts">
import {
  Comment,
  computed,
  resolveDynamicComponent,
  useSlots,
  type Component,
} from 'vue';

export type PfChipColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfChipSize =
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl';

export type PfChipPosition =
  | 'top-right'
  | 'bottom-right'
  | 'top-left'
  | 'bottom-left';

const props = withDefaults(
  defineProps<{
    /** Indicator visibility; for `v-model:show`. */
    show?: boolean;
    /** Root tag or wrapper component (default slot or dot-only mode). */
    as?: string | Component;
    /** Label inside the indicator (number or short text). */
    text?: string | number;
    color?: PfChipColor;
    size?: PfChipSize;
    position?: PfChipPosition;
    /** Indicator inside rounded area (no overflow past the edge). */
    inset?: boolean;
    /** Indicator in flow (not absolute); good for inline lists and menus. */
    standalone?: boolean;
  }>(),
  {
    show: true,
    color: 'primary',
    size: 'md',
    position: 'top-right',
    inset: false,
    standalone: false,
  }
);

defineEmits<{
  'update:show': [value: boolean];
}>();

const slots = useSlots();

const resolvedTag = computed(() => {
  const a = props.as ?? 'span';
  return typeof a === 'string' ? resolveDynamicComponent(a) : a;
});

const hasDefaultContent = computed((): boolean => {
  const d = slots.default?.();
  if (d == null) return false;
  return d.some((vn) => {
    if (vn == null || typeof vn !== 'object') return false;
    if (!('type' in vn)) return true;
    return vn.type !== Comment;
  });
});

/** Indicator only, no default slot (`<PfChip />`, `<PfChip text="3" />`). */
const isDotOnly = computed(() => !hasDefaultContent.value);

const hasLabel = computed((): boolean => {
  if (slots.content != null) return true;
  if (props.text === undefined || props.text === null) return false;
  return String(props.text).length > 0;
});

const rootClass = computed(() => {
  const list: (string | false | null | undefined)[] = ['pfChip'];
  if (!isDotOnly.value) {
    list.push('pfChip_wrap');
    if (props.standalone) list.push('pfChip_wrap_standalone');
  } else {
    list.push('pfChip_dotOnly');
  }
  return list;
});

const baseClass = computed(() => {
  const list = [
    'pfChip__base',
    `pfChip__base_color_${props.color}`,
    `pfChip__base_size_${props.size}`,
  ];
  if (hasLabel.value) list.push('pfChip__base_withText');
  if (!isDotOnly.value && !props.standalone) {
    list.push('pfChip__base_overlay');
    list.push(`pfChip__base_position_${props.position.replace(/-/g, '_')}`);
    if (props.inset) list.push('pfChip__base_inset');
    else list.push('pfChip__base_outset');
  } else if (!isDotOnly.value && props.standalone) {
    list.push('pfChip__base_flow');
  }
  return list;
});
</script>

<template>
  <component
    :is="resolvedTag"
    v-if="isDotOnly"
    v-show="props.show"
    :class="rootClass"
  >
    <span :class="baseClass">
      <slot name="content">{{ text }}</slot>
    </span>
  </component>
  <component :is="resolvedTag" v-else :class="rootClass">
    <slot />
    <span v-show="props.show" :class="baseClass">
      <slot name="content">{{ text }}</slot>
    </span>
  </component>
</template>

<style scoped lang="scss">
.pfChip {
  flex-shrink: 0;
  box-sizing: border-box;

  &_wrap {
    position: relative;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    vertical-align: middle;

    &_standalone {
      flex-direction: row;
      align-items: center;
      gap: var(--pf-space-xs);
    }
  }

  &_dotOnly {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    vertical-align: middle;

    &_standalone {
      position: relative;
    }
  }
}

.pfChip__base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  color: var(--pf-chip-fg);
  font-family: var(--pf-font-sans);
  font-weight: var(--pf-font-weight-medium);
  line-height: 1;
  white-space: nowrap;

  box-shadow: 0 0 0 2px var(--pf-color-surface);
  background-color: var(--pf-chip-bg);
  border-radius: 9999px;

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);

  &_flow {
    flex-shrink: 0;
  }

  &_overlay {
    position: absolute;
    z-index: 1;
    margin: 0;
  }

  &_position_top_right.pfChip__base_outset {
    top: 0;
    right: 0;

    transform: translate(50%, -50%);
  }

  &_position_bottom_right.pfChip__base_outset {
    right: 0;
    bottom: 0;

    transform: translate(50%, 50%);
  }

  &_position_top_left.pfChip__base_outset {
    top: 0;
    left: 0;

    transform: translate(-50%, -50%);
  }

  &_position_bottom_left.pfChip__base_outset {
    bottom: 0;
    left: 0;

    transform: translate(-50%, 50%);
  }

  &_position_top_right.pfChip__base_inset {
    top: var(--pf-chip-inset-offset);
    right: var(--pf-chip-inset-offset);

    transform: none;
  }

  &_position_bottom_right.pfChip__base_inset {
    right: var(--pf-chip-inset-offset);
    bottom: var(--pf-chip-inset-offset);

    transform: none;
  }

  &_position_top_left.pfChip__base_inset {
    top: var(--pf-chip-inset-offset);
    left: var(--pf-chip-inset-offset);

    transform: none;
  }

  &_position_bottom_left.pfChip__base_inset {
    bottom: var(--pf-chip-inset-offset);
    left: var(--pf-chip-inset-offset);

    transform: none;
  }

  &_size_3xs {
    min-width: var(--pf-chip-size-3xs);
    min-height: var(--pf-chip-size-3xs);

    font-size: var(--pf-chip-font-3xs);
  }

  &_size_3xs.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-3xs);
  }

  &_size_2xs {
    min-width: var(--pf-chip-size-2xs);
    min-height: var(--pf-chip-size-2xs);

    font-size: var(--pf-chip-font-2xs);
  }

  &_size_2xs.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-2xs);
  }

  &_size_xs {
    min-width: var(--pf-chip-size-xs);
    min-height: var(--pf-chip-size-xs);

    font-size: var(--pf-chip-font-xs);
  }

  &_size_xs.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-xs);
  }

  &_size_sm {
    min-width: var(--pf-chip-size-sm);
    min-height: var(--pf-chip-size-sm);

    font-size: var(--pf-chip-font-sm);
  }

  &_size_sm.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-sm);
  }

  &_size_md {
    min-width: var(--pf-chip-size-md);
    min-height: var(--pf-chip-size-md);

    font-size: var(--pf-chip-font-md);
  }

  &_size_md.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-md);
  }

  &_size_lg {
    min-width: var(--pf-chip-size-lg);
    min-height: var(--pf-chip-size-lg);

    font-size: var(--pf-chip-font-lg);
  }

  &_size_lg.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-lg);
  }

  &_size_xl {
    min-width: var(--pf-chip-size-xl);
    min-height: var(--pf-chip-size-xl);

    font-size: var(--pf-chip-font-xl);
  }

  &_size_xl.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-xl);
  }

  &_size_2xl {
    min-width: var(--pf-chip-size-2xl);
    min-height: var(--pf-chip-size-2xl);

    font-size: var(--pf-chip-font-2xl);
  }

  &_size_2xl.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-2xl);
  }

  &_size_3xl {
    min-width: var(--pf-chip-size-3xl);
    min-height: var(--pf-chip-size-3xl);

    font-size: var(--pf-chip-font-3xl);
  }

  &_size_3xl.pfChip__base_withText {
    padding-inline: var(--pf-chip-pad-x-3xl);
  }

  &_color_primary {
    --pf-chip-bg: var(--pf-color-primary);
    --pf-chip-fg: var(--pf-color-surface);
  }

  &_color_secondary {
    --pf-chip-bg: var(--pf-color-secondary);
    --pf-chip-fg: var(--pf-color-surface);
  }

  &_color_success {
    --pf-chip-bg: var(--pf-color-success);
    --pf-chip-fg: var(--pf-color-surface);
  }

  &_color_info {
    --pf-chip-bg: var(--pf-color-info);
    --pf-chip-fg: var(--pf-color-surface);
  }

  &_color_warning {
    --pf-chip-bg: var(--pf-color-warning);
    --pf-chip-fg: var(--pf-color-surface);
  }

  &_color_error {
    --pf-chip-bg: var(--pf-color-error);
    --pf-chip-fg: var(--pf-color-surface);
  }

  &_color_neutral {
    --pf-chip-bg: var(--pf-color-text);
    --pf-chip-fg: var(--pf-color-surface);
  }
}
</style>
