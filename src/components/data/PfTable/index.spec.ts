import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { ColumnDef } from '@tanstack/vue-table';
import PfTable from './index.vue';

type Row = { id: string; name: string };

describe('PfTable', () => {
  it('renders rows from data and columns', () => {
    const data: Row[] = [
      { id: '1', name: 'Ada' },
      { id: '2', name: 'Grace' },
    ];
    const columns: ColumnDef<Row, unknown>[] = [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
    ];
    const w = mount(PfTable, {
      props: { data, columns },
    });
    expect(w.find('.pfTable__base').exists()).toBe(true);
    expect(w.text()).toContain('Ada');
    expect(w.text()).toContain('Grace');
    expect(
      w.findAll('.pfTable__tbody .pfTable__tr').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('shows empty message when data is empty', () => {
    const w = mount(PfTable, {
      props: {
        data: [] as Row[],
        columns: [{ accessorKey: 'id', header: 'ID' }],
        empty: 'Nothing here',
      },
    });
    expect(w.text()).toContain('Nothing here');
  });

  it('exposes tableApi', () => {
    const data: Row[] = [{ id: '1', name: 'Ada' }];
    const columns: ColumnDef<Row, unknown>[] = [
      { accessorKey: 'name', header: 'Name' },
    ];
    const w = mount(PfTable, {
      props: { data, columns },
    });
    const vm = w.vm as unknown as {
      tableApi: { getRowModel: () => { rows: unknown[] } };
    };
    expect(vm.tableApi.getRowModel().rows).toHaveLength(1);
  });
});
