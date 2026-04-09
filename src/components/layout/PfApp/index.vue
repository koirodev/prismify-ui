<script setup lang="ts">
import { computed, provide } from 'vue';
import PfToaster from '../../overlay/PfToaster/index.vue';
import {
  PF_APP_INJECTION_KEY,
  resolvePfAppPortalTarget,
  type PfAppDirection,
  type PfAppPortalProp,
  type PfAppScrollBodyOption,
  type PfAppToasterProps,
  type PfAppTooltipProviderProps,
} from './injection';

const props = withDefaults(
  defineProps<{
    /** BCP 47; sets locale for the calendar and future date/time components if they have no own `locale`. */
    locale?: string;
    /**
     * Where to mount portals by default (Teleport, etc.).
     * @default when omitted, equivalent to `'body'`
     */
    portal?: PfAppPortalProp;
    /** Reading direction; set on the root node for nested blocks to inherit. */
    dir?: PfAppDirection;
    /** Global `body` scroll lock behavior for overlays (context for future primitives). */
    scrollBody?: boolean | PfAppScrollBodyOption;
    /** Global nonce (CSP); context for future inline styles / scripts in primitives. */
    nonce?: string;
    /** Tooltip provider options (kept in context until `PfTooltip` mounts). */
    tooltip?: PfAppTooltipProviderProps;
    /** Toaster options (`null` — explicitly disable the toast layer in context). */
    toaster?: PfAppToasterProps | null;
  }>(),
  {
    locale: undefined,
    portal: undefined,
    dir: undefined,
    scrollBody: undefined,
    nonce: undefined,
    tooltip: undefined,
    toaster: undefined,
  }
);

const context = computed(() => ({
  locale: props.locale,
  dir: props.dir,
  portalTarget: resolvePfAppPortalTarget(props.portal),
  scrollBody: props.scrollBody,
  nonce: props.nonce,
  tooltip: props.tooltip,
  toaster: props.toaster,
}));

provide(PF_APP_INJECTION_KEY, context);

const showToaster = computed(() => props.toaster !== null);
</script>

<template>
  <div class="pfApp" :dir="dir">
    <slot />
    <PfToaster
      v-if="showToaster"
      :position="toaster?.position"
      :duration="toaster?.duration"
      :max="toaster?.max"
    />
  </div>
</template>

<style scoped lang="scss">
.pfApp {
  display: contents;
}
</style>
