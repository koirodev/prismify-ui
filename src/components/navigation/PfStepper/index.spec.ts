import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfStepper from './index.vue';
import type { PfStepperItem } from './index.vue';

const threeSteps: PfStepperItem[] = [
  { title: 'A', description: 'da', icon: 'rocket' },
  { title: 'B', description: 'db', icon: 'palette' },
  { title: 'C', description: 'dc' },
];

describe('PfStepper', () => {
  it('renders steps and triggers update:modelValue on allowed click', async () => {
    const w = mount(PfStepper, {
      props: {
        items: threeSteps,
        modelValue: 0,
        linear: true,
      },
    });
    const buttons = w.findAll('button.pfStepper__trigger');
    expect(buttons.length).toBe(3);
    await buttons[1]!.trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual([1]);
  });

  it('does not skip forward when linear', async () => {
    const w = mount(PfStepper, {
      props: {
        items: threeSteps,
        modelValue: 0,
        linear: true,
      },
    });
    const buttons = w.findAll('button.pfStepper__trigger');
    await buttons[2]!.trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('allows any step when linear is false', async () => {
    const w = mount(PfStepper, {
      props: {
        items: threeSteps,
        modelValue: 0,
        linear: false,
      },
    });
    const buttons = w.findAll('button.pfStepper__trigger');
    await buttons[2]!.trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual([2]);
  });

  it('does not emit when disabled', async () => {
    const w = mount(PfStepper, {
      props: {
        items: threeSteps,
        modelValue: 0,
        disabled: true,
      },
    });
    const buttons = w.findAll('button.pfStepper__trigger');
    await buttons[1]!.trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('exposes next and prev', async () => {
    const w = mount(PfStepper, {
      props: {
        items: threeSteps,
        defaultValue: 0,
      },
    });
    const exposed = (
      w.vm as unknown as { $?: { exposed?: Record<string, unknown> } }
    ).$?.exposed as
      | {
          next: () => void;
          prev: () => void;
          hasNext: { value: boolean };
          hasPrev: { value: boolean };
        }
      | undefined;
    expect(exposed).toBeDefined();
    expect(exposed!.hasPrev.value).toBe(false);
    expect(exposed!.hasNext.value).toBe(true);
    exposed!.next();
    expect(w.emitted('update:modelValue')?.[0]).toEqual([1]);
    expect(w.emitted('next')?.[0]?.[0]?.title).toBe('B');
    exposed!.prev();
    expect(w.emitted('update:modelValue')?.[1]).toEqual([0]);
  });
});
