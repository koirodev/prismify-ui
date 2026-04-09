<script lang="ts">
import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  mergeProps,
  provide,
  resolveDynamicComponent,
  type VNode,
} from 'vue';
import type { Component, PropType } from 'vue';
import PfAvatar from '../PfAvatar/index.vue';
import {
  PF_AVATAR_GROUP_INJECTION_KEY,
  type PfAvatarGroupSize,
} from './injection';

function normalizeSlotChildren(raw: VNode[] | undefined): VNode[] {
  if (!raw?.length) return [];
  const out = raw.flatMap((child: VNode) => {
    if (typeof child.type === 'symbol') {
      if (typeof child.children === 'string') return [];
      const inner = child.children as VNode[] | undefined;
      return inner ?? [];
    }
    return [child];
  });
  return out.filter(Boolean) as VNode[];
}

export default defineComponent({
  name: 'PfAvatarGroup',
  inheritAttrs: false,
  props: {
    /**
     * Root tag or component (like `component :is`).
     */
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div',
    },
    /** Size for all avatars in the group (via provide to `PfAvatar`). */
    size: {
      type: String as PropType<PfAvatarGroupSize>,
      default: 'md',
    },
    /**
     * Max visible face avatars from the slot; rest collapse into `+N`.
     * Omitted or ≤ 0 — no limit.
     */
    max: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    provide(
      PF_AVATAR_GROUP_INJECTION_KEY,
      computed(() => ({ size: props.size }))
    );

    const children = computed(() => normalizeSlotChildren(slots.default?.()));

    const maxResolved = computed(() => {
      const m = props.max;
      if (m === undefined || m === null || m === '') return 0;
      const n = typeof m === 'string' ? Number.parseInt(m, 10) : m;
      if (!Number.isFinite(n) || n <= 0) return 0;
      return n;
    });

    const visibleAvatars = computed(() => {
      if (!children.value.length) return [];
      if (!maxResolved.value) {
        return [...children.value].reverse();
      }
      return [...children.value].slice(0, maxResolved.value).reverse();
    });

    const hiddenCount = computed(() => {
      if (!children.value.length) return 0;
      return children.value.length - visibleAvatars.value.length;
    });

    return () => {
      const Tag = resolveDynamicComponent(props.as) as string | Component;
      const itemClass = 'pfAvatarGroup__item';

      const nodes: VNode[] = [];
      let z = 0;

      if (hiddenCount.value > 0) {
        z += 1;
        nodes.push(
          h(PfAvatar, {
            key: 'pf-avatar-group-overflow',
            text: `+${hiddenCount.value}`,
            alt: `${hiddenCount.value} more`,
            class: itemClass,
            style: { zIndex: z },
          })
        );
      }

      for (let i = 0; i < visibleAvatars.value.length; i++) {
        const vnode = visibleAvatars.value[i]!;
        z += 1;
        nodes.push(
          cloneVNode(
            vnode,
            mergeProps(vnode.props ?? {}, {
              class: itemClass,
              style: { zIndex: z },
            })
          )
        );
      }

      return h(
        Tag,
        mergeProps(attrs, {
          class: [
            'pfAvatarGroup',
            `pfAvatarGroup_size_${props.size}`,
            attrs.class,
          ],
        }),
        nodes
      );
    };
  },
});
</script>

<style scoped lang="scss">
.pfAvatarGroup {
  --pf-avatar-group-item-overlap: -0.375rem;
  --pf-avatar-group-item-ring: 2px;

  margin: 0;

  padding: 0;
  display: inline-flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: flex-end;

  vertical-align: middle;

  &_size_3xs,
  &_size_2xs,
  &_size_xs {
    --pf-avatar-group-item-overlap: -0.125rem;
    --pf-avatar-group-item-ring: 1px;
  }

  &_size_sm,
  &_size_md,
  &_size_lg {
    --pf-avatar-group-item-overlap: -0.375rem;
    --pf-avatar-group-item-ring: 2px;
  }

  &_size_xl,
  &_size_2xl,
  &_size_3xl {
    --pf-avatar-group-item-overlap: -0.5rem;
    --pf-avatar-group-item-ring: 3px;
  }

  :deep(.pfAvatarGroup__item) {
    position: relative;

    flex-shrink: 0;

    box-shadow: 0 0 0 var(--pf-avatar-group-item-ring) var(--pf-color-surface);
    border-radius: 50%;
  }

  :deep(.pfAvatarGroup__item:not(:first-child)) {
    margin-inline-end: var(--pf-avatar-group-item-overlap);
  }
}
</style>
