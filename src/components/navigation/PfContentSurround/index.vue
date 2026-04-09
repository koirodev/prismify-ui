<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
  type PropType,
} from 'vue';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import PfLink from '../PfLink/index.vue';

export interface PfContentSurroundItem {
  title?: string;
  description?: string;
  to?: string;
  href?: string;
  target?: string;
  external?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

export type PfContentSurroundUi = Partial<{
  root: string;
  link: string;
  linkLeading: string;
  linkLeadingIcon: string;
  linkTitle: string;
  linkDescription: string;
}>;

defineOptions({ inheritAttrs: false });

const props = defineProps({
  as: [String, Object] as PropType<string | Component | undefined>,
  prevIcon: {
    type: String as PropType<PfIconName>,
    default: 'angleSmallLeft',
  },
  nextIcon: {
    type: String as PropType<PfIconName>,
    default: 'angleSmallRight',
  },
  items: {
    type: Array as PropType<readonly (PfContentSurroundItem | undefined)[]>,
    default: () => [] as readonly (PfContentSurroundItem | undefined)[],
  },
  ui: Object as PropType<PfContentSurroundUi | undefined>,
});

const attrs = useAttrs();

const resolvedTag = computed(() => {
  const tag = props.as ?? 'nav';
  return typeof tag === 'string' ? resolveDynamicComponent(tag) : tag;
});

const surroundItems = computed(() => {
  const left = props.items[0];
  const right = props.items[1];
  return [
    { item: left, direction: 'left' as const },
    { item: right, direction: 'right' as const },
  ];
});

const rootClass = computed(() => [
  'pfContentSurround',
  attrs.class,
  props.ui?.root,
]);
</script>

<template>
  <component :is="resolvedTag" :class="rootClass">
    <template v-for="entry in surroundItems" :key="entry.direction">
      <slot
        v-if="$slots.link && entry.item"
        name="link"
        :item="entry.item"
        :direction="entry.direction"
      />
      <PfLink
        v-else-if="entry.item"
        raw
        class="pfContentSurround__link"
        :class="[
          ui?.link,
          entry.direction === 'right' ? 'pfContentSurround__link_right' : null,
        ]"
        :to="entry.item.to"
        :href="entry.item.href"
        :target="entry.item.target"
        :external="entry.item.external"
        :disabled="entry.item.disabled"
      >
        <span
          class="pfContentSurround__linkLeading"
          :class="[
            ui?.linkLeading,
            entry.direction === 'right'
              ? 'pfContentSurround__linkLeading_right'
              : null,
          ]"
        >
          <slot
            name="link-leading"
            :item="entry.item"
            :direction="entry.direction"
          >
            <PfIcon
              :name="entry.direction === 'left' ? prevIcon : nextIcon"
              size="sm"
              :class="ui?.linkLeadingIcon"
            />
          </slot>
        </span>
        <span class="pfContentSurround__linkTitle" :class="ui?.linkTitle">
          <slot
            name="link-title"
            :item="entry.item"
            :direction="entry.direction"
          >
            {{ entry.item.title }}
          </slot>
        </span>
        <span
          v-if="entry.item.description || $slots['link-description']"
          class="pfContentSurround__linkDescription"
          :class="ui?.linkDescription"
        >
          <slot
            name="link-description"
            :item="entry.item"
            :direction="entry.direction"
          >
            {{ entry.item.description }}
          </slot>
        </span>
      </PfLink>
      <span v-else class="pfContentSurround__placeholder" aria-hidden="true" />
    </template>
  </component>
</template>

<style scoped lang="scss">
.pfContentSurround {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--pf-space-lg);

  font-family: var(--pf-font-sans);

  @media (min-width: 40rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__link {
    padding: var(--pf-space-lg);
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--pf-space-xs);

    text-decoration: none;

    background: var(--pf-color-surface);
    border: var(--pf-stroke-width) solid var(--pf-border-color);
    border-radius: var(--pf-radius-md);

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      border-color var(--pf-animation-duration) var(--pf-animation-easing);

    &:hover {
      background: color-mix(in srgb, var(--pf-color-muted) 8%, transparent);
      border-color: color-mix(
        in srgb,
        var(--pf-color-muted) 35%,
        var(--pf-border-color)
      );
    }

    &_right {
      text-align: right;
    }
  }

  &__linkLeading {
    padding: var(--pf-space-2xs);
    width: fit-content;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    color: var(--pf-color-text);

    background: color-mix(in srgb, var(--pf-color-muted) 12%, transparent);
    border: var(--pf-stroke-width) solid var(--pf-border-color);
    border-radius: 999px;

    &_right {
      margin-inline-start: auto;
    }
  }

  &__linkTitle {
    color: var(--pf-color-text);
    font-size: var(--pf-font-size-md);
    font-weight: var(--pf-font-weight-medium);
    line-height: var(--pf-line-height-md);
  }

  &__linkDescription {
    color: var(--pf-color-muted);
    font-size: var(--pf-font-size-sm);
    line-height: var(--pf-line-height-md);
  }

  &__placeholder {
    display: none;

    @media (min-width: 40rem) {
      display: block;
    }
  }
}
</style>
