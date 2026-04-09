<script setup lang="ts">
import {
  Comment,
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
  type VNode,
} from 'vue';
import PfAvatar from '../PfAvatar/index.vue';
import type { PfBadgeAvatarProps } from '../PfBadge/index.vue';
import PfIcon from '../PfIcon/index.vue';
import type { PfIconSize } from '../PfIcon/iconSizes';
import { PfIconName } from '../PfIcon/paths';
export type PfSeparatorAvatarProps = PfBadgeAvatarProps;

export type PfSeparatorColor =
  | 'error'
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning';

export type PfSeparatorSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfSeparatorType = 'solid' | 'dashed' | 'dotted';

export type PfSeparatorUi = Partial<{
  root: string;
  border: string;
  container: string;
  icon: string;
  avatar: string;
  label: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or component. */
    as?: string | Component;
    /** Center text (if no slot and no `icon` / `avatar`). */
    label?: string;
    /** Center icon (`PfIconName`). */
    icon?: PfIconName;
    /** Center avatar. */
    avatar?: PfSeparatorAvatarProps;
    color?: PfSeparatorColor;
    size?: PfSeparatorSize;
    type?: PfSeparatorType;
    orientation?: 'horizontal' | 'vertical';
    ui?: PfSeparatorUi;
    /**
     * Decorative separator: removed from the accessibility tree
     * (`role="presentation"`, `aria-hidden="true"`).
     */
    decorative?: boolean;
  }>(),
  {
    color: 'neutral',
    size: 'xs',
    type: 'solid',
    orientation: 'horizontal',
    decorative: false,
  }
);

const attrs = useAttrs();
const slots = useSlots();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const hasDefaultSlotContent = computed((): boolean => {
  const d = slots.default?.({});
  if (d == null) return false;
  const list = Array.isArray(d) ? d : [d];
  return list.some((vn: VNode | VNode[] | string | null | undefined) => {
    if (vn == null || typeof vn === 'string') return vn != null && vn !== '';
    if (Array.isArray(vn)) return vn.length > 0;
    if (typeof vn !== 'object') return false;
    if (!('type' in vn)) return true;
    return vn.type !== Comment;
  });
});

const hasMiddle = computed(
  () =>
    hasDefaultSlotContent.value ||
    props.icon != null ||
    props.avatar != null ||
    (props.label != null && props.label !== '')
);

const middleKind = computed<'slot' | 'icon' | 'avatar' | 'label' | null>(() => {
  if (hasDefaultSlotContent.value) return 'slot';
  if (props.icon != null) return 'icon';
  if (props.avatar != null) return 'avatar';
  if (props.label != null && props.label !== '') return 'label';
  return null;
});

const avatarBind = computed(() => ({
  ...props.avatar,
  size:
    props.avatar?.size ?? ('2xs' as NonNullable<PfBadgeAvatarProps['size']>),
}));

const iconSize = computed((): PfIconSize => {
  const map: Record<PfSeparatorSize, PfIconSize> = {
    xs: 'sm',
    sm: 'md',
    md: 'lg',
    lg: 'xl',
    xl: '2xl',
  };
  return map[props.size];
});

const rootClass = computed(() => [
  'pfSeparator',
  `pfSeparator_orientation_${props.orientation}`,
  `pfSeparator_color_${props.color}`,
  `pfSeparator_size_${props.size}`,
  `pfSeparator_type_${props.type}`,
  attrs.class,
  props.ui?.root,
]);

const segmentClass = computed(() => ['pfSeparator__segment', props.ui?.border]);

const lineFullClass = computed(() => [
  'pfSeparator__lineFull',
  props.ui?.border,
]);

const containerClass = computed(() => [
  'pfSeparator__container',
  props.ui?.container,
]);

const a11yAttrs = computed(() => {
  if (props.decorative) {
    return {
      role: 'presentation' as const,
      'aria-hidden': true as const,
    };
  }
  return {
    role: 'separator' as const,
    'aria-orientation':
      props.orientation === 'vertical'
        ? ('vertical' as const)
        : ('horizontal' as const),
  };
});
</script>

<template>
  <component
    :is="resolvedTag"
    :class="rootClass"
    v-bind="{ ...passthroughAttrs, ...a11yAttrs }"
  >
    <template v-if="hasMiddle">
      <div :class="segmentClass" aria-hidden="true" />
      <div :class="containerClass">
        <slot v-if="middleKind === 'slot'" />
        <PfIcon
          v-else-if="middleKind === 'icon' && icon"
          :name="icon"
          :size="iconSize"
          class="pfSeparator__icon"
          :class="ui?.icon"
          aria-hidden="true"
        />
        <PfAvatar
          v-else-if="middleKind === 'avatar'"
          class="pfSeparator__avatar"
          :class="ui?.avatar"
          v-bind="avatarBind"
        />
        <span
          v-else-if="middleKind === 'label'"
          class="pfSeparator__label"
          :class="ui?.label"
        >
          {{ label }}
        </span>
      </div>
      <div :class="segmentClass" aria-hidden="true" />
    </template>
    <div v-else :class="lineFullClass" aria-hidden="true" />
  </component>
</template>

<style scoped lang="scss">
.pfSeparator {
  --pf-separator-line-color: var(--pf-border-color);
  --pf-separator-line-width: var(--pf-separator-thickness-xs);

  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  text-align: center;

  &_color_primary {
    --pf-separator-line-color: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-separator-line-color: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-separator-line-color: var(--pf-color-success);
  }

  &_color_info {
    --pf-separator-line-color: var(--pf-color-info);
  }

  &_color_warning {
    --pf-separator-line-color: var(--pf-color-warning);
  }

  &_color_error {
    --pf-separator-line-color: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-separator-line-color: var(--pf-border-color);
  }

  &_size_xs {
    --pf-separator-line-width: var(--pf-separator-thickness-xs);
  }

  &_size_sm {
    --pf-separator-line-width: var(--pf-separator-thickness-sm);
  }

  &_size_md {
    --pf-separator-line-width: var(--pf-separator-thickness-md);
  }

  &_size_lg {
    --pf-separator-line-width: var(--pf-separator-thickness-lg);
  }

  &_size_xl {
    --pf-separator-line-width: var(--pf-separator-thickness-xl);
  }

  &_orientation_horizontal {
    width: 100%;
    flex-direction: row;
  }

  &_orientation_vertical {
    height: 100%;
    min-height: 2rem;
    flex-direction: column;
    align-self: stretch;
  }
}

.pfSeparator__segment {
  min-width: 0;
  min-height: 0;
  flex: 1 1 0;

  border-width: 0;
  border-style: var(--pf-separator-line-style, solid);
  border-color: var(--pf-separator-line-color);
}

.pfSeparator_type_solid {
  --pf-separator-line-style: solid;
}

.pfSeparator_type_dashed {
  --pf-separator-line-style: dashed;
}

.pfSeparator_type_dotted {
  --pf-separator-line-style: dotted;
}

.pfSeparator_orientation_horizontal .pfSeparator__segment {
  border-top-width: var(--pf-separator-line-width);
}

.pfSeparator_orientation_vertical .pfSeparator__segment {
  border-inline-start-width: var(--pf-separator-line-width);
}

.pfSeparator__lineFull {
  width: 100%;
  min-width: 0;
  min-height: 0;
  align-self: stretch;
  flex: 1 1 auto;

  border-width: 0;
  border-style: var(--pf-separator-line-style, solid);
  border-color: var(--pf-separator-line-color);
}

.pfSeparator_orientation_horizontal .pfSeparator__lineFull {
  border-top-width: var(--pf-separator-line-width);
}

.pfSeparator_orientation_vertical .pfSeparator__lineFull {
  border-inline-start-width: var(--pf-separator-line-width);

  width: auto;
  height: 100%;
}

.pfSeparator__container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  color: var(--pf-color-text);
  font-weight: var(--pf-font-weight-medium);
}

.pfSeparator_orientation_horizontal .pfSeparator__container {
  margin-inline: var(--pf-space-md);

  white-space: nowrap;
}

.pfSeparator_orientation_vertical .pfSeparator__container {
  margin-block: var(--pf-space-sm);
}

.pfSeparator__label {
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-sm);
}

.pfSeparator__icon {
  flex-shrink: 0;

  color: var(--pf-color-muted);
}

.pfSeparator__avatar {
  flex-shrink: 0;
}
</style>
