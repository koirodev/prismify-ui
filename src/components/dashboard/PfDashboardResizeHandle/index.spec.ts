import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardResizeHandle from './index.vue';

describe('PfDashboardResizeHandle', () => {
  it('renders root class', () => {
    const w = mount(PfDashboardResizeHandle);
    expect(w.find('.pfDashboardResizeHandle').exists()).toBe(true);
  });
});
