<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';

export type PfPinInputColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfPinInputVariant =
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'none';

export type PfPinInputUi = Partial<{
  root: string;
  base: string;
}>;

interface CellVisual {
  id: number;
  value: string;
}

interface FallingLetter {
  id: number;
  cellIndex: number;
  value: string;
  left: number;
  top: number;
  rotate: number;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    color?: PfPinInputColor;
    variant?: PfPinInputVariant;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    length?: string | number;
    autofocus?: boolean;
    autofocusDelay?: number;
    highlight?: boolean;
    fixed?: boolean;
    /** Smooth character appear and “drop” on delete. On by default. */
    animatedText?: boolean;
    ui?: PfPinInputUi;
    defaultValue?: string | null;
    disabled?: boolean;
    mask?: boolean;
    modelValue?: string | null;
    otp?: boolean;
    placeholder?: string;
    required?: boolean;
    type?: string;
  }>(),
  {
    color: 'primary',
    variant: 'outline',
    length: 5,
    autofocusDelay: 0,
    highlight: false,
    fixed: true,
    animatedText: true,
    disabled: false,
    mask: false,
    otp: false,
    type: 'text',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  complete: [value: string];
  change: [event: Event];
  blur: [event: FocusEvent];
}>();

const attrs = useAttrs();
const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' =>
    props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const cellCount = computed(() => {
  const n = Number(props.length);
  const raw = Number.isFinite(n) ? n : 5;
  return Math.min(32, Math.max(1, Math.floor(raw)));
});

const isControlled = computed(() => props.modelValue !== undefined);

function sliceToCells(s: string): string {
  return s.slice(0, cellCount.value);
}

const localModel = ref('');

function applyExternalValue(raw: string | null | undefined) {
  localModel.value = sliceToCells(
    raw != null && raw !== undefined ? String(raw) : ''
  );
}

watch(
  () => props.modelValue,
  (v) => {
    if (props.modelValue !== undefined) {
      applyExternalValue(v != null ? String(v) : '');
    }
  },
  { immediate: true }
);

watch(cellCount, (len) => {
  if (localModel.value.length > len) {
    localModel.value = localModel.value.slice(0, len);
    emit('update:modelValue', localModel.value);
  }
});

if (!isControlled.value && props.defaultValue != null) {
  applyExternalValue(props.defaultValue);
}

const nativeInputType = computed(() => {
  if (props.mask) return 'password';
  const t = (props.type || 'text').toLowerCase();
  if (t === 'number') return 'text';
  return t;
});

const isNumericMode = computed(
  () => (props.type || 'text').toLowerCase() === 'number'
);

const showTextAnimation = computed(() => {
  if (!props.animatedText) return false;
  if (props.mask) return true;
  const t = (props.type || 'text').toLowerCase();
  return ['text', 'search', 'url', 'tel', 'email', 'number'].includes(t);
});

const inputRefs = ref<(HTMLInputElement | null)[]>([]);
const cellShellRefs = ref<(HTMLElement | null)[]>([]);
const charRefs = ref<(HTMLElement | null)[]>([]);

const cellVisuals = ref<CellVisual[]>([]);
const fallingLetters = ref<FallingLetter[]>([]);
const pendingBackspaceCell = ref<number | null>(null);

let visualId = 0;
let fallingId = 0;

const createCellVisual = (ch: string): CellVisual => ({
  id: visualId++,
  value: ch,
});

const syncCellVisuals = (value: string) => {
  const next: CellVisual[] = [];
  for (let i = 0; i < cellCount.value; i += 1) {
    const ch = value[i] ?? '';
    const prev = cellVisuals.value[i];
    if (prev && prev.value === ch) {
      next.push(prev);
    } else {
      next.push(createCellVisual(ch));
    }
  }
  cellVisuals.value = next;
};

syncCellVisuals(localModel.value);

watch(
  localModel,
  (v) => {
    if (!showTextAnimation.value) return;
    syncCellVisuals(v);
  },
  { flush: 'sync' }
);

watch(showTextAnimation, (on) => {
  if (on) syncCellVisuals(localModel.value);
});

const displayChar = (ch: string) => {
  if (!props.mask) return ch;
  return ch ? '•' : '';
};

const setCharRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  charRefs.value[index] = el instanceof HTMLElement ? el : null;
};

const setCellShellRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  cellShellRefs.value[index] = el instanceof HTMLElement ? el : null;
};

const setInputRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  inputRefs.value[index] = el instanceof HTMLInputElement ? el : null;
};

const commit = (next: string, event?: Event) => {
  const sliced = sliceToCells(next);
  const prev = localModel.value;
  localModel.value = sliced;
  emit('update:modelValue', sliced);
  if (event) emit('change', event);
  if (sliced.length === cellCount.value && prev.length < cellCount.value) {
    emit('complete', sliced);
  }
};

const filterChar = (ch: string): string => {
  if (!ch) return '';
  if (isNumericMode.value) {
    return /\d/.test(ch) ? ch : '';
  }
  return ch.slice(0, 1);
};

const createFallingForCell = (cellIndex: number, character: string) => {
  const shell = cellShellRefs.value[cellIndex];
  const charEl = charRefs.value[cellIndex];
  if (!shell || !character) return;
  const shellRect = shell.getBoundingClientRect();
  const charRect = charEl?.getBoundingClientRect();
  const left = charRect
    ? charRect.left - shellRect.left + charRect.width / 2
    : shellRect.width / 2;
  const top = charRect ? charRect.top - shellRect.top : shellRect.height * 0.15;
  fallingLetters.value.push({
    id: fallingId++,
    cellIndex,
    value: props.mask ? '•' : character,
    left,
    top,
    rotate: Math.floor(Math.random() * 17) - 8,
  });
};

const onAnimationEnd = (id: number) => {
  fallingLetters.value = fallingLetters.value.filter((l) => l.id !== id);
};

const onCellKeydown = (index: number, e: KeyboardEvent) => {
  if (e.isComposing) return;
  const input = e.target as HTMLInputElement;

  if (e.key === 'Backspace' || e.key === 'Delete') {
    const selStart = input.selectionStart ?? 0;
    const selEnd = input.selectionEnd ?? selStart;

    if (e.key === 'Backspace' && input.value.length > 0) {
      /** Single-char cell with caret at start: native Backspace does not delete the char “after” the caret. */
      const caretAtStartNoSelection = selStart === 0 && selEnd === 0;
      if (caretAtStartNoSelection) {
        e.preventDefault();
        const removed = localModel.value[index] ?? input.value[0] ?? '';
        const next =
          localModel.value.slice(0, index) + localModel.value.slice(index + 1);
        if (showTextAnimation.value && removed) {
          void nextTick().then(() => {
            createFallingForCell(index, removed);
            commit(next, e);
          });
        } else {
          commit(next, e);
        }
        return;
      }
    }

    if (input.value.length > 0 && showTextAnimation.value) {
      pendingBackspaceCell.value = index;
    }
    if (e.key === 'Backspace' && input.value === '' && index > 0) {
      e.preventDefault();
      const prevVal = localModel.value;
      if (index - 1 < prevVal.length) {
        const removed = prevVal[index - 1]!;
        const next = prevVal.slice(0, index - 1) + prevVal.slice(index);
        if (showTextAnimation.value && removed) {
          void nextTick().then(() => {
            createFallingForCell(index - 1, removed);
            commit(next);
            void nextTick(() => inputRefs.value[index - 1]?.focus());
          });
        } else {
          commit(next);
          void nextTick(() => inputRefs.value[index - 1]?.focus());
        }
      } else {
        inputRefs.value[index - 1]?.focus();
      }
    }
    return;
  }

  if (e.key === 'ArrowLeft' && index > 0) {
    e.preventDefault();
    inputRefs.value[index - 1]?.focus();
    return;
  }
  if (e.key === 'ArrowRight' && index < cellCount.value - 1) {
    e.preventDefault();
    inputRefs.value[index + 1]?.focus();
  }
};

const onCellInput = (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  let raw = target.value;

  if (isNumericMode.value) {
    raw = raw.replace(/\D/g, '');
  }

  if (raw.length > 1) {
    const chars = Array.from(raw)
      .map((c) => filterChar(c))
      .filter(Boolean);
    distributeFromIndex(index, chars, e);
    return;
  }

  const ch = filterChar(raw);

  if (pendingBackspaceCell.value === index && showTextAnimation.value) {
    const removed = localModel.value[index] ?? '';
    if (removed) {
      createFallingForCell(index, removed);
    }
    pendingBackspaceCell.value = null;
  }

  const prev = localModel.value;
  let next = prev.slice(0, index) + ch + prev.slice(index + 1);
  next = sliceToCells(next);
  commit(next, e);

  if (ch && index < cellCount.value - 1) {
    void nextTick(() => inputRefs.value[index + 1]?.focus());
  }

  void nextTick(() => {
    target.value = next[index] ?? '';
  });
};

const distributeFromIndex = (startIndex: number, chars: string[], e: Event) => {
  const parts = localModel.value.split('');
  while (parts.length < cellCount.value) {
    parts.push('');
  }
  let write = startIndex;
  for (const c of chars) {
    if (write >= cellCount.value) break;
    const fc = filterChar(c);
    if (!fc) continue;
    parts[write] = fc;
    write += 1;
  }
  const next = sliceToCells(parts.join(''));
  commit(next, e);
  const focusIndex = Math.min(write, cellCount.value - 1);
  void nextTick(() => {
    for (let k = 0; k < cellCount.value; k += 1) {
      const inp = inputRefs.value[k];
      if (inp) inp.value = next[k] ?? '';
    }
    inputRefs.value[focusIndex]?.focus();
  });
};

const onPaste = (index: number, e: ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') ?? '';
  const chars = Array.from(text)
    .map((c) => filterChar(c))
    .filter(Boolean);
  if (!chars.length) return;
  distributeFromIndex(index, chars, e);
};

const onCellFocus = () => {
  pendingBackspaceCell.value = null;
};

const onRootFocusOut = (e: FocusEvent) => {
  const root = e.currentTarget as HTMLElement;
  const next = e.relatedTarget as Node | null;
  if (!next || !root.contains(next)) {
    emit('blur', e);
  }
};

const rootClass = computed(() => [
  'pfPinInput',
  `pfPinInput_size_${effectiveSize.value}`,
  `pfPinInput_color_${props.color}`,
  `pfPinInput_variant_${props.variant}`,
  props.disabled && 'pfPinInput_disabled',
  props.highlight && 'pfPinInput_highlight',
  !props.fixed && 'pfPinInput_responsiveText',
  showTextAnimation.value && 'pfPinInput_animated',
  attrs.class,
  props.ui?.root,
]);

const baseUiClass = computed(() => props.ui?.base ?? '');

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const inputAutocomplete = (index: number) => {
  if (props.otp && index === 0) return 'one-time-code';
  return 'off';
};

const inputMode = computed(() =>
  isNumericMode.value || props.otp ? 'numeric' : undefined
);

const inputPattern = computed(() =>
  isNumericMode.value ? '[0-9]*' : undefined
);

const inputId = (index: number) =>
  props.id ? (index === 0 ? props.id : `${props.id}-${index}`) : undefined;

onMounted(() => {
  if (props.autofocus) {
    const delay = props.autofocusDelay ?? 0;
    window.setTimeout(() => {
      inputRefs.value[0]?.focus();
    }, delay);
  }
});

defineExpose({
  /** Native `<input>` cells (by index). */
  inputsRef: inputRefs,
});
</script>

<template>
  <div :class="rootClass" v-bind="passthroughAttrs" @focusout="onRootFocusOut">
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="localModel"
      :disabled="disabled"
      :required="required"
    />
    <div v-for="i in cellCount" :key="i - 1" class="pfPinInput__cellWrap">
      <div
        :ref="(el) => setCellShellRef(el, i - 1)"
        class="pfPinInput__cellShell"
      >
        <div class="pfPinInput__cellField">
          <span
            v-if="showTextAnimation"
            class="pfPinInput__visual"
            aria-hidden="true"
          >
            <span
              v-if="cellVisuals[i - 1]?.value"
              :key="cellVisuals[i - 1]!.id"
              :ref="(el) => setCharRef(el, i - 1)"
              class="pfPinInput__char"
            >
              {{ displayChar(cellVisuals[i - 1]!.value) }}
            </span>
          </span>

          <span
            v-if="showTextAnimation"
            class="pfPinInput__falling"
            aria-hidden="true"
          >
            <span
              v-for="letter in fallingLetters.filter(
                (l) => l.cellIndex === i - 1
              )"
              :key="letter.id"
              class="pfPinInput__fallingChar"
              :style="{
                left: `${letter.left}px`,
                top: `${letter.top}px`,
                '--pf-input-fall-rotate': `${letter.rotate}deg`,
              }"
              @animationend="onAnimationEnd(letter.id)"
            >
              {{ letter.value === ' ' ? '\u00A0' : letter.value }}
            </span>
          </span>

          <input
            :id="inputId(i - 1)"
            :ref="(el) => setInputRef(el, i - 1)"
            class="pfPinInput__native"
            :class="baseUiClass"
            :type="nativeInputType"
            :value="localModel[i - 1] ?? ''"
            :maxlength="1"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required && !name && i === 1"
            :autocomplete="inputAutocomplete(i - 1)"
            :inputmode="inputMode"
            :pattern="inputPattern"
            @input="onCellInput(i - 1, $event)"
            @keydown="onCellKeydown(i - 1, $event)"
            @paste="onPaste(i - 1, $event)"
            @focus="onCellFocus"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes pfPinInput-appearingLetter {
  0% {
    opacity: 0;

    transform: translateY(2px);
  }

  100% {
    opacity: 1;

    transform: translateY(0);
  }
}

@keyframes pfPinInput-fallingLetter {
  0% {
    opacity: 1;

    transform: translateY(0) rotate(0deg);
  }

  100% {
    opacity: 0;

    transform: translateY(13px) rotate(var(--pf-input-fall-rotate, 0deg));
  }
}

.pfPinInput {
  --pf-input-border: var(--pf-border-color);
  --pf-input-muted: var(--pf-color-muted);
  --pf-input-ring: var(--pf-color-primary);
  --pf-input-surface: var(--pf-color-surface);
  --pf-input-text: var(--pf-color-text);
  --pf-pin-cell-size: 2rem;
  --pf-pin-font-size: var(--pf-font-size-md);
  --pf-pin-gap: var(--pf-space-xs);
  --pf-pin-line-height: var(--pf-line-height-md);
  --pf-pin-pad-block: var(--pf-space-xs);
  --pf-pin-pad-inline: 0;
  --pf-pin-radius: var(--pf-radius-sm);

  position: relative;

  display: inline-flex;
  align-items: center;
  gap: var(--pf-pin-gap);
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing);

  &_color_primary {
    --pf-input-ring: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-input-ring: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-input-ring: var(--pf-color-success);
  }

  &_color_info {
    --pf-input-ring: var(--pf-color-info);
  }

  &_color_warning {
    --pf-input-ring: var(--pf-color-warning);
  }

  &_color_error {
    --pf-input-ring: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-input-ring: var(--pf-color-neutral);
  }

  &_disabled {
    opacity: 0.55;
  }

  &_disabled &__native {
    cursor: not-allowed;
  }

  &_size_xs {
    --pf-pin-cell-size: 1.5rem;
    --pf-pin-font-size: var(--pf-font-size-xs);
    --pf-pin-line-height: var(--pf-line-height-sm);
    --pf-pin-pad-block: var(--pf-space-xs);
    --pf-pin-radius: var(--pf-radius-sm);
    --pf-pin-responsive-font-size: var(--pf-font-size-xs);
    --pf-pin-responsive-line-height: var(--pf-line-height-sm);
  }

  &_size_sm {
    --pf-pin-cell-size: 1.75rem;
    --pf-pin-font-size: var(--pf-font-size-sm);
    --pf-pin-line-height: var(--pf-line-height-sm);
    --pf-pin-pad-block: var(--pf-space-xs);
    --pf-pin-radius: var(--pf-radius-sm);
    --pf-pin-responsive-font-size: var(--pf-font-size-xs);
    --pf-pin-responsive-line-height: var(--pf-line-height-sm);
  }

  &_size_md {
    --pf-pin-cell-size: 2rem;
    --pf-pin-font-size: var(--pf-font-size-md);
    --pf-pin-line-height: var(--pf-line-height-md);
    --pf-pin-pad-block: var(--pf-space-xs);
    --pf-pin-radius: var(--pf-radius-sm);
    --pf-pin-responsive-font-size: var(--pf-font-size-sm);
    --pf-pin-responsive-line-height: var(--pf-line-height-sm);
  }

  &_size_lg {
    --pf-pin-cell-size: 2.25rem;
    --pf-pin-font-size: var(--pf-font-size-md);
    --pf-pin-line-height: var(--pf-line-height-md);
    --pf-pin-pad-block: var(--pf-space-sm);
    --pf-pin-radius: var(--pf-radius-md);
    --pf-pin-responsive-font-size: var(--pf-font-size-sm);
    --pf-pin-responsive-line-height: var(--pf-line-height-sm);
  }

  &_size_xl {
    --pf-pin-cell-size: 2.5rem;
    --pf-pin-font-size: var(--pf-font-size-lg);
    --pf-pin-line-height: var(--pf-line-height-md);
    --pf-pin-pad-block: var(--pf-space-sm);
    --pf-pin-radius: var(--pf-radius-md);
  }

  &_responsiveText:not(.pfPinInput_size_xl) {
    @media (width >= 48rem) {
      --pf-pin-font-size: var(--pf-pin-responsive-font-size);
      --pf-pin-line-height: var(--pf-pin-responsive-line-height);
    }
  }

  &__cellWrap {
    display: flex;
    flex-shrink: 0;
  }

  &__cellShell {
    position: relative;

    width: var(--pf-pin-cell-size);
    min-width: var(--pf-pin-cell-size);
    box-sizing: border-box;

    box-shadow: var(--pf-input-shadow);
    background: var(--pf-input-bg);
    border-radius: var(--pf-pin-radius);
    outline: var(--pf-input-outline, none);
    outline-offset: 0;

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
      outline-color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__cellShell:focus-within {
    box-shadow: var(--pf-input-shadow-focus);
    outline: none;
  }

  &_highlight &__cellShell:not(:focus-within) {
    box-shadow: var(--pf-input-shadow-highlight);
  }

  &__cellField {
    position: relative;

    width: 100%;
    min-height: var(--pf-pin-cell-size);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  &__visual {
    inset: 0;
    position: absolute;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    pointer-events: none;
  }

  &__char {
    color: var(--pf-input-text);
    font-size: var(--pf-pin-font-size);
    line-height: var(--pf-pin-line-height);
    white-space: pre;

    animation: pfPinInput-appearingLetter var(--pf-input-char-appear-duration)
      var(--pf-input-char-appear-easing);
  }

  &__falling {
    inset: 0;
    position: absolute;
    z-index: 1;

    overflow: hidden;

    pointer-events: none;
  }

  &__fallingChar {
    position: absolute;
    margin-inline-start: -0.35em;

    color: var(--pf-input-text);
    font-size: var(--pf-pin-font-size);
    line-height: var(--pf-pin-line-height);
    white-space: pre;

    animation: pfPinInput-fallingLetter var(--pf-input-char-fall-duration)
      var(--pf-input-char-fall-easing) forwards;
    transform-origin: center;
  }

  &__native {
    position: relative;
    z-index: 0;
    margin: 0;

    padding-block: var(--pf-pin-pad-block);
    padding-inline: var(--pf-pin-pad-inline);
    width: 100%;
    min-width: 0;
    box-sizing: border-box;

    color: var(--pf-input-text);
    font-family: inherit;
    font-size: var(--pf-pin-font-size);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-pin-line-height);
    text-align: center;

    background: transparent;
    border: none;
    border-radius: inherit;
    outline: none;

    transition:
      color var(--pf-animation-duration) var(--pf-animation-easing),
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing);

    appearance: none;

    &::placeholder {
      color: var(--pf-input-muted);

      opacity: 1;
    }

    &:focus-visible {
      outline: none;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      box-shadow: none;
      background: transparent;
      background-color: transparent;
      background-image: none;
      background-clip: text;
      -webkit-text-fill-color: var(--input-color);

      transition: background-color 99999999s ease-out;
    }
  }

  &_animated &__native {
    color: transparent;

    -webkit-text-fill-color: transparent;

    caret-color: var(--pf-input-text);

    &::placeholder {
      color: transparent;

      -webkit-text-fill-color: transparent;
      opacity: 0;
    }

    &::selection {
      color: var(--pf-input-surface);

      background-color: var(--pf-input-ring);
    }
  }

  &_variant_outline {
    --pf-input-bg: var(--pf-input-surface);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border);
    --pf-input-shadow-focus:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-ring) 40%, transparent);
  }

  &_variant_soft {
    --pf-input-bg: color-mix(in srgb, var(--pf-input-muted) 10%, transparent);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) transparent;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_variant_subtle {
    --pf-input-bg: color-mix(in srgb, var(--pf-input-muted) 8%, transparent);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border);
    --pf-input-shadow-focus:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-ring) 40%, transparent);
  }

  &_variant_ghost {
    --pf-input-bg: transparent;
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) transparent;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_variant_none {
    --pf-input-bg: transparent;
    --pf-input-shadow: none;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &:focus-within {
    z-index: 1;
  }
}
</style>
