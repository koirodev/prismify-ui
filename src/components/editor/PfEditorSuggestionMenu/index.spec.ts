import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfEditor from '../PfEditor/index.vue';
import PfEditorSuggestionMenu from './index.vue';

describe('PfEditorSuggestionMenu', () => {
  it('mounts inside editor without runtime errors', async () => {
    const wrapper = mount({
      components: { PfEditor, PfEditorSuggestionMenu },
      data() {
        return {
          value: '',
          items: [
            [
              { kind: 'paragraph', label: 'Paragraph', icon: 'text' },
              {
                kind: 'heading',
                level: 1,
                label: 'Heading 1',
                icon: 'heading1',
              },
            ],
          ],
        };
      },
      template: `
        <PfEditor v-model="value" content-type="markdown">
          <template #default="{ editor }">
            <PfEditorSuggestionMenu :editor="editor" :items="items" />
          </template>
        </PfEditor>
      `,
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(PfEditorSuggestionMenu).exists()).toBe(true);
    wrapper.unmount();
  });
});
