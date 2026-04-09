<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import PfButton from '../PfButton/index.vue';
import type { PfButtonAvatarProps } from '../PfButton/index.vue';
import PfKbd from '../PfKbd/index.vue';
import type { PfIconName } from '../PfIcon/paths';
import { usePfContentSearch } from '../../../composables/usePfContentSearch';

export type PfContentSearchButtonUi = Partial<{
  base: string;
  label: string;
  trailing: string;
}>;

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
    ui?: PfContentSearchButtonUi;
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
    label: 'Search',
    color: 'neutral',
    variant: undefined,
    collapsed: true,
    tooltip: false,
    kbds: () => ['meta', 'k'],
    ui: undefined,
    size: 'md',
    square: false,
    block: false,
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
const searchState = usePfContentSearch();

const resolvedVariant = computed(
  () => props.variant ?? (props.collapsed ? 'ghost' : 'outline')
);

const rootClass = computed(() => [
  'pfContentSearchButton',
  props.collapsed ? 'pfContentSearchButton_collapsed' : null,
  attrs.class,
  props.ui?.base,
]);

function onClick(event: MouseEvent) {
  const fromAttrs = attrs.onClick as
    | ((e: MouseEvent) => void | Promise<void>)
    | Array<(e: MouseEvent) => void | Promise<void>>
    | undefined;
  const handlers =
    typeof fromAttrs === 'function' ? [fromAttrs] : (fromAttrs ?? []);
  for (const handler of handlers) {
    void handler(event);
  }
  searchState.open();
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
        <span
          v-if="!collapsed && kbds.length > 0"
          class="pfContentSearchButton__trailing"
          :class="ui?.trailing"
        >
          <PfKbd v-for="kbd in kbds" :key="kbd" :value="kbd" variant="subtle" />
        </span>
      </slot>
    </template>
  </PfButton>
</template>

<style scoped lang="scss">
.pfContentSearchButton__trailing {
  margin-inline-start: auto;

  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.pfContentSearchButton_collapsed .pfContentSearchButton__trailing {
  display: none;
}
</style>
