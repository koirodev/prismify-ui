import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfButton from '../PfButton/index.vue';
import PfFieldGroup from './index.vue';

describe('PfFieldGroup', () => {
  it('renders slot content', () => {
    const w = mount(PfFieldGroup, {
      slots: { default: '<span class="x">inner</span>' },
    });
    expect(w.find('.x').exists()).toBe(true);
    expect(w.text()).toContain('inner');
  });

  it('defaults to horizontal orientation class', () => {
    const w = mount(PfFieldGroup, { slots: { default: 'a' } });
    expect(w.find('.pfFieldGroup_orientation_horizontal').exists()).toBe(true);
  });

  it('applies vertical orientation class', () => {
    const w = mount(PfFieldGroup, {
      props: { orientation: 'vertical' },
      slots: { default: 'a' },
    });
    expect(w.find('.pfFieldGroup_orientation_vertical').exists()).toBe(true);
  });

  it('passes size to PfButton without own size via provide', () => {
    const w = mount({
      components: { PfFieldGroup, PfButton },
      template: `
        <PfFieldGroup size="xl">
          <PfButton color="neutral" variant="outline" label="Go" />
        </PfFieldGroup>
      `,
    });
    const btn = w.findComponent(PfButton);
    expect(btn.classes()).toContain('pfButton_size_xl');
  });

  it('lets PfButton own size override group size', () => {
    const w = mount({
      components: { PfFieldGroup, PfButton },
      template: `
        <PfFieldGroup size="xl">
          <PfButton color="neutral" variant="outline" size="sm" label="Small" />
        </PfFieldGroup>
      `,
    });
    const btn = w.findComponent(PfButton);
    expect(btn.classes()).toContain('pfButton_size_sm');
  });
});
