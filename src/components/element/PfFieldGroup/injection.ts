import type { ComputedRef, InjectionKey } from 'vue';

export type PfFieldGroupSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfFieldGroupInjected = {
  size: PfFieldGroupSize | undefined;
};

export const PF_FIELD_GROUP_INJECTION_KEY: InjectionKey<
  ComputedRef<PfFieldGroupInjected>
> = Symbol('pfFieldGroup');
