import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfEmpty from './index.vue';

describe('PfEmpty', () => {
  it('renders title and description', () => {
    const w = mount(PfEmpty, {
      props: {
        title: 'Nothing here',
        description: 'Add items to see them.',
      },
    });
    expect(w.text()).toContain('Nothing here');
    expect(w.text()).toContain('Add items to see them.');
    expect(w.find('.pfEmpty').classes()).toContain('pfEmpty_variant_outline');
    expect(w.find('.pfEmpty').classes()).toContain('pfEmpty_size_md');
  });

  it('renders icon bubble when icon is set', () => {
    const w = mount(PfEmpty, {
      props: {
        icon: 'file',
        title: 'Empty',
      },
    });
    expect(w.find('.pfEmpty__iconBubble').exists()).toBe(true);
  });

  it('renders action buttons from actions prop', () => {
    const w = mount(PfEmpty, {
      props: {
        title: 'No data',
        actions: [{ label: 'Retry', icon: 'refresh' }],
      },
    });
    expect(w.findAll('.pfButton')).toHaveLength(1);
    expect(w.text()).toContain('Retry');
  });

  it('applies variant and size classes', () => {
    const w = mount(PfEmpty, {
      props: {
        title: 'X',
        variant: 'naked',
        size: 'xl',
      },
    });
    expect(w.find('.pfEmpty').classes()).toContain('pfEmpty_variant_naked');
    expect(w.find('.pfEmpty').classes()).toContain('pfEmpty_size_xl');
  });
});
