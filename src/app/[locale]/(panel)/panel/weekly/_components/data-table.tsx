"use client";

import type { Weekly } from "@prisma/client";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useAtom } from "jotai";
import * as React from "react";
import {
  weeklyDialogAtom,
  weeklyDialogEmitter,
} from "@/app/[locale]/(panel)/_store/dialog.store";
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc/react";
import { columns } from "./columns";
import { DataTableRowActions } from "./data-table-row-actions";

export function DataTable() {
  const { toast } = useToast();

  const [_, setStatus] = useAtom(weeklyDialogAtom);
  const [rowSelection, setRowSelection] = React.useState({});
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

  const tableQuery = api.weekly.query.useQuery(
    {
      limit: pagination.pageSize,
      search: globalFilter,
      orderBy: sorting.map(({ id, desc }) => `${desc ? "-" : "+"}${id}`),
      page: pagination.pageIndex,
      status: columnFilters[0]?.value as any,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const unSubRow = api.subscriber.unsubscribeBatch.useMutation({
    onSuccess: () => {
      tableQuery.refetch();
      toast({
        title: "Success",
        description: "unSubscribe",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const tableColumns = React.useMemo(
    () =>
      columns((row) => (
        <DataTableRowActions onRefresh={tableQuery.refetch} row={row} />
      )),
    [tableQuery.refetch]
  );

  const table = useReactTable<Weekly>({
    data: (tableQuery.data?.rows as any) || [],
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
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
  });

  React.useEffect(() => {
    weeklyDialogEmitter.on("success", tableQuery.refetch);
    return () => {
      weeklyDialogEmitter.off("success", tableQuery.refetch);
    };
  }, [tableQuery.refetch]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        actionsSlot={
          <Button
            onClick={() => {
              setStatus({ show: true, isAdd: true, id: null });
            }}
          >
            Create Week
          </Button>
        }
        filterSlot={
          <DataTableFacetedFilter
            onChange={(value) =>
              table.setColumnFilters([{ id: "status", value }])
            }
            options={[
              { label: "Active", value: "subscribed" },
              { label: "Inactive", value: "unsubscribed" },
            ]}
            title="Status"
            value={(table.getState().columnFilters[0]?.value as string[]) ?? []}
          />
        }
        searchPlaceholder="Search email"
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
      <DataTablePagination
        footerActions={
          <>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                disabled={unSubRow.isPending}
                size={"sm"}
                variant={"destructive"}
              >
                {unSubRow.isPending && <Spinner className="mr-2" />}
                <span>Unsubscribe</span>
              </Button>
            )}
          </>
        }
        table={table}
      />
    </div>
  );
}
