<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import type { PluginKey } from '@tiptap/pm/state';
import type {
  NestedOptions,
  DragHandlePluginProps,
} from '@tiptap/extension-drag-handle';
import { DragHandle as TiptapDragHandle } from '@tiptap/extension-drag-handle-vue-3';
import PfButton from '../../element/PfButton/index.vue';
import { PF_EDITOR_INJECTION_KEY } from '../utils/injection';

type FloatingUIOptions = NonNullable<
  DragHandlePluginProps['computePositionConfig']
>;

const props = withDefaults(
  defineProps<{
    editor?: Editor;
    icon?: string;
    color?:
      | 'error'
      | 'neutral'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warning';
    variant?: 'ghost' | 'solid' | 'outline' | 'soft' | 'subtle' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    options?: FloatingUIOptions;
    pluginKey?: string | PluginKey;
    nested?: boolean | NestedOptions;
    onElementDragStart?: (event: DragEvent) => void;
    onElementDragEnd?: (event: DragEvent) => void;
    ui?: Partial<{
      root: string;
      handle: string;
    }>;
  }>(),
  {
    editor: undefined,
    icon: 'gripVertical',
    color: 'neutral',
    variant: 'ghost',
    size: 'sm',
    options: () => ({ placement: 'left-start' }),
    pluginKey: undefined,
    nested: true,
    onElementDragStart: undefined,
    onElementDragEnd: undefined,
    ui: () => ({}),
  }
);

const emit = defineEmits<{
  nodeChange: [payload: { node: JSONContent; pos: number }];
  hover: [payload: { node: JSONContent; pos: number }];
}>();

const injected = inject(PF_EDITOR_INJECTION_KEY, null);
const editor = computed(() => props.editor ?? injected?.editor.value);

const hoveredNode = ref<{ node: JSONContent; pos: number } | null>(null);

function handleNodeChange(payload: { node: any; pos: number }) {
  if (!payload?.node || typeof payload.pos !== 'number') return;
  const next = {
    node: payload.node.toJSON() as JSONContent,
    pos: payload.pos,
  };
  hoveredNode.value = next;
  emit('nodeChange', next);
  emit('hover', next);
}

function onClick() {
  if (!editor.value || !hoveredNode.value) return null;
  editor.value.chain().focus().setNodeSelection(hoveredNode.value.pos).run();
  return hoveredNode.value;
}
</script>

<template>
  <TiptapDragHandle
    v-if="editor"
    :editor="editor"
    :plugin-key="pluginKey as any"
    :compute-position-config="options as any"
    :nested="nested as any"
    :on-node-change="handleNodeChange"
    :on-element-drag-start="onElementDragStart"
    :on-element-drag-end="onElementDragEnd"
    :class="`pfEditorDragHandle ${ui?.root ?? ''}`"
  >
    <slot
      :ui="{ handle: () => ['pfEditorDragHandle__handle', ui?.handle] }"
      :on-click="onClick"
    >
      <PfButton
        :icon="icon as any"
        :color="color"
        :variant="variant"
        :size="size"
        class="pfEditorDragHandle__handle"
        :class="ui?.handle"
      />
    </slot>
  </TiptapDragHandle>
</template>

<style scoped lang="scss">
.pfEditorDragHandle {
  z-index: calc(var(--pf-editor-menu-z-index) - 1);

  &__handle {
    cursor: grab;
  }
}
</style>
