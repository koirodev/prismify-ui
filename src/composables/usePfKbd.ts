import { computed, type ComputedRef } from 'vue';

/**
 * Glyphs for special keys (similar to Nuxt UI `kbdKeysMap`).
 * Keys are lowercased for lookup.
 */
export const PF_KBD_GLYPHS: Readonly<Record<string, string>> = {
  win: '⊞',
  command: '⌘',
  shift: '⇧',
  control: '⌃',
  option: '⌥',
  enter: '↵',
  delete: '⌦',
  backspace: '⌫',
  escape: 'Esc',
  tab: '⇥',
  capslock: '⇪',
  arrowup: '↑',
  arrowright: '→',
  arrowdown: '↓',
  arrowleft: '←',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
} as const;

function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Macintosh;/.test(String(navigator.userAgent));
}

/**
 * Display text: literal or special key name (`meta` → ⌘ on macOS, `Ctrl` otherwise).
 */
export function getPfKbdKey(value: string): string {
  const key = value.trim().toLowerCase();
  if (key === 'meta') {
    return isMacOS() ? PF_KBD_GLYPHS.command : 'Ctrl';
  }
  if (key === 'ctrl') {
    return isMacOS() ? PF_KBD_GLYPHS.control : 'Ctrl';
  }
  if (key === 'alt') {
    return isMacOS() ? PF_KBD_GLYPHS.option : 'Alt';
  }
  return PF_KBD_GLYPHS[key] ?? value;
}

export function usePfKbd(): {
  macOS: ComputedRef<boolean>;
  getKbdKey: typeof getPfKbdKey;
} {
  const macOS = computed(() => isMacOS());
  return {
    macOS,
    getKbdKey: getPfKbdKey,
  };
}
