import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfTimeline from './index.vue';
import type { PfTimelineItem } from './index.vue';

const items: PfTimelineItem[] = [
  { title: 'A', icon: 'check', value: 'a' },
  { title: 'B', icon: 'check', value: 'b' },
];

describe('PfTimeline', () => {
  it('renders items and titles', () => {
    const w = mount(PfTimeline, {
      props: { items },
      global: { stubs: { PfIcon: true, PfAvatar: true } },
    });
    expect(w.findAll('.pfTimeline__item')).toHaveLength(2);
    expect(w.text()).toContain('A');
    expect(w.text()).toContain('B');
  });

  it('applies orientation and color classes', () => {
    const w = mount(PfTimeline, {
      props: {
        items,
        orientation: 'horizontal',
        color: 'neutral',
      },
      global: { stubs: { PfIcon: true, PfAvatar: true } },
    });
    expect(w.find('.pfTimeline').classes()).toContain(
      'pfTimeline_orientation_horizontal'
    );
    expect(w.find('.pfTimeline').classes()).toContain(
      'pfTimeline_color_neutral'
    );
  });

  it('marks active item from defaultValue', () => {
    const w = mount(PfTimeline, {
      props: { items, defaultValue: 'b' },
      global: { stubs: { PfIcon: true, PfAvatar: true } },
    });
    const els = w.findAll('.pfTimeline__item');
    expect(els[0].attributes('data-state')).toBe('completed');
    expect(els[1].attributes('data-state')).toBe('active');
  });
});
