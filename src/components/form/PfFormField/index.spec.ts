import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import PfInput from '../PfInput/index.vue';
import PfForm from '../PfForm/index.vue';
import PfFormField from './index.vue';

describe('PfFormField', () => {
  it('binds label to generated control id', () => {
    const w = mount({
      components: { PfFormField, PfInput },
      template: `
        <PfFormField label="Email">
          <PfInput />
        </PfFormField>
      `,
    });

    const input = w.find('input');
    const label = w.find('label');

    expect(input.attributes('id')).toBeTruthy();
    expect(label.attributes('for')).toBe(input.attributes('id'));
  });

  it('uses explicit control id when provided', () => {
    const w = mount({
      components: { PfFormField, PfInput },
      template: `
        <PfFormField label="Email">
          <PfInput id="email-id" />
        </PfFormField>
      `,
    });

    expect(w.find('label').attributes('for')).toBe('email-id');
    expect(w.find('input').attributes('id')).toBe('email-id');
  });

  it('proxies size to input when size is omitted on control', () => {
    const w = mount({
      components: { PfFormField, PfInput },
      template: `
        <PfFormField size="xl">
          <PfInput />
        </PfFormField>
      `,
    });

    const inputRoot = w.findComponent(PfInput);
    expect(inputRoot.classes()).toContain('pfInput_size_xl');
  });

  it('sets error color and aria-invalid on control', () => {
    const w = mount({
      components: { PfFormField, PfInput },
      template: `
        <PfFormField error="Required field">
          <PfInput />
        </PfFormField>
      `,
    });

    const inputRoot = w.findComponent(PfInput);
    expect(inputRoot.classes()).toContain('pfInput_color_error');
    expect(w.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('prefers error over help message', () => {
    const w = mount({
      components: { PfFormField, PfInput },
      template: `
        <PfFormField help="Helpful text" error="Error text">
          <PfInput />
        </PfFormField>
      `,
    });

    expect(w.find('.pfFormField__error').text()).toContain('Error text');
    expect(w.find('.pfFormField__help').exists()).toBe(false);
  });

  it('reads error from PfForm context by field name', async () => {
    const w = mount({
      components: { PfForm, PfFormField, PfInput },
      template: `
        <PfForm :state="state" :validate="validate">
          <PfFormField name="email">
            <PfInput v-model="state.email" />
          </PfFormField>
          <button type="submit">Submit</button>
        </PfForm>
      `,
      data: () => ({
        state: { email: '' },
      }),
      methods: {
        validate(formState: { email: string }) {
          return formState.email
            ? []
            : [{ name: 'email', message: 'Email is required' }];
        },
      },
    });

    await w.find('form').trigger('submit');
    await nextTick();
    await Promise.resolve();

    expect(w.find('.pfFormField__error').text()).toContain('Email is required');
  });
});
