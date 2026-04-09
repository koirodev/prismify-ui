import { computed, inject, type ComputedRef } from 'vue';
import {
  PF_APP_INJECTION_KEY,
  type PfAppContextValue,
} from '../components/layout/PfApp/injection';

function defaultContext(): PfAppContextValue {
  return {
    locale: undefined,
    dir: undefined,
    portalTarget: 'body',
    scrollBody: undefined,
    nonce: undefined,
    tooltip: undefined,
    toaster: undefined,
  };
}

/**
 * Global app context from the nearest `PfApp`.
 * Outside `PfApp`, defaults are used (`portalTarget: 'body'`).
 */
export function usePfApp(): ComputedRef<PfAppContextValue> {
  const injected = inject(PF_APP_INJECTION_KEY, null);
  if (injected) return injected;
  return computed(defaultContext);
}
