import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfColorPicker from './index.vue';

describe('PfColorPicker', () => {
  it('mounts with default', () => {
    const w = mount(PfColorPicker);
    expect(w.find('.pfColorPicker').exists()).toBe(true);
    expect(w.find('[data-pf-color-picker-selector]').exists()).toBe(true);
    expect(w.find('[data-pf-color-picker-track]').exists()).toBe(true);
  });

  it('respects disabled', () => {
    const w = mount(PfColorPicker, { props: { disabled: true } });
    expect(w.find('.pfColorPicker_disabled').exists()).toBe(true);
  });

  it('exposes undo/redo when history is enabled', () => {
    const w = mount(PfColorPicker, {
      props: { history: true, defaultValue: '#ffffff' },
    });
    const vm = w.vm as {
      undo: () => void;
      redo: () => void;
      canUndo: unknown;
      canRedo: unknown;
    };
    expect(typeof vm.undo).toBe('function');
    expect(typeof vm.redo).toBe('function');
  });

  it('does not set tabindex when history is off', () => {
    const w = mount(PfColorPicker, { props: { history: false } });
    expect(w.attributes('tabindex')).toBeUndefined();
  });
});
