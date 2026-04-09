/** Allowed `size` prop values for `PfIcon` (`--pf-icon-size-*` tokens). */
export const PF_ICON_SIZES = [
  '3xs',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
] as const;

export type PfIconSize = (typeof PF_ICON_SIZES)[number];
