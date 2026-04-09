import { mount } from '@vue/test-utils';
import { markRaw } from 'vue';
import { describe, expect, it } from 'vitest';
import PfAvatar from './index.vue';

describe('PfAvatar', () => {
  it('renders img when src is set', () => {
    const w = mount(PfAvatar, {
      props: {
        src: 'https://example.com/a.png',
        alt: 'User',
      },
    });
    const img = w.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/a.png');
    expect(img.attributes('alt')).toBe('User');
  });

  it('passes fetchPriority to img', () => {
    const w = mount(PfAvatar, {
      props: {
        src: 'https://example.com/a.png',
        alt: 'User',
        fetchPriority: 'high',
      },
    });
    expect(w.find('img').attributes('fetchpriority')).toBe('high');
  });

  it('shows initials from alt when there is no src', () => {
    const w = mount(PfAvatar, {
      props: { alt: 'Vitaly Koiro' },
    });
    expect(w.find('img').exists()).toBe(false);
    expect(w.text()).toContain('VK');
  });

  it('shows text fallback when text is set without src', () => {
    const w = mount(PfAvatar, {
      props: { text: '+1' },
    });
    expect(w.text()).toContain('+1');
  });

  it('shows icon fallback when icon is set without src', () => {
    const w = mount(PfAvatar, {
      props: { icon: 'plus' },
    });
    expect(w.find('svg').exists()).toBe(true);
  });

  it('applies size class', () => {
    const w = mount(PfAvatar, { props: { size: 'xl', alt: 'A' } });
    expect(w.find('.pfAvatar').classes()).toContain('pfAvatar_size_xl');
  });

  it('applies chip classes when chip is true', () => {
    const w = mount(PfAvatar, {
      props: { alt: 'X', chip: true },
    });
    const root = w.find('.pfAvatar');
    expect(root.classes()).toContain('pfAvatar_withChip');
    expect(root.classes()).toContain('pfAvatar_chipColor_primary');
  });

  it('switches to fallback on image error', async () => {
    const w = mount(PfAvatar, {
      props: { src: 'https://bad.test/x.png', alt: 'Pat Smith' },
    });
    await w.find('img').trigger('error');
    expect(w.find('img').exists()).toBe(false);
    expect(w.text()).toContain('PS');
  });

  it('emits error when image fails', async () => {
    const w = mount(PfAvatar, {
      props: { src: 'https://bad.test/x.png', alt: 'X' },
    });
    await w.find('img').trigger('error');
    expect(w.emitted('error')?.length).toBe(1);
  });

  it('uses as.img to render a custom component', () => {
    const CustomImg = {
      name: 'CustomImg',
      template: '<img class="custom" />',
    };
    const w = mount(PfAvatar, {
      props: {
        src: 'https://example.com/x.png',
        alt: 'Y',
        as: { img: markRaw(CustomImg) },
      },
    });
    expect(w.find('img.custom').exists()).toBe(true);
  });
});
