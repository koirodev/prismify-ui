<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
} from 'vue';
import PfDashboardSidebarToggle from '../PfDashboardSidebarToggle/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

export interface PfDashboardNavbarUi {
  root?: string;
  left?: string;
  icon?: string;
  title?: string;
  center?: string;
  right?: string;
  toggle?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    icon?: PfIconName;
    title?: string;
    toggle?:
      | boolean
      | Partial<{
          color:
            | 'primary'
            | 'secondary'
            | 'success'
            | 'info'
            | 'warning'
            | 'error'
            | 'neutral';
          variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
          class: string;
        }>;
    toggleSide?: 'left' | 'right';
    ui?: PfDashboardNavbarUi;
  }>(),
  {
    as: 'header',
    icon: undefined,
    title: undefined,
    toggle: true,
    toggleSide: 'left',
    ui: undefined,
  }
);

const attrs = useAttrs();

const rootClass = computed(() => [
  'pfDashboardNavbar',
  attrs.class,
  props.ui?.root,
]);
const resolvedTag = computed(() => resolveDynamicComponent(props.as));

const toggleProps = computed(() => {
  if (props.toggle && typeof props.toggle === 'object') {
    return props.toggle;
  }
  return {};
});

const showToggle = computed(() => props.toggle !== false);

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <div class="pfDashboardNavbar__left" :class="ui?.left">
      <template v-if="showToggle && toggleSide === 'left'">
        <slot name="toggle">
          <PfDashboardSidebarToggle
            :side="toggleSide"
            :class="ui?.toggle"
            v-bind="toggleProps"
          />
        </slot>
      </template>
      <slot name="leading" />
      <slot name="title">
        <div class="pfDashboardNavbar__title" :class="ui?.title">
          <PfIcon
            v-if="icon"
            :name="icon"
            class="pfDashboardNavbar__icon"
            :class="ui?.icon"
          />
          <span v-if="title">{{ title }}</span>
        </div>
      </slot>
      <slot name="trailing" />
    </div>
    <div class="pfDashboardNavbar__center" :class="ui?.center">
      <slot />
    </div>
    <div class="pfDashboardNavbar__right" :class="ui?.right">
      <slot name="right" />
      <template v-if="showToggle && toggleSide === 'right'">
        <slot name="toggle">
          <PfDashboardSidebarToggle
            :side="toggleSide"
            :class="ui?.toggle"
            v-bind="toggleProps"
          />
        </slot>
      </template>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfDashboardNavbar {
  padding-inline: var(--pf-dashboard-panel-pad-x);
  min-height: var(--pf-dashboard-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: var(--pf-space-sm);

  border-bottom: var(--pf-stroke-width) solid var(--pf-border-color);
}

.pfDashboardNavbar__left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);
}

.pfDashboardNavbar__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.pfDashboardNavbar__title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--pf-space-sm);

  font-weight: var(--pf-font-weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfDashboardNavbar__center {
  display: none;
}

.pfDashboardNavbar__right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--pf-space-sm);
}

@media (min-width: 64rem) {
  .pfDashboardNavbar__center {
    display: flex;
  }
}
</style>
