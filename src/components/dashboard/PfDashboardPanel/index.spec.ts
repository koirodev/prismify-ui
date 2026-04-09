import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardPanel from './index.vue';

describe('PfDashboardPanel', () => {
  it('renders body slot', () => {
    const w = mount(PfDashboardPanel, {
      slots: {
        body: 'Body',
      },
    });
    expect(w.text()).toContain('Body');
  });
});
