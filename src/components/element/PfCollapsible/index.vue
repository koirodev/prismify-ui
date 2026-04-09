<script setup lang="ts">
import {
  computed,
  ref,
  resolveDynamicComponent,
  useAttrs,
  type Component,
  type PropType,
} from 'vue';

export type PfCollapsibleUi = Partial<{
  root: string;
  content: string;
}>;

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** Root tag or component */
  as: [String, Object] as PropType<string | Component | undefined>,
  ui: Object as PropType<PfCollapsibleUi | undefined>,
  /** Blocks expand and trigger clicks */
  disabled: Boolean,
  /** Initial state without `v-model:open` */
  defaultOpen: Boolean,
  /**
   * Controlled state (`v-model:open`). Runtime `default: undefined`, otherwise Vue
   * injects `false` for `Boolean` and you lose the distinction vs an omitted prop.
   */
  open: {
    type: Boolean,
    required: false,
    default: undefined as boolean | undefined,
  },
  /**
   * When `true`, content is removed from the DOM when closed.
   * When `false`, the block stays mounted (smooth collapse).
   */
  unmountOnHide: { type: Boolean, default: false },
});

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const attrs = useAttrs();
const isControlled = computed(() => props.open !== undefined);
const internalOpen = ref(props.defaultOpen ?? false);

const isOpen = computed(() =>
  isControlled.value ? Boolean(props.open) : internalOpen.value
);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const rootClass = computed(() => [
  'pfCollapsible',
  props.disabled ? 'pfCollapsible_disabled' : null,
  attrs.class,
  props.ui?.root,
]);

const showContentInDom = computed(() => !props.unmountOnHide || isOpen.value);

function setOpen(next: boolean) {
  if (props.disabled) return;
  if (!isControlled.value) {
    internalOpen.value = next;
  }
  emit('update:open', next);
}

function toggle() {
  setOpen(!isOpen.value);
}

function onTriggerClick() {
  toggle();
}
</script>

<template>
  <component
    :is="resolvedTag"
    :class="rootClass"
    :data-state="isOpen ? 'open' : 'closed'"
    v-bind="passthroughAttrs"
  >
    <div
      class="pfCollapsible__trigger"
      data-pf-collapsible-trigger
      @click="onTriggerClick"
    >
      <slot />
    </div>

    <!-- Always mounted when unmountOnHide=false; otherwise only when open -->
    <div
      v-if="showContentInDom"
      class="pfCollapsible__content"
      :class="[
        !unmountOnHide ? 'pfCollapsible__content_animated' : null,
        !unmountOnHide && isOpen ? 'pfCollapsible__content_open' : null,
        !unmountOnHide && !isOpen ? 'pfCollapsible__content_closed' : null,
        ui?.content,
      ]"
      :aria-hidden="unmountOnHide ? undefined : !isOpen || undefined"
      :data-state="isOpen ? 'open' : 'closed'"
    >
      <div class="pfCollapsible__contentInner">
        <slot name="content" />
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfCollapsible {
  min-width: 0;
  box-sizing: border-box;

  &_disabled {
    .pfCollapsible__trigger {
      opacity: 0.6;

      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

.pfCollapsible__trigger {
  min-width: 0;
}

.pfCollapsible__content {
  min-width: 0;
  box-sizing: border-box;

  &_animated {
    display: grid;

    overflow: hidden;

    transition: grid-template-rows var(--pf-animation-duration)
      var(--pf-animation-easing);
  }

  &_animated.pfCollapsible__content_closed {
    grid-template-rows: 0fr;
  }

  &_animated.pfCollapsible__content_open {
    grid-template-rows: 1fr;
  }
}

.pfCollapsible__contentInner {
  min-height: 0;

  overflow: hidden;
}
</style>
