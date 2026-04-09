import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfUser from './index.vue';

describe('PfUser', () => {
  it('renders name and description', () => {
    const w = mount(PfUser, {
      props: {
        name: 'Alice',
        description: 'Developer',
      },
    });
    expect(w.text()).toContain('Alice');
    expect(w.text()).toContain('Developer');
    expect(w.find('.pfUser').classes()).toContain('pfUser_size_md');
    expect(w.find('.pfUser').classes()).toContain(
      'pfUser_orientation_horizontal'
    );
  });

  it('renders as anchor when to is set', () => {
    const w = mount(PfUser, {
      props: {
        name: 'Link',
        to: 'https://example.com',
      },
    });
    expect(w.find('.pfUser').element.tagName.toLowerCase()).toBe('a');
    expect(w.find('.pfUser').attributes('href')).toBe('https://example.com');
    expect(w.find('.pfUser').classes()).toContain('pfUser_link');
  });

  it('renders vertical orientation class', () => {
    const w = mount(PfUser, {
      props: {
        name: 'Bob',
        orientation: 'vertical',
      },
    });
    expect(w.find('.pfUser').classes()).toContain(
      'pfUser_orientation_vertical'
    );
  });

  it('renders PfAvatar when avatar prop is set', () => {
    const w = mount(PfUser, {
      props: {
        name: 'C',
        avatar: { src: 'https://example.com/a.png', alt: 'C' },
      },
    });
    expect(w.find('.pfAvatar').exists()).toBe(true);
  });
});
