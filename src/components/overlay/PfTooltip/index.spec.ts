import { DOMWrapper, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import PfApp from '../../layout/PfApp/index.vue';
import PfTooltip from './index.vue';

describe('PfTooltip', () => {
  it('opens on hover after delayDuration', async () => {
    vi.useFakeTimers();
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);

    const w = mount(PfTooltip, {
      attachTo: wrap,
      props: { text: 'Tip', delayDuration: 100 },
      slots: { default: '<button>trigger</button>' },
    });

    const trigger = wrap.querySelector('.pfTooltip__trigger') as HTMLElement;
    await new DOMWrapper(trigger).trigger('pointerenter');
    vi.advanceTimersByTime(99);
    await nextTick();
    expect(document.body.querySelector('.pfTooltip__content')).toBeNull();

    vi.advanceTimersByTime(1);
    await nextTick();
    expect(document.body.querySelector('.pfTooltip__content')).toBeTruthy();

    w.unmount();
    wrap.remove();
    vi.useRealTimers();
  });

  it('supports controlled open with v-model', async () => {
    const Host = defineComponent({
      components: { PfTooltip },
      setup() {
        const open = ref(false);
        return { open };
      },
      template: `
        <PfTooltip v-model:open="open" text="Hello">
          <button id="trigger">x</button>
        </PfTooltip>
      `,
    });

    const w = mount(Host, { attachTo: document.body });
    await w.find('#trigger').trigger('focusin');
    await nextTick();
    expect(document.body.querySelector('.pfTooltip__content')).toBeTruthy();
    w.unmount();
  });

  it('reads delayDuration from PfApp tooltip config', async () => {
    vi.useFakeTimers();
    const Child = defineComponent({
      components: { PfTooltip },
      render() {
        return h(
          PfTooltip,
          { text: 'From app' },
          { default: () => h('button', { id: 'trigger' }, 'x') }
        );
      },
    });
    const w = mount(PfApp, {
      attachTo: document.body,
      props: { tooltip: { delayDuration: 0 } },
      slots: { default: () => h(Child) },
    });

    await w.find('.pfTooltip__trigger').trigger('pointerenter');
    vi.advanceTimersByTime(0);
    await nextTick();
    expect(document.body.querySelector('.pfTooltip__content')).toBeTruthy();
    w.unmount();
    vi.useRealTimers();
  });
});
