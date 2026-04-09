import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PfApp from '../../layout/PfApp/index.vue';
import { usePfToast } from '../../../composables/usePfToast';

describe('PfToast + PfToaster', () => {
  afterEach(() => {
    usePfToast().clear();
    vi.useRealTimers();
  });

  it('renders toast pushed via composable', async () => {
    const w = mount(PfApp, {
      attachTo: document.body,
      slots: { default: '<div>app</div>' },
    });

    usePfToast().add({
      id: 'toast-a',
      title: 'Saved',
      description: 'Everything is up to date',
    });

    await flushPromises();
    await w.vm.$nextTick();

    expect(document.body.querySelector('.pfToast')).toBeTruthy();
    expect(document.body.textContent).toContain('Saved');

    w.unmount();
  });

  it('auto-dismisses toast by duration', async () => {
    vi.useFakeTimers();

    const w = mount(PfApp, {
      attachTo: document.body,
      props: {
        toaster: { duration: 100 },
      },
      slots: { default: '<div>app</div>' },
    });

    usePfToast().add({
      id: 'toast-b',
      title: 'Temporary',
    });

    await flushPromises();
    await w.vm.$nextTick();
    expect(document.body.textContent).toContain('Temporary');

    vi.advanceTimersByTime(120);
    await flushPromises();
    await w.vm.$nextTick();

    expect(document.body.textContent).not.toContain('Temporary');

    w.unmount();
  });

  it('deduplicates by id and updates pulse', () => {
    const api = usePfToast();
    api.add({ id: 'copy', title: 'Copied' });
    const same = api.add({ id: 'copy', title: 'Copied again' });

    expect(api.items.length).toBe(1);
    expect(same.pulse).toBe(1);
  });
});
