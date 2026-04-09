<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  useSlots,
  type Component,
} from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

/**
 * Error payload shaped like Nuxt `NuxtError` (no dependency on `#app`).
 * In Nuxt `error.vue`, you can pass the object from the `error` prop.
 */
export type PfErrorValue = Partial<{
  statusCode: number;
  status: number;
  statusMessage: string;
  statusText: string;
  message: string;
}>;

export type PfErrorClearButtonProps = Partial<{
  label: string;
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral';
  variant: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  square: boolean;
  block: boolean;
  icon: PfIconName;
  leading: boolean;
  leadingIcon: PfIconName;
  trailing: boolean;
  trailingIcon: PfIconName;
  iconOnly: boolean;
  ariaLabel: string;
  disabled: boolean;
  loading: boolean;
  type: 'button' | 'submit' | 'reset';
  href: string;
  to: string;
  target: string;
  rel: string;
  onClick: (event: MouseEvent) => void | Promise<void>;
}>;

export type PfErrorUi = Partial<{
  root: string;
  inner: string;
  statusCode: string;
  statusMessage: string;
  message: string;
  links: string;
}>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root tag or Vue component. */
    as?: string | Component;
    /** Error object (as in Nuxt `error.vue`). */
    error?: PfErrorValue;
    /** Where to go after clear; in Nuxt usually passed to `clearError({ redirect })` in the `@clear` handler. */
    redirect?: string;
    /**
     * Clear button in the `links` slot.
     * `false` — hide the default button (the `links` slot is still available).
     */
    clear?: boolean | PfErrorClearButtonProps;
    /** Extra classes for layout parts. */
    ui?: PfErrorUi;
  }>(),
  {
    redirect: '/',
    clear: true,
  }
);

const emit = defineEmits<{
  clear: [{ redirect: string }];
}>();

const attrs = useAttrs();
const slots = useSlots();

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const resolvedTag = computed(() => {
  const tag = props.as ?? 'main';
  return typeof tag === 'string' ? resolveDynamicComponent(tag) : tag;
});

const rootClass = computed(() => ['pfError', attrs.class, props.ui?.root]);

const statusCodeText = computed(
  () => props.error?.statusCode ?? props.error?.status
);
const statusMessageText = computed(
  () => props.error?.statusMessage ?? props.error?.statusText
);
const messageText = computed(() => props.error?.message);

const showStatusCode = computed(
  () =>
    slots.statusCode != null ||
    (statusCodeText.value != null && String(statusCodeText.value).length > 0)
);

const showStatusMessage = computed(
  () =>
    slots.statusMessage != null ||
    (statusMessageText.value != null &&
      String(statusMessageText.value).length > 0)
);

const showMessage = computed(
  () =>
    slots.message != null ||
    (messageText.value != null && String(messageText.value).length > 0)
);

const showLinks = computed(() => slots.links != null || props.clear !== false);

const clearExtras = computed((): PfErrorClearButtonProps => {
  if (props.clear === false || props.clear === true) return {};
  return props.clear;
});

const clearButtonBind = computed(() => {
  if (props.clear === false) return null;
  const defaults: PfErrorClearButtonProps = {
    size: 'lg',
    color: 'primary',
    variant: 'solid',
    label: 'Back to home',
    type: 'button',
  };
  const { onClick: userOnClick, ...rest } = clearExtras.value;
  return {
    ...defaults,
    ...rest,
    onClick: (e: MouseEvent) => {
      if (typeof userOnClick === 'function') {
        void userOnClick(e);
      }
      emit('clear', { redirect: props.redirect });
    },
  };
});
</script>

<template>
  <component :is="resolvedTag" :class="rootClass" v-bind="passthroughAttrs">
    <slot>
      <div class="pfError__inner" :class="ui?.inner">
        <p
          v-if="showStatusCode"
          class="pfError__statusCode"
          :class="ui?.statusCode"
        >
          <slot name="statusCode">{{ statusCodeText }}</slot>
        </p>
        <h1
          v-if="showStatusMessage"
          class="pfError__statusMessage"
          :class="ui?.statusMessage"
        >
          <slot name="statusMessage">{{ statusMessageText }}</slot>
        </h1>
        <p v-if="showMessage" class="pfError__message" :class="ui?.message">
          <slot name="message">{{ messageText }}</slot>
        </p>
        <div v-if="showLinks" class="pfError__links" :class="ui?.links">
          <slot name="links">
            <PfButton
              v-if="clear !== false && clearButtonBind"
              v-bind="clearButtonBind"
            />
          </slot>
        </div>
      </div>
    </slot>
  </component>
</template>

<style scoped lang="scss">
.pfError {
  padding-inline: var(--pf-container-padding-x);
  min-height: calc(100vh - var(--pf-header-height));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-family: var(--pf-font-sans);
  text-align: center;

  transition: color var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfError__inner {
  width: 100%;
  max-width: min(42rem, 100%);
  box-sizing: border-box;
}

.pfError__statusCode {
  margin: 0;

  color: var(--pf-color-primary);
  font-size: var(--pf-font-size-md);
  font-weight: var(--pf-font-weight-bold);
  line-height: var(--pf-line-height-md);
  text-wrap: balance;
}

.pfError__statusMessage {
  margin: var(--pf-space-md) 0 0;

  color: var(--pf-color-text);
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: var(--pf-font-weight-bold);
  line-height: var(--pf-line-height-sm);
  text-wrap: balance;
}

.pfError__message {
  margin: var(--pf-space-lg) 0 0;

  color: var(--pf-color-muted);
  font-size: var(--pf-font-size-lg);
  line-height: var(--pf-line-height-lg);
  text-wrap: balance;
}

.pfError__links {
  margin-top: var(--pf-space-xl);

  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--pf-space-lg);
}

@media (min-width: 40rem) {
  .pfError {
    padding-inline: var(--pf-container-padding-x-sm);
  }
}

@media (min-width: 64rem) {
  .pfError {
    padding-inline: var(--pf-container-padding-x-lg);
  }
}
</style>
