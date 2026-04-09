import { computed, ref, type ComputedRef, type Ref } from 'vue';

const pfContentSearchOpen = ref(false);
const pfContentSearchTerm = ref('');

export interface PfContentSearchState {
  isOpen: Ref<boolean>;
  searchTerm: Ref<string>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchTerm: (value: string) => void;
  hasSearchTerm: ComputedRef<boolean>;
}

export function usePfContentSearch(): PfContentSearchState {
  function open() {
    pfContentSearchOpen.value = true;
  }

  function close() {
    pfContentSearchOpen.value = false;
  }

  function toggle() {
    pfContentSearchOpen.value = !pfContentSearchOpen.value;
  }

  function setSearchTerm(value: string) {
    pfContentSearchTerm.value = value;
  }

  const hasSearchTerm = computed(
    () => pfContentSearchTerm.value.trim().length > 0
  );

  return {
    isOpen: pfContentSearchOpen,
    searchTerm: pfContentSearchTerm,
    open,
    close,
    toggle,
    setSearchTerm,
    hasSearchTerm,
  };
}
