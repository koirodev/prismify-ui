import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { usePfApp } from '../../../composables/usePfApp';
import PfApp from './index.vue';

describe('PfApp', () => {
  it('renders slot', () => {
    const w = mount(PfApp, { slots: { default: 'main' } });
    expect(w.text()).toContain('main');
  });

  it('sets dir on root when passed', () => {
    const w = mount(PfApp, {
      props: { dir: 'rtl' },
      slots: { default: 'x' },
    });
    expect(w.find('.pfApp').attributes('dir')).toBe('rtl');
  });

  it('provides locale to descendants via usePfApp', () => {
    const Child = defineComponent({
      setup() {
        const app = usePfApp();
        return () => h('span', app.value.locale ?? '');
      },
    });
    const w = mount(PfApp, {
      props: { locale: 'de-DE' },
      slots: { default: () => h(Child) },
    });
    expect(w.find('span').text()).toBe('de-DE');
  });

  it('resolves portal false', () => {
    const Child = defineComponent({
      setup() {
        const app = usePfApp();
        return () => h('span', String(app.value.portalTarget));
      },
    });
    const w = mount(PfApp, {
      props: { portal: false },
      slots: { default: () => h(Child) },
    });
    expect(w.find('span').text()).toBe('false');
  });
});
