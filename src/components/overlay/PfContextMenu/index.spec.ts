import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import PfContextMenu from './index.vue';

const router = createRouter({
  history: createMemoryHistory('/'),
  routes: [{ path: '/', name: 'home', component: { template: '<div/>' } }],
});

describe('PfContextMenu', () => {
  it('renders menu when open is true', async () => {
    const w = mount(PfContextMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        open: true,
        items: [[{ label: 'Beta' }]],
      },
      slots: {
        default: '<div>slot</div>',
      },
    });
    await flushPromises();
    await w.vm.$nextTick();
    expect(document.body.querySelector('.pfContextMenuItems')).toBeTruthy();
    w.unmount();
  });

  it('emits update:open on contextmenu', async () => {
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);

    const w = mount(PfContextMenu, {
      attachTo: wrap,
      global: { plugins: [router] },
      props: {
        items: [[{ label: 'Alpha' }]],
      },
      slots: {
        default: '<div>target</div>',
      },
    });

    const trigger = wrap.querySelector('[data-pf-context-menu-trigger]');
    expect(trigger).toBeTruthy();
    await new DOMWrapper(trigger as HTMLElement).trigger('contextmenu');
    await flushPromises();
    await w.vm.$nextTick();

    expect(w.emitted('update:open')?.flat()).toContain(true);

    w.unmount();
    wrap.remove();
  });

  it('treats open as uncontrolled when null (Storybook) and opens on contextmenu', async () => {
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);

    const w = mount(PfContextMenu, {
      attachTo: wrap,
      global: { plugins: [router] },
      props: {
        items: [[{ label: 'Alpha' }]],
        // Storybook may inject null for boolean from Controls
        // @ts-expect-error — uncontrolled mode
        open: null,
      },
      slots: {
        default: '<div>target</div>',
      },
    });

    await new DOMWrapper(
      wrap.querySelector('[data-pf-context-menu-trigger]') as HTMLElement
    ).trigger('contextmenu');
    await flushPromises();
    await w.vm.$nextTick();

    expect(document.body.querySelector('.pfContextMenuItems')).toBeTruthy();

    w.unmount();
    wrap.remove();
  });

  it('treats open as uncontrolled without update listener and opens on contextmenu', async () => {
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);

    const w = mount(PfContextMenu, {
      attachTo: wrap,
      global: { plugins: [router] },
      props: {
        items: [[{ label: 'Alpha' }]],
        open: false,
      },
      slots: {
        default: '<div>target</div>',
      },
    });

    await new DOMWrapper(
      wrap.querySelector('[data-pf-context-menu-trigger]') as HTMLElement
    ).trigger('contextmenu');
    await flushPromises();
    await w.vm.$nextTick();

    expect(document.body.querySelector('.pfContextMenuItems')).toBeTruthy();

    w.unmount();
    wrap.remove();
  });

  it('calls onSelect and closes when an item is activated', async () => {
    const onSelect = vi.fn();
    const w = mount(PfContextMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        open: true,
        items: [[{ label: 'Alpha', onSelect }]],
        'onUpdate:open': (v: boolean) => w.setProps({ open: v }),
      },
      slots: {
        default: '<div>target</div>',
      },
    });
    await flushPromises();
    await w.vm.$nextTick();

    const menu = document.body.querySelector('.pfContextMenuItems');
    const btn = menu?.querySelector('button.pfContextMenuItems__item') as
      | HTMLButtonElement
      | undefined;
    expect(btn?.textContent).toContain('Alpha');
    btn?.click();
    await w.vm.$nextTick();

    expect(onSelect).toHaveBeenCalled();
    expect(document.body.querySelector('.pfContextMenuItems')).toBeNull();

    w.unmount();
  });

  it('does not open when disabled', async () => {
    const w = mount(PfContextMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        disabled: true,
        items: [[{ label: 'X' }]],
      },
      slots: {
        default: '<div class="pfCtxTestTarget2">t</div>',
      },
    });

    await w.find('.pfCtxTestTarget2').trigger('contextmenu');
    await w.vm.$nextTick();
    expect(document.body.querySelector('.pfContextMenuItems')).toBeNull();

    w.unmount();
  });
});
