import type { ComputedRef, InjectionKey } from 'vue';

export type PfAppDirection = 'ltr' | 'rtl';

/** `portal` prop value: where to teleport overlays; `false` — no global tooltip layer. */
export type PfAppPortalProp = string | boolean | HTMLElement | undefined;

/**
 * `body` scroll lock behavior (for future modals / overlays).
 * Fields can be extended as primitives are integrated.
 */
export type PfAppScrollBodyOption = {
  paddingRight?: boolean;
  paddingBottom?: boolean;
};

/** Tooltip provider settings (subset of common options; grows with `PfTooltip`). */
export type PfAppTooltipProviderProps = {
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
  disableClosingTrigger?: boolean;
};

/** Toaster settings (subset of common options; grows with `PfToast`). */
export type PfAppToasterProps = {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  max?: number;
  duration?: number;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  label?: string;
  disableSwipe?: boolean;
  swipeThreshold?: number;
};

/** Resolved portal target for consumers (`usePfApp`). */
export type PfAppPortalTarget = string | HTMLElement | false;

export type PfAppContextValue = {
  /** BCP 47; inherited by calendar and future date/time fields. */
  locale: string | undefined;
  dir: PfAppDirection | undefined;
  portalTarget: PfAppPortalTarget;
  scrollBody: boolean | PfAppScrollBodyOption | undefined;
  nonce: string | undefined;
  tooltip: PfAppTooltipProviderProps | undefined;
  toaster: PfAppToasterProps | null | undefined;
};

export const PF_APP_INJECTION_KEY: InjectionKey<
  ComputedRef<PfAppContextValue>
> = Symbol('pfApp');

export function resolvePfAppPortalTarget(
  portal: PfAppPortalProp
): PfAppPortalTarget {
  if (portal === false) return false;
  if (portal === true || portal === undefined) return 'body';
  return portal;
}
