import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfContentSurround from './index.vue';

describe('PfContentSurround', () => {
  it('renders prev and next links', () => {
    const w = mount(PfContentSurround, {
      props: {
        items: [
          { title: 'Previous', description: 'Prev page', to: '#prev' },
          { title: 'Next', description: 'Next page', to: '#next' },
        ],
      },
    });

    const links = w.findAll('a.pfContentSurround__link');
    expect(links).toHaveLength(2);
    expect(w.text()).toContain('Previous');
    expect(w.text()).toContain('Next');
  });

  it('renders placeholder when one side is missing', () => {
    const w = mount(PfContentSurround, {
      props: {
        items: [{ title: 'Only next', to: '#next' }],
      },
    });
    expect(w.find('.pfContentSurround__placeholder').exists()).toBe(true);
  });
});
