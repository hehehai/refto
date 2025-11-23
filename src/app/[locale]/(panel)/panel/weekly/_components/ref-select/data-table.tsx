"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useAtom } from "jotai";
import * as React from "react";
import { refSiteDetailSheetAtom } from "@/app/[locale]/(panel)/_store/dialog.store";
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { Spinner } from "@/components/shared/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RefSite } from "@/db/schema";
import { siteTagMap } from "@/lib/constants";
import { orpc } from "@/lib/orpc/react";
import { columns } from "./columns";

const statusOptions = Object.entries(siteTagMap).map(([value, item]) => ({
  label: `${item.en} / ${item["zh-CN"]}`,
  value,
}));

interface RefSelectDataTableProps {
  value?: string[];
  onChange?: (value: RefSite[]) => void;
  disabled?: boolean;
}

export function RefSelectDataTable({
  value,
  onChange,
  disabled = false,
}: RefSelectDataTableProps) {
  const [_, setDetailStatus] = useAtom(refSiteDetailSheetAtom);
  const rowSelection = React.useMemo<RowSelectionState>(
    () =>
      value?.reduce((acc, cur) => {
        acc[cur] = true;
        return acc;
      }, {} as RowSelectionState) ?? {},
    [value]
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableQuery = useQuery({
    ...orpc.refSites.query.queryOptions({
      input: {
        limit: pagination.pageSize,
        search: globalFilter,
        orderBy: sorting.map(({ id, desc }) => `${desc ? "-" : "+"}${id}`),
        page: pagination.pageIndex,
      },
    }),
    refetchOnWindowFocus: false,
  });

  const tableColumns = React.useMemo(
    () =>
      columns({
        onDetail: setDetailStatus,
      }),
    [setDetailStatus]
  );

  const table = useReactTable<RefSite>({
    getRowId: (row) => row.id,
    data: (tableQuery.data?.rows as unknown as RefSite[]) || [],
    pageCount: (tableQuery.data as any)?.maxPage + 1 || 0,
    columns: tableColumns,
    state: {
      pagination,
      globalFilter,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
    enableRowSelection: !disabled,
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    onRowSelectionChange: (updateFn) => {
      const nextVal = (updateFn as any)(rowSelection);
      if (onChange) {
        const nextKeys = [
          ...new Set(Object.keys(nextVal).filter((key) => nextVal[key])),
        ];
        const selectRows = table
          .getRowModel()
          .rows.filter((row) => nextKeys.includes(row.id))
          .map((row) => row.original);
        onChange(selectRows as unknown as RefSite[]);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
  });

  return (
    <div className="max-w-[45vw] space-y-4">
      <DataTableToolbar
        filterSlot={
          <DataTableFacetedFilter
            onChange={(value) =>
              table.setColumnFilters([{ id: "tags", value }])
            }
            options={statusOptions}
            title="Tags"
            value={(table.getState().columnFilters[0]?.value as string[]) ?? []}
          />
        }
        searchPlaceholder="Search with site name / title / url"
        table={table}
      />
      <div className="rounded-lg border">
        {tableQuery.isPending ? (
          <div className="flex min-h-[300px] w-full items-center justify-center">
            <Spinner className="text-2xl" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead colSpan={header.colSpan} key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={tableColumns.length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <DataTablePagination table={table} total={tableQuery.data?.total} />
    </div>
  );
}
