import { mount, flushPromises } from '@vue/test-utils';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import PfButton from '../PfButton/index.vue';
import PfIcon from '../PfIcon/index.vue';
import PfBanner from './index.vue';

describe('PfBanner', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        store = {};
      },
      key: () => null,
      length: 0,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders title', () => {
    const w = mount(PfBanner, {
      props: { title: 'Hello banner' },
    });
    expect(w.text()).toContain('Hello banner');
  });

  it('applies color class', () => {
    const w = mount(PfBanner, {
      props: { title: 'T', color: 'warning' },
    });
    expect(w.find('.pfBanner').classes()).toContain('pfBanner_color_warning');
  });

  it('emits close and hides when close is clicked', async () => {
    const w = mount(PfBanner, {
      props: {
        title: 'T',
        close: true,
      },
    });
    await flushPromises();
    await w.find('.pfBanner__close button').trigger('click');
    expect(w.emitted('close')?.length).toBe(1);
    expect(w.find('.pfBanner').exists()).toBe(false);
  });

  it('persists dismiss to localStorage when id is set', async () => {
    const w = mount(PfBanner, {
      props: {
        id: 'unit-test-banner',
        title: 'T',
        close: true,
      },
    });
    await flushPromises();
    await w.find('.pfBanner__close button').trigger('click');
    expect(store['banner-unit-test-banner']).toBe('1');
  });

  it('does not render when storage key exists on mount', async () => {
    store['banner-persisted'] = '1';
    const w = mount(PfBanner, {
      props: {
        id: 'persisted',
        title: 'Hidden',
      },
    });
    await flushPromises();
    expect(w.find('.pfBanner').exists()).toBe(false);
  });

  it('renders leading icon when icon prop set', async () => {
    const w = mount(PfBanner, {
      props: {
        title: 'T',
        icon: 'info',
      },
    });
    await flushPromises();
    expect(w.find('.pfBanner__icon').findComponent(PfIcon).exists()).toBe(true);
  });

  it('renders custom close icon', async () => {
    const w = mount(PfBanner, {
      props: {
        title: 'T',
        close: true,
        closeIcon: 'arrowRight',
      },
    });
    await flushPromises();
    const btn = w.findComponent(PfButton);
    expect(btn.props('icon')).toBe('arrowRight');
  });

  it('renders action buttons from actions prop', async () => {
    const w = mount(PfBanner, {
      props: {
        title: 'T',
        actions: [{ label: 'OK' }, { label: 'Cancel', variant: 'outline' }],
      },
    });
    await flushPromises();
    const buttons = w.findAllComponents(PfButton);
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(buttons[0].props('label')).toBe('OK');
    expect(buttons[0].props('size')).toBe('xs');
  });
});
