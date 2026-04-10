<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { usePfApp } from '../../../composables/usePfApp';
import {
  usePfToast,
  type PfToastRecord,
} from '../../../composables/usePfToast';
import PfToast from '../PfToast/index.vue';

const props = withDefaults(
  defineProps<{
    position?:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right';
    duration?: number;
    max?: number;
  }>(),
  {
    position: 'bottom-right',
    duration: 3500,
    max: 5,
  }
);

const app = usePfApp();
const toast = usePfToast();
const timers = ref(new Map<string, ReturnType<typeof setTimeout>>());
const timerMeta = ref(
  new Map<string, { remaining: number; startedAt: number }>()
);
const pausedIds = ref(new Set<string>());
const overflowHiddenIds = ref(new Set<string>());
const overflowEnteringIds = ref(new Set<string>());

const teleportTarget = computed(() => {
  const t = app.value.portalTarget;
  if (t === false) return 'body';
  if (typeof t === 'string') return t;
  return t;
});

const effectiveDuration = computed(
  () => app.value.toaster?.duration ?? props.duration
);

const visibleItems = computed(() => {
  const max = Math.max(1, props.max);
  const start = Math.max(0, toast.items.length - max);
  return toast.items.slice(start);
});

const stackClass = computed(() => [
  'pfToaster',
  `pfToaster_position_${props.position}`,
]);

function clearTimer(id: string) {
  const timer = timers.value.get(id);
  if (timer != null) {
    clearTimeout(timer);
    timers.value.delete(id);
  }
}

function totalDurationFor(item: PfToastRecord) {
  return item.duration ?? effectiveDuration.value;
}

function schedule(item: PfToastRecord) {
  clearTimer(item.id);
  const duration = totalDurationFor(item);
  if (duration == null || duration <= 0) return;
  const existingMeta = timerMeta.value.get(item.id);
  const remaining = existingMeta?.remaining ?? duration;
  timerMeta.value.set(item.id, {
    remaining,
    startedAt: Date.now(),
  });
  const timer = setTimeout(() => {
    remove(item.id);
  }, remaining);
  timers.value.set(item.id, timer);
}

function remove(id: string) {
  clearTimer(id);
  timerMeta.value.delete(id);
  pausedIds.value.delete(id);
  toast.remove(id);
}

function pause(id: string) {
  pausedIds.value.add(id);
  const meta = timerMeta.value.get(id);
  if (meta) {
    const elapsed = Math.max(0, Date.now() - meta.startedAt);
    meta.remaining = Math.max(0, meta.remaining - elapsed);
    timerMeta.value.set(id, meta);
  }
  clearTimer(id);
}

function resume(item: PfToastRecord) {
  pausedIds.value.delete(item.id);
  schedule(item);
}

watch(
  () => toast.items.map((item) => `${item.id}:${item.createdAt}`),
  () => {
    const existing = new Set(toast.items.map((item) => item.id));
    const now = Date.now();
    for (const [id] of timers.value.entries()) {
      if (!existing.has(id)) {
        clearTimer(id);
        timerMeta.value.delete(id);
        pausedIds.value.delete(id);
      } else {
        const meta = timerMeta.value.get(id);
        if (meta && !pausedIds.value.has(id)) {
          const elapsed = Math.max(0, now - meta.startedAt);
          meta.remaining = Math.max(0, meta.remaining - elapsed);
          timerMeta.value.set(id, meta);
        }
      }
    }
    for (const item of toast.items) {
      schedule(item);
    }
  },
  { immediate: true }
);

watch(
  () => visibleItems.value.map((item) => item.id),
  (next, prev = []) => {
    const nextSet = new Set(next);
    const prevSet = new Set(prev);
    const allIds = new Set(toast.items.map((item) => item.id));

    for (const id of prevSet) {
      if (!nextSet.has(id) && allIds.has(id)) {
        overflowHiddenIds.value.add(id);
      }
    }

    for (const id of nextSet) {
      if (!prevSet.has(id) && overflowHiddenIds.value.has(id)) {
        overflowEnteringIds.value.add(id);
        overflowHiddenIds.value.delete(id);
        window.setTimeout(() => {
          overflowEnteringIds.value.delete(id);
        }, 350);
      }
    }
  },
  { immediate: true }
);

function itemTransitionClass(id: string) {
  return [
    overflowEnteringIds.value.has(id) && 'pfToast_transition_overflowEnter',
  ];
}

function onBeforeLeave(el: Element) {
  const node = el as HTMLElement;
  const id = node.dataset.pfToastId;
  if (id && overflowHiddenIds.value.has(id)) {
    node.classList.add('pfToast_transition_overflowLeave');
  }
}

function progressDuration(item: PfToastRecord) {
  const meta = timerMeta.value.get(item.id);
  if (meta) return meta.remaining;
  const duration = totalDurationFor(item);
  if (duration == null || duration <= 0) return 0;
  return duration;
}

onBeforeUnmount(() => {
  for (const [id] of timers.value.entries()) clearTimer(id);
  timerMeta.value.clear();
  pausedIds.value.clear();
});
</script>

<template>
  <Teleport :to="teleportTarget">
    <div :class="stackClass" aria-live="polite" aria-atomic="false">
      <TransitionGroup
        name="pfToastStack"
        tag="div"
        class="pfToaster__list"
        @before-leave="onBeforeLeave"
      >
        <PfToast
          v-for="item in visibleItems"
          :id="item.id"
          :key="item.id"
          :data-pf-toast-id="item.id"
          :class="itemTransitionClass(item.id)"
          :title="item.title"
          :description="item.description"
          :icon="item.icon"
          :color="item.color ?? 'primary'"
          :orientation="item.orientation ?? 'vertical'"
          :close="item.close ?? true"
          :close-icon="item.closeIcon ?? 'crossSmall'"
          :actions="item.actions ?? []"
          :progress="item.progress ?? true"
          :progress-duration="progressDuration(item)"
          :progress-paused="pausedIds.has(item.id)"
          :pulse="item.pulse"
          @close="remove(item.id)"
          @pointerenter="pause(item.id)"
          @pointerleave="resume(item)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.pfToaster {
  inset: var(--pf-space-md);
  position: fixed;
  z-index: var(--pf-toast-z-index);

  display: flex;

  pointer-events: none;
}

.pfToaster_position_top-left {
  align-items: flex-start;
  justify-content: flex-start;
}

.pfToaster_position_top-center {
  align-items: flex-start;
  justify-content: center;
}

.pfToaster_position_top-right {
  align-items: flex-start;
  justify-content: flex-end;
}

.pfToaster_position_bottom-left {
  align-items: flex-end;
  justify-content: flex-start;
}

.pfToaster_position_bottom-center {
  align-items: flex-end;
  justify-content: center;
}

.pfToaster_position_bottom-right {
  align-items: flex-end;
  justify-content: flex-end;
}

.pfToaster__list {
  width: min(100vw - var(--pf-space-xl), var(--pf-toast-width));
  display: flex;
  flex-direction: column;
  gap: var(--pf-space-sm);
}

.pfToastStack-enter-active,
.pfToastStack-leave-active {
  transform-origin: bottom center;
  transition:
    transform var(--pf-animation-duration) var(--pf-animation-easing),
    opacity var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfToastStack-move {
  transition: transform var(--pf-animation-duration) var(--pf-animation-easing);
}

.pfToastStack-enter-from,
.pfToastStack-leave-to {
  opacity: 0;

  transform: translateY(100%);
}

.pfToastStack-enter-from {
  opacity: 0;

  transform: translateY(100%);
}

.pfToastStack-enter-from.pfToast_transition_overflowEnter {
  opacity: 0;

  transform: scale(0.7);
}

.pfToastStack-leave-to.pfToast_transition_overflowLeave {
  opacity: 0;

  transform: scale(0.7);
}

.pfToastStack-leave-active {
  position: absolute;
}

@media (max-width: 64rem) {
  .pfToaster_position_top-right,
  .pfToaster_position_bottom-right {
    justify-content: center;
  }

  .pfToaster__list {
    width: 100%;
  }
}
</style>
