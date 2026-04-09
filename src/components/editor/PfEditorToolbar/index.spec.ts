import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfEditor from '../PfEditor/index.vue';
import PfEditorToolbar from './index.vue';

describe('PfEditorToolbar', () => {
  it('renders fixed toolbar buttons', async () => {
    const wrapper = mount({
      components: { PfEditor, PfEditorToolbar },
      data() {
        return {
          value: '# Toolbar',
          items: [
            [
              { kind: 'mark', mark: 'bold', icon: 'bold', label: 'Bold' },
              { kind: 'mark', mark: 'italic', icon: 'italic', label: 'Italic' },
            ],
          ],
        };
      },
      template: `
        <PfEditor v-model="value" content-type="markdown">
          <template #default="{ editor }">
            <PfEditorToolbar :editor="editor" :items="items" />
          </template>
        </PfEditor>
      `,
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.pfButton').length).toBeGreaterThan(0);
    wrapper.unmount();
  });
});
