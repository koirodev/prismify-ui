import type { ComputedRef, InjectionKey } from 'vue';

export type PfAvatarGroupSize =
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl';

export type PfAvatarGroupInjected = {
  size: PfAvatarGroupSize;
};

export const PF_AVATAR_GROUP_INJECTION_KEY: InjectionKey<
  ComputedRef<PfAvatarGroupInjected>
> = Symbol('pfAvatarGroup');
