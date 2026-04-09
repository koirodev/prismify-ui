<script setup lang="ts">
import {
  Comment,
  Fragment,
  cloneVNode,
  computed,
  defineComponent,
  h,
  inject,
  resolveDynamicComponent,
  useAttrs,
  useId,
  useSlots,
  type Component,
  type VNode,
} from 'vue';
import { PF_FORM_INJECTION_KEY } from '../PfForm/injection';

export type PfFormFieldSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PfFormFieldOrientation = 'vertical' | 'horizontal';

export type PfFormFieldUi = Partial<{
  root: string;
  wrapper: string;
  labelWrapper: string;
  label: string;
  container: string;
  description: string;
  error: string;
  hint: string;
  help: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    name?: string;
    errorPattern?: RegExp;
    label?: string;
    description?: string;
    help?: string;
    error?: string | boolean;
    hint?: string;
    size?: PfFormFieldSize;
    required?: boolean;
    eagerValidation?: boolean;
    validateOnInputDelay?: number;
    orientation?: PfFormFieldOrientation;
    ui?: PfFormFieldUi;
  }>(),
  {
    as: 'div',
    error: undefined,
    size: 'md',
    required: false,
    eagerValidation: false,
    validateOnInputDelay: undefined,
    orientation: 'vertical',
  }
);

const attrs = useAttrs();
const slots = useSlots();
const autoId = useId();
const formContext = inject(PF_FORM_INJECTION_KEY, null);

const rootTag = computed(() => resolveDynamicComponent(props.as));

const rootClass = computed(() => [
  'pfFormField',
  `pfFormField_size_${props.size}`,
  `pfFormField_orientation_${props.orientation}`,
  props.required && 'pfFormField_required',
  attrs.class,
  props.ui?.root,
]);

const passthroughAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  delete next.class;
  return next;
});

const inheritedError = computed(() => {
  if (!formContext) return '';
  const error = formContext.getError(props.name, props.errorPattern);
  return error?.message?.trim() ?? '';
});

const normalizedError = computed(() => {
  if (typeof props.error === 'string') return props.error.trim();
  if (props.error === undefined) return inheritedError.value;
  return '';
});
const hasErrorState = computed(
  () =>
    props.error === true ||
    normalizedError.value.length > 0 ||
    (props.error === undefined && inheritedError.value.length > 0)
);
const hasErrorMessage = computed(() => normalizedError.value.length > 0);

const hasDescription = computed(
  () => props.description != null && props.description.length > 0
);
const hasHelp = computed(() => props.help != null && props.help.length > 0);

const baseId = computed(() => {
  const safeName = props.name?.trim().replace(/[^\w-]+/g, '-');
  return safeName && safeName.length > 0
    ? `pfFormField-${safeName}-${autoId}`
    : `pfFormField-${autoId}`;
});

const fallbackControlId = computed(() => `${baseId.value}-control`);
const descriptionId = computed(() => `${baseId.value}-description`);
const helpId = computed(() => `${baseId.value}-help`);
const errorId = computed(() => `${baseId.value}-error`);

const controlId = computed(() => {
  const defaultNodes = (
    slots as unknown as { default?: () => VNode[] }
  ).default?.();
  const node = getFirstPatchableNode(defaultNodes ?? []);
  const ownId = readProp(node, 'id');
  return typeof ownId === 'string' && ownId.length > 0
    ? ownId
    : fallbackControlId.value;
});

const describedById = computed(() => {
  const tokens: string[] = [];
  if (hasDescription.value) tokens.push(descriptionId.value);
  if (hasErrorState.value) {
    if (hasErrorMessage.value || slots.error != null)
      tokens.push(errorId.value);
  } else if (hasHelp.value || slots.help != null) {
    tokens.push(helpId.value);
  }
  return tokens.join(' ');
});

function readProp(vnode: VNode | null, key: string): unknown {
  if (!vnode?.props) return undefined;
  const propsRecord = vnode.props as Record<string, unknown>;
  return propsRecord[key];
}

function hasMeaningfulProp(vnode: VNode | null, key: string): boolean {
  const value = readProp(vnode, key);
  if (value == null) return false;
  return typeof value !== 'string' || value.length > 0;
}

function getFirstPatchableNode(nodes: VNode[]): VNode | null {
  for (const node of nodes) {
    if (node.type === Comment) continue;
    if (node.type === Fragment) {
      const fragmentChildren = Array.isArray(node.children)
        ? (node.children as VNode[])
        : [];
      const nestedNode = getFirstPatchableNode(fragmentChildren);
      if (nestedNode) return nestedNode;
      continue;
    }
    return node;
  }
  return null;
}

function patchDefaultNodes(nodes: VNode[]): VNode[] {
  let patched = false;

  const patchNode = (node: VNode): VNode => {
    if (patched) return node;
    if (node.type === Comment) return node;

    if (node.type === Fragment) {
      const fragmentChildren = Array.isArray(node.children)
        ? (node.children as VNode[])
        : [];
      const nextChildren = fragmentChildren.map((child) => patchNode(child));
      if (!patched) return node;
      return h(Fragment, null, nextChildren);
    }

    const controlProps: Record<string, unknown> = {};

    if (!hasMeaningfulProp(node, 'id'))
      controlProps.id = fallbackControlId.value;
    if (!hasMeaningfulProp(node, 'size')) controlProps.size = props.size;
    if (!hasMeaningfulProp(node, 'required') && props.required) {
      controlProps.required = true;
    }
    if (!hasMeaningfulProp(node, 'color') && hasErrorState.value) {
      controlProps.color = 'error';
    }

    const currentDescribedBy = readProp(node, 'aria-describedby');
    const ids = new Set<string>();
    if (
      typeof currentDescribedBy === 'string' &&
      currentDescribedBy.length > 0
    ) {
      currentDescribedBy
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((token) => ids.add(token));
    }
    if (describedById.value.length > 0) {
      describedById.value
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((token) => ids.add(token));
    }
    if (!hasMeaningfulProp(node, 'aria-describedby') && ids.size > 0) {
      controlProps['aria-describedby'] = Array.from(ids).join(' ');
    } else if (hasMeaningfulProp(node, 'aria-describedby') && ids.size > 0) {
      controlProps['aria-describedby'] = Array.from(ids).join(' ');
    }

    if (!hasMeaningfulProp(node, 'aria-invalid') && hasErrorState.value) {
      controlProps['aria-invalid'] = 'true';
    }

    patched = true;
    return cloneVNode(node, controlProps);
  };

  return nodes.map((node) => patchNode(node));
}

const patchedDefaultNodes = computed(() =>
  patchDefaultNodes(
    ((slots as unknown as { default?: () => VNode[] }).default?.() ??
      []) as VNode[]
  )
);

const ControlRenderer = defineComponent({
  name: 'PfFormFieldControlRenderer',
  setup() {
    return () => patchedDefaultNodes.value;
  },
});

const labelTag = computed(() => (controlId.value.length > 0 ? 'label' : 'div'));
</script>

<template>
  <component
    :is="rootTag"
    :class="rootClass"
    :data-pf-form-field-name="name || undefined"
    v-bind="passthroughAttrs"
  >
    <div class="pfFormField__wrapper" :class="props.ui?.wrapper">
      <div
        v-if="label || hint || $slots.label || $slots.hint"
        class="pfFormField__labelWrapper"
        :class="props.ui?.labelWrapper"
      >
        <component
          :is="labelTag"
          v-if="label || $slots.label"
          class="pfFormField__label"
          :class="[
            props.ui?.label,
            props.required && 'pfFormField__label_required',
          ]"
          :for="labelTag === 'label' ? controlId : undefined"
        >
          <slot name="label">
            {{ label }}
          </slot>
        </component>

        <div
          v-if="hint || $slots.hint"
          class="pfFormField__hint"
          :class="props.ui?.hint"
        >
          <slot name="hint">
            {{ hint }}
          </slot>
        </div>
      </div>

      <div
        v-if="description || $slots.description"
        :id="descriptionId"
        class="pfFormField__description"
        :class="props.ui?.description"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </div>
    </div>

    <div class="pfFormField__container" :class="props.ui?.container">
      <ControlRenderer />

      <div
        v-if="hasErrorState || help || $slots.help || $slots.error"
        class="pfFormField__message"
      >
        <div
          v-if="hasErrorState"
          :id="errorId"
          class="pfFormField__error"
          :class="props.ui?.error"
          role="alert"
          aria-live="polite"
        >
          <slot name="error">
            <template v-if="hasErrorMessage">
              {{ normalizedError }}
            </template>
          </slot>
        </div>

        <div
          v-else-if="help || $slots.help"
          :id="helpId"
          class="pfFormField__help"
          :class="props.ui?.help"
        >
          <slot name="help">
            {{ help }}
          </slot>
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfFormField {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-xs);
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-family: var(--pf-font-sans);

  &__wrapper {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--pf-space-xs) * 0.5);
  }

  &__labelWrapper {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--pf-space-xs);
  }

  &__label {
    margin: 0;

    color: var(--pf-color-text);
    font-weight: var(--pf-font-weight-medium);
    line-height: var(--pf-line-height-md);
  }

  &__label_required::after {
    content: '*';

    margin-inline-start: 0.25rem;

    color: var(--pf-color-error);
  }

  &__hint,
  &__description,
  &__help {
    color: var(--pf-color-muted);
  }

  &__hint {
    line-height: var(--pf-line-height-sm);
  }

  &__description {
    line-height: var(--pf-line-height-sm);
  }

  &__container {
    position: relative;

    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__message {
    margin-block-start: var(--pf-space-xs);
  }

  &__help {
    line-height: var(--pf-line-height-sm);
  }

  &__error {
    color: var(--pf-color-error);
    line-height: var(--pf-line-height-sm);
  }

  &_size_xs {
    font-size: var(--pf-font-size-xs);
  }

  &_size_sm {
    font-size: var(--pf-font-size-xs);
  }

  &_size_md {
    font-size: var(--pf-font-size-sm);
  }

  &_size_lg {
    font-size: var(--pf-font-size-sm);
  }

  &_size_xl {
    font-size: var(--pf-font-size-md);
  }

  &_orientation_horizontal {
    display: grid;
    align-items: baseline;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: var(--pf-space-md);
  }

  &_orientation_horizontal &__wrapper {
    min-height: 100%;
    justify-content: center;
  }

  &_orientation_horizontal &__container {
    min-width: 0;
  }
}
</style>
