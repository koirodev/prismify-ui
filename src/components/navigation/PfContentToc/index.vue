<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  resolveDynamicComponent,
  useAttrs,
  type Component,
  type PropType,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';

export type PfContentTocColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfContentTocHighlightVariant = 'straight' | 'circuit';

export interface PfContentTocLink {
  id?: string;
  text?: string;
  to?: string;
  href?: string;
  children?: PfContentTocLink[];
  [key: string]: unknown;
}

export type PfContentTocUi = Partial<{
  root: string;
  container: string;
  top: string;
  bottom: string;
  trigger: string;
  title: string;
  trailing: string;
  trailingIcon: string;
  content: string;
  list: string;
  listWithChildren: string;
  item: string;
  itemWithChildren: string;
  link: string;
  linkText: string;
  indicator: string;
  indicatorLine: string;
  indicatorActive: string;
}>;

defineOptions({ inheritAttrs: false });

defineSlots<{
  leading(): unknown;
  default(): unknown;
  trailing(): unknown;
  content(): unknown;
  link(props: {
    link: PfContentTocLink;
    active: boolean;
    level: number;
  }): unknown;
  top(): unknown;
  bottom(): unknown;
}>();

const props = defineProps({
  as: [String, Object] as PropType<string | Component | undefined>,
  trailingIcon: {
    type: String as PropType<PfIconName>,
    default: 'angleSmallDown',
  },
  title: {
    type: String,
    default: 'Table of Contents',
  },
  color: {
    type: String as PropType<PfContentTocColor>,
    default: 'primary',
  },
  highlight: {
    type: Boolean,
    default: false,
  },
  highlightColor: {
    type: String as PropType<PfContentTocColor | undefined>,
    default: undefined,
  },
  highlightVariant: {
    type: String as PropType<PfContentTocHighlightVariant>,
    default: 'straight',
  },
  links: {
    type: Array as PropType<readonly PfContentTocLink[]>,
    default: () => [] as readonly PfContentTocLink[],
  },
  ui: Object as PropType<PfContentTocUi | undefined>,
  defaultOpen: {
    type: Boolean,
    default: true,
  },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  move: [id: string];
}>();

const attrs = useAttrs();
const vnodeProps = computed(
  () => getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
);

function isOpenControlled(): boolean {
  const p = vnodeProps.value;
  return (
    props.open !== undefined &&
    p != null &&
    (typeof p['onUpdate:open'] === 'function' ||
      typeof p.onUpdateOpen === 'function')
  );
}

const localOpen = ref(props.defaultOpen);
const openState = computed(() =>
  isOpenControlled() ? Boolean(props.open) : localOpen.value
);

function setOpen(value: boolean) {
  emit('update:open', value);
  if (!isOpenControlled()) localOpen.value = value;
}

function toggleOpen() {
  setOpen(!openState.value);
}

const activeId = ref<string>('');
let observer: IntersectionObserver | null = null;
let scrollFallback: (() => void) | null = null;

function normalizeLinkTarget(link: PfContentTocLink): string {
  if (typeof link.href === 'string' && link.href.startsWith('#')) {
    return link.href;
  }
  if (typeof link.to === 'string' && link.to.startsWith('#')) {
    return link.to;
  }
  if (typeof link.id === 'string' && link.id.trim() !== '') {
    return `#${link.id}`;
  }
  return '#';
}

function linkId(link: PfContentTocLink): string {
  const target = normalizeLinkTarget(link);
  return target.startsWith('#') ? target.slice(1) : target;
}

function flattenLinks(links: readonly PfContentTocLink[]): PfContentTocLink[] {
  const out: PfContentTocLink[] = [];
  for (const link of links) {
    out.push(link);
    if (Array.isArray(link.children) && link.children.length > 0) {
      out.push(...flattenLinks(link.children));
    }
  }
  return out;
}

function activeFromHash() {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  if (hash && hash !== '#') {
    activeId.value = hash.slice(1);
  }
}

function setupObserver() {
  if (typeof window === 'undefined') return;
  const win = window as any;
  const ids = flattenLinks(props.links).map(linkId).filter(Boolean);
  if (ids.length === 0) return;

  if ('IntersectionObserver' in win) {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const best = visible[0];
        if (best?.target instanceof HTMLElement && best.target.id) {
          activeId.value = best.target.id;
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.1, 0.2, 0.35, 0.5, 0.75],
      }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return;
  }

  const onScroll = () => {
    const candidates = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);
    let current: HTMLElement | null = null;
    for (const el of candidates) {
      if (el.getBoundingClientRect().top <= 120) {
        current = el;
      } else {
        break;
      }
    }
    if (current?.id) activeId.value = current.id;
  };

  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('hashchange', activeFromHash);
  onScroll();
  scrollFallback = () => {
    win.removeEventListener('scroll', onScroll);
    win.removeEventListener('hashchange', activeFromHash);
  };
}

onMounted(() => {
  activeFromHash();
  setupObserver();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  scrollFallback?.();
  scrollFallback = null;
});

const resolvedTag = computed(() => {
  const t = props.as ?? 'nav';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const effectiveHighlightColor = computed(
  () => props.highlightColor ?? props.color
);
const rootClass = computed(() => [
  'pfContentToc',
  `pfContentToc_color_${props.color}`,
  `pfContentToc_highlightColor_${effectiveHighlightColor.value}`,
  `pfContentToc_highlightVariant_${props.highlightVariant}`,
  props.highlight ? 'pfContentToc_highlight' : null,
  attrs.class,
  props.ui?.root,
]);

function linkIsActive(link: PfContentTocLink): boolean {
  const id = linkId(link);
  if (!id) return false;
  return activeId.value === id;
}

function onClickLink(link: PfContentTocLink, event: MouseEvent) {
  const target = normalizeLinkTarget(link);
  if (!target.startsWith('#')) return;
  const id = target.slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    event.preventDefault();
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
    activeId.value = id;
    emit('move', id);
  }
}
</script>

<template>
  <component :is="resolvedTag" :class="rootClass">
    <div class="pfContentToc__container" :class="ui?.container">
      <div class="pfContentToc__top" :class="ui?.top">
        <slot name="top" />
      </div>

      <button
        class="pfContentToc__trigger"
        :class="ui?.trigger"
        type="button"
        :aria-expanded="openState"
        @click="toggleOpen"
      >
        <slot name="leading" />
        <span class="pfContentToc__title" :class="ui?.title">{{ title }}</span>
        <span class="pfContentToc__trailing" :class="ui?.trailing">
          <slot name="trailing">
            <PfIcon
              class="pfContentToc__trailingIcon"
              :class="[
                ui?.trailingIcon,
                openState ? 'pfContentToc__trailingIcon_open' : null,
              ]"
              :name="trailingIcon"
              size="sm"
            />
          </slot>
        </span>
      </button>

      <div
        class="pfContentToc__content"
        :class="[
          ui?.content,
          openState
            ? 'pfContentToc__content_open'
            : 'pfContentToc__content_closed',
        ]"
      >
        <slot name="content">
          <ul class="pfContentToc__list" :class="ui?.list">
            <template
              v-for="(link, index) in links"
              :key="`${linkId(link)}-${index}`"
            >
              <li
                class="pfContentToc__item"
                :class="[
                  ui?.item,
                  Array.isArray(link.children) && link.children.length
                    ? ['pfContentToc__itemWithChildren', ui?.itemWithChildren]
                    : null,
                ]"
              >
                <a
                  class="pfContentToc__link"
                  :class="[
                    ui?.link,
                    linkIsActive(link)
                      ? 'pfContentToc__link_active'
                      : 'pfContentToc__link_inactive',
                  ]"
                  :href="normalizeLinkTarget(link)"
                  @click="onClickLink(link, $event)"
                >
                  <slot
                    name="link"
                    :link="link"
                    :active="linkIsActive(link)"
                    :level="0"
                  >
                    <span class="pfContentToc__linkText" :class="ui?.linkText">
                      {{ link.text }}
                    </span>
                  </slot>
                </a>

                <ul
                  v-if="Array.isArray(link.children) && link.children.length"
                  class="pfContentToc__list pfContentToc__listWithChildren"
                  :class="ui?.listWithChildren"
                >
                  <li
                    v-for="(child, childIndex) in link.children"
                    :key="`${linkId(child)}-${childIndex}`"
                    class="pfContentToc__item"
                    :class="ui?.item"
                  >
                    <a
                      class="pfContentToc__link"
                      :class="[
                        ui?.link,
                        linkIsActive(child)
                          ? 'pfContentToc__link_active'
                          : 'pfContentToc__link_inactive',
                      ]"
                      :href="normalizeLinkTarget(child)"
                      @click="onClickLink(child, $event)"
                    >
                      <slot
                        name="link"
                        :link="child"
                        :active="linkIsActive(child)"
                        :level="1"
                      >
                        <span
                          class="pfContentToc__linkText"
                          :class="ui?.linkText"
                        >
                          {{ child.text }}
                        </span>
                      </slot>
                    </a>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </slot>
      </div>

      <div class="pfContentToc__bottom" :class="ui?.bottom">
        <slot name="bottom" />
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfContentToc {
  --pf-content-toc-accent: var(--pf-color-primary);
  --pf-content-toc-highlight: var(--pf-color-primary);

  position: sticky;
  top: var(--pf-header-height, 0);

  max-height: calc(100vh - var(--pf-header-height, 0px));

  font-family: var(--pf-font-sans);

  overflow: auto;

  &__container {
    padding: var(--pf-space-md) 0;
    display: flex;
    flex-direction: column;
    gap: var(--pf-space-sm);
  }

  &__trigger {
    padding: var(--pf-space-xs) 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--pf-space-xs);

    color: var(--pf-color-text);
    font-size: var(--pf-font-size-sm);
    font-weight: var(--pf-font-weight-semibold);
    text-align: left;

    background: transparent;
    border: 0;

    cursor: pointer;

    &:focus-visible {
      box-shadow: var(--pf-focus-ring);
      border-radius: var(--pf-radius-sm);
      outline: none;
    }
  }

  &__title {
    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &__trailing {
    margin-inline-start: auto;

    display: inline-flex;
    align-items: center;
  }

  &__trailingIcon {
    transition: transform var(--pf-animation-duration)
      var(--pf-animation-easing);

    &_open {
      transform: rotate(180deg);
    }
  }

  &__content {
    overflow: hidden;

    transition:
      max-height var(--pf-animation-duration) var(--pf-animation-easing),
      opacity var(--pf-animation-duration) var(--pf-animation-easing);

    &_open {
      max-height: 60rem;

      opacity: 1;
    }

    &_closed {
      max-height: 0;

      opacity: 0;

      pointer-events: none;
    }
  }

  &__list {
    margin: 0;

    padding: 0;

    list-style: none;
  }

  &__listWithChildren {
    border-inline-start: var(--pf-stroke-width) solid var(--pf-border-color);

    margin-top: var(--pf-space-2xs);
    margin-inline-start: var(--pf-space-sm);

    padding-inline-start: var(--pf-space-sm);
  }

  &__item {
    min-width: 0;
  }

  &__link {
    position: relative;

    padding: 0.28rem 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--pf-space-xs);

    font-size: var(--pf-font-size-sm);
    line-height: var(--pf-line-height-md);
    text-decoration: none;

    transition: color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__link_inactive {
    color: var(--pf-color-muted);

    &:hover {
      color: var(--pf-color-text);
    }
  }

  &__link_active {
    color: var(--pf-content-toc-accent);
    font-weight: var(--pf-font-weight-medium);
  }

  &__linkText {
    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;

    overflow: hidden;
  }

  &_highlight.pfContentToc_highlightVariant_straight &__link_active::before {
    content: '';

    position: absolute;
    inset-block: 0.2rem;
    inset-inline-start: calc(var(--pf-space-sm) * -1);

    width: 2px;

    background: var(--pf-content-toc-highlight);
    border-radius: 999px;
  }

  &_highlight.pfContentToc_highlightVariant_circuit &__list {
    border-inline-start: var(--pf-stroke-width) solid var(--pf-border-color);

    margin-inline-start: var(--pf-space-2xs);

    padding-inline-start: var(--pf-space-sm);
  }

  &_highlight.pfContentToc_highlightVariant_circuit &__link_active::before {
    content: '';

    position: absolute;
    top: 50%;
    inset-inline-start: calc(-1 * var(--pf-space-sm));

    width: var(--pf-space-sm);
    height: var(--pf-stroke-width);

    background: var(--pf-content-toc-highlight);

    transform: translateY(-50%);
  }

  &_color_primary {
    --pf-content-toc-accent: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-content-toc-accent: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-content-toc-accent: var(--pf-color-success);
  }

  &_color_info {
    --pf-content-toc-accent: var(--pf-color-info);
  }

  &_color_warning {
    --pf-content-toc-accent: var(--pf-color-warning);
  }

  &_color_error {
    --pf-content-toc-accent: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-content-toc-accent: var(--pf-color-text);
  }

  &_highlightColor_primary {
    --pf-content-toc-highlight: var(--pf-color-primary);
  }

  &_highlightColor_secondary {
    --pf-content-toc-highlight: var(--pf-color-secondary);
  }

  &_highlightColor_success {
    --pf-content-toc-highlight: var(--pf-color-success);
  }

  &_highlightColor_info {
    --pf-content-toc-highlight: var(--pf-color-info);
  }

  &_highlightColor_warning {
    --pf-content-toc-highlight: var(--pf-color-warning);
  }

  &_highlightColor_error {
    --pf-content-toc-highlight: var(--pf-color-error);
  }

  &_highlightColor_neutral {
    --pf-content-toc-highlight: var(--pf-color-text);
  }
}
</style>
