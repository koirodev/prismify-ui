<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
  type VNode,
} from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import type { PfIconName } from '../../element/PfIcon/paths';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';

export type PfFileUploadColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfFileUploadUi = Partial<{
  root: string;
  base: string;
  wrapper: string;
  icon: string;
  avatar: string;
  label: string;
  description: string;
  actions: string;
  files: string;
  file: string;
  fileLeadingAvatar: string;
  fileWrapper: string;
  fileName: string;
  fileSize: string;
  fileTrailingButton: string;
}>;

export type PfFileUploadFileDeleteConfig = {
  color?: PfFileUploadColor;
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
};

export type PfFileUploadInvalidCode = 'accept' | 'maxSize';

export type PfFileUploadInvalidPayload = {
  code: PfFileUploadInvalidCode;
  file: File;
  message: string;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Record<string, unknown>;
    id?: string;
    name?: string;
    label?: string;
    description?: string;
    color?: PfFileUploadColor;
    /** `button` only when `multiple === false`. */
    variant?: 'button' | 'area';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Only when `variant="area"`. */
    layout?: 'list' | 'grid';
    /** Only when `variant="area"` and `layout="list"`. */
    position?: 'inside' | 'outside';
    highlight?: boolean;
    /** Max file size in kibibytes (KiB, 1 KiB = 1024 bytes). */
    maxSize?: number;
    /** External error text (overrides internal). */
    error?: string;
    /** Custom wrong-type error template: `{name}`, `{accept}` available. */
    acceptErrorText?: string;
    /** Custom max-size error template: `{name}`, `{max}` (human-readable limit). */
    maxSizeErrorText?: string;
    accept?: string;
    multiple?: boolean;
    /** Reset `<input>` value before opening the dialog (same file again). */
    reset?: boolean;
    dropzone?: boolean;
    interactive?: boolean;
    required?: boolean;
    disabled?: boolean;
    /** Zone (area) / button icon. */
    icon?: PfIconName;
    /** Icon in file row (list) or when preview is off. */
    fileIcon?: PfIconName;
    /** Show `<img>` for images in preview. */
    fileImage?: boolean;
    /** `false` — hide the component file list/grid. */
    preview?: boolean;
    /** File delete: `true` / `false` or `PfButton` settings. */
    fileDelete?: boolean | PfFileUploadFileDeleteConfig;
    fileDeleteIcon?: PfIconName;
    modelValue?: File | File[] | null;
    defaultValue?: File | File[] | null;
    ui?: PfFileUploadUi;
    form?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: boolean;
    formtarget?: string;
  }>(),
  {
    color: 'primary',
    variant: 'area',
    size: 'md',
    layout: 'grid',
    position: 'outside',
    highlight: false,
    accept: '*',
    multiple: false,
    reset: false,
    dropzone: true,
    interactive: true,
    fileImage: true,
    preview: true,
    fileDelete: true,
    fileDeleteIcon: 'crossSmall',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null];
  change: [event: Event];
  invalid: [payload: PfFileUploadInvalidPayload];
}>();

const attrs = useAttrs();
const appSlots = useSlots() as Record<string, (() => VNode[]) | undefined>;
const autoId = useId();
const inputId = computed(() => props.id ?? autoId);
const isInteractive = computed(() => props.interactive && !props.disabled);
const acceptRule = computed(() => props.accept ?? '*');
const internalError = ref('');
const resolvedError = computed(() => props.error ?? internalError.value);

const modelBound = usePfVModelBound();
const localModel = ref<File | File[] | null>(
  props.defaultValue != null ? props.defaultValue : null
);

const userModel = computed({
  get: () =>
    (modelBound.value ? props.modelValue : localModel.value) as
      | File
      | File[]
      | null
      | undefined,
  set: (v: File | File[] | null) => {
    if (modelBound.value) {
      emit('update:modelValue', v);
    } else {
      localModel.value = v;
    }
  },
});

const effectiveVariant = computed(() => {
  return props.variant;
});

const filesList = computed((): File[] => {
  const v = userModel.value;
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
});

const effectiveLayout = computed(() =>
  effectiveVariant.value === 'area' ? props.layout : 'grid'
);

const showInsideList = computed(
  () =>
    effectiveVariant.value === 'area' &&
    effectiveLayout.value === 'list' &&
    props.position === 'inside'
);

const showOutsideList = computed(
  () =>
    effectiveVariant.value === 'area' &&
    effectiveLayout.value === 'list' &&
    props.position === 'outside'
);

const showGridBelow = computed(
  () =>
    effectiveVariant.value === 'area' &&
    effectiveLayout.value === 'grid' &&
    props.multiple &&
    props.preview
);

const showGridOverlay = computed(
  () =>
    effectiveVariant.value === 'area' &&
    effectiveLayout.value === 'grid' &&
    !props.multiple &&
    props.preview &&
    filesList.value.length > 0
);

const showButtonInlineFile = computed(
  () =>
    effectiveVariant.value === 'button' &&
    props.preview &&
    !props.multiple &&
    filesList.value.length > 0
);
const buttonSingleFile = computed(() => filesList.value[0] ?? null);

const showButtonList = computed(
  () =>
    effectiveVariant.value === 'button' &&
    props.preview &&
    props.multiple &&
    filesList.value.length > 0
);

const showEmptyAreaContent = computed(() => {
  if (effectiveVariant.value !== 'area') return false;
  if (showGridOverlay.value) return false;
  if (showInsideList.value && filesList.value.length > 0) return false;
  return true;
});

const inputRef = ref<HTMLInputElement | null>(null);
const dropzoneRef = ref<HTMLElement | null>(null);
const dragging = ref(false);
const dragDepth = ref(0);

const previewUrls = ref<Record<string, string>>({});

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function previewUrl(file: File): string | undefined {
  return previewUrls.value[fileKey(file)];
}

function canRenderImagePreview(file: File): boolean {
  return (
    props.fileImage === true &&
    file.type.startsWith('image/') &&
    !!previewUrl(file)
  );
}

function revokeAllPreviews() {
  for (const url of Object.values(previewUrls.value)) {
    URL.revokeObjectURL(url);
  }
  previewUrls.value = {};
}

watch(
  () => filesList.value,
  (files) => {
    const nextKeys = new Set(files.map(fileKey));
    for (const k of Object.keys(previewUrls.value)) {
      if (!nextKeys.has(k)) {
        URL.revokeObjectURL(previewUrls.value[k]!);
        delete previewUrls.value[k];
      }
    }
    if (!props.fileImage) return;
    for (const f of files) {
      const k = fileKey(f);
      if (!f.type.startsWith('image/')) continue;
      if (previewUrls.value[k]) continue;
      previewUrls.value[k] = URL.createObjectURL(f);
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  revokeAllPreviews();
});

const passthroughClass = computed(() => {
  const a = attrs as Record<string, unknown>;
  return typeof a.class === 'string' ? a.class : undefined;
});

const passthroughInputAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  delete a.style;
  return a;
});

const iconSizeForUpload = computed((): PfIconSize => {
  switch (props.size) {
    case 'xs':
      return 'xs';
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

const blockClass = computed(() => {
  const c = [
    'pfFileUpload',
    `pfFileUpload_color_${props.color}`,
    `pfFileUpload_size_${props.size}`,
    `pfFileUpload_variant_${effectiveVariant.value}`,
    `pfFileUpload_layout_${effectiveLayout.value}`,
    `pfFileUpload_position_${props.position}`,
  ];
  if (props.highlight) c.push('pfFileUpload_highlight');
  if (props.disabled) c.push('pfFileUpload_disabled');
  if (dragging.value) c.push('pfFileUpload_dragging');
  if (props.ui?.root) c.push(props.ui.root);
  if (passthroughClass.value) c.push(passthroughClass.value);
  return c;
});

function fileMatchesAccept(file: File, accept: string): boolean {
  if (!accept || accept === '*') return true;
  const parts = accept.split(',').map((s) => s.trim().toLowerCase());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  for (const part of parts) {
    if (part.startsWith('.')) {
      if (name.endsWith(part)) return true;
    } else if (part.endsWith('/*')) {
      const base = part.slice(0, -2);
      if (type.startsWith(`${base}/`)) return true;
    } else if (type === part) {
      return true;
    }
  }
  return false;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

function addFilesFromList(list: FileList | File[]) {
  const incoming = Array.from(list);
  const typeRejected = incoming.filter(
    (f) => !fileMatchesAccept(f, acceptRule.value)
  );
  const accepted = incoming.filter((f) =>
    fileMatchesAccept(f, acceptRule.value)
  );
  const maxBytes =
    props.maxSize == null ? null : Math.floor(props.maxSize) * 1024;
  const sizeRejected =
    maxBytes == null ? [] : accepted.filter((f) => f.size > maxBytes);
  const arr =
    maxBytes == null ? accepted : accepted.filter((f) => f.size <= maxBytes);

  if (typeRejected.length > 0) {
    const first = typeRejected[0]!;
    const template =
      props.acceptErrorText ??
      'File "{name}" has unsupported type. Allowed: {accept}.';
    const msg = template
      .replaceAll('{name}', first.name)
      .replaceAll('{accept}', acceptRule.value);
    internalError.value = msg;
    emit('invalid', { code: 'accept', file: first, message: msg });
  } else if (sizeRejected.length > 0 && maxBytes != null) {
    const first = sizeRejected[0]!;
    const template =
      props.maxSizeErrorText ??
      'File "{name}" is too large. Maximum size is {max}.';
    const msg = template
      .replaceAll('{name}', first.name)
      .replaceAll('{max}', formatBytes(maxBytes));
    internalError.value = msg;
    emit('invalid', { code: 'maxSize', file: first, message: msg });
  } else {
    internalError.value = '';
  }

  if (arr.length === 0) return;
  if (props.multiple) {
    const cur = filesList.value;
    userModel.value = [...cur, ...arr];
  } else {
    userModel.value = arr[0] ?? null;
  }
}

function onInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const list = input.files;
  if (list?.length) {
    addFilesFromList(list);
  }
  emit('change', e);
}

function clearNativeInputValue() {
  if (inputRef.value) inputRef.value.value = '';
}

function open() {
  if (props.disabled) return;
  const el = inputRef.value;
  if (!el) return;
  if (props.reset) {
    el.value = '';
  }
  el.click();
}

function removeFile(file?: File) {
  if (props.disabled) return;
  if (props.error == null) internalError.value = '';
  if (file == null) {
    userModel.value = props.multiple ? [] : null;
    revokeAllPreviews();
    clearNativeInputValue();
    return;
  }
  if (!props.multiple) {
    userModel.value = null;
  } else {
    const next = filesList.value.filter((f) => f !== file);
    userModel.value = next.length ? next : [];
  }
  const k = fileKey(file);
  const url = previewUrls.value[k];
  if (url) {
    URL.revokeObjectURL(url);
    delete previewUrls.value[k];
  }
  clearNativeInputValue();
}

function stopOpen(e: Event) {
  e.stopPropagation();
}

function onGridOverlayClick(e: MouseEvent) {
  if (!isInteractive.value) return;
  if ((e.target as HTMLElement).closest('.pfFileUpload__gridRemove')) return;
  open();
}

function onDropzoneClick(e: MouseEvent) {
  if (!isInteractive.value) return;
  if ((e.target as HTMLElement).closest('.pfFileUpload__fileTrailing')) {
    return;
  }
  open();
}

function onKeydownBase(e: KeyboardEvent) {
  if (!isInteractive.value) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    open();
  }
}

function onDragEnter(e: DragEvent) {
  if (!props.dropzone || props.disabled) return;
  e.preventDefault();
  dragDepth.value += 1;
  dragging.value = true;
}

function onDragOver(e: DragEvent) {
  if (!props.dropzone || props.disabled) return;
  e.preventDefault();
}

function onDragLeave(e: DragEvent) {
  if (!props.dropzone || props.disabled) return;
  e.preventDefault();
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  if (dragDepth.value === 0) dragging.value = false;
}

function onDrop(e: DragEvent) {
  if (!props.dropzone || props.disabled) return;
  e.preventDefault();
  dragDepth.value = 0;
  dragging.value = false;
  const list = e.dataTransfer?.files;
  if (list?.length) {
    addFilesFromList(list);
    emit('change', e);
  }
}

const deleteButtonProps = computed(() => {
  const fd = props.fileDelete;
  if (fd === false) return null;
  if (typeof fd === 'boolean') {
    if (!fd) return null;
    if (effectiveLayout.value === 'list') {
      return {
        color: 'neutral' as const,
        variant: 'link' as const,
        size: props.size,
        iconOnly: true,
      };
    }
    return {
      color: 'neutral' as const,
      variant: 'solid' as const,
      size: 'xs' as const,
      iconOnly: true,
    };
  }
  return {
    color: fd.color ?? ('neutral' as const),
    variant:
      fd.variant ?? (effectiveLayout.value === 'list' ? 'link' : 'solid'),
    size: fd.size ?? (effectiveLayout.value === 'grid' ? 'xs' : props.size),
    iconOnly: fd.iconOnly ?? true,
  };
});

defineExpose({
  inputRef,
  dropzoneRef,
  open,
  removeFile,
});
</script>

<template>
  <component
    :is="as ?? 'div'"
    ref="dropzoneRef"
    :class="blockClass"
    role="presentation"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      :id="inputId"
      ref="inputRef"
      type="file"
      class="pfFileUpload__input"
      :name="name"
      :form="form"
      :multiple="multiple ? true : undefined"
      :accept="accept"
      :required="required"
      :disabled="disabled"
      :formaction="formaction"
      :formenctype="formenctype"
      :formmethod="formmethod"
      :formnovalidate="formnovalidate"
      :formtarget="formtarget"
      v-bind="passthroughInputAttrs"
      @change="onInputChange"
    />

    <template v-if="appSlots.default">
      <slot :open="open" :remove-file="removeFile" :files="filesList" />
    </template>

    <template v-else-if="effectiveVariant === 'button'">
      <div class="pfFileUpload__buttonWrap">
        <slot v-if="appSlots.actions" name="actions" :open="open" />
        <div v-else class="pfFileUpload__buttonRow" :class="[props.ui?.base]">
          <slot name="leading" />
          <div
            v-if="!showButtonInlineFile"
            class="pfFileUpload__iconCircle"
            :class="props.ui?.avatar"
          >
            <PfIcon
              :name="icon ?? 'upload'"
              :size="iconSizeForUpload"
              :class="props.ui?.icon"
            />
          </div>

          <div
            v-if="showButtonInlineFile"
            class="pfFileUpload__buttonInlineFile"
            @click.stop="stopOpen"
          >
            <div class="pfFileUpload__fileAvatar">
              <PfIcon
                v-if="
                  buttonSingleFile && !canRenderImagePreview(buttonSingleFile)
                "
                :name="fileIcon ?? 'file'"
                :size="iconSizeForUpload"
              />
              <img
                v-else-if="buttonSingleFile"
                class="pfFileUpload__fileImg"
                :src="previewUrl(buttonSingleFile)"
                :alt="buttonSingleFile.name"
              />
            </div>
            <div class="pfFileUpload__fileText">
              <span class="pfFileUpload__fileName">
                {{ buttonSingleFile?.name }}
              </span>
              <span class="pfFileUpload__fileSize">
                {{ buttonSingleFile ? formatBytes(buttonSingleFile.size) : '' }}
              </span>
            </div>
            <PfButton
              v-if="deleteButtonProps && fileDelete && buttonSingleFile"
              v-bind="deleteButtonProps"
              type="button"
              :icon="fileDeleteIcon"
              aria-label="Remove file"
              @click.stop="removeFile(buttonSingleFile)"
            />
          </div>

          <div class="pfFileUpload__buttonCol">
            <PfButton
              type="button"
              :color="color"
              variant="outline"
              :size="size"
              :disabled="disabled"
              @click="isInteractive ? open() : undefined"
            >
              {{ label ?? 'Upload file' }}
            </PfButton>
            <p
              v-if="description"
              class="pfFileUpload__buttonDescription"
              :class="props.ui?.description"
            >
              {{ description }}
            </p>
          </div>
        </div>

        <div
          v-if="showButtonList"
          class="pfFileUpload__files pfFileUpload__files_button"
          :class="props.ui?.files"
        >
          <div
            v-for="(file, index) in filesList"
            :key="fileKey(file)"
            class="pfFileUpload__file pfFileUpload__file_list"
            :class="props.ui?.file"
            @click.stop="stopOpen"
          >
            <slot
              name="file"
              :file="file"
              :index="index"
              :remove-file="removeFile"
            >
              <div
                class="pfFileUpload__fileLeading"
                :class="props.ui?.fileLeadingAvatar"
              >
                <slot name="file-leading" :file="file">
                  <div class="pfFileUpload__fileAvatar">
                    <PfIcon
                      v-if="!canRenderImagePreview(file)"
                      :name="fileIcon ?? 'file'"
                      :size="iconSizeForUpload"
                    />
                    <img
                      v-else
                      class="pfFileUpload__fileImg"
                      :src="previewUrl(file)"
                      :alt="file.name"
                    />
                  </div>
                </slot>
              </div>
              <div
                class="pfFileUpload__fileText"
                :class="props.ui?.fileWrapper"
              >
                <slot name="file-name" :file="file">
                  <span
                    class="pfFileUpload__fileName"
                    :class="props.ui?.fileName"
                  >
                    {{ file.name }}
                  </span>
                </slot>
                <slot name="file-size" :file="file">
                  <span
                    class="pfFileUpload__fileSize"
                    :class="props.ui?.fileSize"
                  >
                    {{ formatBytes(file.size) }}
                  </span>
                </slot>
              </div>
              <div
                class="pfFileUpload__fileTrailing"
                :class="props.ui?.fileTrailingButton"
              >
                <slot
                  name="file-trailing"
                  :file="file"
                  :remove-file="removeFile"
                >
                  <PfButton
                    v-if="deleteButtonProps && fileDelete"
                    v-bind="deleteButtonProps"
                    type="button"
                    :icon="fileDeleteIcon"
                    aria-label="Remove file"
                    @click.stop="removeFile(file)"
                  />
                </slot>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <slot
        v-if="appSlots['files-top']"
        name="files-top"
        :open="open"
        :files="filesList"
      />

      <div
        class="pfFileUpload__base"
        :class="[
          props.ui?.base,
          {
            pfFileUpload__base_dropzone: dropzone,
            pfFileUpload__base_interactive: isInteractive,
          },
        ]"
        :tabindex="isInteractive ? 0 : undefined"
        role="button"
        :aria-disabled="disabled ? true : undefined"
        @click="onDropzoneClick"
        @keydown="onKeydownBase"
      >
        <div
          v-if="showInsideList && preview && filesList.length"
          class="pfFileUpload__files pfFileUpload__files_inside"
          :class="props.ui?.files"
        >
          <slot
            name="files"
            :files="filesList"
            :open="open"
            :remove-file="removeFile"
          >
            <div
              v-for="(file, index) in filesList"
              :key="fileKey(file)"
              class="pfFileUpload__file pfFileUpload__file_list"
              :class="props.ui?.file"
              @click.stop="stopOpen"
            >
              <slot
                name="file"
                :file="file"
                :index="index"
                :remove-file="removeFile"
              >
                <div
                  class="pfFileUpload__fileLeading"
                  :class="props.ui?.fileLeadingAvatar"
                >
                  <slot name="file-leading" :file="file">
                    <div class="pfFileUpload__fileAvatar">
                      <PfIcon
                        v-if="!canRenderImagePreview(file)"
                        :name="fileIcon ?? 'file'"
                        :size="iconSizeForUpload"
                      />
                      <img
                        v-else
                        class="pfFileUpload__fileImg"
                        :src="previewUrl(file)"
                        :alt="file.name"
                      />
                    </div>
                  </slot>
                </div>
                <div
                  class="pfFileUpload__fileText"
                  :class="props.ui?.fileWrapper"
                >
                  <slot name="file-name" :file="file">
                    <span
                      class="pfFileUpload__fileName"
                      :class="props.ui?.fileName"
                    >
                      {{ file.name }}
                    </span>
                  </slot>
                  <slot name="file-size" :file="file">
                    <span
                      class="pfFileUpload__fileSize"
                      :class="props.ui?.fileSize"
                    >
                      {{ formatBytes(file.size) }}
                    </span>
                  </slot>
                </div>
                <div
                  class="pfFileUpload__fileTrailing"
                  :class="props.ui?.fileTrailingButton"
                >
                  <slot
                    name="file-trailing"
                    :file="file"
                    :remove-file="removeFile"
                  >
                    <PfButton
                      v-if="deleteButtonProps && fileDelete"
                      v-bind="deleteButtonProps"
                      type="button"
                      :icon="fileDeleteIcon"
                      aria-label="Remove file"
                      @click.stop="removeFile(file)"
                    />
                  </slot>
                </div>
              </slot>
            </div>
          </slot>
        </div>

        <div
          v-if="showGridOverlay"
          class="pfFileUpload__gridOverlay"
          :class="props.ui?.files"
          @click="onGridOverlayClick"
        >
          <slot
            name="files"
            :files="filesList"
            :open="open"
            :remove-file="removeFile"
          >
            <div
              v-for="(file, index) in filesList"
              :key="fileKey(file)"
              class="pfFileUpload__file pfFileUpload__file_grid pfFileUpload__file_gridSingle"
              :class="props.ui?.file"
            >
              <slot
                name="file"
                :file="file"
                :index="index"
                :remove-file="removeFile"
              >
                <div
                  class="pfFileUpload__gridCell"
                  :class="props.ui?.fileLeadingAvatar"
                >
                  <slot name="file-leading" :file="file">
                    <PfIcon
                      v-if="!canRenderImagePreview(file)"
                      :name="fileIcon ?? 'file'"
                      size="lg"
                    />
                    <img
                      v-else
                      class="pfFileUpload__gridImg"
                      :src="previewUrl(file)"
                      :alt="file.name"
                    />
                  </slot>
                  <div
                    v-if="deleteButtonProps && fileDelete"
                    class="pfFileUpload__gridRemove"
                    :class="props.ui?.fileTrailingButton"
                  >
                    <slot
                      name="file-trailing"
                      :file="file"
                      :remove-file="removeFile"
                    >
                      <PfButton
                        v-bind="deleteButtonProps"
                        type="button"
                        :icon="fileDeleteIcon"
                        aria-label="Remove file"
                        @click.stop="removeFile(file)"
                      />
                    </slot>
                  </div>
                </div>
              </slot>
            </div>
          </slot>
        </div>

        <div
          v-show="showEmptyAreaContent"
          class="pfFileUpload__wrapper"
          :class="props.ui?.wrapper"
        >
          <slot name="leading" />
          <div class="pfFileUpload__iconCircle" :class="props.ui?.avatar">
            <PfIcon
              :name="icon ?? 'upload'"
              :size="iconSizeForUpload"
              :class="props.ui?.icon"
            />
          </div>
          <slot name="label">
            <p
              v-if="label"
              class="pfFileUpload__label"
              :class="props.ui?.label"
            >
              {{ label }}
            </p>
          </slot>
          <slot name="description">
            <p
              v-if="description"
              class="pfFileUpload__description"
              :class="props.ui?.description"
            >
              {{ description }}
            </p>
          </slot>
        </div>

        <div
          v-if="appSlots.actions"
          class="pfFileUpload__actions"
          :class="props.ui?.actions"
        >
          <slot name="actions" :open="open" />
        </div>
      </div>

      <div
        v-if="showOutsideList && preview && filesList.length"
        class="pfFileUpload__files pfFileUpload__files_outside"
        :class="props.ui?.files"
      >
        <slot
          name="files"
          :files="filesList"
          :open="open"
          :remove-file="removeFile"
        >
          <div
            v-for="(file, index) in filesList"
            :key="fileKey(file)"
            class="pfFileUpload__file pfFileUpload__file_list"
            :class="props.ui?.file"
            @click.stop="stopOpen"
          >
            <slot
              name="file"
              :file="file"
              :index="index"
              :remove-file="removeFile"
            >
              <div
                class="pfFileUpload__fileLeading"
                :class="props.ui?.fileLeadingAvatar"
              >
                <slot name="file-leading" :file="file">
                  <div class="pfFileUpload__fileAvatar">
                    <PfIcon
                      v-if="!canRenderImagePreview(file)"
                      :name="fileIcon ?? 'file'"
                      :size="iconSizeForUpload"
                    />
                    <img
                      v-else
                      class="pfFileUpload__fileImg"
                      :src="previewUrl(file)"
                      :alt="file.name"
                    />
                  </div>
                </slot>
              </div>
              <div
                class="pfFileUpload__fileText"
                :class="props.ui?.fileWrapper"
              >
                <slot name="file-name" :file="file">
                  <span
                    class="pfFileUpload__fileName"
                    :class="props.ui?.fileName"
                  >
                    {{ file.name }}
                  </span>
                </slot>
                <slot name="file-size" :file="file">
                  <span
                    class="pfFileUpload__fileSize"
                    :class="props.ui?.fileSize"
                  >
                    {{ formatBytes(file.size) }}
                  </span>
                </slot>
              </div>
              <div
                class="pfFileUpload__fileTrailing"
                :class="props.ui?.fileTrailingButton"
              >
                <slot
                  name="file-trailing"
                  :file="file"
                  :remove-file="removeFile"
                >
                  <PfButton
                    v-if="deleteButtonProps && fileDelete"
                    v-bind="deleteButtonProps"
                    type="button"
                    :icon="fileDeleteIcon"
                    aria-label="Remove file"
                    @click.stop="removeFile(file)"
                  />
                </slot>
              </div>
            </slot>
          </div>
        </slot>
      </div>

      <div
        v-if="showGridBelow && filesList.length"
        class="pfFileUpload__files pfFileUpload__files_gridBelow"
        :class="props.ui?.files"
      >
        <slot
          name="files"
          :files="filesList"
          :open="open"
          :remove-file="removeFile"
        >
          <div
            v-for="(file, index) in filesList"
            :key="fileKey(file)"
            class="pfFileUpload__file pfFileUpload__file_grid"
            :class="props.ui?.file"
            @click.stop="stopOpen"
          >
            <slot
              name="file"
              :file="file"
              :index="index"
              :remove-file="removeFile"
            >
              <div
                class="pfFileUpload__gridCell"
                :class="props.ui?.fileLeadingAvatar"
              >
                <slot name="file-leading" :file="file">
                  <PfIcon
                    v-if="!canRenderImagePreview(file)"
                    :name="fileIcon ?? 'file'"
                    size="lg"
                  />
                  <img
                    v-else
                    class="pfFileUpload__gridImg"
                    :src="previewUrl(file)"
                    :alt="file.name"
                  />
                </slot>
                <div
                  v-if="deleteButtonProps && fileDelete"
                  class="pfFileUpload__gridRemove"
                  :class="props.ui?.fileTrailingButton"
                >
                  <slot
                    name="file-trailing"
                    :file="file"
                    :remove-file="removeFile"
                  >
                    <PfButton
                      v-bind="deleteButtonProps"
                      type="button"
                      :icon="fileDeleteIcon"
                      aria-label="Remove file"
                      @click.stop="removeFile(file)"
                    />
                  </slot>
                </div>
              </div>
            </slot>
          </div>
        </slot>
      </div>

      <slot
        v-if="appSlots['files-bottom']"
        name="files-bottom"
        :open="open"
        :remove-file="removeFile"
        :files="filesList"
      />
    </template>

    <p
      class="pfFileUpload__error"
      :class="{ pfFileUpload__error_visible: resolvedError }"
      aria-live="polite"
    >
      {{ resolvedError }}
    </p>
  </component>
</template>

<style scoped lang="scss">
.pfFileUpload {
  position: relative;

  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--pf-space-sm);
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-family: var(--pf-font-sans);

  transition: opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload__input {
  position: absolute;
  margin: -1px;

  padding: 0;
  width: 1px;
  height: 1px;

  white-space: nowrap;

  border: 0;
  overflow: hidden;

  clip: rect(0, 0, 0, 0);
}

.pfFileUpload_disabled {
  opacity: 0.75;

  cursor: not-allowed;
}

.pfFileUpload__buttonRow {
  padding: var(--pf-space-sm);
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--pf-space-md);

  border: 1px dashed transparent;
  border-radius: var(--pf-radius-md);

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    border-color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload__buttonWrap {
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-sm);
}

.pfFileUpload__buttonInlineFile {
  padding: var(--pf-space-sm);
  min-width: 0;
  display: flex;
  align-items: center;
  flex: 1 1 12rem;
  gap: var(--pf-space-sm);

  background: color-mix(in srgb, var(--pf-color-muted) 8%, transparent);
  border: 1px solid var(--pf-border-color);
  border-radius: var(--pf-radius-sm);

  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload__iconCircle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  color: var(--pf-color-primary);

  background: var(--pf-file-upload-icon-circle-bg);
  border-radius: 50%;
}

.pfFileUpload_variant_button .pfFileUpload__iconCircle {
  width: var(--pf-avatar-size-lg);
  height: var(--pf-avatar-size-lg);
}

.pfFileUpload_size_xs.pfFileUpload_variant_button .pfFileUpload__iconCircle {
  width: var(--pf-avatar-size-sm);
  height: var(--pf-avatar-size-sm);
}

.pfFileUpload_size_sm.pfFileUpload_variant_button .pfFileUpload__iconCircle {
  width: var(--pf-avatar-size-md);
  height: var(--pf-avatar-size-md);
}

.pfFileUpload_size_lg.pfFileUpload_variant_button .pfFileUpload__iconCircle,
.pfFileUpload_size_xl.pfFileUpload_variant_button .pfFileUpload__iconCircle {
  width: var(--pf-avatar-size-xl);
  height: var(--pf-avatar-size-xl);
}

.pfFileUpload__buttonCol {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-xs);
}

.pfFileUpload__buttonDescription {
  margin: 0;

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-sm);
}

.pfFileUpload__base {
  position: relative;

  padding: var(--pf-space-lg);
  min-height: var(--pf-file-upload-min-height);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex: 1;
  box-sizing: border-box;

  background: transparent;
  border: 1px solid var(--pf-border-color);
  border-radius: var(--pf-radius-md);

  transition:
    background-color var(--pf-animation-duration) var(--pf-animation-easing),
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload:not(.pfFileUpload_disabled) .pfFileUpload__base_interactive {
  cursor: pointer;
}

.pfFileUpload_dragging .pfFileUpload__base_dropzone {
  box-shadow: 0 0 0 3px
    color-mix(
      in srgb,
      var(--pf-file-upload-focus, var(--pf-color-primary)) 22%,
      transparent
    );
  background: var(--pf-file-upload-drag-overlay);
  border-color: var(--pf-file-upload-focus, var(--pf-color-primary));
}

.pfFileUpload_layout_grid .pfFileUpload__base {
  min-height: var(--pf-file-upload-min-height);
}

.pfFileUpload__base:focus-within {
  outline: 2px solid var(--pf-file-upload-focus, var(--pf-color-primary));
  outline-offset: 2px;
}

.pfFileUpload_color_primary {
  --pf-file-upload-focus: var(--pf-color-primary);
}

.pfFileUpload_color_secondary {
  --pf-file-upload-focus: var(--pf-color-secondary);
}

.pfFileUpload_color_success {
  --pf-file-upload-focus: var(--pf-color-success);
}

.pfFileUpload_color_info {
  --pf-file-upload-focus: var(--pf-color-info);
}

.pfFileUpload_color_warning {
  --pf-file-upload-focus: var(--pf-color-warning);
}

.pfFileUpload_color_error {
  --pf-file-upload-focus: var(--pf-color-error);
}

.pfFileUpload_color_neutral {
  --pf-file-upload-focus: var(--pf-color-neutral);
}

.pfFileUpload_highlight .pfFileUpload__base {
  border-color: var(--pf-file-upload-focus, var(--pf-color-primary));
}

.pfFileUpload__base_dropzone {
  border-style: dashed;
}

.pfFileUpload_variant_area .pfFileUpload__base_interactive:hover {
  background: var(--pf-file-upload-hover-overlay);
}

.pfFileUpload_variant_button.pfFileUpload_dragging .pfFileUpload__buttonRow {
  background: var(--pf-file-upload-drag-overlay);
  border-color: var(--pf-file-upload-focus, var(--pf-color-primary));
}

.pfFileUpload__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;

  text-align: center;

  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload_variant_area .pfFileUpload__iconCircle {
  width: 3rem;
  height: 3rem;
}

.pfFileUpload_size_xs .pfFileUpload__iconCircle {
  width: 2.25rem;
  height: 2.25rem;
}

.pfFileUpload_size_sm .pfFileUpload__iconCircle {
  width: 2.5rem;
  height: 2.5rem;
}

.pfFileUpload_size_lg .pfFileUpload__iconCircle,
.pfFileUpload_size_xl .pfFileUpload__iconCircle {
  width: 3.5rem;
  height: 3.5rem;
}

.pfFileUpload__label {
  margin: var(--pf-space-sm) 0 0;

  font-weight: var(--pf-font-weight-bold);
  line-height: var(--pf-line-height-md);
}

.pfFileUpload_size_xs .pfFileUpload__label,
.pfFileUpload_size_sm .pfFileUpload__label {
  font-size: var(--pf-font-size-sm);
}

.pfFileUpload_size_md .pfFileUpload__label,
.pfFileUpload_size_lg .pfFileUpload__label,
.pfFileUpload_size_xl .pfFileUpload__label {
  font-size: var(--pf-font-size-md, 1rem);
}

.pfFileUpload__description {
  margin: var(--pf-space-sm) 0 0;

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-sm);
  line-height: var(--pf-line-height-sm);
}

.pfFileUpload__actions {
  margin-top: var(--pf-space-lg);

  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--pf-space-sm);
}

.pfFileUpload__files {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-sm);
}

.pfFileUpload__files_outside {
  order: 0;
}

.pfFileUpload__files_button {
  margin-top: var(--pf-space-xs);
}

.pfFileUpload__files_gridBelow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--pf-space-lg);
}

@media (min-width: 768px) {
  .pfFileUpload__files_gridBelow {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.pfFileUpload__files_inside {
  margin-bottom: var(--pf-space-md);
}

.pfFileUpload__file {
  position: relative;

  box-sizing: border-box;
}

.pfFileUpload__file_list {
  padding: var(--pf-space-md);
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--pf-space-md);

  background: color-mix(in srgb, var(--pf-color-muted) 8%, transparent);
  border: 1px solid var(--pf-border-color);
  border-radius: var(--pf-radius-sm);

  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    border-color var(--pf-animation-duration) var(--pf-animation-easing),
    background-color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload_size_xs .pfFileUpload__file_list,
.pfFileUpload_size_sm .pfFileUpload__file_list {
  padding: var(--pf-space-sm);
  gap: var(--pf-space-sm);

  font-size: var(--pf-font-size-xs);
}

.pfFileUpload__fileAvatar {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  background: color-mix(
    in srgb,
    var(--pf-color-muted) 14%,
    var(--pf-color-surface)
  );
  border-radius: 50%;
  overflow: hidden;
}

.pfFileUpload__fileImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pfFileUpload__fileText {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.pfFileUpload__fileName {
  font-size: var(--pf-font-size-sm);
  font-weight: var(--pf-font-weight-medium);
  line-height: var(--pf-line-height-sm);
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfFileUpload__fileSize {
  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
}

.pfFileUpload__fileTrailing {
  margin-inline-start: auto;

  flex-shrink: 0;
}

.pfFileUpload__file_grid {
  position: relative;

  padding: 0;
  min-height: var(--pf-file-upload-grid-cell-min);
  aspect-ratio: 1;

  background: transparent;
  border: none;
}

.pfFileUpload__gridCell {
  position: relative;

  width: 100%;
  height: 100%;
  min-height: var(--pf-file-upload-grid-cell-min);
  display: flex;
  align-items: center;
  justify-content: center;

  background: color-mix(in srgb, var(--pf-color-muted) 8%, transparent);
  border: 1px solid var(--pf-border-color);
  border-radius: var(--pf-radius-sm);
  overflow: hidden;

  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    border-color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload__gridImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pfFileUpload__gridRemove {
  position: absolute;
  top: var(--pf-space-sm);
  z-index: 2;
  inset-inline-end: var(--pf-space-sm);
}

.pfFileUpload__gridRemove :deep(.pfButton) {
  border: 2px solid var(--pf-color-surface);
  border-radius: 50%;
}

.pfFileUpload__gridOverlay {
  inset: 0;
  position: absolute;
  z-index: 1;

  pointer-events: auto;
}

.pfFileUpload__file_gridSingle {
  inset: 0;
  position: absolute;

  width: 100%;
  height: 100%;
}

.pfFileUpload__file_gridSingle .pfFileUpload__gridCell {
  min-height: 100%;

  border-radius: var(--pf-radius-md);
}

.pfFileUpload__error {
  margin: 0;

  min-height: calc(var(--pf-font-size-xs) * var(--pf-line-height-sm));

  color: var(--pf-color-error);
  font-size: var(--pf-font-size-xs);
  line-height: var(--pf-line-height-sm);

  opacity: 0;

  transform: translateY(-2px);
  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfFileUpload__error_visible {
  opacity: 1;

  transform: translateY(0);
}
</style>
