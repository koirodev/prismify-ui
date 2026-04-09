import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import PfInput from '../PfInput/index.vue';
import PfFormField from '../PfFormField/index.vue';
import PfForm from './index.vue';
import type { PfFormError } from './injection';

describe('PfForm', () => {
  it('shows FormField errors from custom validator', async () => {
    const wrapper = mount({
      components: { PfForm, PfFormField, PfInput },
      template: `
        <PfForm :state="state" :validate="validate">
          <PfFormField name="email" label="Email">
            <PfInput v-model="state.email" />
          </PfFormField>
          <button type="submit">Submit</button>
        </PfForm>
      `,
      data: () => ({
        state: { email: '' },
      }),
      methods: {
        validate(formState: { email: string }): PfFormError[] {
          if (!formState.email) {
            return [{ name: 'email', message: 'Required' }];
          }
          return [];
        },
      },
    });

    await wrapper.find('form').trigger('submit');
    await nextTick();
    await Promise.resolve();

    expect(wrapper.find('.pfFormField__error').text()).toContain('Required');
  });

  it('emits submit with validated data', async () => {
    const wrapper = mount({
      components: { PfForm, PfFormField, PfInput },
      template: `
        <PfForm :state="state" @submit="onSubmit">
          <PfFormField name="email" label="Email">
            <PfInput v-model="state.email" />
          </PfFormField>
          <button type="submit">Submit</button>
        </PfForm>
      `,
      data: () => ({
        state: { email: 'a@b.com' },
      }),
      methods: {
        onSubmit(_event: unknown) {},
      },
    });

    await wrapper.find('form').trigger('submit');
    await nextTick();
    await Promise.resolve();

    const form = wrapper.findComponent(PfForm);
    expect(form.emitted('submit')?.length).toBe(1);
    expect(form.emitted('submit')?.[0]?.[0]).toEqual({
      data: { email: 'a@b.com' },
    });
  });

  it('exposes clear, getErrors and setErrors helpers', () => {
    const wrapper = mount(PfForm, {
      props: {
        state: { email: '' },
      },
      slots: {
        default: '<div />',
      },
    });

    const vm = wrapper.vm as unknown as {
      setErrors: (errors: PfFormError[]) => void;
      getErrors: () => PfFormError[];
      clear: () => void;
    };

    vm.setErrors([{ name: 'email', message: 'Invalid' }]);
    expect(vm.getErrors()).toEqual([{ name: 'email', message: 'Invalid' }]);
    vm.clear();
    expect(vm.getErrors()).toEqual([]);
  });
});
