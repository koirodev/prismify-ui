<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useId,
  watchEffect,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import PfInput from '../PfInput/index.vue';
import type { PfButtonAvatarProps } from '../../element/PfButton/index.vue';
import type {
  PfInputColor,
  PfInputUi,
  PfInputVariant,
} from '../PfInput/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export interface PfInputTagsUi extends PfInputUi {
  tags?: string;
  tag?: string;
  tagText?: string;
  tagRemove?: string;
  tagRemoveIcon?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    form?: string;
    modelValue?: unknown[] | null;
    defaultValue?: unknown[];
    placeholder?: string;
    maxlength?: number;
    color?: PfInputColor;
    variant?: PfInputVariant;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    autofocus?: boolean;
    autofocusDelay?: number;
    deleteIcon?: PfIconName;
    highlight?: boolean;
    fixed?: boolean;
    animatedInput?: boolean;
    ui?: PfInputTagsUi;
    addOnPaste?: boolean;
    addOnTab?: boolean;
    addOnBlur?: boolean;
    duplicate?: boolean;
    disabled?: boolean;
    delimiter?: string | RegExp;
    max?: number;
    convertValue?: (value: string) => unknown;
    displayValue?: (value: unknown) => string;
    required?: boolean;
    icon?: PfIconName;
    avatar?: PfButtonAvatarProps;
    leading?: boolean;
    leadingIcon?: PfIconName;
    trailing?: boolean;
    trailingIcon?: PfIconName;
    loading?: boolean;
    loadingIcon?: PfIconName;
    enterKeyHint?:
      | 'search'
      | 'enter'
      | 'done'
      | 'go'
      | 'next'
      | 'previous'
      | 'send';
    autocomplete?: string;
    readonly?: boolean;
    list?: string;
  }>(),
  {
    color: 'primary',
    variant: 'outline',
    size: 'md',
    autofocusDelay: 0,
    deleteIcon: 'crossSmall',
    highlight: false,
    fixed: true,
    animatedInput: true,
    addOnPaste: false,
    addOnTab: false,
    addOnBlur: false,
    duplicate: false,
    disabled: false,
    autocomplete: 'off',
    readonly: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]];
  change: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  invalid: [value: unknown];
  addTag: [value: unknown];
  removeTag: [value: unknown];
}>();

const attrs = useAttrs();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const modelBound = usePfVModelBound();
const localModel = ref<unknown[]>(
  props.defaultValue != null ? [...props.defaultValue] : []
);

const userModel = computed({
  get: () =>
    (modelBound.value
      ? (props.modelValue ?? [])
      : localModel.value) as unknown[],
  set: (v: unknown[]) => {
    if (modelBound.value) {
      emit('update:modelValue', v);
    } else {
      localModel.value = v;
    }
  },
});

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);

const draft = ref('');

const inputComponentRef = ref<InstanceType<typeof PfInput> | null>(null);
const inputRefExpose = shallowRef<HTMLInputElement | null>(null);

watchEffect(() => {
  const inst = inputComponentRef.value as null | {
    inputRef?: { value: HTMLInputElement | null };
  };
  inputRefExpose.value = inst?.inputRef?.value ?? null;
});

defineExpose({
  inputRef: inputRefExpose,
});

function convert(raw: string): unknown {
  return props.convertValue ? props.convertValue(raw) : raw;
}

function display(v: unknown): string {
  return props.displayValue ? props.displayValue(v) : String(v);
}

function tagsEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (
    typeof a === 'object' &&
    a != null &&
    typeof b === 'object' &&
    b != null
  ) {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

function hasDuplicate(next: unknown): boolean {
  return userModel.value.some((x) => tagsEqual(x, next));
}

function splitPaste(text: string): string[] {
  const d = props.delimiter;
  if (d instanceof RegExp) {
    return text
      .split(d)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof d === 'string' && d.length > 0) {
    return text
      .split(d)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return text
    .split(/[\n\r,;\t]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function tryAddFromString(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;

  if (props.maxlength != null && trimmed.length > props.maxlength) {
    emit('invalid', convert(trimmed));
    return false;
  }

  const value = convert(trimmed);

  if (!props.duplicate && hasDuplicate(value)) {
    emit('invalid', value);
    return false;
  }

  if (props.max != null && userModel.value.length >= props.max) {
    emit('invalid', value);
    return false;
  }

  userModel.value = [...userModel.value, value];
  emit('addTag', value);
  emit('change', new Event('change', { bubbles: true }));
  return true;
}

function tryAddDraft() {
  if (tryAddFromString(draft.value)) {
    draft.value = '';
  }
}

function removeAt(index: number) {
  const removed = userModel.value[index];
  const next = [...userModel.value];
  next.splice(index, 1);
  userModel.value = next;
  emit('removeTag', removed);
  emit('change', new Event('change', { bubbles: true }));
}

function onWrapperKeydown(e: KeyboardEvent) {
  if (props.disabled || props.readonly) return;
  const t = e.target as HTMLElement | null;
  if (!t || t.tagName !== 'INPUT') return;

  if (e.key === 'Tab' && props.addOnTab && draft.value.trim()) {
    e.preventDefault();
    tryAddDraft();
    return;
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    tryAddDraft();
    return;
  }

  if (e.key === ',' && !e.isComposing) {
    e.preventDefault();
    tryAddDraft();
    return;
  }

  if (
    e.key === 'Backspace' &&
    draft.value === '' &&
    userModel.value.length > 0
  ) {
    removeAt(userModel.value.length - 1);
  }
}

function onPaste(e: ClipboardEvent) {
  if (!props.addOnPaste || props.disabled || props.readonly) return;
  e.preventDefault();
  const text = e.clipboardData?.getData('text/plain') ?? '';
  const parts = splitPaste(text);
  if (!parts.length) return;

  let added = false;
  for (const p of parts) {
    if (tryAddFromString(p)) {
      added = true;
    }
  }
  if (added) {
    draft.value = '';
  }
}

function onBlur(e: FocusEvent) {
  if (props.addOnBlur && !props.disabled && !props.readonly) {
    tryAddDraft();
  }
  emit('blur', e);
}

function onFocus(e: FocusEvent) {
  emit('focus', e);
}

const hiddenFieldName = computed(() => {
  const n = props.name;
  if (!n) return '';
  return n.endsWith('[]') ? n : `${n}[]`;
});

onMounted(() => {
  if (!props.autofocus) return;
  const d = Math.max(0, Number(props.autofocusDelay) || 0);
  const run = () => {
    const el = inputRefExpose.value;
    el?.focus();
  };
  if (d === 0) void nextTick(run);
  else setTimeout(run, d);
});
</script>

<template>
  <div
    class="pfInputTags"
    :class="attrs.class"
    :aria-required="required ? 'true' : undefined"
  >
    <template v-if="name">
      <input
        v-for="(item, i) in userModel"
        :key="`pfInputTags-hid-${i}`"
        type="hidden"
        :name="hiddenFieldName"
        :value="display(item)"
        :form="form"
        :disabled="disabled"
      />
    </template>
    <PfInput
      :id="inputId"
      ref="inputComponentRef"
      v-model="draft"
      v-bind="passthroughAttrs"
      type="text"
      :placeholder="placeholder"
      :color="color"
      :variant="variant"
      :size="size"
      :disabled="disabled"
      :readonly="readonly"
      :highlight="highlight"
      :fixed="fixed"
      :animated-text="animatedInput"
      :maxlength="maxlength"
      :icon="icon"
      :avatar="avatar"
      :leading="leading"
      :leading-icon="leadingIcon"
      :trailing="trailing"
      :trailing-icon="trailingIcon"
      :loading="loading"
      :loading-icon="loadingIcon"
      :enter-key-hint="enterKeyHint"
      :autocomplete="autocomplete"
      :form="form"
      :list="list"
      :ui="ui"
      @keydown="onWrapperKeydown"
      @paste="onPaste"
      @blur="onBlur"
      @focus="onFocus"
    >
      <div
        v-if="userModel.length"
        class="pfInputTags__tags"
        :class="ui?.tags"
        role="list"
      >
        <span
          v-for="(item, i) in userModel"
          :key="`tag-${i}-${display(item)}`"
          class="pfInputTags__tag"
          :class="ui?.tag"
          role="listitem"
        >
          <span class="pfInputTags__tagText" :class="ui?.tagText">
            <slot name="item-text" :item="item" :index="i">
              {{ display(item) }}
            </slot>
          </span>
          <button
            type="button"
            class="pfInputTags__tagRemove"
            :class="ui?.tagRemove"
            :disabled="disabled || readonly"
            aria-label="Remove"
            @click.stop="removeAt(i)"
          >
            <slot name="item-delete" :item="item" :index="i">
              <PfIcon :name="deleteIcon" size="xs" :class="ui?.tagRemoveIcon" />
            </slot>
          </button>
        </span>
      </div>
    </PfInput>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles/mixins/input-tag-pill' as tagPill;

.pfInputTags {
  max-width: 100%;
  display: inline-flex;
  vertical-align: top;
  box-sizing: border-box;

  /* Container padding (like PfInputMenu__triggerRow); native has no padding — overlays adjusted below. */
  :deep(.pfInput__field) {
    gap: var(--pf-space-sm);
    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    box-sizing: border-box;
  }

  :deep(.pfInput_hasLeading .pfInput__field) {
    padding-inline-start: var(--pf-input-leading-pad);
  }

  :deep(.pfInput_hasTrailing .pfInput__field) {
    padding-inline-end: var(--pf-input-trailing-pad);
  }

  :deep(.pfInput__valueCell) {
    flex: 1 1 6rem;
    min-width: 5rem;
  }

  :deep(.pfInput__placeholder),
  :deep(.pfInput__falling),
  :deep(.pfInput__native) {
    padding: 0 !important;
  }

  :deep(.pfInput__visual) {
    padding-block: 0 !important;
  }

  :deep(.pfInput__visualGutter_start),
  :deep(.pfInput__visualGutter_end) {
    width: 0 !important;
  }

  &__tags {
    @include tagPill.pf-input-tags-cluster;
  }

  &__tag {
    @include tagPill.pf-input-tag-pill;
  }

  &__tagText {
    @include tagPill.pf-input-tag-text;
  }

  &__tagRemove {
    @include tagPill.pf-input-tag-remove;
  }
}
</style>
