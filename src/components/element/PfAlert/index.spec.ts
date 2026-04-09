import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PfButton from '../PfButton/index.vue';
import PfAlert from './index.vue';

describe('PfAlert', () => {
  it('renders title and description', () => {
    const w = mount(PfAlert, {
      props: {
        title: 'Heads up!',
        description: 'Details here.',
      },
    });
    expect(w.text()).toContain('Heads up!');
    expect(w.text()).toContain('Details here.');
  });

  it('applies color, variant, and orientation classes', () => {
    const w = mount(PfAlert, {
      props: {
        title: 'T',
        color: 'warning',
        variant: 'outline',
        orientation: 'horizontal',
      },
    });
    const el = w.find('.pfAlert');
    expect(el.classes()).toContain('pfAlert_color_warning');
    expect(el.classes()).toContain('pfAlert_variant_outline');
    expect(el.classes()).toContain('pfAlert_orientation_horizontal');
  });

  it('emits update:open and hides when close is clicked', async () => {
    const w = mount(PfAlert, {
      props: {
        title: 'T',
        close: true,
      },
    });
    await w.find('.pfAlert__close button').trigger('click');
    expect(w.emitted('update:open')?.[0]).toEqual([false]);
    expect(w.find('.pfAlert').exists()).toBe(false);
  });

  it('renders leading icon when icon prop set', () => {
    const w = mount(PfAlert, {
      props: {
        title: 'T',
        icon: 'check',
      },
    });
    expect(w.find('.pfAlert__leading svg.pfIcon').exists()).toBe(true);
  });

  it('renders custom close icon', () => {
    const w = mount(PfAlert, {
      props: {
        title: 'T',
        close: true,
        closeIcon: 'arrowRight',
      },
    });
    const btn = w.findComponent(PfButton);
    expect(btn.props('icon')).toBe('arrowRight');
  });

  it('renders action buttons from actions prop', () => {
    const w = mount(PfAlert, {
      props: {
        title: 'T',
        actions: [{ label: 'OK' }, { label: 'Cancel', variant: 'outline' }],
      },
    });
    const buttons = w.findAllComponents(PfButton);
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(buttons[0].props('label')).toBe('OK');
    expect(buttons[0].props('size')).toBe('xs');
  });
});
