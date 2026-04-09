import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFieldGroup from '../../element/PfFieldGroup/index.vue';
import PfTextarea from './index.vue';

describe('PfTextarea', () => {
  it('renders and binds v-model', async () => {
    const w = mount(PfTextarea, {
      props: {
        modelValue: 'a',
        'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      },
    });
    const ta = w.find('textarea');
    expect((ta.element as HTMLTextAreaElement).value).toBe('a');
    await ta.setValue('ab');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('ab');
  });

  it('exposes textareaRef', () => {
    const w = mount(PfTextarea);
    const vm = w.vm as { textareaRef: HTMLTextAreaElement | null };
    expect(vm.textareaRef).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('emits blur', async () => {
    const w = mount(PfTextarea);
    await w.find('textarea').trigger('blur');
    expect(w.emitted('blur')?.length).toBe(1);
  });

  it('inherits size from PfFieldGroup when size prop omitted', () => {
    const w = mount({
      components: { PfFieldGroup, PfTextarea },
      template: '<PfFieldGroup size="xl"><PfTextarea /></PfFieldGroup>',
    });
    const root = w.findComponent(PfTextarea);
    expect(root.classes()).toContain('pfTextarea_size_xl');
  });

  it('sets rows attribute', () => {
    const w = mount(PfTextarea, { props: { rows: 5 } });
    expect(w.find('textarea').attributes('rows')).toBe('5');
  });

  it('disables animated overlay when animatedText is false', () => {
    const w = mount(PfTextarea, {
      props: { animatedText: false, modelValue: 'x' },
    });
    expect(w.find('.pfTextarea__visual').exists()).toBe(false);
    expect(w.classes()).not.toContain('pfTextarea_animated');
  });
});
