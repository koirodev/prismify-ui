import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfScrollArea from './index.vue';

describe('PfScrollArea', () => {
  it('renders list from items without virtualization', () => {
    const items = [
      { id: 1, t: 'a' },
      { id: 2, t: 'b' },
    ];
    const wrapper = mount(PfScrollArea, {
      props: { items },
      slots: {
        default: `<template #default="{ item, index }"><span class="cell">{{ index }}-{{ item.t }}</span></template>`,
      },
    });
    expect(wrapper.findAll('.cell').length).toBe(2);
    expect(wrapper.text()).toContain('0-a');
    expect(wrapper.text()).toContain('1-b');
  });

  it('sets data-orientation in virtualize mode', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const wrapper = mount(PfScrollArea, {
      props: {
        items,
        virtualize: { estimateSize: 40, skipMeasurement: true },
      },
      slots: {
        default: `<template #default="{ item }"><span>{{ item.id }}</span></template>`,
      },
    });
    const root = wrapper.find('.pfScrollArea');
    expect(root.attributes('data-orientation')).toBe('vertical');
  });
});
