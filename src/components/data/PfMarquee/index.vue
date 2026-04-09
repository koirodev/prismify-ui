<script setup lang="ts">
import {
  computed,
  resolveDynamicComponent,
  useAttrs,
  type Component,
  type PropType,
} from 'vue';
import { usePfApp } from '../../../composables/usePfApp';

export type PfMarqueeOrientation = 'horizontal' | 'vertical';

export type PfMarqueeUi = Partial<{
  /** Extra classes on the root (on top of `pfMarquee`). */
  root: string;
  /** Extra classes on the animated track (on top of `pfMarquee__track`). */
  content: string;
}>;

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /**
   * Root tag or component (`div` by default).
   * For a component object in `setup`, use `markRaw(Comp)`.
   */
  as: [String, Object] as PropType<string | Component | undefined>,
  /** Pause animation on hover. */
  pauseOnHover: Boolean,
  /** Reverse animation direction. */
  reverse: Boolean,
  /** Scroll direction. */
  orientation: {
    type: String as PropType<PfMarqueeOrientation>,
    default: 'horizontal',
  },
  /**
   * How many times to duplicate content in the track (at least 2).
   * @default 4
   */
  repeat: {
    type: Number,
    default: 4,
  },
  /**
   * Gradient fades at the edges.
   * @default true
   */
  overlay: {
    type: Boolean,
    default: true,
  },
  /** Extra classes per region (like Nuxt UI theme slots). */
  ui: Object as PropType<PfMarqueeUi | undefined>,
});

const attrs = useAttrs();

const resolvedTag = computed(() => {
  const t = props.as ?? 'div';
  return typeof t === 'string' ? resolveDynamicComponent(t) : t;
});

const app = usePfApp();

const isRtl = computed(() => {
  if (app.value.dir === 'rtl') return true;
  if (app.value.dir === 'ltr') return false;
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('dir') === 'rtl';
});

const repeatCount = computed(() => {
  const n = Math.floor(Number(props.repeat));
  if (!Number.isFinite(n) || n < 2) return 2;
  return Math.min(32, n);
});

const rootClass = computed(() => [
  'pfMarquee',
  `pfMarquee_orientation_${props.orientation}`,
  props.overlay && 'pfMarquee_overlay',
  props.pauseOnHover && 'pfMarquee_pauseOnHover',
  props.reverse && 'pfMarquee_reverse',
  isRtl.value && 'pfMarquee_rtl',
  attrs.class,
  props.ui?.root,
]);

const trackClass = computed(() => ['pfMarquee__track', props.ui?.content]);

const trackStyle = computed(() => ({
  '--pf-marquee-repeat': String(repeatCount.value),
}));

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});
</script>

<template>
  <component
    :is="resolvedTag"
    :class="rootClass"
    :data-orientation="orientation"
    v-bind="passthroughAttrs"
  >
    <div class="pfMarquee__viewport">
      <div :class="trackClass" :style="trackStyle">
        <div v-for="n in repeatCount" :key="n" class="pfMarquee__segment">
          <slot />
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
@keyframes pfMarqueeHorizontal {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(calc(-100% / var(--pf-marquee-repeat, 4)), 0, 0);
  }
}

@keyframes pfMarqueeHorizontalRtl {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(calc(100% / var(--pf-marquee-repeat, 4)), 0, 0);
  }
}

@keyframes pfMarqueeVertical {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(0, calc(-100% / var(--pf-marquee-repeat, 4)), 0);
  }
}

@keyframes pfMarqueeVerticalRtl {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(0, calc(100% / var(--pf-marquee-repeat, 4)), 0);
  }
}

.pfMarquee {
  isolation: isolate;

  position: relative;

  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  overflow: hidden;

  &_orientation_horizontal {
    flex-direction: row;
  }

  &_orientation_vertical {
    min-height: 0;
    flex-direction: column;
  }

  &__viewport {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    box-sizing: border-box;

    overflow: hidden;
  }

  &_orientation_vertical &__viewport {
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
  }

  &__track {
    display: flex;
    flex-shrink: 0;
    gap: 0;

    will-change: transform;

    backface-visibility: hidden;
  }

  &_orientation_horizontal &__track {
    width: max-content;
    min-width: max-content;
    flex-direction: row;
    align-items: center;

    animation: pfMarqueeHorizontal var(--pf-marquee-duration) linear infinite;
  }

  &_orientation_horizontal.pfMarquee_rtl &__track {
    animation-name: pfMarqueeHorizontalRtl;
  }

  &_orientation_vertical &__track {
    height: max-content;
    min-height: max-content;
    flex-direction: column;
    align-items: stretch;

    animation: pfMarqueeVertical var(--pf-marquee-duration) linear infinite;
  }

  &_orientation_vertical.pfMarquee_rtl &__track {
    animation-name: pfMarqueeVerticalRtl;
  }

  &_reverse &__track {
    animation-direction: reverse;
  }

  &_pauseOnHover:hover &__track {
    animation-play-state: paused;
  }

  &__segment {
    padding-inline-end: var(--pf-marquee-gap);
    min-width: max-content;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    gap: var(--pf-marquee-gap);
  }

  &_orientation_vertical &__segment {
    padding-block-end: var(--pf-marquee-gap);
    padding-inline-end: 0;
    min-width: auto;
    min-height: max-content;
    flex-direction: column;
  }

  &_overlay {
    &::before,
    &::after {
      content: '';

      position: absolute;
      z-index: var(--pf-marquee-overlay-z-index);

      pointer-events: none;
    }
  }

  &_overlay.pfMarquee_orientation_horizontal {
    &::before {
      inline-size: 33.333%;

      inset-block: 0;
      inset-inline-start: 0;

      background: linear-gradient(
        to right,
        var(--pf-color-surface) 0%,
        transparent 100%
      );
    }

    &::after {
      inline-size: 33.333%;

      inset-block: 0;
      inset-inline-end: 0;

      background: linear-gradient(
        to left,
        var(--pf-color-surface) 0%,
        transparent 100%
      );
    }
  }

  &_overlay.pfMarquee_orientation_vertical {
    &::before {
      block-size: 33.333%;

      inset-block-start: 0;
      inset-inline: 0;

      background: linear-gradient(
        to bottom,
        var(--pf-color-surface) 0%,
        transparent 100%
      );
    }

    &::after {
      block-size: 33.333%;

      inset-block-end: 0;
      inset-inline: 0;

      background: linear-gradient(
        to top,
        var(--pf-color-surface) 0%,
        transparent 100%
      );
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .pfMarquee__track {
    animation: none !important;
  }
}
</style>
