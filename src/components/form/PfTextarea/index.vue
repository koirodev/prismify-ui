<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue';
import PfAvatar from '../../element/PfAvatar/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfButtonAvatarProps } from '../../element/PfButton/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfTextareaColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfTextareaVariant =
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'none';

export type PfTextareaUi = Partial<{
  root: string;
  base: string;
  leading: string;
  leadingIcon: string;
  leadingAvatar: string;
  trailing: string;
  trailingIcon: string;
}>;

interface FallingLetter {
  id: number;
  value: string;
  left: number;
  top: number;
  rotate: number;
}

interface BackspaceMeta {
  start: number;
  end: number;
}

interface VisualToken {
  id: number;
  value: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    placeholder?: string;
    color?: PfTextareaColor;
    variant?: PfTextareaVariant;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    required?: boolean;
    autocomplete?: string;
    autofocus?: boolean;
    /** Delay before focus (ms). */
    autofocusDelay?: number;
    disabled?: boolean;
    readonly?: boolean;
    highlight?: boolean;
    fixed?: boolean;
    /**
     * Smooth character appear and “drop” on delete (like `PfInput`).
     * On by default; turn off for a11y and heavy forms.
     */
    animatedText?: boolean;
    /** Grow height to fit content. */
    autoresize?: boolean;
    /** Delay before height recalc (ms). */
    autoresizeDelay?: number;
    /** Default row count. */
    rows?: number;
    /** Max rows when autoresizing; `0` — no limit. */
    maxrows?: number;
    ui?: PfTextareaUi;
    icon?: PfIconName;
    avatar?: PfButtonAvatarProps;
    leading?: boolean;
    leadingIcon?: PfIconName;
    trailing?: boolean;
    trailingIcon?: PfIconName;
    loading?: boolean;
    loadingIcon?: PfIconName;
    maxlength?: number;
    minlength?: number;
    cols?: number;
    dirname?: string;
    form?: string;
    wrap?: string;
  }>(),
  {
    color: 'primary',
    variant: 'outline',
    autocomplete: 'off',
    disabled: false,
    readonly: false,
    highlight: false,
    fixed: true,
    animatedText: true,
    loading: false,
    autoresize: false,
    autoresizeDelay: 0,
    rows: 3,
    maxrows: 0,
    autofocusDelay: 0,
  }
);

const emit = defineEmits<{
  blur: [event: FocusEvent];
  change: [event: Event];
}>();

const modelValue = defineModel<string>({ default: '' });

const attrs = useAttrs();
const slots = useSlots();

const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);

const effectiveSize = computed(
  (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' =>
    props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const characterRefs = ref<(HTMLElement | null)[]>([]);
const fallingLetters = ref<FallingLetter[]>([]);
const pendingBackspace = ref<BackspaceMeta | null>(null);
const visualOffsetX = ref(0);
const visualOffsetY = ref(0);
/** Vertical scrollbar width: `<textarea>` text wraps, overlay should narrow the same way. */
const scrollbarGapPx = ref(0);
const visualTokens = ref<VisualToken[]>([]);
const isFocused = ref(false);

let fallingId = 0;
let visualTokenId = 0;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let focusTimer: ReturnType<typeof setTimeout> | null = null;
let textareaResizeObserver: ResizeObserver | null = null;

const createVisualTokens = (value: string): VisualToken[] =>
  Array.from(value).map((character) => {
    const token: VisualToken = {
      id: visualTokenId,
      value: character,
    };
    visualTokenId += 1;
    return token;
  });

const syncVisualTokens = (nextValue: string) => {
  const previousTokens = visualTokens.value;
  const previousCharacters = previousTokens.map((token) => token.value);
  const nextCharacters = Array.from(nextValue);

  let prefixLength = 0;
  while (
    prefixLength < previousCharacters.length &&
    prefixLength < nextCharacters.length &&
    previousCharacters[prefixLength] === nextCharacters[prefixLength]
  ) {
    prefixLength += 1;
  }

  let previousSuffixIndex = previousCharacters.length - 1;
  let nextSuffixIndex = nextCharacters.length - 1;

  while (
    previousSuffixIndex >= prefixLength &&
    nextSuffixIndex >= prefixLength &&
    previousCharacters[previousSuffixIndex] === nextCharacters[nextSuffixIndex]
  ) {
    previousSuffixIndex -= 1;
    nextSuffixIndex -= 1;
  }

  const keptHead = previousTokens.slice(0, prefixLength);
  const insertedTokens = createVisualTokens(
    nextCharacters.slice(prefixLength, nextSuffixIndex + 1).join('')
  );
  const keptTail = previousTokens.slice(previousSuffixIndex + 1);

  visualTokens.value = [...keptHead, ...insertedTokens, ...keptTail];
};

visualTokens.value = createVisualTokens(modelValue.value ?? '');

const showTextAnimation = computed(() => props.animatedText);

watch(modelValue, async (value) => {
  const nextValue = value ?? '';
  if (showTextAnimation.value) {
    syncVisualTokens(nextValue);
    await nextTick();
    syncOverlayLayout();
  }
  scheduleResize();
});

watch(showTextAnimation, (on) => {
  if (on) {
    visualTokens.value = createVisualTokens(modelValue.value ?? '');
    void nextTick().then(() => {
      syncOverlayLayout();
      scheduleResize();
    });
  }
});

const syncOverlayLayout = () => {
  const el = textareaRef.value;
  if (!el) {
    scrollbarGapPx.value = 0;
    visualOffsetX.value = 0;
    visualOffsetY.value = 0;
    return;
  }
  scrollbarGapPx.value = Math.max(0, el.offsetWidth - el.clientWidth);
  visualOffsetX.value = el.scrollLeft;
  visualOffsetY.value = el.scrollTop;
};

const setCharacterRef = (
  element: Element | ComponentPublicInstance | null,
  index: number
) => {
  characterRefs.value[index] = element instanceof HTMLElement ? element : null;
};

const resetBackspaceMeta = () => {
  pendingBackspace.value = null;
};

const findWordStart = (value: string, cursorPosition: number) => {
  let start = cursorPosition;
  while (start > 0 && /\s/.test(value.charAt(start - 1))) {
    start -= 1;
  }
  while (start > 0 && !/\s/.test(value.charAt(start - 1))) {
    start -= 1;
  }
  return start;
};

const findWordEnd = (value: string, cursorPosition: number) => {
  let end = cursorPosition;
  while (end < value.length && /\s/.test(value.charAt(end))) {
    end += 1;
  }
  while (end < value.length && !/\s/.test(value.charAt(end))) {
    end += 1;
  }
  return end;
};

const createFallingLetters = (source: string, start: number, end: number) => {
  const wrapperElement = wrapperRef.value;
  if (!wrapperElement) return;

  const wrapperRect = wrapperElement.getBoundingClientRect();

  for (let index = start; index < end; index += 1) {
    const character = source.charAt(index);
    const characterElement = characterRefs.value[index];

    if (!character || !characterElement) {
      continue;
    }

    const characterRect = characterElement.getBoundingClientRect();

    fallingLetters.value.push({
      id: fallingId,
      value: character,
      left: characterRect.left - wrapperRect.left,
      top: characterRect.top - wrapperRect.top,
      rotate: Math.floor(Math.random() * 17) - 8,
    });

    fallingId += 1;
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (
    event.isComposing ||
    !showTextAnimation.value ||
    (event.key !== 'Backspace' && event.key !== 'Delete' && event.key !== 'Del')
  ) {
    resetBackspaceMeta();
    return;
  }

  const target = event.target as HTMLTextAreaElement;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? start;
  const isBackspace = event.key === 'Backspace';

  if (start === 0 && end === 0) {
    resetBackspaceMeta();
    return;
  }

  if (end > start) {
    pendingBackspace.value = { start, end };
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    if (isBackspace) {
      pendingBackspace.value = {
        start: findWordStart(target.value, start),
        end: start,
      };
      return;
    }

    pendingBackspace.value = {
      start,
      end: findWordEnd(target.value, start),
    };
    return;
  }

  if (isBackspace && start > 0) {
    pendingBackspace.value = {
      start: start - 1,
      end: start,
    };
    return;
  }

  if (!isBackspace && start < target.value.length) {
    pendingBackspace.value = {
      start,
      end: start + 1,
    };
    return;
  }

  resetBackspaceMeta();
};

const clearResizeTimer = () => {
  if (resizeTimer != null) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
};

const adjustHeight = () => {
  const el = textareaRef.value;
  if (!el || !props.autoresize) return;

  el.style.height = 'auto';

  const styles = getComputedStyle(el);
  let lineHeight = parseFloat(styles.lineHeight);
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    const fontSize = parseFloat(styles.fontSize);
    lineHeight = Number.isFinite(fontSize) ? fontSize * 1.25 : 20;
  }
  const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const borderY =
    parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);

  let target = el.scrollHeight;

  if (props.maxrows > 0 && Number.isFinite(lineHeight) && lineHeight > 0) {
    const maxPx = lineHeight * props.maxrows + padY + borderY;
    if (target > maxPx) {
      target = maxPx;
      el.style.overflowY = 'auto';
    } else {
      el.style.overflowY = 'hidden';
    }
  } else {
    el.style.overflowY = 'hidden';
  }

  el.style.height = `${target}px`;
};

const scheduleResize = () => {
  if (!props.autoresize) return;
  clearResizeTimer();
  const delay = props.autoresizeDelay;
  if (delay <= 0) {
    void nextTick(() => {
      adjustHeight();
      syncOverlayLayout();
    });
    return;
  }
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    adjustHeight();
    syncOverlayLayout();
  }, delay);
};

const onNativeInput = (target: HTMLTextAreaElement) => {
  const previousValue = modelValue.value ?? '';

  if (showTextAnimation.value && pendingBackspace.value) {
    const { start, end } = pendingBackspace.value;
    if (end > start) {
      createFallingLetters(previousValue, start, end);
    }
  }

  const nextValue = target.value;
  if (showTextAnimation.value) {
    syncVisualTokens(nextValue);
  }
  modelValue.value = nextValue;
  syncOverlayLayout();
  resetBackspaceMeta();
  scheduleResize();
};

const onAnimationEnd = (id: number) => {
  fallingLetters.value = fallingLetters.value.filter(
    (letter) => letter.id !== id
  );
};

const onFocus = () => {
  isFocused.value = true;
  syncOverlayLayout();
};

const onBlur = (e: FocusEvent) => {
  isFocused.value = false;
  emit('blur', e);
};

const onChange = (e: Event) => {
  emit('change', e);
};

const showLeadingFromIconProp = computed(() => {
  if (props.icon == null) return false;
  if (props.trailing === true) return false;
  return true;
});

const showTrailingFromIconProp = computed(() => {
  if (props.icon == null) return false;
  return props.trailing === true;
});

const resolvedLeadingIcon = computed((): PfIconName | undefined => {
  if (props.leadingIcon) return props.leadingIcon;
  if (showLeadingFromIconProp.value) return props.icon;
  return undefined;
});

const resolvedTrailingIcon = computed((): PfIconName | undefined => {
  if (props.trailingIcon) return props.trailingIcon;
  if (showTrailingFromIconProp.value) return props.icon;
  return undefined;
});

const loadingOnTrailing = computed(() => props.trailing === true);

const showLeadingSpinner = computed(
  () => props.loading && !loadingOnTrailing.value
);

const showTrailingSpinner = computed(
  () => props.loading && loadingOnTrailing.value
);

const effectiveLeadingIcon = computed(() =>
  showLeadingSpinner.value ? undefined : resolvedLeadingIcon.value
);

const effectiveTrailingIcon = computed(() =>
  showTrailingSpinner.value ? undefined : resolvedTrailingIcon.value
);

const spinnerIcon = computed((): PfIconName => props.loadingIcon ?? 'spinner');

const iconSizeForControl = computed((): PfIconSize => {
  switch (effectiveSize.value) {
    case 'xs':
      return '2xs';
    case 'sm':
      return 'sm';
    case 'md':
      return 'md';
    case 'lg':
      return 'lg';
    case 'xl':
      return 'xl';
    default:
      return 'md';
  }
});

const avatarEmbedSize = computed(() => {
  const map: Record<
    'xs' | 'sm' | 'md' | 'lg' | 'xl',
    PfButtonAvatarProps['size']
  > = {
    xs: '3xs',
    sm: '2xs',
    md: '2xs',
    lg: '2xs',
    xl: 'xs',
  };
  return map[effectiveSize.value];
});

const hasAvatar = computed(() => props.avatar != null);

const hasLeading = computed(
  () =>
    hasAvatar.value ||
    Boolean(effectiveLeadingIcon.value) ||
    showLeadingSpinner.value ||
    slots.leading != null
);

const hasTrailing = computed(
  () =>
    Boolean(effectiveTrailingIcon.value) ||
    showTrailingSpinner.value ||
    slots.trailing != null
);

const avatarBindings = computed(() => {
  const a = props.avatar;
  if (!a) return {};
  return {
    ...a,
    size: a.size ?? avatarEmbedSize.value,
  };
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() => [
  'pfTextarea',
  `pfTextarea_size_${effectiveSize.value}`,
  `pfTextarea_color_${props.color}`,
  `pfTextarea_variant_${props.variant}`,
  hasLeading.value && 'pfTextarea_hasLeading',
  hasTrailing.value && 'pfTextarea_hasTrailing',
  props.disabled && 'pfTextarea_disabled',
  props.highlight && 'pfTextarea_highlight',
  !props.fixed && 'pfTextarea_responsiveText',
  props.autoresize && 'pfTextarea_autoresize',
  showTextAnimation.value && 'pfTextarea_animated',
  attrs.class,
  props.ui?.root,
]);

const nativeClass = computed(() => ['pfTextarea__native', props.ui?.base]);

const showSyntheticPlaceholder = computed(
  () =>
    Boolean(props.placeholder?.length) &&
    showTextAnimation.value &&
    !(modelValue.value != null && modelValue.value.length > 0) &&
    !isFocused.value
);

const inputPlaceholder = computed(() =>
  showSyntheticPlaceholder.value ? '' : (props.placeholder ?? '')
);

const visualGutterStartStyle = computed(() => ({
  width: hasLeading.value
    ? 'var(--pf-input-leading-pad)'
    : 'var(--pf-input-pad-inline)',
}));

const visualGutterEndStyle = computed(() => ({
  width: hasTrailing.value
    ? 'var(--pf-input-trailing-pad)'
    : 'var(--pf-input-pad-inline)',
}));

const visualTrackStyle = computed(() => ({
  transform: `translate(${-visualOffsetX.value}px, ${-visualOffsetY.value}px)`,
}));

watch(
  () => props.autoresize,
  async (on) => {
    const el = textareaRef.value;
    if (!el) return;
    if (!on) {
      el.style.height = '';
      el.style.overflowY = '';
    } else {
      await nextTick();
      adjustHeight();
      syncOverlayLayout();
    }
  }
);

watch(
  () => [props.rows, props.maxrows, effectiveSize.value] as const,
  () => {
    scheduleResize();
  }
);

onMounted(() => {
  void nextTick(() => {
    adjustHeight();
    syncOverlayLayout();
    const el = textareaRef.value;
    if (typeof ResizeObserver !== 'undefined' && el) {
      textareaResizeObserver = new ResizeObserver(() => {
        syncOverlayLayout();
      });
      textareaResizeObserver.observe(el);
    }
    if (props.autofocus && textareaRef.value) {
      const run = () => textareaRef.value?.focus();
      if (props.autofocusDelay > 0) {
        focusTimer = setTimeout(run, props.autofocusDelay);
      } else {
        run();
      }
    }
  });
});

onBeforeUnmount(() => {
  clearResizeTimer();
  if (focusTimer != null) {
    clearTimeout(focusTimer);
    focusTimer = null;
  }
  textareaResizeObserver?.disconnect();
  textareaResizeObserver = null;
});

defineExpose({
  textareaRef,
});
</script>

<template>
  <div
    :class="rootClass"
    :style="{ '--pf-textarea-scrollbar-gap': `${scrollbarGapPx}px` }"
  >
    <div ref="wrapperRef" class="pfTextarea__shell">
      <span
        v-if="hasLeading"
        class="pfTextarea__leading"
        :class="props.ui?.leading"
      >
        <slot name="leading">
          <PfAvatar
            v-if="avatar"
            class="pfTextarea__leadingAvatar"
            :class="props.ui?.leadingAvatar"
            v-bind="avatarBindings"
          />
          <PfIcon
            v-if="showLeadingSpinner"
            class="pfTextarea__iconSpin"
            :class="props.ui?.leadingIcon"
            :name="spinnerIcon"
            :size="iconSizeForControl"
          />
          <PfIcon
            v-else-if="effectiveLeadingIcon"
            :class="props.ui?.leadingIcon"
            :name="effectiveLeadingIcon"
            :size="iconSizeForControl"
          />
        </slot>
      </span>

      <div class="pfTextarea__field">
        <slot />

        <span
          v-if="showSyntheticPlaceholder"
          class="pfTextarea__placeholder"
          aria-hidden="true"
        >
          {{ placeholder }}
        </span>

        <span
          v-if="showTextAnimation"
          class="pfTextarea__visual"
          aria-hidden="true"
        >
          <span
            class="pfTextarea__visualGutter pfTextarea__visualGutter_start"
            :style="visualGutterStartStyle"
            aria-hidden="true"
          />
          <span class="pfTextarea__visualClip">
            <span class="pfTextarea__visualTrack" :style="visualTrackStyle">
              <span class="pfTextarea__visualInner">
                <span
                  v-for="(token, index) in visualTokens"
                  :key="token.id"
                  :ref="(el) => setCharacterRef(el, index)"
                  class="pfTextarea__char"
                >
                  {{ token.value }}
                </span>
              </span>
            </span>
          </span>
          <span
            class="pfTextarea__visualGutter pfTextarea__visualGutter_end"
            :style="visualGutterEndStyle"
            aria-hidden="true"
          />
        </span>

        <span
          v-if="showTextAnimation"
          class="pfTextarea__falling"
          aria-hidden="true"
        >
          <span
            v-for="letter in fallingLetters"
            :key="letter.id"
            class="pfTextarea__fallingChar"
            :style="{
              left: `${letter.left}px`,
              top: `${letter.top}px`,
              '--pf-input-fall-rotate': `${letter.rotate}deg`,
            }"
            @animationend="onAnimationEnd(letter.id)"
          >
            {{ letter.value }}
          </span>
        </span>

        <textarea
          :id="id"
          ref="textareaRef"
          :value="modelValue"
          :class="nativeClass"
          :name="name"
          :placeholder="inputPlaceholder"
          :required="required"
          :rows="rows"
          :autocomplete="autocomplete"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :minlength="minlength"
          :cols="cols"
          :dirname="dirname"
          :form="form"
          :wrap="wrap"
          :aria-busy="loading ? 'true' : undefined"
          v-bind="passthroughAttrs"
          @focus="onFocus"
          @blur="onBlur"
          @change="onChange"
          @click="syncOverlayLayout"
          @scroll="syncOverlayLayout"
          @keydown="onKeydown"
          @input="onNativeInput($event.target as HTMLTextAreaElement)"
        />
      </div>

      <span
        v-if="hasTrailing"
        class="pfTextarea__trailing"
        :class="props.ui?.trailing"
      >
        <slot name="trailing">
          <PfIcon
            v-if="showTrailingSpinner"
            class="pfTextarea__iconSpin"
            :class="props.ui?.trailingIcon"
            :name="spinnerIcon"
            :size="iconSizeForControl"
          />
          <PfIcon
            v-else-if="effectiveTrailingIcon"
            :class="props.ui?.trailingIcon"
            :name="effectiveTrailingIcon"
            :size="iconSizeForControl"
          />
        </slot>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes pfTextarea-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pfTextarea-appearingLetter {
  0% {
    opacity: 0;

    transform: translateY(2px);
  }

  100% {
    opacity: 1;

    transform: translateY(0);
  }
}

@keyframes pfTextarea-fallingLetter {
  0% {
    opacity: 1;

    transform: translateY(0) rotate(0deg);
  }

  100% {
    opacity: 0;

    transform: translateY(13px) rotate(var(--pf-input-fall-rotate, 0deg));
  }
}

.pfTextarea {
  --pf-input-border: var(--pf-border-color);
  --pf-input-muted: var(--pf-color-muted);
  --pf-input-ring: var(--pf-color-primary);
  --pf-input-surface: var(--pf-color-surface);
  --pf-input-text: var(--pf-color-text);
  /** Decorative resize grip color (`mask-image` on `__field::before`). */
  --pf-textarea-resizer-color: var(--pf-input-muted);
  --pf-textarea-scrollbar-gap: 0px;

  max-width: 100%;
  display: inline-flex;
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

  &__shell {
    position: relative;

    width: 100%;
    min-width: 0;
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
  }

  &__leading,
  &__trailing {
    position: absolute;
    z-index: 2;

    padding-top: var(--pf-input-pad-block);
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;

    pointer-events: none;
  }

  &__leading :deep(.pfIcon),
  &__leading :deep(.pfAvatar),
  &__trailing :deep(*) {
    pointer-events: auto;
  }

  &__leading {
    inset-inline-start: 0;

    padding-inline-end: var(--pf-space-xs);
    padding-inline-start: var(--pf-input-pad-inline);
  }

  &__trailing {
    inset-inline-end: 0;

    padding-inline-end: var(--pf-input-pad-inline);
    padding-inline-start: var(--pf-space-xs);
  }

  &__iconSpin {
    animation: pfTextarea-spin 0.8s linear infinite;
  }

  &__field {
    position: relative;

    min-width: 0;
    min-height: 0;
    flex: 1;
    box-sizing: border-box;
  }

  &:not(&_autoresize) &__field::before {
    content: '';

    position: absolute;
    z-index: 4;
    inset-block-end: 2px;
    inset-inline-end: 2px;

    width: 20px;
    height: 20px;

    background-color: var(--pf-textarea-resizer-color);

    pointer-events: none;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M3.41421 16.1427L2 14.7285L14.7279 2.00059L16.1421 3.41481L3.41421 16.1427Z' fill='black'/%3E%3Cpath d='M15.435 9.77877L9.77817 15.4356L8.36396 14.0214L14.0208 8.36455L15.435 9.77877Z' fill='black'/%3E%3C/svg%3E");
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
  }

  &__placeholder {
    position: absolute;
    z-index: 3;
    inset-block: 0;
    inset-inline: 0;

    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    max-width: 100%;

    color: var(--pf-input-muted);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);
    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;

    transition:
      opacity var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing);

    pointer-events: none;
  }

  &__visual {
    inset: 0;
    position: absolute;
    z-index: 1;

    padding-block: var(--pf-input-pad-block);
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    overflow: hidden;

    pointer-events: none;
  }

  &__visualGutter {
    align-self: stretch;
    flex-shrink: 0;
  }

  &__visualClip {
    padding-inline-end: var(--pf-textarea-scrollbar-gap);
    min-width: 0;
    display: flex;
    align-items: flex-start;
    flex: 1;
    box-sizing: border-box;

    overflow: hidden;
  }

  &__visualTrack {
    width: 100%;
    display: block;
    box-sizing: border-box;
  }

  &__visualInner {
    width: 100%;
    display: block;
    box-sizing: border-box;

    color: var(--pf-input-text);
    font-size: var(--pf-input-font-size);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-input-line-height);
    white-space: pre-wrap;
    word-break: normal;
    overflow-wrap: break-word;
  }

  &__falling {
    inset: 0;
    position: absolute;
    z-index: 1;

    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);

    overflow: hidden;

    pointer-events: none;
  }

  &__char {
    display: inline;

    color: var(--pf-input-text);
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;

    animation: pfTextarea-appearingLetter var(--pf-input-char-appear-duration)
      var(--pf-input-char-appear-easing);
  }

  &__fallingChar {
    position: absolute;

    color: var(--pf-input-text);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);
    white-space: pre;

    animation: pfTextarea-fallingLetter var(--pf-input-char-fall-duration)
      var(--pf-input-char-fall-easing) forwards;
    transform-origin: center;
  }

  &__native {
    position: relative;
    z-index: 0;
    margin: 0;

    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    width: 100%;
    min-width: 0;
    display: block;
    box-sizing: border-box;

    color: var(--pf-input-text);
    font-family: inherit;
    font-size: var(--pf-input-font-size);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-input-line-height);
    white-space: pre-wrap;
    word-break: normal;
    overflow-wrap: break-word;

    background: transparent;
    border: none;
    border-radius: inherit;
    outline: none;

    transition:
      color var(--pf-animation-duration) var(--pf-animation-easing),
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing);

    resize: vertical;
    appearance: none;

    &::-webkit-resizer {
      background: transparent;
      border: none;
    }

    &::placeholder {
      color: var(--pf-input-muted);

      opacity: 1;
    }

    &:focus-visible {
      outline: none;
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

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-text-fill-color: transparent;

      transition: background-color 999999s ease-out;
    }
  }

  &_autoresize &__native {
    resize: none;
  }

  &__shell {
    box-shadow: var(--pf-input-shadow);
    background: var(--pf-input-bg);
    border-radius: var(--pf-input-radius);
    outline: var(--pf-input-outline, none);
    outline-offset: 0;

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
      outline-color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__shell:focus-within {
    box-shadow: var(--pf-input-shadow-focus);
    outline: none;
  }

  &_highlight &__shell:not(:focus-within) {
    box-shadow: var(--pf-input-shadow-highlight);
  }

  &_size_xs {
    --pf-input-font-size: var(--pf-font-size-xs);
    --pf-input-leading-pad: 1.75rem;
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 1.75rem;

    &.pfTextarea_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-xs);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_sm {
    --pf-input-font-size: var(--pf-font-size-sm);
    --pf-input-leading-pad: 2rem;
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 2rem;

    &.pfTextarea_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-xs);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_md {
    --pf-input-font-size: var(--pf-font-size-md);
    --pf-input-leading-pad: 2.25rem;
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-sm);
    --pf-input-pad-inline: var(--pf-space-md);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 2.25rem;

    &.pfTextarea_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-sm);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_lg {
    --pf-input-font-size: var(--pf-font-size-md);
    --pf-input-leading-pad: 2.5rem;
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-sm);
    --pf-input-pad-inline: var(--pf-space-lg);
    --pf-input-radius: var(--pf-radius-md);
    --pf-input-trailing-pad: 2.5rem;

    &.pfTextarea_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-sm);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_xl {
    --pf-input-font-size: var(--pf-font-size-lg);
    --pf-input-leading-pad: 2.75rem;
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-md);
    --pf-input-pad-inline: var(--pf-space-lg);
    --pf-input-radius: var(--pf-radius-md);
    --pf-input-trailing-pad: 2.75rem;
  }

  &_responsiveText:not(.pfTextarea_size_xl) {
    @media (width >= 48rem) {
      --pf-input-font-size: var(--pf-input-responsive-font-size);
      --pf-input-line-height: var(--pf-input-responsive-line-height);
    }
  }

  &_hasLeading &__native,
  &_hasLeading &__placeholder,
  &_hasLeading &__falling {
    padding-inline-start: var(--pf-input-leading-pad);
  }

  &_hasTrailing &__native,
  &_hasTrailing &__placeholder,
  &_hasTrailing &__falling {
    padding-inline-end: var(--pf-input-trailing-pad);
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
