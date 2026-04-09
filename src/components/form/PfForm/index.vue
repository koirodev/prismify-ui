<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  readonly,
  ref,
  useAttrs,
  useId,
} from 'vue';
import {
  PF_FORM_INJECTION_KEY,
  type PfFormContextValue,
  type PfFormError,
  type PfFormInputEvent,
  type PfFormValidateOptions,
} from './injection';
import {
  filterErrorsByName,
  runCustomValidation,
  runSchemaValidation,
} from './validation';

export type PfFormSubmitEvent<T = unknown> = {
  data: T;
};

export type PfFormErrorEvent = {
  errors: PfFormError[];
};

export type PfFormUi = Partial<{
  base: string;
}>;

type NestedFormEntry = {
  validate: (opts?: PfFormValidateOptions) => Promise<unknown>;
  clear: (path?: string | RegExp) => void;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string | number;
    schema?: unknown;
    state?: Record<string, unknown>;
    validate?:
      | ((
          state: Record<string, unknown>
        ) => PfFormError[] | Promise<PfFormError[]>)
      | undefined;
    validateOn?: PfFormInputEvent[];
    disabled?: boolean;
    name?: string;
    validateOnInputDelay?: number;
    transform?: boolean;
    nested?: boolean;
    loadingAuto?: boolean;
    ui?: PfFormUi;
  }>(),
  {
    validateOn: () => ['input', 'change', 'blur'],
    validateOnInputDelay: 300,
    transform: true,
    nested: false,
    loadingAuto: true,
    disabled: false,
  }
);

const emit = defineEmits<{
  submit: [event: PfFormSubmitEvent];
  error: [event: PfFormErrorEvent];
}>();

const attrs = useAttrs();
const autoId = useId().replace(/:/g, '');
const rootId = computed(() => `pfForm-${autoId}`);

const parentForm = inject(PF_FORM_INJECTION_KEY, null);
const isNested = computed(() => props.nested && parentForm != null);

const localErrors = ref<PfFormError[]>([]);
const submitting = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const nestedForms = new Set<NestedFormEntry>();

const dirtyFieldsInternal = ref(new Set<string>());
const touchedFieldsInternal = ref(new Set<string>());
const blurredFieldsInternal = ref(new Set<string>());

const errors = computed(() =>
  isNested.value && parentForm ? parentForm.errors.value : localErrors.value
);

const disabled = computed(
  () =>
    props.disabled ||
    submitting.value ||
    (isNested.value && parentForm ? parentForm.disabled.value : false)
);

const pathPrefix = computed(() => {
  if (!isNested.value || !parentForm) return '';

  const segments = [parentForm.pathPrefix];
  if (props.name) segments.push(props.name);

  return segments.filter(Boolean).join('.');
});

function splitPath(path: string): string[] {
  return path
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function getValueByPath(source: unknown, path?: string): unknown {
  if (!path) return source;

  return splitPath(path).reduce<unknown>((cursor, key) => {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    return (cursor as Record<string, unknown>)[key];
  }, source);
}

function withPrefix(name: string): string {
  return pathPrefix.value ? `${pathPrefix.value}.${name}` : name;
}

function isInScope(errorName: string): boolean {
  if (!pathPrefix.value) return true;
  return (
    errorName === pathPrefix.value ||
    errorName.startsWith(`${pathPrefix.value}.`)
  );
}

function isMatchingPath(errorName: string, path: string | RegExp): boolean {
  if (path instanceof RegExp) return path.test(errorName);
  return errorName === path || errorName.startsWith(`${path}.`);
}

function fieldMatches(
  errorName: string,
  pattern?: RegExp,
  name?: string
): boolean {
  if (name && (errorName === name || errorName.startsWith(`${name}.`))) {
    return true;
  }
  if (pattern) return pattern.test(errorName);
  return false;
}

const stateValue = computed<Record<string, unknown>>(() => {
  if (!isNested.value || !parentForm) return props.state ?? {};
  const inherited = getValueByPath(parentForm.state.value, props.name);
  return inherited && typeof inherited === 'object'
    ? (inherited as Record<string, unknown>)
    : {};
});

function setErrors(nextErrors: PfFormError[], path?: string | RegExp) {
  const target = isNested.value && parentForm ? parentForm.errors : localErrors;

  if (!path) {
    target.value = [...nextErrors];
    return;
  }

  const preserved = target.value.filter(
    (error) => !isMatchingPath(error.name, path)
  );
  target.value = [...preserved, ...nextErrors];
}

function clear(path?: string | RegExp) {
  const target = isNested.value && parentForm ? parentForm.errors : localErrors;

  if (!path) {
    if (isNested.value && pathPrefix.value) {
      target.value = target.value.filter((error) => !isInScope(error.name));
      return;
    }
    target.value = [];
    return;
  }

  const scopedPath =
    typeof path === 'string' && pathPrefix.value
      ? withPrefix(path)
      : (path as string | RegExp);
  target.value = target.value.filter(
    (error) => !isMatchingPath(error.name, scopedPath)
  );
}

function getErrors(path?: string | RegExp): PfFormError[] {
  if (!path) return errors.value;
  const scopedPath =
    typeof path === 'string' && pathPrefix.value ? withPrefix(path) : path;
  return errors.value.filter((error) => isMatchingPath(error.name, scopedPath));
}

function getError(name?: string, pattern?: RegExp): PfFormError | undefined {
  return errors.value.find((error) =>
    fieldMatches(error.name, pattern, name ? withPrefix(name) : undefined)
  );
}

function markFieldInteraction(name: string, event: PfFormInputEvent) {
  const scopedName = withPrefix(name);

  if (event === 'input' || event === 'change') {
    dirtyFieldsInternal.value.add(scopedName);
  }
  touchedFieldsInternal.value.add(scopedName);
  if (event === 'blur') {
    blurredFieldsInternal.value.add(scopedName);
  }
}

const inputTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearInputTimer(name: string) {
  const timer = inputTimers.get(name);
  if (!timer) return;
  clearTimeout(timer);
  inputTimers.delete(name);
}

function scheduleInputValidation(name: string) {
  clearInputTimer(name);
  const timer = setTimeout(() => {
    void runValidation({ name, silent: true, nested: false });
    inputTimers.delete(name);
  }, props.validateOnInputDelay);
  inputTimers.set(name, timer);
}

function collectErrorIds(nextErrors: PfFormError[]): PfFormError[] {
  const root = rootRef.value;
  if (!root) return nextErrors;

  return nextErrors.map((error) => {
    if (error.id) return error;
    const selectorValue = error.name.replaceAll('"', '\\"');
    const byName = root.querySelector<HTMLElement>(`[name="${selectorValue}"]`);
    if (byName?.id) return { ...error, id: byName.id };
    return error;
  });
}

async function runValidation(opts: PfFormValidateOptions = {}) {
  const options: Required<Pick<PfFormValidateOptions, 'silent' | 'nested'>> &
    Pick<PfFormValidateOptions, 'name' | 'transform'> = {
    silent: opts.silent ?? false,
    nested: opts.nested ?? true,
    name: opts.name,
    transform: opts.transform ?? props.transform,
  };

  const currentState = stateValue.value;
  const { data: schemaData, errors: schemaErrors } = await runSchemaValidation(
    props.schema,
    currentState
  );
  const customErrors = await runCustomValidation(props.validate, currentState);

  const ownErrorsRaw = [...schemaErrors, ...customErrors]
    .filter((error) => error.name.length > 0)
    .map((error) => ({ ...error, name: withPrefix(error.name) }));

  const ownErrors = filterErrorsByName(
    ownErrorsRaw,
    options.name
      ? Array.isArray(options.name)
        ? options.name.map((name) => withPrefix(name))
        : withPrefix(options.name)
      : undefined
  );

  if (options.name) {
    const names = Array.isArray(options.name) ? options.name : [options.name];
    for (const name of names) {
      clear(name);
    }
  } else if (isNested.value && pathPrefix.value) {
    clear();
  } else {
    clear();
  }

  if (ownErrors.length > 0) {
    setErrors([...errors.value, ...ownErrors]);
  }

  if (options.nested) {
    for (const nestedForm of nestedForms) {
      await nestedForm.validate({
        silent: true,
        nested: true,
        transform: options.transform,
      });
    }
  }

  const allErrors = options.name
    ? filterErrorsByName(
        errors.value,
        Array.isArray(options.name)
          ? options.name.map((name) => withPrefix(name))
          : withPrefix(options.name)
      )
    : errors.value;

  if (allErrors.length > 0 && !options.silent) {
    throw collectErrorIds(allErrors);
  }

  return options.transform ? schemaData : currentState;
}

async function submit() {
  if (isNested.value) {
    await runValidation({ nested: true, transform: props.transform });
    return;
  }

  if (
    rootRef.value instanceof HTMLFormElement &&
    !rootRef.value.reportValidity()
  ) {
    return;
  }

  if (props.loadingAuto) {
    submitting.value = true;
  }

  try {
    const data = await runValidation({ nested: true, transform: props.transform });
    emit('submit', { data });
  } catch (error) {
    const nextErrors = Array.isArray(error)
      ? (error as PfFormError[])
      : ([] as PfFormError[]);
    emit('error', { errors: collectErrorIds(nextErrors) });
  } finally {
    submitting.value = false;
  }
}

function onSubmit(event: Event) {
  event.preventDefault();
  void submit();
}

function extractFieldName(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLElement)) return undefined;

  const ownRoot = rootRef.value;
  const owner = target.closest<HTMLElement>('[data-pf-form-root]');
  if (owner && ownRoot && owner !== ownRoot) return undefined;

  const byName = target.getAttribute('name');
  if (byName && byName.length > 0) return byName;

  const byField = target
    .closest('[data-pf-form-field-name]')
    ?.getAttribute('data-pf-form-field-name');
  if (byField && byField.length > 0) return byField;

  return undefined;
}

function onInputCapture(event: Event) {
  if (!props.validateOn.includes('input')) return;
  const name = extractFieldName(event.target);
  if (!name) return;
  markFieldInteraction(name, 'input');
  scheduleInputValidation(name);
}

function onChangeCapture(event: Event) {
  if (!props.validateOn.includes('change')) return;
  const name = extractFieldName(event.target);
  if (!name) return;
  markFieldInteraction(name, 'change');
  void runValidation({ name, silent: true, nested: false });
}

function onFocusoutCapture(event: FocusEvent) {
  if (!props.validateOn.includes('blur')) return;
  const name = extractFieldName(event.target);
  if (!name) return;
  markFieldInteraction(name, 'blur');
  void runValidation({ name, silent: true, nested: false });
}

function registerNested(entry: NestedFormEntry) {
  nestedForms.add(entry);
}

function unregisterNested(entry: NestedFormEntry) {
  nestedForms.delete(entry);
}

const contextValue: PfFormContextValue = {
  pathPrefix: pathPrefix.value,
  state: stateValue,
  errors: isNested.value && parentForm ? parentForm.errors : localErrors,
  disabled: computed(() => disabled.value),
  getError,
  clear,
  markFieldInteraction,
  validate: runValidation,
  registerNested,
  unregisterNested,
};

provide(PF_FORM_INJECTION_KEY, contextValue);

const selfEntry: NestedFormEntry = {
  validate: runValidation,
  clear,
};

onMounted(() => {
  if (isNested.value && parentForm) {
    parentForm.registerNested(selfEntry);
  }
});

onBeforeUnmount(() => {
  for (const key of inputTimers.keys()) {
    clearInputTimer(key);
  }
  if (isNested.value && parentForm) {
    parentForm.unregisterNested(selfEntry);
  }
});

const rootClass = computed(() => ['pfForm', attrs.class, props.ui?.base]);

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});

const rootTag = computed(() => (isNested.value ? 'div' : 'form'));

defineExpose({
  submit,
  validate: runValidation,
  clear,
  getErrors,
  setErrors,
  errors: readonly(errors),
  disabled: readonly(disabled),
  dirty: computed(() => dirtyFieldsInternal.value.size > 0),
  dirtyFields: readonly(dirtyFieldsInternal),
  touchedFields: readonly(touchedFieldsInternal),
  blurredFields: readonly(blurredFieldsInternal),
});
</script>

<template>
  <component
    :is="rootTag"
    :id="id"
    ref="rootRef"
    :class="rootClass"
    :data-pf-form-root="rootId"
    :aria-busy="submitting ? 'true' : undefined"
    v-bind="passthroughAttrs"
    @submit="onSubmit"
    @input.capture="onInputCapture"
    @change.capture="onChangeCapture"
    @focusout.capture="onFocusoutCapture"
  >
    <fieldset class="pfForm__fieldset" :disabled="disabled">
      <slot />
    </fieldset>
  </component>
</template>

<style scoped lang="scss">
.pfForm {
  max-width: 100%;
  display: block;
  box-sizing: border-box;

  &__fieldset {
    margin: 0;

    padding: 0;
    min-width: 0;

    border: 0;
  }
}
</style>
