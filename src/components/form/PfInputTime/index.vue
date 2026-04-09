<script setup lang="ts">
import type { Component, ComponentPublicInstance } from 'vue';
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue';
import { DateFormatter, getLocalTimeZone, Time } from '@internationalized/date';
import { usePfApp } from '../../../composables/usePfApp';
import { usePfVModelBound } from '../../../composables/usePfVModelBound';
import PfAvatar from '../../element/PfAvatar/index.vue';
import { PF_FIELD_GROUP_INJECTION_KEY } from '../../element/PfFieldGroup/injection';
import PfIcon from '../../element/PfIcon/index.vue';
import type { PfButtonAvatarProps } from '../../element/PfButton/index.vue';
import type { PfIconName } from '../../element/PfIcon/paths';
import type { PfIconSize } from '../../element/PfIcon/iconSizes';
import {
  buildIntlTimeOptions,
  cmpTimeInBounds,
  compareTimeOnly,
  extractTime,
  inferTimeGranularity,
  layoutAndTextsFromTime,
  mergeTimeInto,
  nudgeTimeSegment,
  snapTimeToStep,
  timeValueToJsDate,
  tryComposeTimeFromTexts,
  type PfInputTimeGranularity,
  type PfInputTimeHourCycle,
  type PfInputTimeLayoutToken,
  type PfInputTimeRange,
  type PfTimeValue,
} from './inputTimeSegments';

export type PfInputTimeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfInputTimeVariant =
  | 'outline'
  | 'soft'
  | 'subtle'
  | 'ghost'
  | 'none';

export type PfInputTimeUi = Partial<{
  root: string;
  base: string;
  leading: string;
  leadingIcon: string;
  leadingAvatar: string;
  trailing: string;
  trailingIcon: string;
  segment: string;
  separatorIcon: string;
}>;

export type PfInputTimeModel = PfTimeValue | null | PfInputTimeRange;

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

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    id?: string;
    name?: string;
    color?: PfInputTimeColor;
    variant?: PfInputTimeVariant;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    highlight?: boolean;
    fixed?: boolean;
    autofocus?: boolean;
    autofocusDelay?: number;
    range?: boolean;
    locale?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    minValue?: PfTimeValue | null;
    maxValue?: PfTimeValue | null;
    isTimeUnavailable?: (value: PfTimeValue) => boolean;
    defaultValue?: PfInputTimeModel | null;
    placeholder?: PfTimeValue | null;
    defaultPlaceholder?: PfTimeValue | null;
    granularity?: PfInputTimeGranularity;
    hourCycle?: PfInputTimeHourCycle;
    hideTimeZone?: boolean;
    step?: number;
    stepSnapping?: boolean;
    icon?: PfIconName;
    avatar?: PfButtonAvatarProps;
    leading?: boolean;
    leadingIcon?: PfIconName;
    trailing?: boolean;
    trailingIcon?: PfIconName;
    loading?: boolean;
    loadingIcon?: PfIconName;
    separatorIcon?: PfIconName;
    ui?: PfInputTimeUi;
  }>(),
  {
    as: 'div',
    color: 'primary',
    variant: 'outline',
    highlight: false,
    fixed: true,
    autofocus: false,
    autofocusDelay: 0,
    range: false,
    disabled: false,
    readonly: false,
    required: false,
    hideTimeZone: false,
    step: 1,
    stepSnapping: false,
    loading: false,
    hourCycle: 'h12',
    separatorIcon: 'minusSmall',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: PfInputTimeModel | null];
  change: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const modelValue = defineModel<PfInputTimeModel | null>({ default: null });

const attrs = useAttrs();
const slots = useSlots();
const fieldGroupInjected = inject(PF_FIELD_GROUP_INJECTION_KEY, null);
const modelBound = usePfVModelBound();
const pfApp = usePfApp();
const tz = getLocalTimeZone();

const effectiveSize = computed(
  (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' =>
    props.size ?? fieldGroupInjected?.value.size ?? 'md'
);

const resolvedLocale = computed(() =>
  pickLocaleTag(
    props.locale,
    pfApp.value.locale,
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().locale
      : undefined
  )
);

function isRangeModel(
  v: PfInputTimeModel | null
): v is PfInputTimeRange | null {
  return (
    v != null &&
    typeof v === 'object' &&
    !('toDate' in v) &&
    ('start' in v || 'end' in v)
  );
}

const rangeStart = computed(() =>
  props.range && isRangeModel(modelValue.value)
    ? (modelValue.value?.start ?? null)
    : null
);

const rangeEnd = computed(() =>
  props.range && isRangeModel(modelValue.value)
    ? (modelValue.value?.end ?? null)
    : null
);

const singleValue = computed((): PfTimeValue | null => {
  if (props.range) return null;
  const v = modelValue.value;
  if (v == null || isRangeModel(v)) return null;
  return v as PfTimeValue;
});

const effectiveGranularity = computed((): PfInputTimeGranularity => {
  if (props.range) {
    return inferTimeGranularity(
      rangeStart.value ?? rangeEnd.value ?? null,
      props.granularity
    );
  }
  const v = modelValue.value;
  if (v != null && typeof v === 'object' && 'start' in v) {
    return 'minute';
  }
  return inferTimeGranularity(v as PfTimeValue | null, props.granularity);
});

const intlOptions = computed(() =>
  buildIntlTimeOptions(
    effectiveGranularity.value,
    props.hourCycle,
    props.hideTimeZone
  )
);

const formatter = computed(
  () => new DateFormatter(resolvedLocale.value, intlOptions.value)
);

function defaultRefTime(): Time {
  return new Time(0, 0, 0);
}

function referenceJsDate(which: 'single' | 'start' | 'end'): Date {
  const ph = props.placeholder ?? props.defaultPlaceholder;
  if (which === 'single') {
    const v = singleValue.value;
    if (v) return timeValueToJsDate(v, tz);
    if (ph) return timeValueToJsDate(ph, tz);
    return timeValueToJsDate(defaultRefTime(), tz);
  }
  if (which === 'start') {
    if (rangeStart.value) return timeValueToJsDate(rangeStart.value, tz);
    if (ph) return timeValueToJsDate(ph, tz);
    return timeValueToJsDate(defaultRefTime(), tz);
  }
  if (rangeEnd.value) return timeValueToJsDate(rangeEnd.value, tz);
  if (rangeStart.value) return timeValueToJsDate(rangeStart.value, tz);
  if (ph) return timeValueToJsDate(ph, tz);
  return timeValueToJsDate(defaultRefTime(), tz);
}

const layoutSingle = computed(() =>
  layoutAndTextsFromTime(formatter.value, referenceJsDate('single'))
);

const layoutStart = computed(() =>
  layoutAndTextsFromTime(formatter.value, referenceJsDate('start'))
);

const layoutEnd = computed(() =>
  layoutAndTextsFromTime(formatter.value, referenceJsDate('end'))
);

const textsSingle = ref<Record<string, string>>({});
const textsStart = ref<Record<string, string>>({});
const textsEnd = ref<Record<string, string>>({});

const invalidSingle = ref(false);
const invalidStart = ref(false);
const invalidEnd = ref(false);

const segmentFocusDepth = ref(0);

function priorForCompose(
  which: 'single' | 'start' | 'end'
): PfTimeValue | null {
  if (which === 'single') return singleValue.value;
  if (which === 'start') return rangeStart.value;
  return rangeEnd.value;
}

function applyValidation(
  value: PfTimeValue,
  which: 'single' | 'start' | 'end',
  otherEnd?: PfTimeValue | null
): boolean {
  if (!cmpTimeInBounds(value, props.minValue, props.maxValue)) return false;
  if (props.isTimeUnavailable?.(value)) return false;
  if (
    props.range &&
    which === 'start' &&
    otherEnd != null &&
    compareTimeOnly(value, otherEnd) > 0
  ) {
    return false;
  }
  if (
    props.range &&
    which === 'end' &&
    otherEnd != null &&
    compareTimeOnly(otherEnd, value) > 0
  ) {
    return false;
  }
  return true;
}

function syncTextsFromModel() {
  if (!props.range) {
    const v = singleValue.value;
    const js = referenceJsDate('single');
    const { layout, texts } = layoutAndTextsFromTime(formatter.value, js);
    if (v) {
      const refD = timeValueToJsDate(v, tz);
      const full = layoutAndTextsFromTime(formatter.value, refD);
      textsSingle.value = { ...full.texts };
    } else {
      textsSingle.value = { ...texts };
      for (const t of layout) {
        if (t.kind === 'field') {
          textsSingle.value[t.key] = '';
        }
      }
    }
    invalidSingle.value = false;
    return;
  }

  const jsS = referenceJsDate('start');
  const jsE = referenceJsDate('end');
  const startV = rangeStart.value;
  const endV = rangeEnd.value;

  if (startV) {
    textsStart.value = {
      ...layoutAndTextsFromTime(formatter.value, timeValueToJsDate(startV, tz))
        .texts,
    };
  } else {
    const { layout, texts } = layoutAndTextsFromTime(formatter.value, jsS);
    textsStart.value = { ...texts };
    for (const t of layout) {
      if (t.kind === 'field') {
        textsStart.value[t.key] = '';
      }
    }
  }

  if (endV) {
    textsEnd.value = {
      ...layoutAndTextsFromTime(formatter.value, timeValueToJsDate(endV, tz))
        .texts,
    };
  } else {
    const { layout, texts } = layoutAndTextsFromTime(formatter.value, jsE);
    textsEnd.value = { ...texts };
    for (const t of layout) {
      if (t.kind === 'field') {
        textsEnd.value[t.key] = '';
      }
    }
  }
  invalidStart.value = false;
  invalidEnd.value = false;
}

watch(
  [
    () => modelValue.value,
    resolvedLocale,
    effectiveGranularity,
    () => props.hourCycle,
    () => props.hideTimeZone,
    () => props.placeholder,
    () => props.defaultPlaceholder,
    () => props.range,
  ],
  () => {
    if (segmentFocusDepth.value > 0) return;
    syncTextsFromModel();
  },
  { deep: true, immediate: true }
);

function emitRange(patch: Partial<PfInputTimeRange>) {
  const cur: PfInputTimeRange = isRangeModel(modelValue.value)
    ? { ...modelValue.value }
    : { start: undefined, end: undefined };
  modelValue.value = { ...cur, ...patch };
}

function finalizeCommittedValue(value: PfTimeValue): PfTimeValue {
  if (!props.stepSnapping) return value;
  const snapped = snapTimeToStep(
    extractTime(value),
    effectiveGranularity.value,
    props.step
  );
  return mergeTimeInto(value, snapped);
}

function tryCommitSingle() {
  const { layout } = layoutSingle.value;
  const prior = priorForCompose('single');
  const r = tryComposeTimeFromTexts(
    layout,
    textsSingle.value,
    effectiveGranularity.value,
    prior
  );
  if (!r.segmentsComplete) {
    invalidSingle.value = false;
    return;
  }
  if (!r.valid || r.value == null) {
    invalidSingle.value = true;
    return;
  }
  const out = finalizeCommittedValue(r.value);
  if (!applyValidation(out, 'single')) {
    invalidSingle.value = true;
    return;
  }
  invalidSingle.value = false;
  modelValue.value = out;
}

function tryCommitStart() {
  const { layout } = layoutStart.value;
  const prior = priorForCompose('start');
  const r = tryComposeTimeFromTexts(
    layout,
    textsStart.value,
    effectiveGranularity.value,
    prior
  );
  if (!r.segmentsComplete) {
    invalidStart.value = false;
    return;
  }
  if (!r.valid || r.value == null) {
    invalidStart.value = true;
    return;
  }
  const out = finalizeCommittedValue(r.value);
  const other = rangeEnd.value;
  if (!applyValidation(out, 'start', other)) {
    invalidStart.value = true;
    return;
  }
  invalidStart.value = false;
  emitRange({ start: out });
}

function tryCommitEnd() {
  const { layout } = layoutEnd.value;
  const prior = priorForCompose('end');
  const r = tryComposeTimeFromTexts(
    layout,
    textsEnd.value,
    effectiveGranularity.value,
    prior
  );
  if (!r.segmentsComplete) {
    invalidEnd.value = false;
    return;
  }
  if (!r.valid || r.value == null) {
    invalidEnd.value = true;
    return;
  }
  const out = finalizeCommittedValue(r.value);
  const other = rangeStart.value;
  if (!applyValidation(out, 'end', other)) {
    invalidEnd.value = true;
    return;
  }
  invalidEnd.value = false;
  emitRange({ end: out });
}

function onFieldInput(
  key: string,
  ev: Event,
  which: 'single' | 'start' | 'end',
  partType: string,
  index: number
) {
  const input = ev.target as HTMLInputElement;
  const maxLength = fieldMaxLength(partType);
  let nextText = input.value;

  if (partType !== 'dayPeriod') {
    nextText = nextText.replace(/\D/g, '');
  } else {
    nextText = nextText.replace(/[^a-zA-Z]/g, '').toUpperCase();
  }

  if (nextText.length > maxLength) {
    nextText = nextText.slice(0, maxLength);
  }

  if (input.value !== nextText) {
    input.value = nextText;
  }

  if (which === 'single') {
    textsSingle.value = { ...textsSingle.value, [key]: nextText };
  } else if (which === 'start') {
    textsStart.value = { ...textsStart.value, [key]: nextText };
  } else {
    textsEnd.value = { ...textsEnd.value, [key]: nextText };
  }

  if (nextText.length >= maxLength) {
    focusSegmentByOffset(index, 1);
  }
}

function segmentText(key: string, which: 'single' | 'start' | 'end'): string {
  if (which === 'single') return textsSingle.value[key] ?? '';
  if (which === 'start') return textsStart.value[key] ?? '';
  return textsEnd.value[key] ?? '';
}

const inputsRef = ref<(HTMLInputElement | null)[]>([]);

function registerInput(
  el: Element | ComponentPublicInstance | null,
  index: number
) {
  const node = el instanceof HTMLInputElement ? el : null;
  if (!node) {
    inputsRef.value[index] = null;
    return;
  }
  inputsRef.value[index] = node;
}

function layoutStructureSignature(layout: PfInputTimeLayoutToken[]): string {
  return layout
    .map((t) =>
      t.kind === 'literal' ? `L:${t.text}` : `F:${String(t.partType)}:${t.key}`
    )
    .join('|');
}

watch(
  () =>
    [
      props.range,
      layoutStructureSignature(layoutSingle.value.layout),
      layoutStructureSignature(layoutStart.value.layout),
      layoutStructureSignature(layoutEnd.value.layout),
    ] as const,
  () => {
    inputsRef.value = [];
    void nextTick(() => {
      inputsRef.value = inputsRef.value.filter(Boolean);
    });
  }
);

const showLeadingFromIconProp = computed(() => {
  if (props.icon == null) return false;
  if (props.trailing === true) return false;
  return true;
});

const showTrailingFromIconProp = computed(() => {
  if (props.icon == null) return false;
  return props.trailing === true;
});

const resolvedLeadingIcon = computed((): PfIconName | undefined => {
  if (props.leadingIcon) return props.leadingIcon;
  if (showLeadingFromIconProp.value) return props.icon;
  return undefined;
});

const resolvedTrailingIcon = computed((): PfIconName | undefined => {
  if (props.trailingIcon) return props.trailingIcon;
  if (showTrailingFromIconProp.value) return props.icon;
  return undefined;
});

const loadingOnTrailing = computed(() => props.trailing === true);

const showLeadingSpinner = computed(
  () => props.loading && !loadingOnTrailing.value
);

const showTrailingSpinner = computed(
  () => props.loading && loadingOnTrailing.value
);

const effectiveLeadingIcon = computed(() =>
  showLeadingSpinner.value ? undefined : resolvedLeadingIcon.value
);

const effectiveTrailingIcon = computed(() =>
  showTrailingSpinner.value ? undefined : resolvedTrailingIcon.value
);

const spinnerIcon = computed((): PfIconName => props.loadingIcon ?? 'spinner');

const iconSizeForField = computed((): PfIconSize => {
  switch (effectiveSize.value) {
    case 'xs':
      return '2xs';
    case 'sm':
      return 'sm';
    case 'md':
      return 'md';
    case 'lg':
      return 'lg';
    case 'xl':
      return 'xl';
    default:
      return 'md';
  }
});

const avatarEmbedSize = computed(() => {
  const map: Record<
    'xs' | 'sm' | 'md' | 'lg' | 'xl',
    PfButtonAvatarProps['size']
  > = {
    xs: '3xs',
    sm: '2xs',
    md: '2xs',
    lg: '2xs',
    xl: 'xs',
  };
  return map[effectiveSize.value];
});

const hasAvatar = computed(() => props.avatar != null);

const hasLeading = computed(
  () =>
    hasAvatar.value ||
    Boolean(effectiveLeadingIcon.value) ||
    showLeadingSpinner.value ||
    slots.leading != null
);

const hasTrailing = computed(
  () =>
    Boolean(effectiveTrailingIcon.value) ||
    showTrailingSpinner.value ||
    slots.trailing != null
);

const avatarBindings = computed(() => {
  const a = props.avatar;
  if (!a) return {};
  return {
    ...a,
    size: a.size ?? avatarEmbedSize.value,
  };
});

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootInvalid = computed(
  () => invalidSingle.value || invalidStart.value || invalidEnd.value
);

const rootClass = computed(() => [
  'pfInputTime',
  `pfInputTime_size_${effectiveSize.value}`,
  `pfInputTime_color_${props.color}`,
  `pfInputTime_variant_${props.variant}`,
  hasLeading.value && 'pfInputTime_hasLeading',
  hasTrailing.value && 'pfInputTime_hasTrailing',
  props.disabled && 'pfInputTime_disabled',
  props.readonly && 'pfInputTime_readonly',
  props.highlight && 'pfInputTime_highlight',
  !props.fixed && 'pfInputTime_responsiveText',
  rootInvalid.value && 'pfInputTime_invalid',
  attrs.class,
  props.ui?.root,
]);

const shellClass = computed(() => ['pfInputTime__shell', props.ui?.base]);

function buildRowParts(
  layout: PfInputTimeLayoutToken[],
  which: 'single' | 'start' | 'end',
  startIdx: { n: number },
  firstField: { done: boolean }
): {
  which: 'single' | 'start' | 'end';
  parts: {
    type: 'lit' | 'field';
    text?: string;
    key?: string;
    partType?: string;
    idx?: number;
    domId?: string;
  }[];
} {
  const parts: {
    type: 'lit' | 'field';
    text?: string;
    key?: string;
    partType?: string;
    idx?: number;
    domId?: string;
  }[] = [];
  for (const t of layout) {
    if (t.kind === 'literal') {
      parts.push({ type: 'lit', text: t.text });
    } else {
      const idx = startIdx.n;
      startIdx.n += 1;
      const domId = !firstField.done && props.id ? props.id : undefined;
      if (!firstField.done) {
        firstField.done = true;
      }
      parts.push({
        type: 'field',
        key: t.key,
        partType: String(t.partType),
        idx,
        domId,
      });
    }
  }
  return { which, parts };
}

const segmentRows = computed(() => {
  const counter = { n: 0 };
  const firstField = { done: false };
  if (!props.range) {
    return [
      buildRowParts(layoutSingle.value.layout, 'single', counter, firstField),
    ];
  }
  return [
    buildRowParts(layoutStart.value.layout, 'start', counter, firstField),
    buildRowParts(layoutEnd.value.layout, 'end', counter, firstField),
  ];
});

function fieldWidthCh(partType: string | undefined): number {
  switch (partType) {
    case 'hour':
    case 'minute':
    case 'second':
      return 2;
    case 'dayPeriod':
      return 4;
    default:
      return 3;
  }
}

function fieldMaxLength(partType: string | undefined): number {
  switch (partType) {
    case 'hour':
    case 'minute':
    case 'second':
      return 2;
    case 'dayPeriod':
      return 4;
    default:
      return 4;
  }
}

function focusSegmentByOffset(fromIndex: number, direction: -1 | 1): void {
  let idx = fromIndex + direction;
  while (idx >= 0 && idx < inputsRef.value.length) {
    const node = inputsRef.value[idx];
    if (node) {
      node.focus();
      node.select();
      return;
    }
    idx += direction;
  }
}

function onSegmentFocus(e: FocusEvent) {
  const target = e.target as HTMLInputElement | null;
  target?.select();
  segmentFocusDepth.value += 1;
  emit('focus', e);
}

function onSegmentClick(e: MouseEvent) {
  const target = e.target as HTMLInputElement | null;
  if (!target) return;
  window.requestAnimationFrame(() => {
    target.select();
  });
}

function onSegmentBlur(e: FocusEvent, which: 'single' | 'start' | 'end') {
  if (which === 'single') tryCommitSingle();
  else if (which === 'start') tryCommitStart();
  else tryCommitEnd();
  segmentFocusDepth.value = Math.max(0, segmentFocusDepth.value - 1);
  if (segmentFocusDepth.value === 0) {
    syncTextsFromModel();
  }
  emit('blur', e);
}

function onSegmentChange(e: Event) {
  emit('change', e);
}

function resolveBaseForNudge(
  which: 'single' | 'start' | 'end'
): PfTimeValue | null {
  const layout =
    which === 'single'
      ? layoutSingle.value.layout
      : which === 'start'
        ? layoutStart.value.layout
        : layoutEnd.value.layout;
  const texts =
    which === 'single'
      ? textsSingle.value
      : which === 'start'
        ? textsStart.value
        : textsEnd.value;
  const r = tryComposeTimeFromTexts(
    layout,
    texts,
    effectiveGranularity.value,
    priorForCompose(which)
  );
  if (r.valid && r.value) return r.value;

  if (which === 'single' && singleValue.value) return singleValue.value;
  if (which === 'start' && rangeStart.value) return rangeStart.value;
  if (which === 'end' && rangeEnd.value) return rangeEnd.value;

  const ph = props.placeholder ?? props.defaultPlaceholder;
  if (ph) return ph;
  return defaultRefTime();
}

function applyTextsFromTimeValue(
  v: PfTimeValue,
  which: 'single' | 'start' | 'end'
) {
  const js = timeValueToJsDate(v, tz);
  const { texts } = layoutAndTextsFromTime(formatter.value, js);
  if (which === 'single') textsSingle.value = { ...texts };
  else if (which === 'start') textsStart.value = { ...texts };
  else textsEnd.value = { ...texts };
}

function commitNudgedValue(
  next: PfTimeValue,
  which: 'single' | 'start' | 'end'
) {
  const other =
    which === 'start'
      ? rangeEnd.value
      : which === 'end'
        ? rangeStart.value
        : undefined;
  if (!applyValidation(next, which, other ?? undefined)) return;

  if (which === 'single') {
    invalidSingle.value = false;
    modelValue.value = next;
  } else if (which === 'start') {
    invalidStart.value = false;
    emitRange({ start: next });
  } else {
    invalidEnd.value = false;
    emitRange({ end: next });
  }
  applyTextsFromTimeValue(next, which);
}

function onSegmentKeydown(
  e: KeyboardEvent,
  partType: string,
  which: 'single' | 'start' | 'end',
  index: number
) {
  if (props.disabled || props.readonly) return;
  if (e.isComposing) return;

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    focusSegmentByOffset(index, -1);
    return;
  }

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    focusSegmentByOffset(index, 1);
    return;
  }

  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();

  const base = resolveBaseForNudge(which);
  if (!base) return;

  const direction = (e.key === 'ArrowUp' ? 1 : -1) as 1 | -1;
  const raw = nudgeTimeSegment(base, partType, direction, {
    granularity: effectiveGranularity.value,
    step: props.step,
  });
  if (!raw) return;

  commitNudgedValue(raw, which);
}

const hiddenSingle = computed(() => {
  const v = singleValue.value;
  return v ? v.toString() : '';
});

const hiddenStart = computed(() => {
  const v = rangeStart.value;
  return v ? v.toString() : '';
});

const hiddenEnd = computed(() => {
  const v = rangeEnd.value;
  return v ? v.toString() : '';
});

onMounted(() => {
  if (!modelBound.value && props.defaultValue != null) {
    modelValue.value = props.defaultValue;
    syncTextsFromModel();
  }
  if (props.autofocus) {
    const delay = props.autofocusDelay ?? 0;
    window.setTimeout(() => {
      const first = inputsRef.value.find(Boolean);
      first?.focus();
    }, delay);
  }
});

defineExpose({
  inputsRef,
});
</script>

<template>
  <component :is="as" :class="rootClass" v-bind="passthroughAttrs">
    <div :class="shellClass">
      <span
        v-if="hasLeading"
        class="pfInputTime__leading"
        :class="props.ui?.leading"
      >
        <slot name="leading">
          <PfAvatar
            v-if="avatar"
            class="pfInputTime__leadingAvatar"
            :class="props.ui?.leadingAvatar"
            v-bind="avatarBindings"
          />
          <PfIcon
            v-if="showLeadingSpinner"
            class="pfInputTime__iconSpin"
            :class="props.ui?.leadingIcon"
            :name="spinnerIcon"
            :size="iconSizeForField"
          />
          <PfIcon
            v-else-if="effectiveLeadingIcon"
            :class="props.ui?.leadingIcon"
            :name="effectiveLeadingIcon"
            :size="iconSizeForField"
          />
        </slot>
      </span>

      <div class="pfInputTime__field">
        <template
          v-for="(row, rowIndex) in segmentRows"
          :key="`${row.which}-${rowIndex}`"
        >
          <span
            v-if="rowIndex > 0"
            class="pfInputTime__rangeSep"
            aria-hidden="true"
          >
            <slot name="separator">
              <PfIcon
                :name="separatorIcon"
                :size="iconSizeForField"
                :class="props.ui?.separatorIcon"
              />
            </slot>
          </span>
          <span class="pfInputTime__segments">
            <template
              v-for="(p, pi) in row.parts"
              :key="`${row.which}-${pi}-${p.type}`"
            >
              <span
                v-if="p.type === 'lit'"
                class="pfInputTime__literal"
                data-segment="literal"
              >
                {{ p.text }}
              </span>
              <input
                v-else
                :id="p.domId"
                :key="`${row.which}-${p.key}`"
                :ref="(el) => registerInput(el, p.idx ?? 0)"
                class="pfInputTime__segment"
                :class="props.ui?.segment"
                :data-segment="p.partType"
                :style="{ width: `${fieldWidthCh(p.partType)}ch` }"
                :maxlength="fieldMaxLength(p.partType)"
                :value="segmentText(p.key!, row.which)"
                :placeholder="'0'"
                :disabled="disabled"
                :readonly="readonly"
                :aria-invalid="rootInvalid ? 'true' : undefined"
                :aria-required="required ? 'true' : undefined"
                :inputmode="p.partType === 'dayPeriod' ? 'text' : 'numeric'"
                autocomplete="off"
                @focus="onSegmentFocus"
                @click="onSegmentClick"
                @blur="onSegmentBlur($event, row.which)"
                @change="onSegmentChange"
                @keydown="
                  onSegmentKeydown($event, p.partType!, row.which, p.idx ?? 0)
                "
                @input="
                  onFieldInput(
                    p.key!,
                    $event,
                    row.which,
                    p.partType!,
                    p.idx ?? 0
                  )
                "
              />
            </template>
          </span>
        </template>

        <input
          v-if="name && !range"
          type="hidden"
          :name="name"
          :value="hiddenSingle"
        />
        <template v-if="name && range">
          <input type="hidden" :name="`${name}_start`" :value="hiddenStart" />
          <input type="hidden" :name="`${name}_end`" :value="hiddenEnd" />
        </template>
      </div>

      <span
        v-if="hasTrailing"
        class="pfInputTime__trailing"
        :class="props.ui?.trailing"
      >
        <slot name="trailing">
          <PfIcon
            v-if="showTrailingSpinner"
            class="pfInputTime__iconSpin"
            :class="props.ui?.trailingIcon"
            :name="spinnerIcon"
            :size="iconSizeForField"
          />
          <PfIcon
            v-else-if="effectiveTrailingIcon"
            :class="props.ui?.trailingIcon"
            :name="effectiveTrailingIcon"
            :size="iconSizeForField"
          />
        </slot>
      </span>
    </div>
  </component>
</template>

<style scoped lang="scss">
@keyframes pfInputTime-spin {
  to {
    transform: rotate(360deg);
  }
}

.pfInputTime {
  --pf-input-border: var(--pf-border-color);
  --pf-input-muted: var(--pf-color-muted);
  --pf-input-ring: var(--pf-color-primary);
  --pf-input-surface: var(--pf-color-surface);
  --pf-input-text: var(--pf-color-text);

  max-width: 100%;
  display: inline-flex;
  box-sizing: border-box;

  font-family: var(--pf-font-sans);

  transition:
    opacity var(--pf-animation-duration) var(--pf-animation-easing),
    box-shadow var(--pf-animation-duration) var(--pf-animation-easing);

  &_color_primary {
    --pf-input-ring: var(--pf-color-primary);
  }

  &_color_secondary {
    --pf-input-ring: var(--pf-color-secondary);
  }

  &_color_success {
    --pf-input-ring: var(--pf-color-success);
  }

  &_color_info {
    --pf-input-ring: var(--pf-color-info);
  }

  &_color_warning {
    --pf-input-ring: var(--pf-color-warning);
  }

  &_color_error {
    --pf-input-ring: var(--pf-color-error);
  }

  &_color_neutral {
    --pf-input-ring: var(--pf-color-neutral);
  }

  &_disabled {
    opacity: 0.55;
  }

  &_readonly &__segment {
    cursor: default;
  }

  &_invalid &__segment {
    color: var(--pf-color-error);
  }

  &__shell {
    position: relative;

    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--pf-space-xs);
    box-sizing: border-box;

    box-shadow: var(--pf-input-shadow);
    background: var(--pf-input-bg);
    border-radius: var(--pf-input-radius);
    outline: var(--pf-input-outline, none);
    outline-offset: 0;

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      box-shadow var(--pf-animation-duration) var(--pf-animation-easing),
      outline-color var(--pf-animation-duration) var(--pf-animation-easing);
  }

  &__shell:focus-within {
    box-shadow: var(--pf-input-shadow-focus);
    outline: none;
  }

  &_highlight &__shell:not(:focus-within) {
    box-shadow: var(--pf-input-shadow-highlight);
  }

  &__leading,
  &__trailing {
    position: absolute;
    z-index: 2;

    display: flex;
    align-items: center;
    flex-shrink: 0;

    pointer-events: none;
  }

  &__leading :deep(.pfIcon),
  &__leading :deep(.pfAvatar),
  &__trailing :deep(*) {
    pointer-events: auto;
  }

  &__leading {
    inset-block: 0;
    inset-inline-start: 0;

    padding-inline-end: var(--pf-space-xs);
    padding-inline-start: var(--pf-input-pad-inline);
  }

  &__trailing {
    inset-block: 0;
    inset-inline-end: 0;

    padding-inline-end: var(--pf-input-pad-inline);
    padding-inline-start: var(--pf-space-xs);
  }

  &__iconSpin {
    animation: pfInputTime-spin 0.8s linear infinite;
  }

  &__field {
    position: relative;

    padding-block: var(--pf-input-pad-block);
    padding-inline: var(--pf-input-pad-inline);
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    flex: 1;
    flex-wrap: wrap;
    gap: var(--pf-space-xs);
    box-sizing: border-box;
  }

  &__segments {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.125em;
  }

  &__rangeSep {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;

    color: var(--pf-input-muted);
  }

  &__literal {
    color: var(--pf-input-muted);
    font-size: var(--pf-input-font-size);
    line-height: var(--pf-input-line-height);
    white-space: pre;
  }

  &__segment {
    margin: 0;

    padding-block: 0;
    padding-inline: 0.25rem;
    min-width: 0;
    box-sizing: content-box;

    color: var(--pf-input-text);
    font-family: inherit;
    font-size: var(--pf-input-font-size);
    font-variant-numeric: tabular-nums;
    line-height: var(--pf-input-line-height);
    text-align: center;

    background: transparent;
    border: none;
    border-radius: var(--pf-radius-xs);
    outline: none;

    transition:
      background-color var(--pf-animation-duration) var(--pf-animation-easing),
      color var(--pf-animation-duration) var(--pf-animation-easing);

    &:focus-visible {
      outline: none;
    }

    &:focus {
      background-color: color-mix(
        in srgb,
        var(--pf-color-neutral) 10%,
        transparent
      );
    }

    &::selection {
      color: var(--pf-input-text);

      background-color: transparent;
    }

    &::placeholder {
      color: var(--pf-input-muted);

      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &_size_xs {
    --pf-input-font-size: var(--pf-font-size-xs);
    --pf-input-leading-pad: 1.75rem;
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 1.75rem;

    &.pfInputTime_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-xs);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_sm {
    --pf-input-font-size: var(--pf-font-size-sm);
    --pf-input-leading-pad: 2rem;
    --pf-input-line-height: var(--pf-line-height-sm);
    --pf-input-pad-block: var(--pf-space-xs);
    --pf-input-pad-inline: var(--pf-space-sm);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 2rem;

    &.pfInputTime_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-xs);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_md {
    --pf-input-font-size: var(--pf-font-size-md);
    --pf-input-leading-pad: 2.25rem;
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-sm);
    --pf-input-pad-inline: var(--pf-space-md);
    --pf-input-radius: var(--pf-radius-sm);
    --pf-input-trailing-pad: 2.25rem;

    &.pfInputTime_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-sm);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_lg {
    --pf-input-font-size: var(--pf-font-size-md);
    --pf-input-leading-pad: 2.5rem;
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-sm);
    --pf-input-pad-inline: var(--pf-space-lg);
    --pf-input-radius: var(--pf-radius-md);
    --pf-input-trailing-pad: 2.5rem;

    &.pfInputTime_responsiveText {
      --pf-input-responsive-font-size: var(--pf-font-size-sm);
      --pf-input-responsive-line-height: var(--pf-line-height-sm);
    }
  }

  &_size_xl {
    --pf-input-font-size: var(--pf-font-size-lg);
    --pf-input-leading-pad: 2.75rem;
    --pf-input-line-height: var(--pf-line-height-md);
    --pf-input-pad-block: var(--pf-space-md);
    --pf-input-pad-inline: var(--pf-space-lg);
    --pf-input-radius: var(--pf-radius-md);
    --pf-input-trailing-pad: 2.75rem;
  }

  &_responsiveText:not(.pfInputTime_size_xl) {
    @media (width >= 48rem) {
      --pf-input-font-size: var(--pf-input-responsive-font-size);
      --pf-input-line-height: var(--pf-input-responsive-line-height);
    }
  }

  &_hasLeading &__field {
    padding-inline-start: var(--pf-input-leading-pad);
  }

  &_hasTrailing &__field {
    padding-inline-end: var(--pf-input-trailing-pad);
  }

  &_variant_outline {
    --pf-input-bg: var(--pf-input-surface);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border);
    --pf-input-shadow-focus:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-ring) 40%, transparent);
  }

  &_variant_soft {
    --pf-input-bg: color-mix(in srgb, var(--pf-input-muted) 10%, transparent);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) transparent;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_variant_subtle {
    --pf-input-bg: color-mix(in srgb, var(--pf-input-muted) 8%, transparent);
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border);
    --pf-input-shadow-focus:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight:
      inset 0 0 0 var(--pf-stroke-width) var(--pf-input-border),
      0 0 0 2px color-mix(in srgb, var(--pf-input-ring) 40%, transparent);
  }

  &_variant_ghost {
    --pf-input-bg: transparent;
    --pf-input-shadow: inset 0 0 0 var(--pf-stroke-width) transparent;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &_variant_none {
    --pf-input-bg: transparent;
    --pf-input-shadow: none;
    --pf-input-shadow-focus:
      0 0 0 2px color-mix(in srgb, var(--pf-input-surface) 100%, transparent),
      0 0 0 4px color-mix(in srgb, var(--pf-input-ring) 45%, transparent);
    --pf-input-shadow-highlight: 0 0 0 2px
      color-mix(in srgb, var(--pf-input-ring) 35%, transparent);
  }

  &:focus-within {
    z-index: 1;
  }
}
</style>
