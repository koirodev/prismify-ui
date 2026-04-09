<script setup lang="ts">
import PfApp from '@/components/layout/PfApp/index.vue';
import PfButton from '@/components/element/PfButton/index.vue';
import { usePfToast } from '@/composables/usePfToast';

const toast = usePfToast();

function showToast() {
  const eventDate = new Date(Date.now() + Math.random() * 31536000000);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  toast.add({
    title: 'Event added to calendar',
    description: `This event is scheduled for ${formattedDate}.`,
    icon: 'calendar',
    color: 'primary',
  });
}
</script>

<template>
  <PfApp :toaster="{ position: 'bottom-right', duration: 5000, max: 4 }">
    <div class="playground">
      <h1 class="playground__title">PfToast playground</h1>
      <p class="playground__hint">
        Click the button to show a toast via
        <code>usePfToast()</code>
        .
      </p>

      <PfButton
        label="Add to calendar"
        variant="outline"
        icon="plus"
        @click="showToast"
      />
    </div>
  </PfApp>
</template>

<style scoped lang="scss">
.playground {
  box-sizing: border-box;
  min-height: 100vh;
  margin: 0;
  padding: 1.5rem;
  font-family: system-ui, sans-serif;
  background: var(--pf-bg, #f4f4f5);
  color: var(--pf-fg, #18181b);
}

.playground__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.playground__hint {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  opacity: 0.85;
}
</style>
