"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { api } from "@/lib/trpc/react";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter";
import { columns } from "./columns";
import { DataTableRowActions } from "./data-table-row-actions";
import { type Weekly } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { useAtom } from "jotai";
import { weeklyDialogAtom, weeklyDialogEmitter } from "../../../_store/dialog.store";

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
    [],
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
    },
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

  const tableColumns = React.useMemo(() => {
    return columns((row) => {
      return <DataTableRowActions row={row} onRefresh={tableQuery.refetch} />;
    });
  }, [tableQuery.refetch]);

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
        searchPlaceholder="Search email"
        table={table}
        filterSlot={
          <DataTableFacetedFilter
            value={(table.getState().columnFilters[0]?.value as string[]) ?? []}
            title="Status"
            options={[
              { label: "Active", value: "subscribed" },
              { label: "Inactive", value: "unsubscribed" },
            ]}
            onChange={(value) =>
              table.setColumnFilters([{ id: "status", value }])
            }
          />
        }
        actionsSlot={
          <Button
            onClick={() => {
              setStatus({ show: true, isAdd: true, id: null });
            }}
          >
            Create Week
          </Button>
        }
      />
      <div className="rounded-lg border">
        {tableQuery.isLoading ? (
          <div className="flex min-h-[300px] w-full items-center justify-center">
            <Spinner className="text-2xl" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
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
        table={table}
        footerActions={
          <>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                size={"xs"}
                variant={"destructive"}
                disabled={unSubRow.isLoading}
              >
                {unSubRow.isLoading && <Spinner className="mr-2" />}
                <span>Unsubscribe</span>
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}
