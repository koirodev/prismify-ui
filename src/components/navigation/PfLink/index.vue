<script setup lang="ts">
import { computed, useAttrs, type Component } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import type { RouteLocationRaw, RouteLocationResolved } from 'vue-router';
import { isQueryEqual, isQueryPartiallyEqual } from '@/utils/pfLinkQuery';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Root element when there is no `to` / `href` @default button */
    as?: string | Component;
    /** Button type when not a link @default button */
    type?: 'reset' | 'submit' | 'button';
    disabled?: boolean;
    /** Force active state (ignore route matching) */
    active?: boolean;
    /** Active only on exact route match (like RouterLink `exact` in Vue 2) */
    exact?: boolean;
    /** Query matching: `true` — full; `partial` — only params listed on the link */
    exactQuery?: boolean | 'partial';
    /** Match hash */
    exactHash?: boolean;
    inactiveClass?: string;
    /** Only classes from `class`, `activeClass`, `inactiveClass`, `exactActiveClass` */
    raw?: boolean;
    to?: RouteLocationRaw;
    /** Ignored when `to` is set */
    href?: RouteLocationRaw;
    external?: boolean;
    target?: (string & {}) | '_blank' | '_parent' | '_self' | '_top' | null;
    rel?:
      | 'noopener'
      | 'noreferrer'
      | 'nofollow'
      | 'sponsored'
      | 'ugc'
      | (string & {})
      | null;
    noRel?: boolean;
    prefetchedClass?: string;
    prefetch?: boolean;
    prefetchOn?:
      | 'visibility'
      | 'interaction'
      | Partial<{ visibility: boolean; interaction: boolean }>;
    noPrefetch?: boolean;
    trailingSlash?: 'remove' | 'append';
    activeClass?: string;
    exactActiveClass?: string;
    ariaCurrentValue?:
      | 'step'
      | 'page'
      | 'true'
      | 'false'
      | 'location'
      | 'date'
      | 'time';
    viewTransition?: boolean;
    replace?: boolean;
    name?: string;
    autofocus?: boolean | 'true' | 'false';
    form?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: boolean | 'true' | 'false';
    formtarget?: string;
    referrerpolicy?: string;
    download?: unknown;
    hreflang?: string;
    media?: string;
    ping?: string;
  }>(),
  {
    as: 'button',
    type: 'button',
    ariaCurrentValue: 'page',
  }
);

defineSlots<{
  default(props: { active: boolean }): unknown;
}>();

const attrs = useAttrs();

const router = useRouter();
const route = useRoute();

const resolvedTo = computed<RouteLocationRaw | undefined>(
  () => props.to ?? props.href
);

const isExternal = computed(() => {
  if (props.external === true) return true;
  if (props.external === false) return false;
  const t = resolvedTo.value;
  if (t == null) return false;
  if (typeof t === 'string') {
    return (
      /^(https?:)?\/\//i.test(t) ||
      /^mailto:/i.test(t) ||
      /^tel:/i.test(t) ||
      /^sms:/i.test(t)
    );
  }
  return false;
});

const hasRouter = computed(() => router != null);

const canUseRouterLink = computed(
  () => hasRouter.value && resolvedTo.value != null && !isExternal.value
);

/** Internal link without vue-router: string `to` / object with `path` only */
const fallbackInternalHref = computed(() => {
  const t = resolvedTo.value;
  if (t == null) {
    return '#';
  }
  if (typeof t === 'string') {
    return t;
  }
  if (typeof t === 'object' && t !== null && 'path' in t) {
    const p = (t as { path: string }).path;
    return typeof p === 'string' ? p : '#';
  }
  return '#';
});

const useStaticInternalLink = computed(
  () => resolvedTo.value != null && !isExternal.value && !hasRouter.value
);

function currentQuery() {
  return route?.query ?? {};
}

function currentHash() {
  return route?.hash ?? '';
}

function isLinkActive(slot: {
  route: RouteLocationResolved;
  isActive: boolean;
  isExactActive: boolean;
}): boolean {
  if (props.active !== undefined) {
    return props.active;
  }

  if (props.exactQuery === 'partial') {
    if (!isQueryPartiallyEqual(slot.route.query, currentQuery())) {
      return false;
    }
  } else if (props.exactQuery === true) {
    if (!isQueryEqual(slot.route.query, currentQuery())) {
      return false;
    }
  }

  if (props.exactHash && slot.route.hash !== currentHash()) {
    return false;
  }

  if (props.exact && slot.isExactActive) {
    return true;
  }

  if (!props.exact && slot.isActive) {
    return true;
  }

  return false;
}

function isExactNavMatch(slot: {
  route: RouteLocationResolved;
  isExactActive: boolean;
}): boolean {
  if (props.active !== undefined) {
    return props.active;
  }
  if (props.exactQuery === 'partial') {
    if (!isQueryPartiallyEqual(slot.route.query, currentQuery())) {
      return false;
    }
  } else if (props.exactQuery === true) {
    if (!isQueryEqual(slot.route.query, currentQuery())) {
      return false;
    }
  }
  if (props.exactHash && slot.route.hash !== currentHash()) {
    return false;
  }
  return slot.isExactActive;
}

function resolveRawClass(slot: {
  route: RouteLocationResolved;
  isActive: boolean;
  isExactActive: boolean;
}) {
  const active = isLinkActive(slot);
  const exact = isExactNavMatch(slot);
  const base = attrs.class;
  if (exact && props.exactActiveClass) {
    return [base, props.exactActiveClass];
  }
  if (active) {
    return [base, props.activeClass];
  }
  return [base, props.inactiveClass];
}

function resolveThemedClass(slot: {
  route: RouteLocationResolved;
  isActive: boolean;
  isExactActive: boolean;
}) {
  const active = isLinkActive(slot);
  return [
    'pfLink',
    {
      pfLink_active: active,
      pfLink_inactive: !active,
      pfLink_disabled: props.disabled,
    },
    attrs.class,
  ];
}

function resolveClass(slot: {
  route: RouteLocationResolved;
  isActive: boolean;
  isExactActive: boolean;
}) {
  return props.raw ? resolveRawClass(slot) : resolveThemedClass(slot);
}

function ariaCurrent(slot: {
  route: RouteLocationResolved;
  isActive: boolean;
  isExactActive: boolean;
}):
  | 'page'
  | 'step'
  | 'location'
  | 'date'
  | 'time'
  | 'true'
  | 'false'
  | undefined {
  if (!isExactNavMatch(slot)) {
    return undefined;
  }
  return props.ariaCurrentValue;
}

function onNavigateClick(
  e: MouseEvent,
  navigate: (e?: MouseEvent) => void | Promise<unknown>
) {
  if (props.disabled) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  const r = navigate(e);
  if (r && typeof (r as Promise<unknown>).catch === 'function') {
    (r as Promise<unknown>).catch(() => {});
  }
}

const relResolved = computed(() => {
  if (props.noRel) {
    return undefined;
  }
  if (props.rel != null) {
    return props.rel;
  }
  if (props.target === '_blank') {
    return 'noopener noreferrer';
  }
  return undefined;
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  delete a.onClick;
  return a;
});

const routerLinkBind = computed(() => ({
  to: resolvedTo.value!,
  replace: props.replace,
  custom: true as const,
  viewTransition: props.viewTransition,
}));

const externalHref = computed(() => {
  const t = resolvedTo.value;
  if (t == null) {
    return undefined;
  }
  return typeof t === 'string' ? t : String(t);
});

function externalActive(): boolean {
  return props.active === true;
}

function resolveExternalClass() {
  const active = externalActive();
  if (props.raw) {
    const base = attrs.class;
    if (active && props.activeClass) {
      return [base, props.activeClass];
    }
    return [base, props.inactiveClass];
  }
  return [
    'pfLink',
    {
      pfLink_active: active,
      pfLink_inactive: !active,
      pfLink_disabled: props.disabled,
    },
    attrs.class,
  ];
}

function resolveStaticClass() {
  const active = props.active === true;
  if (props.raw) {
    const base = attrs.class;
    if (active && props.exactActiveClass) {
      return [base, props.exactActiveClass];
    }
    if (active && props.activeClass) {
      return [base, props.activeClass];
    }
    return [base, props.inactiveClass];
  }
  return [
    'pfLink',
    {
      pfLink_active: active,
      pfLink_inactive: !active,
      pfLink_disabled: props.disabled,
    },
    attrs.class,
  ];
}

function isStringAs(as: typeof props.as): as is string {
  return typeof as === 'string';
}
</script>

<template>
  <RouterLink
    v-if="canUseRouterLink"
    v-slot="{
      route: linkRoute,
      href: linkHref,
      navigate,
      isActive,
      isExactActive,
    }"
    v-bind="routerLinkBind"
  >
    <a
      :class="resolveClass({ route: linkRoute, isActive, isExactActive })"
      :href="linkHref"
      :rel="relResolved ?? undefined"
      :target="target ?? undefined"
      :aria-current="ariaCurrent({ route: linkRoute, isActive, isExactActive })"
      :aria-disabled="disabled ? true : undefined"
      :tabindex="disabled ? -1 : undefined"
      v-bind="passthroughAttrs"
      @click="onNavigateClick($event, navigate)"
    >
      <slot
        :active="isLinkActive({ route: linkRoute, isActive, isExactActive })"
      />
    </a>
  </RouterLink>
  <a
    v-else-if="useStaticInternalLink"
    :class="resolveStaticClass()"
    :href="fallbackInternalHref"
    :rel="relResolved ?? undefined"
    :target="target ?? undefined"
    :aria-disabled="disabled ? true : undefined"
    :tabindex="disabled ? -1 : undefined"
    v-bind="passthroughAttrs"
    @click="
      (e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    "
  >
    <slot :active="active === true" />
  </a>
  <a
    v-else-if="resolvedTo != null && isExternal"
    :class="resolveExternalClass()"
    :href="externalHref"
    :rel="relResolved ?? undefined"
    :target="target ?? undefined"
    :aria-disabled="disabled ? true : undefined"
    :tabindex="disabled ? -1 : undefined"
    v-bind="passthroughAttrs"
    @click="
      (e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    "
  >
    <slot :active="externalActive()" />
  </a>
  <component
    :is="as"
    v-else
    :type="
      isStringAs(as) && (as === 'button' || as === 'submit' || as === 'reset')
        ? type
        : undefined
    "
    :class="
      raw
        ? attrs.class
        : [
            'pfLink',
            {
              pfLink_inactive: true,
              pfLink_disabled: disabled,
            },
            attrs.class,
          ]
    "
    :disabled="disabled"
    :aria-disabled="disabled ? true : undefined"
    v-bind="passthroughAttrs"
    @click="
      (e: MouseEvent) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    "
  >
    <slot :active="false" />
  </component>
</template>

<style scoped lang="scss">
.pfLink {
  margin: 0;

  padding: 0;

  color: var(--pf-link-color-inactive);
  font-family: var(--pf-font-sans);
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-align: inherit;
  text-decoration: none;

  background: none;
  border: none;

  transition: color var(--pf-animation-duration) var(--pf-animation-easing);

  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--pf-link-focus-ring-color);
    outline-offset: 2px;
  }

  &_active {
    color: var(--pf-link-color-active);
  }

  &_inactive:not(&_disabled) {
    &:hover {
      color: var(--pf-link-color-hover);
    }
  }

  &_disabled {
    opacity: var(--pf-link-disabled-opacity);

    cursor: not-allowed;
  }
}
</style>
