<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import {
  computed,
  inject,
  nextTick,
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

export type PfInputColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfInputVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none';

export type PfInputUi = Partial<{
  root: string;
  base: string;
  valueCell: string;
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
    type?: string;
    placeholder?: string;
    color?: PfInputColor;
    variant?: PfInputVariant;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    required?: boolean;
    autocomplete?: string;
    autofocus?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    highlight?: boolean;
    /** If `false`, font size steps down slightly on wide viewports (Nuxt UI `fixed: false` style). */
    fixed?: boolean;
    /** Smooth character appear and “drop” on delete (text types only). On by default. */
    animatedText?: boolean;
    ui?: PfInputUi;
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
    pattern?: string;
    list?: string;
    form?: string;
    enterKeyHint?:
      | 'search'
      | 'enter'
      | 'done'
      | 'go'
      | 'next'
      | 'previous'
      | 'send';
    /** Native input attrs (step, min, max, etc.) are passed through `v-bind` to `<input>`. */
  }>(),
  {
    type: 'text',
    color: 'primary',
    variant: 'outline',
    autocomplete: 'off',
    disabled: false,
    readonly: false,
    highlight: false,
    fixed: true,
    animatedText: true,
    loading: false,
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

const inputRef = ref<HTMLInputElement | null>(null);
const valueCellRef = ref<HTMLElement | null>(null);
const characterRefs = ref<(HTMLElement | null)[]>([]);
const fallingLetters = ref<FallingLetter[]>([]);
const pendingBackspace = ref<BackspaceMeta | null>(null);
const visualOffset = ref(0);
const visualTokens = ref<VisualToken[]>([]);

const isFocused = ref(false);

let fallingId = 0;
let visualTokenId = 0;

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

visualTokens.value = createVisualTokens(modelValue.value);

const isAnimatedType = computed(() => {
  const t = (props.type || 'text').toLowerCase();
  return ['text', 'search', 'url', 'tel', 'email'].includes(t);
});

const showTextAnimation = computed(
  () => props.animatedText && isAnimatedType.value
);

watch(modelValue, async (value) => {
  const nextValue = value ?? '';
  if (!showTextAnimation.value) return;
  syncVisualTokens(nextValue);
  await nextTick();
  syncVisualOffset();
});

watch(showTextAnimation, (on) => {
  if (on) {
    visualTokens.value = createVisualTokens(modelValue.value ?? '');
    void nextTick().then(() => syncVisualOffset());
  }
});

const syncVisualOffset = () => {
  visualOffset.value = inputRef.value?.scrollLeft ?? 0;
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
  const cell = valueCellRef.value;
  if (!cell) return;

  const cellRect = cell.getBoundingClientRect();

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
      left: characterRect.left - cellRect.left,
      top: characterRect.top - cellRect.top,
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

  const target = event.target as HTMLInputElement;
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

const onInput = (target: HTMLInputElement) => {
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
  syncVisualOffset();
  resetBackspaceMeta();
};

const onAnimationEnd = (id: number) => {
  fallingLetters.value = fallingLetters.value.filter(
    (letter) => letter.id !== id
  );
};

const onFocus = () => {
  isFocused.value = true;
  syncVisualOffset();
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

const iconSizeForInput = computed((): PfIconSize => {
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
  'pfInput',
  `pfInput_size_${effectiveSize.value}`,
  `pfInput_color_${props.color}`,
  `pfInput_variant_${props.variant}`,
  hasLeading.value && 'pfInput_hasLeading',
  hasTrailing.value && 'pfInput_hasTrailing',
  props.disabled && 'pfInput_disabled',
  props.highlight && 'pfInput_highlight',
  !props.fixed && 'pfInput_responsiveText',
  showTextAnimation.value && 'pfInput_animated',
  attrs.class,
  props.ui?.root,
]);

const nativeClass = computed(() => ['pfInput__native', props.ui?.base]);

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

/** Columns left/right of text area: track `translateX` does not go under icons. */
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

defineExpose({
  inputRef,
});
</script>

<template>
  <div :class="rootClass">
    <div class="pfInput__shell">
      <span
        v-if="hasLeading"
        class="pfInput__leading"
        :class="props.ui?.leading"
      >
        <slot name="leading">
          <PfAvatar
            v-if="avatar"
            class="pfInput__leadingAvatar"
            :class="props.ui?.leadingAvatar"
            v-bind="avatarBindings"
          />
          <PfIcon
            v-if="showLeadingSpinner"
            class="pfInput__iconSpin"
            :class="props.ui?.leadingIcon"
            :name="spinnerIcon"
            :size="iconSizeForInput"
          />
          <PfIcon
            v-else-if="effectiveLeadingIcon"
            :class="props.ui?.leadingIcon"
            :name="effectiveLeadingIcon"
            :size="iconSizeForInput"
          />
        </slot>
      </span>

      <div class="pfInput__field">
        <slot />

        <div
          ref="valueCellRef"
          class="pfInput__valueCell"
          :class="props.ui?.valueCell"
        >
          <span
            v-if="showSyntheticPlaceholder"
            class="pfInput__placeholder"
            aria-hidden="true"
          >
            {{ placeholder }}
          </span>

          <span
            v-if="showTextAnimation"
            class="pfInput__visual"
            aria-hidden="true"
          >
            <span
              class="pfInput__visualGutter pfInput__visualGutter_start"
              :style="visualGutterStartStyle"
              aria-hidden="true"
            />
            <span class="pfInput__visualClip">
              <span
                class="pfInput__visualTrack"
                :style="{ transform: `translateX(-${visualOffset}px)` }"
              >
                <span
                  v-for="(token, index) in visualTokens"
                  :key="token.id"
                  :ref="(el) => setCharacterRef(el, index)"
                  class="pfInput__char"
                >
                  {{ token.value === ' ' ? '\u00A0' : token.value }}
                </span>
              </span>
            </span>
            <span
              class="pfInput__visualGutter pfInput__visualGutter_end"
              :style="visualGutterEndStyle"
              aria-hidden="true"
            />
          </span>

          <span
            v-if="showTextAnimation"
            class="pfInput__falling"
            aria-hidden="true"
          >
            <span
              v-for="letter in fallingLetters"
              :key="letter.id"
              class="pfInput__fallingChar"
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
            :id="id"
            ref="inputRef"
            :value="modelValue"
            :class="nativeClass"
            :type="type"
            :name="name"
            :placeholder="inputPlaceholder"
            :required="required"
            :autocomplete="autocomplete"
            :autofocus="autofocus"
            :disabled="disabled"
            :readonly="readonly"
            :maxlength="maxlength"
            :minlength="minlength"
            :pattern="pattern"
            :list="list"
            :form="form"
            :enterkeyhint="enterKeyHint"
            :aria-busy="loading ? 'true' : undefined"
            v-bind="passthroughAttrs"
            @focus="onFocus"
            @blur="onBlur"
            @change="onChange"
            @click="syncVisualOffset"
            @keydown="onKeydown"
            @scroll="syncVisualOffset"
            @input="onInput($event.target as HTMLInputElement)"
          />
        </div>
      </div>

      <span
        v-if="hasTrailing"
        class="pfInput__trailing"
        :class="props.ui?.trailing"
      >
        <slot name="trailing">
          <PfIcon
            v-if="showTrailingSpinner"
            class="pfInput__iconSpin"
            :class="props.ui?.trailingIcon"
            :name="spinnerIcon"
            :size="iconSizeForInput"
          />
          <PfIcon
            v-else-if="effectiveTrailingIcon"
            :class="props.ui?.trailingIcon"
            :name="effectiveTrailingIcon"
            :size="iconSizeForInput"
          />
        </slot>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes pfInput-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pfInput-appearingLetter {
  0% {
    opacity: 0;

    transform: translateY(2px);
  }

  100% {
    opacity: 1;

    transform: translateY(0);
  }
}

@keyframes pfInput-fallingLetter {
  0% {
    opacity: 1;

    transform: translateY(0) rotate(0deg);
  }

  100% {
    opacity: 0;

    transform: translateY(13px) rotate(var(--pf-input-fall-rotate, 0deg));
  }
}

.pfInput {
  --pf-input-border: var(--pf-border-color);
  --pf-input-muted: var(--pf-color-muted);
  --pf-input-ring: var(--pf-color-primary);
  --pf-input-surface: var(--pf-color-surface);
  --pf-input-text: var(--pf-color-text);

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

    display: flex;
    align-items: center;
    flex-shrink: 0;

    pointer-events: none;
  }

  &__leading :deep(.pfIcon),
  &__leading :deep(.pfAvatar),
  &__trailing :deep(*) {
    pointer-events: auto;
  }

  &__leading {
    inset-block: 0;
    inset-inline-start: 0;

    padding-inline-end: var(--pf-space-xs);
    padding-inline-start: var(--pf-input-pad-inline);
  }

  &__trailing {
    inset-block: 0;
    inset-inline-end: 0;

    padding-inline-end: var(--pf-input-pad-inline);
    padding-inline-start: var(--pf-space-xs);
  }

  &__iconSpin {
    animation: pfInput-spin 0.8s linear infinite;
  }

  &__field {
    position: relative;

    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    flex: 1;
    flex-flow: row wrap;
    box-sizing: border-box;
  }

  &__valueCell {
    position: relative;

    min-width: 0;
    min-height: 0;
    display: flex;
    flex: 1 1 0%;
    box-sizing: border-box;
  }

  &__placeholder {
    position: absolute;
    z-index: 3;
    inset-block: 0;
    inset-inline-start: 0;

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
    align-items: center;

    overflow: hidden;

    pointer-events: none;
  }

  &__visualGutter {
    align-self: stretch;
    flex-shrink: 0;
  }

  &__visualClip {
    min-width: 0;
    display: flex;
    align-items: center;
    flex: 1;

    overflow: hidden;
  }

  &__visualTrack {
    width: max-content;
    display: flex;
    align-items: center;
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
    color: var(--pf-input-text);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);
    white-space: pre;

    animation: pfInput-appearingLetter var(--pf-input-char-appear-duration)
      var(--pf-input-char-appear-easing);
  }

  &__fallingChar {
    position: absolute;

    color: var(--pf-input-text);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);
    white-space: pre;

    animation: pfInput-fallingLetter var(--pf-input-char-fall-duration)
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
    box-sizing: border-box;

    color: var(--pf-input-text);
    font-family: inherit;
    font-size: var(--pf-input-font-size);
    font-weight: var(--pf-font-weight-normal);
    line-height: var(--pf-input-line-height);

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

    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      display: none;
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

    &[type='number'] {
      appearance: textfield;
    }

    &[type='number']::-webkit-outer-spin-button,
    &[type='number']::-webkit-inner-spin-button {
      margin: 0;

      appearance: none;
    }

    &[type='file'] {
      cursor: pointer;
    }

    &[type='file']::file-selector-button {
      margin-inline-end: var(--pf-space-sm);

      padding: var(--pf-space-xs) var(--pf-space-sm);

      color: var(--pf-input-text);
      font-family: inherit;
      font-size: var(--pf-font-size-xs);
      font-weight: var(--pf-font-weight-medium);

      background: color-mix(in srgb, var(--pf-input-muted) 12%, transparent);
      border: none;
      border-radius: var(--pf-radius-sm);

      transition: background-color var(--pf-animation-duration)
        var(--pf-animation-easing);

      cursor: pointer;
    }

    &[type='file']::file-selector-button:hover {
      background: color-mix(in srgb, var(--pf-input-muted) 20%, transparent);
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

  /* sizes */
  &_size_xs {
    --pf-input-font-size: var(--pf-font-size-xs);
    --pf-input-leading-pad: 1.75rem;
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 1.75rem;

    &.pfInput_responsiveText {
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

    &.pfInput_responsiveText {
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

    &.pfInput_responsiveText {
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

    &.pfInput_responsiveText {
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

  &_responsiveText:not(.pfInput_size_xl) {
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
