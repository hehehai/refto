import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Frame, FrameFooter } from "@/components/shared/frame";
import {
  FrameTable,
  FrameTableBody,
  FrameTableCell,
  FrameTableHead,
  FrameTableHeader,
  FrameTableRow,
} from "@/components/shared/frame-table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createUserColumns } from "./columns";
import { useUserActions } from "./use-user-actions";

type UserRow = import("./columns").UserRow;

interface UserDataTableProps {
  data: UserRow[];
  defaultPageSize?: number;
  isLoading?: boolean;
  className?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (order: "asc" | "desc") => void;
}

export function UserDataTable({
  data,
  defaultPageSize = 20,
  isLoading,
  className,
  sortOrder,
  onSortChange,
}: UserDataTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const actions = useUserActions();

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => createUserColumns({ sortOrder, onSortChange }),
    [sortOrder, onSortChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageSize: defaultPageSize },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleBatchDelete = async () => {
    if (hasSelection) {
      await actions.batchDelete.mutateAsync({
        ids: selectedRows.map((row) => row.original.id),
      });
      setRowSelection({});
    }
  };

  // Pagination info
  const { pageIndex } = table.getState().pagination;
  const totalPages = table.getPageCount();

  return (
    <Frame className={cn("w-full", className)}>
      <FrameTable className="table-fixed">
        <FrameTableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <FrameTableRow
              className="hover:bg-transparent"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize();
                return (
                  <FrameTableHead
                    key={header.id}
                    style={
                      columnSize ? { width: `${columnSize}px` } : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </FrameTableHead>
                );
              })}
            </FrameTableRow>
          ))}
        </FrameTableHeader>

        <FrameTableBody>
          {isLoading ? (
            <FrameTableRow>
              <FrameTableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                Loading...
              </FrameTableCell>
            </FrameTableRow>
          ) : data.length ? (
            table.getRowModel().rows.map((row) => (
              <FrameTableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <FrameTableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </FrameTableCell>
                ))}
              </FrameTableRow>
            ))
          ) : (
            <FrameTableRow>
              <FrameTableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No users found.
              </FrameTableCell>
            </FrameTableRow>
          )}
        </FrameTableBody>
      </FrameTable>

      {/* Local pagination */}
      <FrameFooter className="p-2">
        <div className="flex items-center justify-between gap-2">
          {hasSelection ? (
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-muted-foreground text-sm">
                {selectedRows.length} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setRowSelection({})}
                  size="sm"
                  variant="outline"
                >
                  Clear
                </Button>
                <Button
                  disabled={actions.batchDelete.isPending}
                  onClick={handleBatchDelete}
                  size="sm"
                  variant="destructive"
                >
                  <span className="i-hugeicons-delete-03 size-3.5" />
                  {actions.batchDelete.isPending
                    ? "Deleting..."
                    : "Delete Selected"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 whitespace-nowrap">
              {totalPages > 1 && (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <p className="text-muted-foreground text-sm">Viewing</p>
                  <Select
                    items={Array.from({ length: totalPages }, (_, i) => {
                      const start =
                        i * table.getState().pagination.pageSize + 1;
                      const end = Math.min(
                        (i + 1) * table.getState().pagination.pageSize,
                        table.getRowCount()
                      );
                      const pageNum = i + 1;
                      return { label: `${start}-${end}`, value: pageNum };
                    })}
                    onValueChange={(value) => {
                      table.setPageIndex((value as number) - 1);
                    }}
                    value={table.getState().pagination.pageIndex + 1}
                  >
                    <SelectTrigger
                      aria-label="Select result range"
                      className="w-fit min-w-none"
                      size="sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: totalPages }, (_, i) => {
                        const start =
                          i * table.getState().pagination.pageSize + 1;
                        const end = Math.min(
                          (i + 1) * table.getState().pagination.pageSize,
                          table.getRowCount()
                        );
                        const pageNum = i + 1;
                        return (
                          <SelectItem key={pageNum} value={pageNum}>
                            {`${start}-${end}`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-sm">of</p>
                </div>
              )}
              <p className="text-muted-foreground text-sm">
                <strong className="font-medium text-foreground">
                  {table.getRowCount()}
                </strong>{" "}
                results
              </p>
            </div>
          )}

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  render={
                    <Button
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-muted-foreground text-xs">
                  Page {pageIndex + 1} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  render={
                    <Button
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </FrameFooter>
    </Frame>
  );
}

export type { UserRow } from "./columns";
