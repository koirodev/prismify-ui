import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import PfContentToc from './index.vue';

describe('PfContentToc', () => {
  it('renders toc title and links', () => {
    const w = mount(PfContentToc, {
      props: {
        title: 'On this page',
        links: [
          { id: 'intro', text: 'Intro' },
          { id: 'api', text: 'API' },
        ],
      },
    });
    expect(w.text()).toContain('On this page');
    expect(w.text()).toContain('Intro');
    expect(w.text()).toContain('API');
  });

  it('toggles open and emits update:open', async () => {
    const w = mount(PfContentToc, {
      props: {
        links: [{ id: 'intro', text: 'Intro' }],
        defaultOpen: false,
      },
    });
    const trigger = w.find('.pfContentToc__trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    await trigger.trigger('click');
    expect(w.emitted('update:open')?.[0]).toEqual([true]);
  });

  it('emits move when heading exists', async () => {
    const heading = document.createElement('h2');
    heading.id = 'intro';
    heading.scrollIntoView = vi.fn();
    document.body.appendChild(heading);

    const w = mount(PfContentToc, {
      attachTo: document.body,
      props: {
        links: [{ id: 'intro', text: 'Intro' }],
      },
    });

    await w.find('a.pfContentToc__link').trigger('click');
    expect(w.emitted('move')?.[0]).toEqual(['intro']);

    w.unmount();
    heading.remove();
  });
});
