import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfDashboardSearch from './index.vue';

describe('PfDashboardSearch', () => {
  it('renders modal content when open', async () => {
    const w = mount(PfDashboardSearch, {
      props: { open: true },
      attachTo: document.body,
    });
    expect(document.body.innerHTML).toContain('pfDashboardSearch');
    w.unmount();
  });
});
