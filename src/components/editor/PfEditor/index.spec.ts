import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfEditor from './index.vue';

describe('PfEditor', () => {
  it('creates tiptap instance', async () => {
    const wrapper = mount(PfEditor, {
      props: {
        modelValue: '<p>Hello</p>',
        contentType: 'html',
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.pfEditor').exists()).toBe(true);
    expect(wrapper.find('.pfEditor__base').exists()).toBe(true);
    wrapper.unmount();
  });

  it('emits update:modelValue when editor content changes', async () => {
    const wrapper = mount({
      components: { PfEditor },
      data() {
        return {
          value: '<p>Hello</p>',
        };
      },
      template: `
        <PfEditor v-model="value" content-type="html">
          <template #default="{ editor }">
            <button
              type="button"
              class="set-content"
              @click="editor?.commands.setContent('<p>Updated</p>')"
            >
              set
            </button>
          </template>
        </PfEditor>
      `,
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    await wrapper.find('button.set-content').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    const editor = wrapper.findComponent(PfEditor);
    expect(editor.emitted('update:modelValue')).toBeTruthy();
    wrapper.unmount();
  });
});
