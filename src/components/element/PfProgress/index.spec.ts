import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfProgress from './index.vue';

describe('PfProgress', () => {
  it('exposes progressbar with value when modelValue is set', () => {
    const w = mount(PfProgress, { props: { modelValue: 25, max: 100 } });
    const bar = w.find('[role="progressbar"]');
    expect(bar.attributes('aria-valuenow')).toBe('25');
    expect(bar.attributes('aria-valuemax')).toBe('100');
    expect(bar.attributes('aria-valuemin')).toBe('0');
  });

  it('is indeterminate when modelValue is null', () => {
    const w = mount(PfProgress, { props: { modelValue: null } });
    const bar = w.find('[role="progressbar"]');
    expect(bar.attributes('aria-valuenow')).toBeUndefined();
    expect(bar.find('.pfProgress__indicator').attributes('data-state')).toBe(
      'indeterminate'
    );
  });

  it('clamps value to max', () => {
    const w = mount(PfProgress, { props: { modelValue: 150, max: 100 } });
    expect(w.find('[role="progressbar"]').attributes('aria-valuenow')).toBe(
      '100'
    );
  });

  it('uses array length as max and renders steps', () => {
    const w = mount(PfProgress, {
      props: {
        modelValue: 1,
        max: ['A', 'B', 'C'],
      },
    });
    expect(w.find('[role="progressbar"]').attributes('aria-valuemax')).toBe(
      '3'
    );
    const steps = w.findAll('.pfProgress__step');
    expect(steps).toHaveLength(3);
    expect(steps[1]!.classes()).toContain('pfProgress__step_active');
  });

  it('shows status row when status is true', () => {
    const w = mount(PfProgress, {
      props: { modelValue: 50, max: 100, status: true },
    });
    expect(w.find('.pfProgress__status').exists()).toBe(true);
    expect(w.find('.pfProgress__status').text()).toContain('50');
  });

  it('respects getValueText for aria-valuetext', () => {
    const w = mount(PfProgress, {
      props: {
        modelValue: 2,
        max: 4,
        getValueText: (v: number | null | undefined) =>
          v == null ? undefined : `Step ${v} of 4`,
      },
    });
    expect(w.find('[role="progressbar"]').attributes('aria-valuetext')).toBe(
      'Step 2 of 4'
    );
  });
});
