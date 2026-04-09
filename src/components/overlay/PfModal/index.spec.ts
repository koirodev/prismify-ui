import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfModal from './index.vue';

describe('PfModal', () => {
  it('opens from trigger and emits update:open', async () => {
    const w = mount(PfModal, {
      attachTo: document.body,
      slots: {
        default: '<button type="button">Open</button>',
        body: '<div>Body</div>',
      },
    });

    const trigger = w.find('[data-pf-modal-trigger]');
    await trigger.trigger('click');
    await flushPromises();
    await w.vm.$nextTick();

    expect(w.emitted('update:open')?.flat()).toContain(true);

    w.unmount();
  });

  it('renders panel when open is true', async () => {
    const w = mount(PfModal, {
      attachTo: document.body,
      props: {
        open: true,
      },
      slots: {
        default: '<button type="button">Open</button>',
        body: '<div>Body</div>',
      },
    });

    await flushPromises();
    await w.vm.$nextTick();

    expect(document.body.querySelector('.pfModal__content')).toBeTruthy();

    w.unmount();
  });

  it('emits close:prevent when dismissible is false and overlay clicked', async () => {
    const w = mount(PfModal, {
      attachTo: document.body,
      props: {
        open: true,
        dismissible: false,
      },
      slots: {
        default: '<button type="button">Open</button>',
        body: '<div>Body</div>',
      },
    });

    await flushPromises();
    await w.vm.$nextTick();

    const overlay = document.body.querySelector('.pfModal__overlay');
    expect(overlay).toBeTruthy();

    await new DOMWrapper(overlay as HTMLElement).trigger('pointerdown');
    await w.vm.$nextTick();

    expect(w.emitted('close:prevent')).toBeTruthy();

    w.unmount();
  });
});
