import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import PfDropdownMenu from './index.vue';

const router = createRouter({
  history: createMemoryHistory('/'),
  routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
});

describe('PfDropdownMenu', () => {
  it('renders menu when open is true', async () => {
    const w = mount(PfDropdownMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        open: true,
        items: [[{ label: 'Item A' }]],
      },
      slots: {
        default: '<button type="button">trigger</button>',
      },
    });
    await flushPromises();
    await w.vm.$nextTick();

    expect(document.body.querySelector('.pfDropdownMenuItems')).toBeTruthy();
    w.unmount();
  });

  it('emits update:open on trigger click', async () => {
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);

    const w = mount(PfDropdownMenu, {
      attachTo: wrap,
      global: { plugins: [router] },
      props: {
        items: [[{ label: 'Item A' }]],
      },
      slots: {
        default: '<button type="button">trigger</button>',
      },
    });

    const trigger = wrap.querySelector('[data-pf-dropdown-menu-trigger]');
    expect(trigger).toBeTruthy();
    await new DOMWrapper(trigger as HTMLElement).trigger('click');
    await flushPromises();
    await w.vm.$nextTick();

    expect(w.emitted('update:open')?.flat()).toContain(true);
    w.unmount();
    wrap.remove();
  });

  it('calls onSelect and closes on item click', async () => {
    const onSelect = vi.fn();
    const w = mount(PfDropdownMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        open: true,
        items: [[{ label: 'Item A', onSelect }]],
        'onUpdate:open': (value: boolean) => w.setProps({ open: value }),
      },
      slots: {
        default: '<button type="button">trigger</button>',
      },
    });
    await flushPromises();
    await w.vm.$nextTick();

    const itemButton = document.body.querySelector(
      'button.pfDropdownMenuItems__item'
    ) as HTMLButtonElement | null;
    expect(itemButton).toBeTruthy();
    itemButton?.click();
    await w.vm.$nextTick();

    expect(onSelect).toHaveBeenCalled();
    expect(document.body.querySelector('.pfDropdownMenuItems')).toBeNull();
    w.unmount();
  });

  it('filters items and emits update:searchTerm', async () => {
    const w = mount(PfDropdownMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        open: true,
        filter: true,
        items: [[{ label: 'Alpha' }, { label: 'Beta' }]],
      },
      slots: {
        default: '<button type="button">trigger</button>',
      },
    });
    await flushPromises();
    await w.vm.$nextTick();

    const input = document.body.querySelector(
      '.pfDropdownMenuItems .pfInput input'
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();
    if (input) {
      input.value = 'bet';
      input.dispatchEvent(new Event('input'));
    }
    await w.vm.$nextTick();

    expect(w.emitted('update:searchTerm')).toBeTruthy();
    w.unmount();
  });

  it('does not render interactive item for separator', async () => {
    const w = mount(PfDropdownMenu, {
      attachTo: document.body,
      global: { plugins: [router] },
      props: {
        open: true,
        items: [
          [{ type: 'separator' }, { label: 'Dark mode' }, { label: 'Logout' }],
        ],
      },
      slots: {
        default: '<button type="button">trigger</button>',
      },
    });
    await flushPromises();
    await w.vm.$nextTick();

    const buttons = document.body.querySelectorAll(
      '.pfDropdownMenuItems button.pfDropdownMenuItems__item'
    );
    expect(buttons).toHaveLength(2);
    w.unmount();
  });
});
