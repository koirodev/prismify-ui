import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import PfError from './index.vue';

describe('PfError', () => {
  it('renders main root by default', () => {
    const w = mount(PfError, {
      props: {
        error: {
          statusCode: 404,
          statusMessage: 'Not found',
          message: 'Missing page',
        },
      },
    });
    expect(w.find('main.pfError').exists()).toBe(true);
    expect(w.text()).toContain('404');
    expect(w.text()).toContain('Not found');
    expect(w.text()).toContain('Missing page');
  });

  it('renders custom tag when as is set', () => {
    const w = mount(PfError, {
      props: { as: 'div', error: { statusCode: 500 } },
    });
    expect(w.find('div.pfError').exists()).toBe(true);
  });

  it('emits clear with redirect when default button is clicked', async () => {
    const w = mount(PfError, {
      props: { redirect: '/home', error: { statusCode: 404 } },
    });
    await w.find('button.pfButton').trigger('click');
    expect(w.emitted('clear')).toBeTruthy();
    expect(w.emitted('clear')?.[0]).toEqual([{ redirect: '/home' }]);
  });

  it('hides default clear button when clear is false', () => {
    const w = mount(PfError, {
      props: { clear: false, error: { statusCode: 404 } },
    });
    expect(w.find('button.pfButton').exists()).toBe(false);
  });

  it('merges clear object with defaults', () => {
    const w = mount(PfError, {
      props: {
        clear: { label: 'Go back' },
        error: { statusCode: 404 },
      },
    });
    expect(w.text()).toContain('Go back');
  });

  it('invokes custom onClick from clear before emitting clear', async () => {
    const userClick = vi.fn();
    const w = mount(PfError, {
      props: {
        clear: { onClick: userClick },
        error: { statusCode: 404 },
      },
    });
    await w.find('button.pfButton').trigger('click');
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(w.emitted('clear')).toBeTruthy();
  });

  it('merges ui classes on parts', () => {
    const w = mount(PfError, {
      props: {
        error: { statusCode: 403 },
        ui: { root: 'rootExtra', statusCode: 'codeExtra' },
      },
    });
    expect(w.find('.pfError.rootExtra').exists()).toBe(true);
    expect(w.find('.pfError__statusCode.codeExtra').exists()).toBe(true);
  });
});
