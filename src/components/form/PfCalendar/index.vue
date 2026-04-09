<script setup lang="ts">
import type { Component } from 'vue';
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import { usePfApp } from '../../../composables/usePfApp';
import type { DateValue } from '@internationalized/date';
import {
  DateFormatter,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  isToday,
  today,
  toCalendarDate,
} from '@internationalized/date';
import PfButton from '../../element/PfButton/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import { buildMonthGrid, shiftVisibleMonth } from './calendarGrid';
import type { PfCalendarWeekStartsOn } from './calendarGrid';
import {
  applyMultipleClick,
  applyRangeClick,
  applySingleClick,
  isDayInRange,
  type PfCalendarDateRange,
  type PfCalendarMatcher,
} from './calendarSelection';

export type {
  PfCalendarDateRange,
  PfCalendarMatcher,
} from './calendarSelection';
export type { PfCalendarWeekStartsOn } from './calendarGrid';

export type PfCalendarColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfCalendarVariant = 'solid' | 'outline' | 'soft' | 'subtle';

export type PfCalendarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PfCalendarWeekdayFormat = 'narrow' | 'short' | 'long';

export type PfCalendarModelValue =
  | DateValue
  | null
  | DateValue[]
  | PfCalendarDateRange;

export type PfCalendarUi = {
  root?: string | string[];
  header?: string | string[];
  body?: string | string[];
  heading?: string | string[];
  grid?: string | string[];
  gridRow?: string | string[];
  gridWeekDaysRow?: string | string[];
  gridBody?: string | string[];
  headCell?: string | string[];
  headCellWeek?: string | string[];
  cell?: string | string[];
  cellTrigger?: string | string[];
  cellWeek?: string | string[];
};

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    color?: PfCalendarColor;
    variant?: PfCalendarVariant;
    size?: PfCalendarSize;
    range?: boolean;
    multiple?: boolean;
    monthControls?: boolean;
    yearControls?: boolean;
    fixedWeeks?: boolean;
    weekNumbers?: boolean;
    numberOfMonths?: number;
    disabled?: boolean;
    readonly?: boolean;
    initialFocus?: boolean;
    /** BCP 47 locale for month/weekday labels (passed to `DateFormatter`). */
    locale?: string;
    weekdayFormat?: PfCalendarWeekdayFormat;
    weekStartsOn?: PfCalendarWeekStartsOn;
    pagedNavigation?: boolean;
    preventDeselect?: boolean;
    maximumDays?: number;
    allowNonContiguousRanges?: boolean;
    fixedDate?: 'start' | 'end';
    disableDaysOutsideCurrentView?: boolean;
    modelValue?: PfCalendarModelValue | null;
    defaultValue?: PfCalendarModelValue | null;
    placeholder?: DateValue | null;
    defaultPlaceholder?: DateValue | null;
    minValue?: DateValue | null;
    maxValue?: DateValue | null;
    isDateDisabled?: PfCalendarMatcher;
    isDateUnavailable?: PfCalendarMatcher;
    isDateHighlightable?: PfCalendarMatcher;
    nextPage?: (placeholder: DateValue) => DateValue;
    prevPage?: (placeholder: DateValue) => DateValue;
    ui?: PfCalendarUi;
    prevYearIcon?: PfIconName;
    nextYearIcon?: PfIconName;
    prevMonthIcon?: PfIconName;
    nextMonthIcon?: PfIconName;
  }>(),
  {
    as: 'div',
    color: 'primary',
    variant: 'solid',
    size: 'md',
    range: false,
    multiple: false,
    monthControls: true,
    yearControls: true,
    fixedWeeks: true,
    weekNumbers: false,
    numberOfMonths: 1,
    disabled: false,
    readonly: false,
    initialFocus: false,
    locale: undefined,
    weekdayFormat: 'short',
    weekStartsOn: undefined,
    pagedNavigation: false,
    preventDeselect: false,
    allowNonContiguousRanges: false,
    disableDaysOutsideCurrentView: false,
    prevYearIcon: 'arrowLeft',
    nextYearIcon: 'arrowRight',
    prevMonthIcon: 'arrowSmallLeft',
    nextMonthIcon: 'arrowSmallRight',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: PfCalendarModelValue | null];
  'update:placeholder': [value: DateValue];
  'update:validModelValue': [value: PfCalendarDateRange];
  'update:startValue': [value: DateValue | undefined];
}>();

const tz = getLocalTimeZone();

const pfApp = usePfApp();

/**
 * BCP 47 for `DateFormatter`: empty string, non-string types from Storybook controls
 * and “typographic” hyphens cause RangeError in `Intl` / `@internationalized/date`.
 */
function normalizeLocaleTag(locale: unknown): string | undefined {
  if (locale == null) return undefined;
  if (typeof locale !== 'string' && typeof locale !== 'number')
    return undefined;
  let t = String(locale).trim();
  if (!t.length) return undefined;
  t = t.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-');
  return t;
}

function isValidLocaleForIntl(tag: string): boolean {
  if (typeof Intl === 'undefined') return true;
  try {
    if (typeof Intl.Locale === 'function') {
      new Intl.Locale(tag);
      return true;
    }
    new Intl.DateTimeFormat(tag);
    return true;
  } catch {
    return false;
  }
}

function pickLocaleTag(...candidates: (string | undefined)[]): string {
  const fallback = 'en-US';
  for (const raw of candidates) {
    const t = normalizeLocaleTag(raw);
    if (t && isValidLocaleForIntl(t)) return t;
  }
  return isValidLocaleForIntl(fallback) ? fallback : 'en';
}

const resolvedLocale = computed(() =>
  pickLocaleTag(
    props.locale,
    pfApp.value.locale,
    Intl.DateTimeFormat().resolvedOptions().locale
  )
);

const monthFormatter = computed(
  () =>
    new DateFormatter(resolvedLocale.value, {
      month: 'long',
      year: 'numeric',
    })
);

const weekdayFormatter = computed(() => {
  const w = props.weekdayFormat;
  return new DateFormatter(resolvedLocale.value, {
    weekday: w === 'narrow' ? 'narrow' : w === 'long' ? 'long' : 'short',
  });
});

function defaultPlaceholderFromValue(): DateValue {
  const v = props.modelValue;
  if (v != null && !Array.isArray(v) && typeof v === 'object' && 'start' in v) {
    const r = v as PfCalendarDateRange;
    if (r.start != null) return toCalendarDate(r.start);
    if (r.end != null) return toCalendarDate(r.end);
  }
  if (
    v != null &&
    !Array.isArray(v) &&
    typeof v === 'object' &&
    'calendar' in v
  ) {
    return toCalendarDate(v as DateValue);
  }
  if (Array.isArray(v) && v.length > 0) {
    return toCalendarDate(v[0]!);
  }
  if (props.defaultValue != null) {
    const d = props.defaultValue;
    if (Array.isArray(d) && d.length > 0) return toCalendarDate(d[0]!);
    if (typeof d === 'object' && d != null && 'start' in d) {
      const r = d as PfCalendarDateRange;
      if (r.start != null) return toCalendarDate(r.start);
    }
    if (typeof d === 'object' && d != null && 'calendar' in d) {
      return toCalendarDate(d as DateValue);
    }
  }
  return today(tz);
}

const placeholderLocal = shallowRef<DateValue>(
  toCalendarDate(props.defaultPlaceholder ?? defaultPlaceholderFromValue())
);

const isPlaceholderControlled = computed(() => props.placeholder !== undefined);

const visiblePlaceholder = computed(() => {
  if (props.placeholder !== undefined && props.placeholder !== null) {
    return toCalendarDate(props.placeholder);
  }
  return toCalendarDate(placeholderLocal.value);
});

function setPlaceholder(next: DateValue) {
  const cal = toCalendarDate(next);
  if (isPlaceholderControlled.value) {
    emit('update:placeholder', cal);
  } else {
    placeholderLocal.value = cal;
    emit('update:placeholder', cal);
  }
}

watch(
  () => props.placeholder,
  (p) => {
    if (p !== undefined && p !== null) {
      placeholderLocal.value = toCalendarDate(p);
    }
  }
);

const initialModel = (): PfCalendarModelValue | null => {
  if (props.modelValue !== undefined) return props.modelValue;
  if (props.defaultValue !== undefined) return props.defaultValue;
  if (props.range) return { start: null, end: null };
  if (props.multiple) return [];
  return null;
};

const localModel = shallowRef<PfCalendarModelValue | null>(initialModel());

watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) localModel.value = v;
  },
  { deep: true }
);

const isControlled = computed(() => props.modelValue !== undefined);

const model = computed({
  get(): PfCalendarModelValue | null {
    return isControlled.value ? (props.modelValue ?? null) : localModel.value;
  },
  set(v: PfCalendarModelValue | null) {
    if (!isControlled.value) localModel.value = v;
    emit('update:modelValue', v);
  },
});

function emitRangeExtras(next: PfCalendarDateRange) {
  emit('update:startValue', next.start ?? undefined);
  if (next.start != null && next.end != null) {
    emit('update:validModelValue', {
      start: toCalendarDate(next.start),
      end: toCalendarDate(next.end),
    });
  }
}

const visibleMonthAnchors = computed(() => {
  const base = visiblePlaceholder.value;
  const n = Math.max(1, props.numberOfMonths);
  const out: DateValue[] = [];
  for (let i = 0; i < n; i++) {
    out.push(toCalendarDate(base).add({ months: i }));
  }
  return out;
});

const weekdayLabels = computed(() => {
  const labels: string[] = [];
  const anchor = visibleMonthAnchors.value[0]!;
  const som = toCalendarDate(anchor);
  const grid = buildMonthGrid(
    som,
    resolvedLocale.value,
    props.weekStartsOn,
    true,
    false,
    tz
  );
  const firstRow = grid[0];
  if (!firstRow) return labels;
  for (const d of firstRow.days) {
    labels.push(weekdayFormatter.value.format(d.toDate(tz)));
  }
  return labels;
});

const monthGrids = computed(() =>
  visibleMonthAnchors.value.map((m) =>
    buildMonthGrid(
      m,
      resolvedLocale.value,
      props.weekStartsOn,
      props.fixedWeeks,
      props.weekNumbers,
      tz
    )
  )
);

const navButtonSize = computed((): PfCalendarSize => {
  switch (props.size) {
    case 'xl':
    case 'lg':
      return 'sm';
    case 'md':
      return 'sm';
    default:
      return 'xs';
  }
});

function monthTitle(d: DateValue): string {
  return monthFormatter.value.format(toCalendarDate(d).toDate(tz));
}

function isOutsideCurrentMonth(
  day: DateValue,
  monthAnchor: DateValue
): boolean {
  return !isSameMonth(day, monthAnchor);
}

function isSelectedDay(day: DateValue): boolean {
  const m = model.value;
  if (m == null) return false;
  if (
    props.range &&
    typeof m === 'object' &&
    !Array.isArray(m) &&
    'start' in m
  ) {
    const r = isDayInRange(day, m as PfCalendarDateRange);
    return r.selected;
  }
  if (props.multiple && Array.isArray(m)) {
    return m.some((d) => isSameDay(d, day));
  }
  if (
    !props.multiple &&
    !props.range &&
    typeof m === 'object' &&
    m != null &&
    'calendar' in m
  ) {
    return isSameDay(m as DateValue, day);
  }
  return false;
}

function rangeParts(day: DateValue) {
  const m = model.value;
  if (
    !props.range ||
    m == null ||
    typeof m !== 'object' ||
    Array.isArray(m) ||
    !('start' in m)
  ) {
    return { inRange: false, rangeStart: false, rangeEnd: false };
  }
  return isDayInRange(day, m as PfCalendarDateRange);
}

function orderedCalPair(
  a: DateValue,
  b: DateValue
): [ReturnType<typeof toCalendarDate>, ReturnType<typeof toCalendarDate>] {
  const ca = toCalendarDate(a);
  const cb = toCalendarDate(b);
  return ca.compare(cb) <= 0 ? [ca, cb] : [cb, ca];
}

/** Only the first range edge is selected — waiting for the second. */
function isSelectingRangeEnd(): boolean {
  if (!props.range) return false;
  const m = model.value;
  if (
    m == null ||
    typeof m !== 'object' ||
    Array.isArray(m) ||
    !('start' in m)
  ) {
    return false;
  }
  const r = m as PfCalendarDateRange;
  return r.start != null && r.end == null;
}

const rangeHoverDay = shallowRef<ReturnType<typeof toCalendarDate> | null>(
  null
);

function clearRangeHoverDay() {
  rangeHoverDay.value = null;
}

function onRangeHoverEnter(day: DateValue) {
  if (!props.range || props.disabled || props.readonly) return;
  if (!isSelectingRangeEnd()) return;
  rangeHoverDay.value = toCalendarDate(day);
}

watch(
  () => {
    if (!props.range) return '';
    const m = model.value;
    if (
      m == null ||
      typeof m !== 'object' ||
      Array.isArray(m) ||
      !('start' in m)
    ) {
      return '';
    }
    const r = m as PfCalendarDateRange;
    return `${r.start?.toString() ?? ''}|${r.end?.toString() ?? ''}`;
  },
  () => {
    clearRangeHoverDay();
  }
);

function isRangeHoverPreview(day: DateValue): boolean {
  if (!props.range || props.disabled || props.readonly) return false;
  if (rangeHoverDay.value == null) return false;
  if (!isSelectingRangeEnd()) return false;
  const m = model.value as PfCalendarDateRange;
  const start = m.start;
  if (start == null) return false;
  const [lo, hi] = orderedCalPair(start, rangeHoverDay.value);
  const cd = toCalendarDate(day);
  return cd.compare(lo) >= 0 && cd.compare(hi) <= 0;
}

function isDisabled(day: DateValue, monthAnchor: DateValue): boolean {
  if (props.disabled || props.readonly) return true;
  const cd = toCalendarDate(day);
  if (
    props.minValue != null &&
    cd.compare(toCalendarDate(props.minValue)) < 0
  ) {
    return true;
  }
  if (
    props.maxValue != null &&
    cd.compare(toCalendarDate(props.maxValue)) > 0
  ) {
    return true;
  }
  if (
    props.disableDaysOutsideCurrentView &&
    isOutsideCurrentMonth(day, monthAnchor)
  ) {
    return true;
  }
  return props.isDateDisabled?.(day) ?? false;
}

function isUnavailable(day: DateValue): boolean {
  return props.isDateUnavailable?.(day) ?? false;
}

function isHighlighted(day: DateValue): boolean {
  return props.isDateHighlightable?.(day) ?? false;
}

function onDayClick(day: DateValue, monthAnchor: DateValue) {
  if (isDisabled(day, monthAnchor) || props.readonly) return;
  if (isUnavailable(day)) return;

  if (props.range) {
    const current = (model.value as PfCalendarDateRange | null) ?? {
      start: null,
      end: null,
    };
    const next = applyRangeClick(current, day, {
      minValue: props.minValue,
      maxValue: props.maxValue,
      maximumDays: props.maximumDays,
      isDateUnavailable: props.isDateUnavailable,
      allowNonContiguousRanges: props.allowNonContiguousRanges,
      preventDeselect: props.preventDeselect,
      fixedDate: props.fixedDate,
    });
    model.value = next;
    emitRangeExtras(next);
    return;
  }

  if (props.multiple) {
    const list = Array.isArray(model.value) ? [...model.value] : [];
    const next = applyMultipleClick(list, day, {
      minValue: props.minValue,
      maxValue: props.maxValue,
    });
    model.value = next;
    return;
  }

  const cur =
    model.value != null &&
    typeof model.value === 'object' &&
    'calendar' in model.value
      ? (model.value as DateValue)
      : null;
  const next = applySingleClick(cur, day, {
    preventDeselect: props.preventDeselect,
    minValue: props.minValue,
    maxValue: props.maxValue,
  });
  model.value = next;
}

const pageStep = computed(() =>
  props.pagedNavigation ? Math.max(1, props.numberOfMonths) : 1
);

function goPrevMonth() {
  const ph = visiblePlaceholder.value;
  if (props.prevPage) {
    setPlaceholder(props.prevPage(ph));
    return;
  }
  setPlaceholder(shiftVisibleMonth(ph, -pageStep.value));
}

function goNextMonth() {
  const ph = visiblePlaceholder.value;
  if (props.nextPage) {
    setPlaceholder(props.nextPage(ph));
    return;
  }
  setPlaceholder(shiftVisibleMonth(ph, pageStep.value));
}

function goPrevYear() {
  const ph = visiblePlaceholder.value;
  setPlaceholder(toCalendarDate(ph).subtract({ years: 1 }));
}

function goNextYear() {
  const ph = visiblePlaceholder.value;
  setPlaceholder(toCalendarDate(ph).add({ years: 1 }));
}

const rootEl = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!props.initialFocus) return;
  requestAnimationFrame(() => {
    rootEl.value
      ?.querySelector<HTMLElement>('.pfCalendar__cellTrigger')
      ?.focus();
  });
});

function mergeUi(
  key: keyof PfCalendarUi,
  ...classes: (string | false | undefined)[]
): string[] {
  const u = props.ui?.[key];
  const fromUi = u == null ? [] : Array.isArray(u) ? u : [u];
  return [...(classes.filter(Boolean) as string[]), ...fromUi];
}

function cellTriggerClass(day: DateValue, monthAnchor: DateValue): string[] {
  const rp = props.range ? rangeParts(day) : null;
  return mergeUi(
    'cellTrigger',
    'pfCalendar__cellTrigger',
    isSelectedDay(day) && 'pfCalendar__cellTrigger_selected',
    isToday(day, tz) && 'pfCalendar__cellTrigger_today',
    isOutsideCurrentMonth(day, monthAnchor) &&
      'pfCalendar__cellTrigger_outside',
    isDisabled(day, monthAnchor) && 'pfCalendar__cellTrigger_disabled',
    isUnavailable(day) && 'pfCalendar__cellTrigger_unavailable',
    isHighlighted(day) && 'pfCalendar__cellTrigger_highlighted',
    rp?.inRange &&
      !rp.rangeStart &&
      !rp.rangeEnd &&
      'pfCalendar__cellTrigger_rangeBetween',
    isRangeHoverPreview(day) && 'pfCalendar__cellTrigger_rangeHover'
  );
}

const rootClass = computed(() =>
  mergeUi(
    'root',
    'pfCalendar',
    `pfCalendar_color_${props.color}`,
    `pfCalendar_variant_${props.variant}`,
    `pfCalendar_size_${props.size}`,
    props.disabled && 'pfCalendar_disabled',
    props.readonly && 'pfCalendar_readonly',
    props.weekNumbers && 'pfCalendar_weekNumbers'
  )
);

defineExpose({
  focus: () =>
    rootEl.value
      ?.querySelector<HTMLElement>('.pfCalendar__cellTrigger')
      ?.focus(),
});
</script>

<template>
  <component :is="as" ref="rootEl" :class="rootClass">
    <div :class="mergeUi('header', 'pfCalendar__header')">
      <div
        v-if="monthControls || yearControls"
        class="pfCalendar__headerNav pfCalendar__headerNav_start"
      >
        <PfButton
          v-if="yearControls"
          icon-only
          color="neutral"
          variant="ghost"
          :size="navButtonSize"
          :disabled="disabled"
          :leading-icon="prevYearIcon"
          aria-label="Previous year"
          class="pfCalendar__navBtn"
          @click="goPrevYear"
        />
        <PfButton
          v-if="monthControls"
          icon-only
          color="neutral"
          variant="ghost"
          :size="navButtonSize"
          :disabled="disabled"
          :leading-icon="prevMonthIcon"
          aria-label="Previous month"
          class="pfCalendar__navBtn"
          @click="goPrevMonth"
        />
      </div>

      <div :class="mergeUi('heading', 'pfCalendar__heading')">
        <slot name="heading" :months="visibleMonthAnchors">
          <span
            v-for="(m, idx) in visibleMonthAnchors"
            :key="`${m.year}-${m.month}-${idx}`"
            class="pfCalendar__headingText"
          >
            {{ monthTitle(m) }}
          </span>
        </slot>
      </div>

      <div
        v-if="monthControls || yearControls"
        class="pfCalendar__headerNav pfCalendar__headerNav_end"
      >
        <PfButton
          v-if="monthControls"
          icon-only
          color="neutral"
          variant="ghost"
          :size="navButtonSize"
          :disabled="disabled"
          :leading-icon="nextMonthIcon"
          aria-label="Next month"
          class="pfCalendar__navBtn"
          @click="goNextMonth"
        />
        <PfButton
          v-if="yearControls"
          icon-only
          color="neutral"
          variant="ghost"
          :size="navButtonSize"
          :disabled="disabled"
          :leading-icon="nextYearIcon"
          aria-label="Next year"
          class="pfCalendar__navBtn"
          @click="goNextYear"
        />
      </div>
    </div>

    <div
      :class="mergeUi('body', 'pfCalendar__body')"
      @mouseleave="clearRangeHoverDay"
    >
      <div
        v-for="(monthAnchor, mi) in visibleMonthAnchors"
        :key="`${monthAnchor.year}-${monthAnchor.month}-${mi}`"
        class="pfCalendar__month"
      >
        <div
          :class="
            mergeUi(
              'gridWeekDaysRow',
              'pfCalendar__weekdays',
              'pfCalendar__gridRow'
            )
          "
        >
          <div
            v-if="weekNumbers"
            :class="
              mergeUi(
                'headCellWeek',
                'pfCalendar__weekday pfCalendar__weekday_weekNum'
              )
            "
          />
          <div
            v-for="(wd, wi) in weekdayLabels"
            :key="wi"
            :class="mergeUi('headCell', 'pfCalendar__weekday')"
          >
            <slot name="week-day" :label="wd" :index="wi">
              {{ wd }}
            </slot>
          </div>
        </div>

        <div :class="mergeUi('gridBody', 'pfCalendar__grid')">
          <div
            v-for="(row, ri) in monthGrids[mi]"
            :key="ri"
            :class="mergeUi('gridRow', 'pfCalendar__row')"
          >
            <div
              v-if="weekNumbers && row.weekNumber != null"
              :class="mergeUi('cellWeek', 'pfCalendar__weekNumber')"
            >
              {{ row.weekNumber }}
            </div>
            <div
              v-for="(day, di) in row.days"
              :key="di"
              :class="mergeUi('cell', 'pfCalendar__cell')"
            >
              <button
                type="button"
                :class="cellTriggerClass(day, monthAnchor)"
                :disabled="isDisabled(day, monthAnchor) || isUnavailable(day)"
                :tabindex="
                  initialFocus && mi === 0 && ri === 0 && di === 0 ? 0 : -1
                "
                @click="onDayClick(day, monthAnchor)"
                @mouseenter="onRangeHoverEnter(day)"
              >
                <slot name="day" :day="day">
                  {{ toCalendarDate(day).day }}
                </slot>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfCalendar {
  --pf-cal-cell: 2rem;
  /* Opaque fill between range edges and hover preview */
  --pf-cal-range-mid: color-mix(
    in srgb,
    var(--pf-cal-tone) 24%,
    var(--pf-color-surface)
  );
  --pf-cal-tone: var(--pf-color-primary);
  --pf-cal-tone-hover: var(--pf-color-primary-hover);

  max-width: 100%;
  box-sizing: border-box;

  color: var(--pf-color-text);
  font-family: var(--pf-font-sans);

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  &_disabled {
    opacity: 0.55;

    pointer-events: none;
  }

  &_readonly {
    .pfCalendar__cellTrigger {
      cursor: default;
    }
  }

  &_size_xs {
    --pf-cal-cell: 1.75rem;

    .pfCalendar__headingText {
      font-size: var(--pf-font-size-xs);
    }

    .pfCalendar__weekday {
      font-size: 0.625rem;
    }

    .pfCalendar__cell {
      font-size: var(--pf-font-size-xs);
    }

    .pfCalendar__body {
      padding-top: var(--pf-space-sm);
      gap: var(--pf-space-sm);
    }
  }

  &_size_sm {
    --pf-cal-cell: 1.75rem;

    .pfCalendar__headingText,
    .pfCalendar__weekday,
    .pfCalendar__cell {
      font-size: var(--pf-font-size-xs);
    }
  }

  &_size_md {
    .pfCalendar__headingText {
      font-size: var(--pf-font-size-sm);
    }

    .pfCalendar__weekday {
      font-size: var(--pf-font-size-xs);
    }

    .pfCalendar__cell {
      font-size: var(--pf-font-size-sm);
    }
  }

  &_size_lg {
    --pf-cal-cell: 2.25rem;

    .pfCalendar__headingText,
    .pfCalendar__weekday {
      font-size: var(--pf-font-size-md);
    }

    .pfCalendar__cell {
      font-size: var(--pf-font-size-md);
    }
  }

  &_size_xl {
    --pf-cal-cell: 2.5rem;

    .pfCalendar__headingText,
    .pfCalendar__weekday {
      font-size: var(--pf-font-size-lg);
    }

    .pfCalendar__cell {
      font-size: var(--pf-font-size-lg);
    }
  }

  &_color_primary {
    --pf-cal-tone: var(--pf-color-primary);
    --pf-cal-tone-hover: var(--pf-color-primary-hover);
  }

  &_color_secondary {
    --pf-cal-tone: var(--pf-color-secondary);
    --pf-cal-tone-hover: var(--pf-color-secondary-hover);
  }

  &_color_success {
    --pf-cal-tone: var(--pf-color-success);
    --pf-cal-tone-hover: var(--pf-color-success-hover);
  }

  &_color_info {
    --pf-cal-tone: var(--pf-color-info);
    --pf-cal-tone-hover: var(--pf-color-info-hover);
  }

  &_color_warning {
    --pf-cal-tone: var(--pf-color-warning);
    --pf-cal-tone-hover: var(--pf-color-warning-hover);
  }

  &_color_error {
    --pf-cal-tone: var(--pf-color-error);
    --pf-cal-tone-hover: var(--pf-color-error-hover);
  }

  &_color_neutral {
    --pf-cal-tone: var(--pf-color-neutral);
    --pf-cal-tone-hover: var(--pf-color-neutral-hover);
  }

  &__header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--pf-space-sm);
  }

  &__headerNav {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: var(--pf-space-xs);
  }

  &__heading {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: var(--pf-space-md);
  }

  &__headingText {
    font-weight: var(--pf-font-weight-medium);
    line-height: var(--pf-line-height-sm);
    text-align: center;
  }

  &__body {
    padding-top: var(--pf-space-lg);
    display: flex;
    flex-direction: row;
    gap: var(--pf-space-lg);
  }

  &__month {
    min-width: min(100%, 16rem);
    flex: 1 1 auto;
  }

  &__gridRow,
  &__weekdays,
  &__row {
    width: 100%;
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--pf-space-xs);
  }

  &_weekNumbers &__gridRow,
  &_weekNumbers &__weekdays,
  &_weekNumbers &__row {
    grid-template-columns: 2.25rem repeat(7, minmax(0, 1fr));
  }

  &__weekdays {
    margin-bottom: var(--pf-space-xs);
  }

  &__weekday {
    color: var(--pf-cal-tone);
    font-weight: var(--pf-font-weight-medium);
    line-height: var(--pf-line-height-sm);
    text-align: center;
  }

  &__weekday_weekNum {
    color: var(--pf-color-muted);
  }

  &__weekNumber {
    color: var(--pf-color-muted);
    font-size: var(--pf-font-size-xs);
    line-height: var(--pf-line-height-sm);
    text-align: center;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: var(--pf-space-xs);
  }

  &__cell {
    position: relative;

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    text-align: center;
  }

  &__cellTrigger {
    position: relative;
    margin: 0;

    padding: 0;
    width: var(--pf-cal-cell);
    min-width: var(--pf-cal-cell);
    height: var(--pf-cal-cell);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    color: inherit;
    font: inherit;
    line-height: var(--pf-line-height-sm);

    background: transparent;
    border: none;
    border-radius: 9999px;

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
      opacity var(--pf-animation-duration) var(--pf-animation-easing);

    cursor: pointer;
    appearance: none;

    &:focus-visible {
      box-shadow:
        0 0 0 2px var(--pf-color-surface),
        0 0 0 4px var(--pf-cal-tone);
      outline: none;
    }

    &:disabled {
      opacity: 0.45;

      cursor: not-allowed;
    }
  }

  &__cellTrigger_outside:not(&__cellTrigger_disabled) {
    color: var(--pf-color-muted);
  }

  &__cellTrigger_today:not(&__cellTrigger_selected) {
    color: var(--pf-cal-tone);
    font-weight: var(--pf-font-weight-bold);
  }

  &__cellTrigger_unavailable:not(:disabled) {
    color: var(--pf-color-muted);
    text-decoration: line-through;

    pointer-events: none;
  }

  &__cellTrigger_highlighted:not(&__cellTrigger_selected) {
    background: color-mix(in srgb, var(--pf-cal-tone) 18%, transparent);
  }

  /* variant + selection: selected dates and range — circles; between — solid fill */
  &_variant_soft,
  &_variant_subtle {
    --pf-cal-range-mid: color-mix(
      in srgb,
      var(--pf-cal-tone) 20%,
      var(--pf-color-surface)
    );
  }

  &_variant_solid {
    .pfCalendar__cellTrigger:hover:not(:disabled):not(
        .pfCalendar__cellTrigger_selected
      ):not(.pfCalendar__cellTrigger_rangeHover) {
      background: color-mix(in srgb, var(--pf-cal-tone) 16%, transparent);
    }

    .pfCalendar__cellTrigger_selected {
      color: var(--pf-color-surface);

      background: var(--pf-cal-tone);
    }

    .pfCalendar__cellTrigger_rangeBetween {
      color: var(--pf-cal-tone);

      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }
  }

  &_variant_outline {
    --pf-cal-range-mid: color-mix(
      in srgb,
      var(--pf-cal-tone) 14%,
      var(--pf-color-surface)
    );

    .pfCalendar__cellTrigger:hover:not(:disabled):not(
        .pfCalendar__cellTrigger_selected
      ):not(.pfCalendar__cellTrigger_rangeHover) {
      background: color-mix(in srgb, var(--pf-cal-tone) 10%, transparent);
    }

    .pfCalendar__cellTrigger_selected {
      color: var(--pf-cal-tone);

      box-shadow: inset 0 0 0 2px
        color-mix(in srgb, var(--pf-cal-tone) 50%, transparent);
      background: transparent;
    }

    .pfCalendar__cellTrigger_rangeBetween {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }
  }

  &_variant_soft {
    .pfCalendar__cellTrigger:hover:not(:disabled):not(
        .pfCalendar__cellTrigger_selected
      ):not(.pfCalendar__cellTrigger_rangeHover) {
      background: color-mix(in srgb, var(--pf-cal-tone) 18%, transparent);
    }

    .pfCalendar__cellTrigger_selected {
      color: var(--pf-cal-tone);

      background: color-mix(in srgb, var(--pf-cal-tone) 12%, transparent);
    }

    .pfCalendar__cellTrigger_rangeBetween {
      color: var(--pf-cal-tone);

      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      background: var(--pf-cal-range-mid);
    }
  }

  &_variant_subtle {
    .pfCalendar__cellTrigger:hover:not(:disabled):not(
        .pfCalendar__cellTrigger_selected
      ):not(.pfCalendar__cellTrigger_rangeHover) {
      background: color-mix(in srgb, var(--pf-cal-tone) 18%, transparent);
    }

    .pfCalendar__cellTrigger_selected {
      color: var(--pf-cal-tone);

      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--pf-cal-tone) 28%, transparent);
      background: color-mix(in srgb, var(--pf-cal-tone) 12%, transparent);
    }

    .pfCalendar__cellTrigger_rangeBetween {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }

    .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-cal-tone);

      box-shadow: none;
      background: var(--pf-cal-range-mid);
    }
  }

  &_color_neutral {
    --pf-cal-range-mid: color-mix(
      in srgb,
      var(--pf-color-neutral) 26%,
      var(--pf-color-surface)
    );

    &.pfCalendar_variant_solid .pfCalendar__cellTrigger_selected {
      color: var(--pf-color-surface);

      background: var(--pf-color-text);
    }

    &.pfCalendar_variant_outline .pfCalendar__cellTrigger_selected {
      color: var(--pf-color-text);

      box-shadow: inset 0 0 0 2px var(--pf-border-color-hover);
      background: transparent;
    }

    &.pfCalendar_variant_soft .pfCalendar__cellTrigger_selected,
    &.pfCalendar_variant_subtle .pfCalendar__cellTrigger_selected {
      color: var(--pf-color-text);

      background: var(--pf-border-color);
    }

    &.pfCalendar_variant_outline
      .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover,
    &.pfCalendar_variant_soft
      .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover,
    &.pfCalendar_variant_subtle
      .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-color-text);

      background: var(--pf-cal-range-mid);
    }

    &.pfCalendar_variant_solid
      .pfCalendar__cellTrigger_selected.pfCalendar__cellTrigger_rangeHover {
      color: var(--pf-color-text);

      background: var(--pf-cal-range-mid);
    }
  }
}
</style>
