import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardGroup from './index.vue';

describe('PfDashboardGroup', () => {
  it('renders slot content', () => {
    const w = mount(PfDashboardGroup, { slots: { default: 'content' } });
    expect(w.text()).toContain('content');
  });

  it('uses fixed dashboard class', () => {
    const w = mount(PfDashboardGroup);
    expect(w.find('.pfDashboardGroup').exists()).toBe(true);
  });
});
