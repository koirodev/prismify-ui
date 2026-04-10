<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfKbd from '../../element/PfKbd/index.vue';
import type { PfButtonAvatarProps } from '../../element/PfButton/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

export interface PfDashboardSearchButtonUi {
  base?: string;
  label?: string;
  trailing?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    icon?: PfIconName;
    label?: string;
    color?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warning'
      | 'error'
      | 'neutral';
    variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
    collapsed?: boolean;
    tooltip?: boolean | Record<string, unknown>;
    kbds?: string[];
    ui?: PfDashboardSearchButtonUi;
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
    icon: 'search',
    label: 'Search...',
    color: 'neutral',
    variant: undefined,
    collapsed: false,
    tooltip: false,
    kbds: () => ['meta', 'k'],
    ui: undefined,
    size: 'md',
    square: false,
    block: true,
    loadingAuto: false,
    avatar: undefined,
    leading: true,
    leadingIcon: undefined,
    trailing: false,
    trailingIcon: undefined,
    loading: false,
    loadingIcon: undefined,
    disabled: false,
    type: 'button',
  }
);

const attrs = useAttrs();

const resolvedVariant = computed(
  () => props.variant ?? (props.collapsed ? 'ghost' : 'outline')
);

const rootClass = computed(() => [
  'pfDashboardSearchButton',
  props.collapsed && 'pfDashboardSearchButton_collapsed',
  attrs.class,
  props.ui?.base,
]);

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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pf-dashboard-search-open'));
  }
}
</script>

<template>
  <PfButton
    :class="rootClass"
    :icon="icon"
    :label="collapsed ? undefined : label"
    :color="color"
    :variant="resolvedVariant"
    :size="size"
    :square="square || collapsed"
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
    @click="onClick"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>
    <slot />
    <template #trailing>
      <slot name="trailing">
        <div
          v-if="!collapsed && kbds.length > 0"
          class="pfDashboardSearchButton__trailing"
          :class="ui?.trailing"
        >
          <PfKbd v-for="kbd in kbds" :key="kbd" :value="kbd" variant="subtle" />
        </div>
      </slot>
    </template>
  </PfButton>
</template>

<style scoped lang="scss">
.pfDashboardSearchButton__trailing {
  margin-inline-start: auto;

  display: none;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 64rem) {
  .pfDashboardSearchButton__trailing {
    display: inline-flex;
  }
}

.pfDashboardSearchButton_collapsed {
  gap: 0;

  .pfDashboardSearchButton__trailing {
    display: none;
  }
}
</style>
