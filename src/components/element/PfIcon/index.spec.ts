import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfIcon from './index.vue';

describe('PfIcon', () => {
  it('renders an svg with path for known name', () => {
    const w = mount(PfIcon, { props: { name: 'plus' } });
    expect(w.find('svg').exists()).toBe(true);
    expect(w.find('path').exists()).toBe(true);
  });

  it('applies size class', () => {
    const w = mount(PfIcon, { props: { name: 'plus', size: 'lg' } });
    expect(w.find('svg').classes()).toContain('pfIcon_lg');
  });

  it('applies 3xs size class', () => {
    const w = mount(PfIcon, { props: { name: 'plus', size: '3xs' } });
    expect(w.find('svg').classes()).toContain('pfIcon_3xs');
  });
});
