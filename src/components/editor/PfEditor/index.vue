<script setup lang="ts">
import type { Extensions, JSONContent } from '@tiptap/vue-3';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { NodeRange } from '@tiptap/extension-node-range';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { Markdown } from '@tiptap/markdown';
import { computed, provide, ref, shallowRef, useAttrs, watch } from 'vue';
import type {
  PfEditorContentType,
  PfEditorCustomHandlers,
  PfEditorProps,
} from '../utils/types';
import { createEditorHandlers } from '../utils/handlers';
import { PF_EDITOR_INJECTION_KEY } from '../utils/injection';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PfEditorProps>(), {
  modelValue: '',
  contentType: undefined,
  starterKit: () => ({}),
  placeholder: undefined,
  markdown: () => ({}),
  image: true,
  mention: true,
  handlers: () => ({}),
  nodeRange: true,
  extensions: () => [],
  editable: true,
  autofocus: false,
  textDirection: undefined,
  ui: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [value: null | string | JSONContent | JSONContent[]];
}>();

const attrs = useAttrs();

const modelValue = ref<null | string | JSONContent | JSONContent[]>(
  props.modelValue ?? ''
);

watch(
  () => props.modelValue,
  (value) => {
    modelValue.value = value ?? '';
  }
);

const inferredContentType = computed<PfEditorContentType>(() => {
  if (props.contentType) return props.contentType;
  return typeof modelValue.value === 'string' || modelValue.value == null
    ? 'html'
    : 'json';
});

const resolvedHandlers = computed<PfEditorCustomHandlers>(() =>
  createEditorHandlers(props.handlers)
);

function normalizeEditorContent(
  value: null | string | JSONContent | JSONContent[] | undefined
): string | JSONContent | JSONContent[] {
  if (value == null) return '';
  return value;
}

function resolveExtensions(): Extensions {
  const result: Extensions = [StarterKit.configure(props.starterKit)];

  if (props.placeholder) {
    const configured =
      typeof props.placeholder === 'string'
        ? { placeholder: props.placeholder }
        : props.placeholder;
    result.push(Placeholder.configure(configured));
  }

  if (props.image !== false) {
    result.push(
      Image.configure(typeof props.image === 'boolean' ? {} : props.image)
    );
  }

  if (props.mention !== false) {
    result.push(
      Mention.configure(
        typeof props.mention === 'boolean'
          ? {
              HTMLAttributes: {
                class: 'pfEditor__mention',
              },
            }
          : props.mention
      )
    );
  }

  if (props.markdown !== false) {
    result.push(
      Markdown.configure(
        typeof props.markdown === 'boolean' ? {} : props.markdown
      )
    );
  }

  if (props.nodeRange !== false) {
    const nodeRangeOpts =
      props.nodeRange === true || props.nodeRange === undefined
        ? {}
        : props.nodeRange;
    result.push(NodeRange.configure(nodeRangeOpts));
  }

  if (props.extensions?.length) {
    result.push(...props.extensions);
  }

  return result;
}

function getEditorValue(
  type: PfEditorContentType
): null | string | JSONContent | JSONContent[] {
  const instance = editor.value;
  if (!instance) return modelValue.value;
  if (type === 'json') {
    return instance.getJSON();
  }
  if (type === 'markdown') {
    const markdown = (instance as any).getMarkdown?.();
    return typeof markdown === 'string' ? markdown : instance.getHTML();
  }
  return instance.getHTML();
}

function valueToCompare(
  value: null | string | JSONContent | JSONContent[] | undefined
): string {
  if (typeof value === 'string' || value == null) {
    return value ?? '';
  }
  return JSON.stringify(value);
}

const isSyncingFromOutside = shallowRef(false);

const editor = useEditor({
  extensions: resolveExtensions(),
  content: normalizeEditorContent(modelValue.value),
  contentType: inferredContentType.value,
  autofocus: props.autofocus as any,
  editable: props.editable,
  editorProps: {
    attributes: {
      class: 'pfEditor__base',
      ...(props.textDirection ? { dir: props.textDirection } : {}),
    },
  },
  onUpdate: () => {
    if (isSyncingFromOutside.value) return;
    const nextValue = getEditorValue(inferredContentType.value);
    modelValue.value = nextValue;
    emit('update:modelValue', nextValue);
  },
});

watch(
  () => props.editable,
  (editable) => {
    editor.value?.setEditable(editable);
  }
);

watch(
  [() => modelValue.value, () => inferredContentType.value],
  ([value, type]) => {
    const instance = editor.value;
    if (!instance) return;
    const current = getEditorValue(type);
    if (valueToCompare(current) === valueToCompare(value)) return;
    isSyncingFromOutside.value = true;
    instance.commands.setContent(normalizeEditorContent(value), {
      emitUpdate: false,
    });
    isSyncingFromOutside.value = false;
  }
);

provide(PF_EDITOR_INJECTION_KEY, {
  editor,
  handlers: resolvedHandlers,
});

defineExpose({
  editor,
});
</script>

<template>
  <div class="pfEditor" :class="[ui?.root, attrs.class]">
    <slot :editor="editor" :handlers="resolvedHandlers" />

    <div class="pfEditor__content" :class="ui?.content">
      <EditorContent
        v-if="editor"
        :editor="editor"
        class="pfEditor__base"
        :class="ui?.base"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pfEditor {
  position: relative;

  width: 100%;
  min-height: var(--pf-editor-min-height);
  display: flex;
  flex-direction: column;

  background: var(--pf-editor-surface);
  border: var(--pf-stroke-width) solid var(--pf-editor-chrome-border);
  border-radius: var(--pf-editor-radius);

  &__content {
    min-height: 0;
    flex: 1;
  }

  &__base {
    padding: var(--pf-editor-padding-y) var(--pf-editor-padding-x);
    min-height: var(--pf-editor-min-height);

    color: var(--pf-editor-text);
    font-family: var(--pf-font-sans);
    font-size: var(--pf-editor-font-size);
    line-height: var(--pf-editor-line-height);

    outline: none;

    -webkit-tap-highlight-color: transparent;
  }

  &__base :deep(.ProseMirror),
  &__base :deep(.tiptap) {
    outline: none;
  }

  &__base :deep(.ProseMirror:focus),
  &__base :deep(.ProseMirror-focused) {
    box-shadow: none;
    outline: none;
  }

  &__base :deep(.ProseMirror:focus-visible) {
    outline: 2px solid
      color-mix(in srgb, var(--pf-color-primary) 50%, transparent);
    outline-offset: 2px;
  }

  &__base :deep(p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);

    float: inline-start;

    height: 0;

    color: var(--pf-editor-muted);

    pointer-events: none;
  }

  &__base :deep(a) {
    color: var(--pf-color-primary);
    text-decoration: underline;
  }

  &__base :deep(code) {
    padding: 0 var(--pf-space-xs);

    font-size: calc(var(--pf-editor-font-size) * 0.92);

    background: color-mix(in srgb, var(--pf-editor-border) 45%, transparent);
    border: var(--pf-stroke-width) solid var(--pf-editor-border);
    border-radius: var(--pf-radius-sm);
  }

  &__base :deep(pre) {
    margin: var(--pf-space-md) 0;

    padding: var(--pf-space-sm);

    background: color-mix(in srgb, var(--pf-editor-border) 55%, transparent);
    border: var(--pf-stroke-width) solid var(--pf-editor-border);
    border-radius: var(--pf-radius-md);
    overflow: auto;
  }

  &__base :deep(blockquote) {
    border-inline-start: 3px solid var(--pf-editor-border);

    margin: var(--pf-space-md) 0;

    padding-inline-start: var(--pf-space-md);

    color: var(--pf-editor-muted);
  }

  &__base :deep(img) {
    max-width: 100%;

    border-radius: var(--pf-radius-sm);
  }

  &__base :deep(.pfEditor__mention) {
    color: var(--pf-color-primary);
    font-weight: var(--pf-font-weight-medium);
  }
}
</style>
