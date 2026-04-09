import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfFileUpload from './index.vue';

describe('PfFileUpload', () => {
  it('updates model with a single file on change', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        multiple: false,
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as File | null }),
      },
    });
    const input = w.find('input[type="file"]');
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    });
    await input.trigger('change');
    await w.vm.$nextTick();
    expect(w.props('modelValue')).toEqual(file);
    w.unmount();
  });

  it('appends files when multiple', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        multiple: true,
        modelValue: [],
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as File[] }),
      },
    });
    const input = w.find('input[type="file"]');
    const f1 = new File(['a'], 'a.txt', { type: 'text/plain' });
    Object.defineProperty(input.element, 'files', {
      value: [f1],
      configurable: true,
    });
    await input.trigger('change');
    await w.vm.$nextTick();
    expect(w.props('modelValue')).toEqual([f1]);
    w.unmount();
  });

  it('exposes open and forwards to input click', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
    });
    let clicks = 0;
    const input = w.find('input[type="file"]');
    input.element.addEventListener('click', () => {
      clicks += 1;
    });
    (w.vm as { open: () => void }).open();
    expect(clicks).toBe(1);
    w.unmount();
  });

  it('shows selected file inline for button variant in single mode', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        variant: 'button',
        multiple: false,
        modelValue: null,
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as File | null }),
      },
    });

    const input = w.find('input[type="file"]');
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    });

    await input.trigger('change');
    await w.vm.$nextTick();

    expect(w.find('.pfFileUpload__buttonInlineFile').exists()).toBe(true);
    expect(
      w
        .find('.pfFileUpload__buttonInlineFile .pfFileUpload__iconCircle')
        .exists()
    ).toBe(false);
    expect(
      w.find('.pfFileUpload__buttonRow > .pfFileUpload__iconCircle').exists()
    ).toBe(false);
    expect(w.text()).toContain('avatar.png');
    w.unmount();
  });

  it('shows file list below button for multiple mode', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        variant: 'button',
        multiple: true,
        modelValue: [],
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as File[] }),
      },
    });

    const input = w.find('input[type="file"]');
    const f1 = new File(['a'], 'a.txt', { type: 'text/plain' });
    const f2 = new File(['b'], 'b.txt', { type: 'text/plain' });
    Object.defineProperty(input.element, 'files', {
      value: [f1, f2],
      configurable: true,
    });

    await input.trigger('change');
    await w.vm.$nextTick();

    expect(w.find('.pfFileUpload__files_button').exists()).toBe(true);
    expect(w.text()).toContain('a.txt');
    expect(w.text()).toContain('b.txt');
    w.unmount();
  });

  it('toggles dragging class on drag events', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        dropzone: true,
      },
    });

    const root = w.find('.pfFileUpload');
    expect(root.classes()).not.toContain('pfFileUpload_dragging');

    await root.trigger('dragenter');
    await w.vm.$nextTick();
    expect(root.classes()).toContain('pfFileUpload_dragging');

    await root.trigger('dragleave');
    await w.vm.$nextTick();
    expect(root.classes()).not.toContain('pfFileUpload_dragging');
    w.unmount();
  });

  it('shows max size error and blocks oversized files', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        maxSize: 1,
        modelValue: null,
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as File | null }),
      },
    });

    const input = w.find('input[type="file"]');
    const file = new File(['x'.repeat(2048)], 'big.txt', {
      type: 'text/plain',
    });
    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    });

    await input.trigger('change');
    await w.vm.$nextTick();

    expect(w.props('modelValue')).toBeNull();
    const error = w.find('.pfFileUpload__error');
    expect(error.text()).toContain('big.txt');
    expect(error.classes()).toContain('pfFileUpload__error_visible');
    w.unmount();
  });

  it('shows accept error and blocks unsupported files', async () => {
    const w = mount(PfFileUpload, {
      attachTo: document.body,
      props: {
        accept: 'image/*',
        modelValue: null,
        'onUpdate:modelValue': (v: unknown) =>
          w.setProps({ modelValue: v as File | null }),
      },
    });

    const input = w.find('input[type="file"]');
    const file = new File(['text'], 'bad.txt', { type: 'text/plain' });
    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    });

    await input.trigger('change');
    await w.vm.$nextTick();

    expect(w.props('modelValue')).toBeNull();
    const error = w.find('.pfFileUpload__error');
    expect(error.text()).toContain('bad.txt');
    expect(error.text()).toContain('image/*');
    expect(w.emitted('invalid')?.[0]?.[0]?.code).toBe('accept');
    w.unmount();
  });
});
