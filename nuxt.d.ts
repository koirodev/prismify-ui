import type { NuxtModule } from '@nuxt/schema';

export interface PrismifyNuxtModuleOptions {
  css?: boolean;
  plugin?: boolean;
  components?: boolean;
  composables?: boolean;
}

declare const _default: NuxtModule<PrismifyNuxtModuleOptions>;
export default _default;
