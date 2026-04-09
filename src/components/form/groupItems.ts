/** Matches `PfCheckboxUi` / `PfRadioUi` for group items. */
export type PfChoiceControlUi = Partial<{
  root: string;
  container: string;
  base: string;
  indicator: string;
  icon: string;
  wrapper: string;
  label: string;
  description: string;
}>;

export type PfChoiceGroupItemObject = {
  label?: string;
  description?: string;
  value?: unknown;
  disabled?: boolean;
  class?: string;
  ui?: PfChoiceControlUi;
};

export type PfChoiceGroupItem =
  | string
  | number
  | boolean
  | PfChoiceGroupItemObject;

export type PfNormalizedChoiceItem = {
  key: number;
  value: unknown;
  label: string;
  description?: string;
  disabled: boolean;
  class?: string;
  ui?: PfChoiceControlUi;
};

export type PfChoiceGroupKeys = {
  valueKey: string;
  labelKey: string;
  descriptionKey: string;
};

export function normalizeChoiceGroupItems(
  items: readonly PfChoiceGroupItem[] | undefined,
  keys: PfChoiceGroupKeys
): PfNormalizedChoiceItem[] {
  if (!items?.length) return [];

  return items.map((raw, index) => {
    if (
      typeof raw === 'string' ||
      typeof raw === 'number' ||
      typeof raw === 'boolean'
    ) {
      return {
        key: index,
        value: raw,
        label: String(raw),
        description: undefined,
        disabled: false,
        class: undefined,
        ui: undefined,
      };
    }

    const o = raw as Record<string, unknown>;
    const vk = keys.valueKey;
    const lk = keys.labelKey;
    const dk = keys.descriptionKey;

    let value: unknown = o[vk];
    if (value === undefined && vk !== 'value') {
      value = o.value;
    }
    if (value === undefined) {
      value = index;
    }

    const labelRaw = o[lk];
    const label =
      typeof labelRaw === 'string' || typeof labelRaw === 'number'
        ? String(labelRaw)
        : String(value);

    const descRaw = o[dk];
    const description = typeof descRaw === 'string' ? descRaw : undefined;

    return {
      key: index,
      value,
      label,
      description,
      disabled: Boolean(o.disabled),
      class: typeof o.class === 'string' ? o.class : undefined,
      ui: o.ui as PfChoiceControlUi | undefined,
    };
  });
}

export function nativeInputValuePart(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}
