import { computed, getCurrentInstance } from 'vue';

/**
 * `v-model` that starts as `undefined` (e.g. radio “none selected”) must stay
 * controlled; otherwise each instance falls back to its own `localModel`.
 */
export function usePfVModelBound() {
  return computed(() => {
    const p = getCurrentInstance()?.vnode.props as
      | Record<string, unknown>
      | undefined;
    return (
      p != null &&
      (typeof p['onUpdate:modelValue'] === 'function' ||
        typeof p['onUpdateModelValue'] === 'function')
    );
  });
}
