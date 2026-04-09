import { CalendarDate } from '@internationalized/date';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { describe, expect, it } from 'vitest';
import PfApp from '../../layout/PfApp/index.vue';
import PfCalendar from './index.vue';

describe('PfCalendar', () => {
  it('renders weekday header', () => {
    const w = mount(PfCalendar, {
      props: {
        placeholder: new CalendarDate(2025, 3, 1),
        locale: 'en-US',
        monthControls: false,
        yearControls: false,
      },
    });
    expect(w.find('.pfCalendar__weekdays').exists()).toBe(true);
  });

  it('emits update:modelValue when a day is selected (single)', async () => {
    const w = mount(PfCalendar, {
      props: {
        modelValue: null,
        'onUpdate:modelValue': () => {},
        placeholder: new CalendarDate(2025, 3, 1),
        locale: 'en-US',
        monthControls: false,
        yearControls: false,
      },
    });
    const btn = w
      .findAll('button.pfCalendar__cellTrigger')
      .find((b) => b.text().trim() === '15');
    expect(btn).toBeTruthy();
    await btn!.trigger('click');
    expect(w.emitted('update:modelValue')).toBeTruthy();
    const payload = w.emitted('update:modelValue')![0]![0] as CalendarDate;
    expect(payload).toBeInstanceOf(CalendarDate);
    expect(payload.year).toBe(2025);
    expect(payload.month).toBe(3);
    expect(payload.day).toBe(15);
  });

  it('accepts ru-RU locale', () => {
    const w = mount(PfCalendar, {
      props: {
        locale: 'ru-RU',
        placeholder: new CalendarDate(2025, 3, 1),
        monthControls: false,
        yearControls: false,
      },
    });
    expect(w.find('.pfCalendar__weekdays').exists()).toBe(true);
    // ru-RU month label for March (avoid Cyrillic literals in source)
    expect(w.text()).toMatch(/\u043c\u0430\u0440\u0442|March/i);
  });

  it('normalizes unicode hyphen in locale subtags', () => {
    const w = mount(PfCalendar, {
      props: {
        locale: 'ru\u2011RU',
        placeholder: new CalendarDate(2025, 3, 1),
        monthControls: false,
        yearControls: false,
      },
    });
    expect(w.find('.pfCalendar__weekdays').exists()).toBe(true);
  });

  it('ignores empty locale string and falls back without throwing', () => {
    const w = mount(PfCalendar, {
      props: {
        locale: '  ',
        placeholder: new CalendarDate(2025, 3, 1),
        monthControls: false,
        yearControls: false,
      },
    });
    expect(w.find('.pfCalendar__weekdays').exists()).toBe(true);
    expect(w.text()).toContain('2025');
  });

  it('inherits locale from PfApp when locale prop is omitted', () => {
    const w = mount(PfApp, {
      props: { locale: 'de-DE' },
      slots: {
        default: () =>
          h(PfCalendar, {
            placeholder: new CalendarDate(2025, 3, 1),
            monthControls: false,
            yearControls: false,
          }),
      },
    });
    expect(w.text()).toMatch(/März|Marz/i);
  });

  it('ignores empty PfApp locale so calendar still renders', () => {
    const w = mount(PfApp, {
      props: { locale: '' },
      slots: {
        default: () =>
          h(PfCalendar, {
            placeholder: new CalendarDate(2025, 3, 1),
            monthControls: false,
            yearControls: false,
          }),
      },
    });
    expect(w.find('.pfCalendar__weekdays').exists()).toBe(true);
  });

  it('toggles multiple selection (uncontrolled)', async () => {
    const w = mount(PfCalendar, {
      props: {
        multiple: true,
        placeholder: new CalendarDate(2025, 3, 1),
        locale: 'en-US',
        monthControls: false,
        yearControls: false,
      },
    });
    const btn = w
      .findAll('button.pfCalendar__cellTrigger')
      .find((b) => b.text().trim() === '10');
    await btn!.trigger('click');
    const first = w.emitted('update:modelValue')![0]![0] as CalendarDate[];
    expect(first).toHaveLength(1);
    await btn!.trigger('click');
    const second = w.emitted('update:modelValue')![1]![0] as CalendarDate[];
    expect(second).toHaveLength(0);
  });
});
