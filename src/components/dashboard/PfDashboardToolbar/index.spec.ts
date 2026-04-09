import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardToolbar from './index.vue';

describe('PfDashboardToolbar', () => {
  it('renders default slot', () => {
    const w = mount(PfDashboardToolbar, { slots: { default: 'Toolbar' } });
    expect(w.text()).toContain('Toolbar');
  });
});
