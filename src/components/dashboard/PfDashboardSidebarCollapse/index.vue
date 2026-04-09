<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import { PF_DASHBOARD_GROUP_KEY } from '../shared/injection';
import type { PfButtonAvatarProps } from '../../element/PfButton/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

export interface PfDashboardSidebarCollapseUi {
  base?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    color?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warning'
      | 'error'
      | 'neutral';
    variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
    side?: 'left' | 'right';
    ui?: PfDashboardSidebarCollapseUi;
    icon?: PfIconName;
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    square?: boolean;
    block?: boolean;
    loadingAuto?: boolean;
    avatar?: PfButtonAvatarProps;
    leading?: boolean;
    leadingIcon?: PfIconName;
    trailing?: boolean;
    trailingIcon?: PfIconName;
    loading?: boolean;
    loadingIcon?: PfIconName;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    color: 'neutral',
    variant: 'ghost',
    side: 'left',
    ui: undefined,
    icon: undefined,
    label: undefined,
    size: 'md',
    square: false,
    block: false,
    loadingAuto: false,
    avatar: undefined,
    leading: undefined,
    leadingIcon: undefined,
    trailing: undefined,
    trailingIcon: undefined,
    loading: false,
    loadingIcon: undefined,
    disabled: false,
    type: 'button',
  }
);

const attrs = useAttrs();
const group = inject(PF_DASHBOARD_GROUP_KEY, null);

const sidebar = computed(() => group?.getSidebarBySide(props.side) ?? null);
const resolvedIcon = computed(() => {
  if (props.icon) return props.icon;
  const collapsed = sidebar.value?.collapsed.value ?? false;
  if (props.side === 'left') {
    return collapsed ? 'angleSmallRight' : 'angleSmallLeft';
  }
  return collapsed ? 'angleSmallLeft' : 'angleSmallRight';
});

const rootClass = computed(() => [
  'pfDashboardSidebarCollapse',
  attrs.class,
  props.ui?.base,
]);
const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  delete next.onClick;
  return next;
});

function onClick(event: MouseEvent): void {
  const fromAttrs = attrs.onClick as
    | ((e: MouseEvent) => void | Promise<void>)
    | Array<(e: MouseEvent) => void | Promise<void>>
    | undefined;
  const handlers =
    typeof fromAttrs === 'function' ? [fromAttrs] : (fromAttrs ?? []);
  for (const handler of handlers) {
    void handler(event);
  }
  sidebar.value?.toggleCollapsed();
}
</script>

<template>
  <PfButton
    :class="rootClass"
    :color="color"
    :variant="variant"
    :icon="resolvedIcon"
    :label="label"
    :size="size"
    :square="square"
    :block="block"
    :loading-auto="loadingAuto"
    :avatar="avatar"
    :leading="leading"
    :leading-icon="leadingIcon"
    :trailing="trailing"
    :trailing-icon="trailingIcon"
    :loading="loading"
    :loading-icon="loadingIcon"
    :disabled="disabled"
    :type="type"
    v-bind="passthroughAttrs"
    @click="onClick"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>
    <slot />
    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </PfButton>
</template>

<style scoped lang="scss">
.pfDashboardSidebarCollapse {
  display: none;

  @media (min-width: 64rem) {
    display: inline-flex;
  }
}
</style>
