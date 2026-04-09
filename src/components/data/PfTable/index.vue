<script
  setup
  lang="ts"
  generic="TData extends import('@tanstack/table-core').RowData"
>
import {
  computed,
  ref,
  useAttrs,
  useSlots,
  watch,
  type Component,
  type Ref,
  type Slots,
  type WatchOptions,
} from 'vue';
import {
  FlexRender,
  useVueTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/vue-table';
import type {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingInfoState,
  ColumnSizingState,
  ExpandedState,
  FacetedOptions,
  GlobalFilterOptions,
  GroupingOptions,
  GroupingState,
  PaginationOptions,
  PaginationState,
  Row,
  RowData,
  RowPinningOptions,
  RowPinningState,
  RowSelectionOptions,
  RowSelectionState,
  SortingOptions,
  SortingState,
  TableMeta,
  TableOptions,
  Updater,
  VisibilityOptions,
  VisibilityState,
} from '@tanstack/table-core';

export type PfTableColumn<
  TData extends import('@tanstack/table-core').RowData,
> = ColumnDef<TData, unknown>;

export type PfTableRow<TData extends import('@tanstack/table-core').RowData> =
  Row<TData>;

export type PfTableUi = Partial<{
  root: string;
  scroll: string;
  base: string;
  caption: string;
  thead: string;
  tbody: string;
  tfoot: string;
  tr: string;
  th: string;
  td: string;
  separator: string;
  empty: string;
  loading: string;
}>;

export type PfTableLoadingColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';

export type PfTableLoadingAnimation =
  | 'carousel'
  | 'carousel-inverse'
  | 'swing'
  | 'elastic';

/** Optional `meta` on column defs — class, style, colspan, rowspan (PfTable). */
export type PfTableColumnMeta<TData extends RowData = RowData> = {
  class?: {
    th?: string | ((arg: unknown) => string);
    td?: string | ((arg: unknown) => string);
  };
  style?: {
    th?:
      | string
      | Record<string, string>
      | ((arg: unknown) => string | Record<string, string>);
    td?:
      | string
      | Record<string, string>
      | ((arg: unknown) => string | Record<string, string>);
  };
  colspan?: {
    td?: string | ((cell: Cell<TData, unknown>) => string);
  };
  rowspan?: {
    td?: string | ((cell: Cell<TData, unknown>) => string);
  };
};

/** Optional `meta` on the table — row class/style (PfTable). */
export type PfTableRowMeta = {
  class?: {
    tr?: string | ((arg: unknown) => string);
  };
  style?: {
    tr?:
      | string
      | Record<string, string>
      | ((arg: unknown) => string | Record<string, string>);
  };
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    data?: TData[];
    columns?: ColumnDef<TData, unknown>[];
    caption?: string;
    meta?: TableMeta<TData>;
    empty?: string;
    sticky?: boolean | 'header' | 'footer';
    loading?: boolean;
    loadingColor?: PfTableLoadingColor;
    loadingAnimation?: PfTableLoadingAnimation;
    watchOptions?: WatchOptions;
    globalFilterOptions?: Omit<
      GlobalFilterOptions<TData>,
      'onGlobalFilterChange'
    >;
    columnFiltersOptions?: Omit<
      NonNullable<TableOptions<TData>>,
      'getFilteredRowModel' | 'onColumnFiltersChange'
    >;
    columnPinningOptions?: Omit<
      NonNullable<TableOptions<TData>>,
      'onColumnPinningChange'
    >;
    columnSizingOptions?: Omit<
      NonNullable<TableOptions<TData>>,
      'onColumnSizingChange' | 'onColumnSizingInfoChange'
    >;
    visibilityOptions?: Omit<VisibilityOptions, 'onColumnVisibilityChange'>;
    sortingOptions?: Omit<
      SortingOptions<TData>,
      'getSortedRowModel' | 'onSortingChange'
    >;
    groupingOptions?: Omit<GroupingOptions, 'onGroupingChange'>;
    expandedOptions?: Omit<
      NonNullable<TableOptions<TData>>,
      'getExpandedRowModel' | 'onExpandedChange'
    >;
    rowSelectionOptions?: Omit<
      RowSelectionOptions<TData>,
      'onRowSelectionChange'
    >;
    rowPinningOptions?: Omit<RowPinningOptions<TData>, 'onRowPinningChange'>;
    paginationOptions?: Omit<PaginationOptions, 'onPaginationChange'>;
    facetedOptions?: FacetedOptions<TData>;
    /** When set, row clicks invoke this handler (interactive controls inside the row are ignored). */
    onSelect?: (e: Event, row: Row<TData>) => void;
    /** When true, rows look clickable and emit `select` on click (unless the target is interactive). */
    selectable?: boolean;
    onHover?: (e: Event, row: Row<TData> | null) => void;
    onContextmenu?:
      | ((e: Event, row: Row<TData>) => void)
      | ((e: Event, row: Row<TData>) => void)[];
    ui?: PfTableUi;
    renderFallbackValue?: TableOptions<TData>['renderFallbackValue'];
    virtualize?: boolean | Record<string, unknown>;
    /** TanStack Table option (leading underscore). */
    // eslint-disable-next-line vue/prop-name-casing -- TanStack Table API
    _features?: TableOptions<TData>['_features'];
    autoResetAll?: TableOptions<TData>['autoResetAll'];
    debugAll?: boolean;
    debugCells?: boolean;
    debugColumns?: boolean;
    debugHeaders?: boolean;
    debugRows?: boolean;
    debugTable?: boolean;
    defaultColumn?: Partial<ColumnDef<TData, unknown>>;
    getRowId?: TableOptions<TData>['getRowId'];
    getSubRows?: TableOptions<TData>['getSubRows'];
    initialState?: TableOptions<TData>['initialState'];
    mergeOptions?: TableOptions<TData>['mergeOptions'];
  }>(),
  {
    loadingColor: 'primary',
    loadingAnimation: 'carousel',
    watchOptions: () => ({ deep: true }),
    selectable: false,
  }
);

const emit = defineEmits<{
  select: [e: Event, row: Row<TData>];
  hover: [e: Event, row: Row<TData> | null];
  contextmenu: [e: Event, row: Row<TData>];
}>();

const globalFilter = defineModel<string>('globalFilter');
const columnFilters = defineModel<ColumnFiltersState>('columnFilters');
const columnOrder = defineModel<ColumnOrderState>('columnOrder');
const columnVisibility = defineModel<VisibilityState>('columnVisibility');
const columnPinning = defineModel<ColumnPinningState>('columnPinning');
const columnSizing = defineModel<ColumnSizingState>('columnSizing');
const columnSizingInfo = defineModel<ColumnSizingInfoState>('columnSizingInfo');
const rowSelection = defineModel<RowSelectionState>('rowSelection');
const rowPinning = defineModel<RowPinningState>('rowPinning');
const sorting = defineModel<SortingState>('sorting');
const grouping = defineModel<GroupingState>('grouping');
const expanded = defineModel<ExpandedState>('expanded');
const pagination = defineModel<PaginationState>('pagination');

const attrs = useAttrs();
const slots: Slots = useSlots();

const rootRef = ref<HTMLElement | null>(null);
const tableRef = ref<HTMLTableElement | null>(null);

const passthroughAttrs = computed(() => {
  const a = { ...attrs } as Record<string, unknown>;
  delete a.class;
  return a;
});

const rootClass = computed(() => {
  const extra = (attrs.class as string | undefined) ?? '';
  return ['pfTable', props.ui?.root, extra].filter(Boolean).join(' ');
});

if (import.meta.env.DEV && props.virtualize) {
  console.warn(
    '[PfTable] `virtualize` is not implemented yet; ignoring. Use a fixed height and scroll, or TanStack Virtual in the app.'
  );
}

function upperFirst(s: string): string {
  if (!s) {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function processColumns(
  cols: ColumnDef<TData, unknown>[] | undefined,
  firstRow: TData | undefined
): ColumnDef<TData, unknown>[] {
  const source =
    cols ??
    (firstRow
      ? (Object.keys(firstRow as object).map((accessorKey) => ({
          accessorKey,
          header: upperFirst(accessorKey),
        })) as ColumnDef<TData, unknown>[])
      : []);

  return source.map((column) => {
    const col = { ...column } as ColumnDef<TData, unknown>;
    if ('columns' in col && col.columns) {
      col.columns = processColumns(
        col.columns as ColumnDef<TData, unknown>[],
        firstRow
      );
    }
    if (!col.cell && 'accessorKey' in col && col.accessorKey) {
      col.cell = ({ getValue }) => {
        const value = getValue();
        if (value === '' || value === null || value === undefined) {
          return '\u00A0';
        }
        return String(value);
      };
    }
    return col;
  });
}

const dataRef = ref<TData[]>(props.data ? [...props.data] : []) as Ref<TData[]>;

watch(
  () => props.data,
  (v) => {
    dataRef.value = v ? [...v] : [];
  },
  props.watchOptions ?? { deep: true }
);

const processedColumns = computed(() =>
  processColumns(props.columns, dataRef.value[0])
);

const hasFooter = computed(() => {
  function walk(cols: ColumnDef<TData, unknown>[]): boolean {
    for (const column of cols) {
      if ('footer' in column && column.footer) {
        return true;
      }
      if ('columns' in column && column.columns) {
        if (walk(column.columns as ColumnDef<TData, unknown>[])) {
          return true;
        }
      }
    }
    return false;
  }
  return walk(processedColumns.value);
});

function valueUpdater<V>(updater: Updater<V>, model: Ref<V | undefined>) {
  const next =
    typeof updater === 'function'
      ? (updater as (old: V) => V)(model.value as V)
      : updater;
  model.value = next as V;
}

const tableApi = useVueTable({
  _features: props._features,
  autoResetAll: props.autoResetAll,
  debugAll: props.debugAll,
  debugCells: props.debugCells,
  debugColumns: props.debugColumns,
  debugHeaders: props.debugHeaders,
  debugRows: props.debugRows,
  debugTable: props.debugTable,
  defaultColumn: props.defaultColumn,
  getRowId: props.getRowId,
  getSubRows: props.getSubRows,
  initialState: props.initialState,
  mergeOptions: props.mergeOptions,
  renderFallbackValue: props.renderFallbackValue,
  get data() {
    return dataRef.value;
  },
  get columns() {
    return processedColumns.value;
  },
  get meta() {
    return props.meta ?? {};
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  ...(props.globalFilterOptions ?? {}),
  ...(globalFilter.value !== undefined && {
    onGlobalFilterChange: (u: Updater<string>) => valueUpdater(u, globalFilter),
  }),
  ...(props.columnFiltersOptions ?? {}),
  ...(columnFilters.value !== undefined && {
    onColumnFiltersChange: (u: Updater<ColumnFiltersState>) =>
      valueUpdater(u, columnFilters),
  }),
  ...(columnOrder.value !== undefined && {
    onColumnOrderChange: (u: Updater<ColumnOrderState>) =>
      valueUpdater(u, columnOrder),
  }),
  ...(props.visibilityOptions ?? {}),
  ...(columnVisibility.value !== undefined && {
    onColumnVisibilityChange: (u: Updater<VisibilityState>) =>
      valueUpdater(u, columnVisibility),
  }),
  ...(props.columnPinningOptions ?? {}),
  ...(columnPinning.value !== undefined && {
    onColumnPinningChange: (u: Updater<ColumnPinningState>) =>
      valueUpdater(u, columnPinning),
  }),
  ...(props.columnSizingOptions ?? {}),
  ...(columnSizing.value !== undefined && {
    onColumnSizingChange: (u: Updater<ColumnSizingState>) =>
      valueUpdater(u, columnSizing),
  }),
  ...(columnSizingInfo.value !== undefined && {
    onColumnSizingInfoChange: (u: Updater<ColumnSizingInfoState>) =>
      valueUpdater(u, columnSizingInfo),
  }),
  ...(props.rowSelectionOptions ?? {}),
  ...(rowSelection.value !== undefined && {
    onRowSelectionChange: (u: Updater<RowSelectionState>) =>
      valueUpdater(u, rowSelection),
  }),
  ...(props.rowPinningOptions ?? {}),
  ...(rowPinning.value !== undefined && {
    onRowPinningChange: (u: Updater<RowPinningState>) =>
      valueUpdater(u, rowPinning),
  }),
  ...(props.sortingOptions ?? {}),
  ...(sorting.value !== undefined && {
    onSortingChange: (u: Updater<SortingState>) => valueUpdater(u, sorting),
  }),
  ...(props.groupingOptions ?? {}),
  ...(grouping.value !== undefined && {
    onGroupingChange: (u: Updater<GroupingState>) => valueUpdater(u, grouping),
  }),
  ...(props.expandedOptions ?? {}),
  ...(expanded.value !== undefined && {
    onExpandedChange: (u: Updater<ExpandedState>) => valueUpdater(u, expanded),
  }),
  ...(props.paginationOptions ?? {}),
  ...(pagination.value !== undefined && {
    onPaginationChange: (u: Updater<PaginationState>) =>
      valueUpdater(u, pagination),
  }),
  ...(props.facetedOptions ?? {}),
  state: {
    get globalFilter() {
      return globalFilter.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnOrder() {
      return columnOrder.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get columnPinning() {
      return columnPinning.value;
    },
    get columnSizing() {
      return columnSizing.value;
    },
    get columnSizingInfo() {
      return columnSizingInfo.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get rowPinning() {
      return rowPinning.value;
    },
    get sorting() {
      return sorting.value;
    },
    get grouping() {
      return grouping.value;
    },
    get expanded() {
      return expanded.value;
    },
    get pagination() {
      return pagination.value;
    },
  },
} as TableOptions<TData>);

const rowsToRender = computed(() => {
  const api = tableApi;
  const top = api.getTopRows();
  const bottom = api.getBottomRows();
  if (top.length === 0 && bottom.length === 0) {
    return api.getRowModel().rows;
  }
  return [...top, ...api.getCenterRows(), ...bottom];
});

const visibleLeafColumnsCount = computed(
  () => tableApi.getVisibleLeafColumns().length
);

const stickyHeader = computed(
  () => props.sticky === true || props.sticky === 'header'
);

const stickyFooter = computed(
  () => props.sticky === true || props.sticky === 'footer'
);

function getColumnStyles(column: Column<TData>): Record<string, string> {
  const styles: Record<string, string> = {};
  const pinned = column.getIsPinned();
  if (pinned === 'left') {
    styles.left = `${column.getStart('left')}px`;
  } else if (pinned === 'right') {
    styles.right = `${column.getAfter('right')}px`;
  }
  return styles;
}

function resolveMetaClass(
  raw: string | ((arg: unknown) => string) | undefined,
  arg: unknown
): string | undefined {
  if (raw == null) {
    return undefined;
  }
  return typeof raw === 'function' ? raw(arg) : raw;
}

function resolveMetaStyle(
  raw:
    | string
    | Record<string, string>
    | ((arg: unknown) => string | Record<string, string>)
    | undefined,
  arg: unknown
): string | Record<string, string> | undefined {
  if (raw == null) {
    return undefined;
  }
  return typeof raw === 'function' ? raw(arg) : raw;
}

function pfColumnMeta(
  meta: ColumnDef<TData, unknown>['meta'] | undefined
): PfTableColumnMeta<TData> | undefined {
  return meta as PfTableColumnMeta<TData> | undefined;
}

function pfTableRowMeta(
  meta: TableMeta<TData> | undefined
): PfTableRowMeta | undefined {
  return meta as PfTableRowMeta | undefined;
}

function resolveSpan(
  raw: string | ((cell: Cell<TData, unknown>) => string) | undefined,
  cell: Cell<TData, unknown>
): number | undefined {
  if (raw == null) {
    return undefined;
  }
  const v = typeof raw === 'function' ? raw(cell) : raw;
  if (v === '' || v === undefined) {
    return undefined;
  }
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function onRowSelect(e: Event, row: Row<TData>) {
  const target = e.target as HTMLElement | null;
  if (
    target?.closest(
      'button,a,input,select,textarea,[role=checkbox],[role=menuitem]'
    )
  ) {
    return;
  }
  if (props.onSelect) {
    e.preventDefault();
    e.stopPropagation();
    props.onSelect(e, row);
  }
  if (props.onSelect || props.selectable) {
    emit('select', e, row);
  }
}

function onRowHover(e: Event, row: Row<TData> | null) {
  props.onHover?.(e, row);
  emit('hover', e, row);
}

function onRowContextmenu(e: Event, row: Row<TData>) {
  const h = props.onContextmenu;
  if (!h) {
    return;
  }
  if (Array.isArray(h)) {
    h.forEach((fn) => fn(e, row));
  } else {
    h(e, row);
  }
  emit('contextmenu', e, row);
}

function columnSlotName(id: string, kind: 'header' | 'cell' | 'footer') {
  return `${id}-${kind}`;
}

defineExpose({
  get $el() {
    return rootRef.value;
  },
  tableRef,
  tableApi,
});
</script>

<template>
  <component
    :is="as ?? 'div'"
    ref="rootRef"
    :class="rootClass"
    v-bind="passthroughAttrs"
  >
    <div :class="['pfTable__scroll', ui?.scroll]">
      <table ref="tableRef" :class="['pfTable__base', ui?.base]">
        <caption
          v-if="caption || slots.caption"
          :class="['pfTable__caption', ui?.caption]"
        >
          <slot name="caption">
            {{ caption }}
          </slot>
        </caption>

        <thead
          :class="[
            'pfTable__thead',
            ui?.thead,
            {
              pfTable__thead_sticky: stickyHeader && !virtualize,
              pfTable__thead_loading: loading,
              [`pfTable__thead_loading_${loadingColor}`]: loading,
              [`pfTable__thead_loadingAnim_${loadingAnimation}`]: loading,
            },
          ]"
        >
          <tr
            v-for="headerGroup in tableApi.getHeaderGroups()"
            :key="headerGroup.id"
            :class="['pfTable__tr', ui?.tr]"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :rowspan="header.rowSpan"
              :class="[
                'pfTable__th',
                ui?.th,
                {
                  pfTable__th_pinned: header.column.getIsPinned(),
                  [`pfTable__th_pin_${header.column.getIsPinned()}`]:
                    header.column.getIsPinned(),
                },
                resolveMetaClass(
                  pfColumnMeta(header.column.columnDef.meta)?.class?.th,
                  header
                ),
              ]"
              :style="[
                getColumnStyles(header.column),
                resolveMetaStyle(
                  pfColumnMeta(header.column.columnDef.meta)?.style?.th,
                  header
                ),
              ]"
            >
              <slot
                v-if="slots[columnSlotName(String(header.column.id), 'header')]"
                :name="columnSlotName(String(header.column.id), 'header')"
                v-bind="header.getContext()"
              />
              <FlexRender
                v-else-if="
                  !header.isPlaceholder && header.column.columnDef.header
                "
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>

        <tbody :class="['pfTable__tbody', ui?.tbody]">
          <slot name="body-top" />

          <template v-if="loading">
            <tr :class="['pfTable__tr', ui?.tr]">
              <td
                :colspan="Math.max(visibleLeafColumnsCount, 1)"
                :class="[
                  'pfTable__td',
                  'pfTable__td_loading',
                  ui?.td,
                  ui?.loading,
                ]"
              >
                <slot name="loading">
                  <div class="pfTable__loadingInner">
                    <span class="pfTable__loadingText">Loading…</span>
                  </div>
                </slot>
              </td>
            </tr>
          </template>

          <template v-else-if="rowsToRender.length === 0">
            <tr :class="['pfTable__tr', ui?.tr]">
              <td
                :colspan="Math.max(visibleLeafColumnsCount, 1)"
                :class="['pfTable__td', 'pfTable__td_empty', ui?.td, ui?.empty]"
              >
                <slot name="empty">
                  {{ empty ?? 'No data.' }}
                </slot>
              </td>
            </tr>
          </template>

          <template v-else>
            <template v-for="row in rowsToRender" :key="row.id">
              <tr
                :class="[
                  'pfTable__tr',
                  ui?.tr,
                  {
                    pfTable__tr_selectable: !!(onSelect || selectable),
                    pfTable__tr_selected: row.getIsSelected(),
                  },
                  resolveMetaClass(pfTableRowMeta(meta)?.class?.tr, row),
                ]"
                :style="resolveMetaStyle(pfTableRowMeta(meta)?.style?.tr, row)"
                :data-selected="row.getIsSelected() ? 'true' : 'false'"
                :data-selectable="onSelect || selectable ? 'true' : undefined"
                :data-expanded="row.getIsExpanded() ? 'true' : 'false'"
                @click="onRowSelect($event, row)"
                @pointerenter="onRowHover($event, row)"
                @pointerleave="onRowHover($event, null)"
                @contextmenu.prevent="onRowContextmenu($event, row)"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :class="[
                    'pfTable__td',
                    ui?.td,
                    {
                      pfTable__td_pinned: cell.column.getIsPinned(),
                      [`pfTable__td_pin_${cell.column.getIsPinned()}`]:
                        cell.column.getIsPinned(),
                      pfTable__td_hidden:
                        resolveMetaClass(
                          pfColumnMeta(cell.column.columnDef.meta)?.class?.td,
                          cell
                        ) === 'hidden',
                    },
                    resolveMetaClass(
                      pfColumnMeta(cell.column.columnDef.meta)?.class?.td,
                      cell
                    ),
                  ]"
                  :style="[
                    getColumnStyles(cell.column),
                    resolveMetaStyle(
                      pfColumnMeta(cell.column.columnDef.meta)?.style?.td,
                      cell
                    ),
                  ]"
                  :colspan="
                    resolveSpan(
                      pfColumnMeta(cell.column.columnDef.meta)?.colspan?.td,
                      cell
                    )
                  "
                  :rowspan="
                    resolveSpan(
                      pfColumnMeta(cell.column.columnDef.meta)?.rowspan?.td,
                      cell
                    )
                  "
                >
                  <slot
                    v-if="slots[columnSlotName(String(cell.column.id), 'cell')]"
                    :name="columnSlotName(String(cell.column.id), 'cell')"
                    v-bind="cell.getContext()"
                  />
                  <FlexRender
                    v-else-if="cell.column.columnDef.cell"
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </td>
              </tr>

              <tr
                v-if="slots.expanded && row.getIsExpanded()"
                :key="`${row.id}-expanded`"
                :class="['pfTable__tr', 'pfTable__tr_expanded', ui?.tr]"
              >
                <td
                  :colspan="Math.max(visibleLeafColumnsCount, 1)"
                  :class="['pfTable__td', 'pfTable__td_expanded', ui?.td]"
                >
                  <slot name="expanded" :row="row" />
                </td>
              </tr>
            </template>
          </template>

          <slot name="body-bottom" />
        </tbody>

        <tfoot
          v-if="hasFooter"
          :class="[
            'pfTable__tfoot',
            ui?.tfoot,
            { pfTable__tfoot_sticky: stickyFooter && !virtualize },
          ]"
        >
          <tr
            v-for="footerGroup in tableApi.getFooterGroups()"
            :key="footerGroup.id"
            :class="['pfTable__tr', ui?.tr]"
          >
            <th
              v-for="header in footerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :rowspan="header.rowSpan"
              :class="[
                'pfTable__th',
                'pfTable__th_footer',
                ui?.th,
                {
                  pfTable__th_pinned: header.column.getIsPinned(),
                  [`pfTable__th_pin_${header.column.getIsPinned()}`]:
                    header.column.getIsPinned(),
                },
                resolveMetaClass(
                  pfColumnMeta(header.column.columnDef.meta)?.class?.th,
                  header
                ),
              ]"
              :style="[
                getColumnStyles(header.column),
                resolveMetaStyle(
                  pfColumnMeta(header.column.columnDef.meta)?.style?.th,
                  header
                ),
              ]"
            >
              <slot
                v-if="slots[columnSlotName(String(header.column.id), 'footer')]"
                :name="columnSlotName(String(header.column.id), 'footer')"
                v-bind="header.getContext()"
              />
              <FlexRender
                v-else-if="header.column.columnDef.footer"
                :render="header.column.columnDef.footer"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  </component>
</template>

<style scoped lang="scss">
.pfTable {
  position: relative;

  width: 100%;
}

.pfTable__scroll {
  position: relative;

  width: 100%;
  max-width: 100%;

  overflow: auto;
}

.pfTable__base {
  border-collapse: collapse;
  border-spacing: 0;

  width: 100%;
  min-width: 100%;

  font-family: var(--pf-font-sans);
}

.pfTable__caption {
  caption-side: top;

  padding: var(--pf-table-cell-padding-y) var(--pf-table-cell-padding-x);

  color: var(--pf-color-muted);
  font-size: var(--pf-table-cell-font-size);
  text-align: left;
}

.pfTable__thead {
  position: relative;
}

.pfTable__thead_sticky .pfTable__th {
  position: sticky;
  top: 0;
  z-index: var(--pf-table-sticky-z-index);

  background: var(--pf-table-sticky-bg);
  backdrop-filter: blur(6px);
}

.pfTable__thead_loading::after {
  content: '';

  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: calc(var(--pf-table-sticky-z-index) + 1);

  height: var(--pf-table-loading-line-height);

  pointer-events: none;
}

.pfTable__thead_loading_primary::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-primary),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loading_secondary::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-secondary),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loading_success::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-success),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loading_info::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-info),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loading_warning::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-warning),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loading_error::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-error),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loading_neutral::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--pf-color-neutral),
    transparent
  );
  background-size: 40% 100%;

  animation: pf-table-carousel var(--pf-table-loading-line-duration)
    var(--pf-table-loading-line-easing) infinite;
}

.pfTable__thead_loadingAnim_carousel-inverse::after {
  animation-direction: reverse;
}

.pfTable__thead_loadingAnim_swing::after {
  animation-name: pf-table-swing;
}

.pfTable__thead_loadingAnim_elastic::after {
  animation-name: pf-table-elastic;
}

.pfTable__tbody {
  position: relative;
}

.pfTable__tbody > .pfTable__tr + .pfTable__tr .pfTable__td {
  border-top: 1px solid var(--pf-table-border-color);
}

.pfTable__tr_selectable {
  cursor: pointer;
}

.pfTable__tr[data-selectable='true']:hover .pfTable__td {
  background: var(--pf-table-row-hover-bg);
}

.pfTable__tr[data-selected='true'] .pfTable__td {
  background: var(--pf-table-row-selected-bg);
}

.pfTable__th,
.pfTable__td {
  padding: var(--pf-table-cell-padding-y) var(--pf-table-cell-padding-x);

  color: var(--pf-color-text);
  text-align: left;
  vertical-align: middle;

  border-bottom: 1px solid var(--pf-table-border-color);
}

.pfTable__th {
  color: var(--pf-color-text);
  font-size: var(--pf-table-header-font-size);
  font-weight: var(--pf-table-header-font-weight);
  white-space: nowrap;
}

.pfTable__th:has(.pfCheckbox__control) {
  padding-inline-end: 0;
  width: 1%;
}

.pfTable__td {
  color: var(--pf-color-muted);
  font-size: var(--pf-table-cell-font-size);
  white-space: nowrap;
}

.pfTable__td:has(.pfCheckbox__control) {
  padding-inline-end: 0;
  width: 1%;
}

.pfTable__th_footer {
  font-weight: var(--pf-font-weight-medium);
}

.pfTable__th_pinned,
.pfTable__td_pinned {
  position: sticky;
  z-index: var(--pf-table-pin-z-index);

  background: var(--pf-table-sticky-bg);
}

.pfTable__td_hidden {
  display: none;
}

.pfTable__td_empty,
.pfTable__td_loading {
  color: var(--pf-color-muted);
  text-align: center;
}

.pfTable__loadingInner {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pfTable__loadingText {
  font-size: var(--pf-font-size-sm);
}

.pfTable__tfoot_sticky .pfTable__th {
  position: sticky;
  bottom: 0;
  z-index: var(--pf-table-sticky-z-index);

  background: var(--pf-table-sticky-bg);
  backdrop-filter: blur(6px);
}

.pfTable__td_expanded {
  white-space: normal;

  background: color-mix(in srgb, var(--pf-color-muted) 8%, transparent);
}

@keyframes pf-table-carousel {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(320%);
  }
}

@keyframes pf-table-swing {
  0%,
  100% {
    opacity: 0.6;

    transform: scaleX(0.35);
  }

  50% {
    opacity: 1;

    transform: scaleX(1);
  }
}

@keyframes pf-table-elastic {
  0%,
  100% {
    transform: scaleX(0.2);
  }

  40% {
    transform: scaleX(1.1);
  }

  70% {
    transform: scaleX(0.95);
  }
}
</style>
