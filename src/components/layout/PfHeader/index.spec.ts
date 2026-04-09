import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import PfHeader from './index.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('PfHeader', () => {
  it('renders native header by default', () => {
    const w = mount(PfHeader, {
      props: { title: 'T', to: '/' },
      global: { stubs: { Teleport: true } },
    });
    expect(w.find('header.pfHeader').exists()).toBe(true);
    expect(w.text()).toContain('T');
  });

  it('toggles panel open when body slot exists', async () => {
    const open = ref(false);
    const Parent = defineComponent({
      components: { PfHeader },
      setup() {
        return { open };
      },
      template: `
        <PfHeader v-model:open="open" title="App" to="/">
          <template #body><nav data-testid="mobile">Mobile</nav></template>
        </PfHeader>
      `,
    });
    mount(Parent, { attachTo: document.body });
    const header = document.querySelector('.pfHeader');
    const toggle = header?.querySelector('.pfHeader__toggle');
    expect(toggle).toBeTruthy();

    (toggle as HTMLElement).click();
    await nextTick();

    expect(open.value).toBe(true);

    const panel = document.querySelector('[role="dialog"]');
    expect(panel).toBeTruthy();
    expect(panel?.querySelector('[data-testid="mobile"]')).toBeTruthy();

    (toggle as HTMLElement).click();
    await nextTick();
    expect(open.value).toBe(false);
  });

  it('closes menu when routeKey changes with autoClose', async () => {
    const open = ref(true);
    const routeKey = ref('a');
    const Parent = defineComponent({
      components: { PfHeader },
      setup() {
        return { open, routeKey };
      },
      template: `
        <PfHeader v-model:open="open" :route-key="routeKey" title="App" to="/">
          <template #body><p>Inside</p></template>
        </PfHeader>
      `,
    });
    mount(Parent, {
      global: { stubs: { Teleport: true } },
    });

    routeKey.value = 'b';
    await nextTick();

    expect(open.value).toBe(false);
  });
});
