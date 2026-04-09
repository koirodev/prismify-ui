import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { describe, expect, it } from 'vitest';
import PfAvatar from '../PfAvatar/index.vue';
import PfAvatarGroup from './index.vue';

describe('PfAvatarGroup', () => {
  it('renders stacked avatars from slot', () => {
    const w = mount(PfAvatarGroup, {
      slots: {
        default: () => [
          h(PfAvatar, {
            src: 'https://example.com/a.png',
            alt: 'A',
          }),
          h(PfAvatar, {
            src: 'https://example.com/b.png',
            alt: 'B',
          }),
        ],
      },
    });
    expect(w.findAll('img')).toHaveLength(2);
    expect(w.find('.pfAvatarGroup').exists()).toBe(true);
  });

  it('provides size to PfAvatar children', () => {
    const w = mount(PfAvatarGroup, {
      props: { size: 'xl' },
      slots: {
        default: () => [
          h(PfAvatar, {
            src: 'https://example.com/a.png',
            alt: 'User',
          }),
        ],
      },
    });
    expect(w.find('.pfAvatar_size_xl').exists()).toBe(true);
  });

  it('shows +N overflow when max is set', () => {
    const w = mount(PfAvatarGroup, {
      props: { max: 2 },
      slots: {
        default: () => [
          h(PfAvatar, {
            src: 'https://example.com/1.png',
            alt: 'One',
          }),
          h(PfAvatar, {
            src: 'https://example.com/2.png',
            alt: 'Two',
          }),
          h(PfAvatar, {
            src: 'https://example.com/3.png',
            alt: 'Three',
          }),
        ],
      },
    });
    expect(w.findAll('img')).toHaveLength(2);
    expect(w.text()).toContain('+1');
  });

  it('parses max from string', () => {
    const w = mount(PfAvatarGroup, {
      props: { max: '1' },
      slots: {
        default: () => [
          h(PfAvatar, {
            src: 'https://example.com/1.png',
            alt: 'One',
          }),
          h(PfAvatar, {
            src: 'https://example.com/2.png',
            alt: 'Two',
          }),
        ],
      },
    });
    expect(w.findAll('img')).toHaveLength(1);
    expect(w.text()).toContain('+1');
  });
});
