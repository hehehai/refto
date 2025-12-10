"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { DatePickerWithRange } from "@/components/shared/date-range-picker";
import { Spinner } from "@/components/shared/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQueryClient, orpc } from "@/lib/orpc/react";
import { userEditDialogEmitter } from "../_store/dialog.store";
import { columns, roles, statuses, type UserWithMeta } from "./columns";
import { DataTableRowActions } from "./data-table-row-actions";

export function DataTable() {
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
  const [dateRange, setDateRange] = React.useState<{
    from?: Date;
    to?: Date;
  }>({});

  const queryClient = getQueryClient();

  // Extract filter values from columnFilters
  const roleFilter = columnFilters.find((f) => f.id === "role")?.value as
    | string
    | undefined;
  const statusFilter = columnFilters.find((f) => f.id === "status")?.value as
    | string
    | undefined;

  const input = React.useMemo(
    () => ({
      limit: pagination.pageSize,
      search: globalFilter,
      orderBy: sorting.map(({ id, desc }) => `${desc ? "-" : "+"}${id}`),
      page: pagination.pageIndex,
      role: roleFilter as "USER" | "ADMIN" | undefined,
      status: statusFilter as "active" | "banned" | undefined,
      createdAtStart: dateRange.from,
      createdAtEnd: dateRange.to,
    }),
    [
      pagination.pageSize,
      pagination.pageIndex,
      globalFilter,
      sorting,
      roleFilter,
      statusFilter,
      dateRange,
    ]
  );

  const tableQuery = useQuery({
    ...orpc.adminUser.query.queryOptions({ input }),
    refetchOnWindowFocus: false,
  });

  const handleRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: orpc.adminUser.query.key({ input }),
    });
  }, [queryClient, input]);

  // Listen for edit success to refresh data
  React.useEffect(() => {
    const handleSuccess = () => {
      handleRefresh();
    };

    userEditDialogEmitter.on("success", handleSuccess);

    return () => {
      userEditDialogEmitter.off("success", handleSuccess);
    };
  }, [handleRefresh]);

  const tableColumns = React.useMemo(
    () =>
      columns((row) => (
        <DataTableRowActions onRefresh={handleRefresh} row={row} />
      )),
    [handleRefresh]
  );

  const table = useReactTable<UserWithMeta>({
    data: (tableQuery.data?.rows as UserWithMeta[]) || [],
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

  const handleFilterChange = (id: string, values: string[]) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== id);
      // Take only the first value since these are single-select filters
      const value = values[0];
      if (value) {
        return [...existing, { id, value }];
      }
      return existing;
    });
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <DataTableFacetedFilter
              onChange={(value) => handleFilterChange("role", value)}
              options={roles}
              title="Role"
              value={roleFilter ? [roleFilter] : []}
            />
            <DataTableFacetedFilter
              onChange={(value) => handleFilterChange("status", value)}
              options={statuses}
              title="Status"
              value={statusFilter ? [statusFilter] : []}
            />
            <DatePickerWithRange
              onChange={(range: DateRange | undefined) =>
                setDateRange({ from: range?.from, to: range?.to })
              }
              placeholder="Created Date"
              value={
                dateRange.from
                  ? { from: dateRange.from, to: dateRange.to }
                  : undefined
              }
            />
          </div>
        }
        searchPlaceholder="Search name & email"
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
      <DataTablePagination table={table} />
    </div>
  );
}
