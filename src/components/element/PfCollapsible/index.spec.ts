import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfButton from '../PfButton/index.vue';
import PfCollapsible from './index.vue';

describe('PfCollapsible', () => {
  it('toggles open on trigger click and sets data-state on root', async () => {
    const w = mount(PfCollapsible, {
      slots: {
        default: '<button type="button">Open</button>',
        content: '<p>Panel</p>',
      },
    });
    const root = w.find('.pfCollapsible');
    expect(root.attributes('data-state')).toBe('closed');

    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(root.attributes('data-state')).toBe('open');
    expect(w.html()).toContain('Panel');

    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(root.attributes('data-state')).toBe('closed');
  });

  it('emits update:open when toggled', async () => {
    const w = mount(PfCollapsible, {
      slots: {
        default: '<button type="button">T</button>',
        content: 'c',
      },
    });
    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(w.emitted('update:open')?.[0]).toEqual([true]);
    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(w.emitted('update:open')?.[1]).toEqual([false]);
  });

  it('respects controlled open: emits update:open and reacts to prop', async () => {
    const w = mount(PfCollapsible, {
      props: { open: false, unmountOnHide: true },
      slots: {
        default: '<button type="button">T</button>',
        content: '<span>Inside</span>',
      },
    });
    expect(w.find('.pfCollapsible__content').exists()).toBe(false);

    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(w.emitted('update:open')?.[0]).toEqual([true]);
    expect(w.find('.pfCollapsible__content').exists()).toBe(false);

    await w.setProps({ open: true });
    expect(w.find('.pfCollapsible__content').exists()).toBe(true);

    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(w.emitted('update:open')?.[1]).toEqual([false]);
  });

  it('does not toggle when disabled', async () => {
    const w = mount(PfCollapsible, {
      props: { disabled: true, defaultOpen: false },
      slots: {
        default: '<button type="button">T</button>',
        content: 'c',
      },
    });
    await w.find('.pfCollapsible__trigger').trigger('click');
    expect(w.emitted('update:open')).toBeFalsy();
    expect(w.find('.pfCollapsible').attributes('data-state')).toBe('closed');
  });

  it('keeps content in DOM when closed and unmountOnHide is false', () => {
    const w = mount(PfCollapsible, {
      props: { unmountOnHide: false, defaultOpen: false },
      slots: {
        default: '<button type="button">T</button>',
        content: '<span id="keep">K</span>',
      },
    });
    expect(w.find('#keep').exists()).toBe(true);
    expect(w.find('.pfCollapsible__content').classes()).toContain(
      'pfCollapsible__content_closed'
    );
  });

  it('removes content from DOM when closed and unmountOnHide is true', () => {
    const w = mount(PfCollapsible, {
      props: { unmountOnHide: true, defaultOpen: false },
      slots: {
        default: '<button type="button">T</button>',
        content: '<span id="gone">G</span>',
      },
    });
    expect(w.find('#gone').exists()).toBe(false);
  });

  it('starts open with defaultOpen', () => {
    const w = mount(PfCollapsible, {
      props: { defaultOpen: true },
      slots: {
        default: '<button type="button">T</button>',
        content: 'c',
      },
    });
    expect(w.props('defaultOpen')).toBe(true);
    expect(w.find('.pfCollapsible').attributes('data-state')).toBe('open');
  });

  it('works with PfButton in default slot', async () => {
    const w = mount(PfCollapsible, {
      slots: {
        default: '<PfButton label="Go" />',
        content: 'x',
      },
      global: { components: { PfButton } },
    });
    await w.findComponent(PfButton).trigger('click');
    expect(w.emitted('update:open')?.[0]).toEqual([true]);
  });
});
