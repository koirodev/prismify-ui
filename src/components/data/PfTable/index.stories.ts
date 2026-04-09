import type { Meta, StoryObj } from '@storybook/vue3';
import { h, ref } from 'vue';
import PfBadge from '../../element/PfBadge/index.vue';
import PfButton from '../../element/PfButton/index.vue';
import PfCheckbox from '../../form/PfCheckbox/index.vue';
import PfInput from '../../form/PfInput/index.vue';
import PfTable from './index.vue';
import type { PfTableColumn } from './index.vue';

const meta: Meta<typeof PfTable> = {
  title: 'Data/PfTable',
  component: PfTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

type Payment = {
  id: string;
  date: string;
  status: 'paid' | 'failed' | 'refunded';
  email: string;
  amount: number;
};

const sample: Payment[] = [
  {
    id: '4600',
    date: '2024-03-11T15:30:00',
    status: 'paid',
    email: 'james.anderson@example.com',
    amount: 594,
  },
  {
    id: '4599',
    date: '2024-03-11T10:10:00',
    status: 'failed',
    email: 'mia.white@example.com',
    amount: 276,
  },
  {
    id: '4598',
    date: '2024-03-11T08:50:00',
    status: 'refunded',
    email: 'william.brown@example.com',
    amount: 315,
  },
];

const paymentColumns: PfTableColumn<Payment>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) =>
      new Date(row.getValue('date') as string).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Payment['status'];
      const color =
        status === 'paid'
          ? 'success'
          : status === 'failed'
            ? 'error'
            : 'neutral';
      return h(PfBadge, { variant: 'subtle', color, class: 'capitalize' }, () =>
        String(status)
      );
    },
  },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      style: {
        th: { textAlign: 'right' },
        td: { textAlign: 'right' },
      },
    },
    cell: ({ row }) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(Number(row.getValue('amount'))),
  },
];

export const Default: Story = {
  render: () => ({
    components: { PfTable },
    setup() {
      const data = ref<Payment[]>([...sample]);
      const columns = paymentColumns;
      return { data, columns };
    },
    template:
      '<PfTable :data="data" :columns="columns" style="max-width: 56rem" />',
  }),
};

export const AutoColumns: Story = {
  render: () => ({
    components: { PfTable },
    setup() {
      const data = ref([
        { name: 'Ada', role: 'Admin' },
        { name: 'Grace', role: 'Member' },
      ]);
      return { data };
    },
    template: '<PfTable :data="data" />',
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingColor: 'primary',
    loadingAnimation: 'carousel',
    data: [],
    columns: [],
  },
};

export const StickyHeader: Story = {
  render: () => ({
    components: { PfTable },
    setup() {
      const data = ref<Payment[]>(
        Array.from({ length: 12 }, (_, i) => ({
          ...sample[i % sample.length]!,
          id: String(4600 - i),
        }))
      );
      const columns: PfTableColumn<Payment>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'email', header: 'Email' },
        {
          accessorKey: 'amount',
          header: 'Amount',
          meta: {
            style: {
              th: { textAlign: 'right' },
              td: { textAlign: 'right' },
            },
          },
        },
      ];
      return { data, columns };
    },
    template:
      '<PfTable sticky :data="data" :columns="columns" style="max-height: 12rem" />',
  }),
};

export const SortingAndFilter: Story = {
  render: () => ({
    components: { PfTable, PfInput, PfButton },
    setup() {
      const data = ref<Payment[]>([...sample]);
      const sorting = ref([{ id: 'email', desc: false }]);
      const globalFilter = ref('');
      const columns: PfTableColumn<Payment>[] = [
        { accessorKey: 'id', header: '#' },
        {
          accessorKey: 'email',
          header: ({ column }) => {
            const sorted = column.getIsSorted();
            return h(PfButton, {
              variant: 'ghost',
              color: 'neutral',
              label: 'Email',
              trailingIcon:
                sorted === 'asc'
                  ? 'chevron-up'
                  : sorted === 'desc'
                    ? 'chevron-down'
                    : 'chevrons-up-down',
              onClick: () =>
                column.toggleSorting(column.getIsSorted() === 'asc'),
            });
          },
        },
        {
          accessorKey: 'amount',
          header: 'Amount',
          meta: {
            style: {
              th: { textAlign: 'right' },
              td: { textAlign: 'right' },
            },
          },
        },
      ];
      return { data, columns, sorting, globalFilter };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;max-width:40rem">
        <PfInput v-model="globalFilter" placeholder="Global filter…" />
        <PfTable
          v-model:sorting="sorting"
          v-model:global-filter="globalFilter"
          :data="data"
          :columns="columns"
        />
      </div>
    `,
  }),
};

export const RowSelection: Story = {
  render: () => ({
    components: { PfTable, PfCheckbox },
    setup() {
      const data = ref<Payment[]>([...sample]);
      const rowSelection = ref<Record<string, boolean>>({});
      const columns: PfTableColumn<Payment>[] = [
        {
          id: 'select',
          header: ({ table }) =>
            h(PfCheckbox, {
              modelValue: table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : table.getIsAllPageRowsSelected(),
              'onUpdate:modelValue': (v: boolean | 'indeterminate') =>
                table.toggleAllPageRowsSelected(!!v),
              ariaLabel: 'Select all',
            }),
          cell: ({ row }) =>
            h(PfCheckbox, {
              modelValue: row.getIsSelected(),
              'onUpdate:modelValue': (v: boolean | 'indeterminate') =>
                row.toggleSelected(!!v),
              ariaLabel: 'Select row',
            }),
          enableSorting: false,
        },
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'email', header: 'Email' },
      ];
      return { data, columns, rowSelection };
    },
    template:
      '<PfTable v-model:row-selection="rowSelection" :data="data" :columns="columns" />',
  }),
};
