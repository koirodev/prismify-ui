<script setup lang="ts">
import { ref, watch } from 'vue';
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';
import PfFileUpload from '../../form/PfFileUpload/index.vue';

const props = defineProps<NodeViewProps>();

const file = ref<File | undefined>(undefined);
const loading = ref(false);

watch(file, async (nextFile) => {
  if (!nextFile) return;
  loading.value = true;

  try {
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve((event.target?.result as string) ?? null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(nextFile);
    });

    if (!dataUrl) return;

    const pos = props.getPos();
    if (typeof pos !== 'number') return;

    props.editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + 1 })
      .setImage({ src: dataUrl })
      .run();
  } finally {
    loading.value = false;
    file.value = undefined;
  }
});
</script>

<template>
  <NodeViewWrapper class="pfEditorImageUploadNode">
    <PfFileUpload
      v-model="file"
      accept="image/*"
      :multiple="false"
      :disabled="loading"
      title="Upload image"
      description="PNG, JPG, SVG, GIF"
      class="pfEditorImageUploadNode__upload"
    />
  </NodeViewWrapper>
</template>

<style scoped lang="scss">
.pfEditorImageUploadNode {
  margin: var(--pf-space-sm) 0;

  &__upload {
    min-height: 10rem;
  }
}
</style>
