import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardSearchButton from './index.vue';

describe('PfDashboardSearchButton', () => {
  it('renders label by default', () => {
    const w = mount(PfDashboardSearchButton);
    expect(w.text().toLowerCase()).toContain('search');
  });
});
