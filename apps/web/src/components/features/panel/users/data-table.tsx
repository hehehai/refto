import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Frame, FrameFooter } from "@/components/shared/frame";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createUserColumns } from "./columns";
import { useUserActions } from "./use-user-actions";

type UserRow = import("./columns").UserRow;

interface UserDataTableProps {
  data: UserRow[];
  defaultPageSize?: number;
  isLoading?: boolean;
  className?: string;
}

export function UserDataTable({
  data,
  defaultPageSize = 20,
  isLoading,
  className,
}: UserDataTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const actions = useUserActions();

  const columns = useMemo<ColumnDef<UserRow>[]>(() => createUserColumns(), []);

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
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = data.length;
  const totalPages = table.getPageCount();
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <Frame className={cn("w-full", className)}>
      {/* Batch actions bar */}
      {hasSelection && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <span className="text-muted-foreground text-sm">
            {selectedRows.length} user(s) selected
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
      )}

      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize();
                return (
                  <TableHead
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
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Local pagination */}
      {totalPages > 1 && (
        <FrameFooter className="p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              Showing{" "}
              <strong className="font-medium text-foreground">
                {startItem}-{endItem}
              </strong>{" "}
              of{" "}
              <strong className="font-medium text-foreground">
                {totalRows}
              </strong>{" "}
              users
            </p>

            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={!table.getCanPreviousPage()}
                    className={cn(
                      !table.getCanPreviousPage() &&
                        "pointer-events-none opacity-50"
                    )}
                    onClick={() => table.previousPage()}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-muted-foreground text-sm">
                    Page {pageIndex + 1} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    aria-disabled={!table.getCanNextPage()}
                    className={cn(
                      !table.getCanNextPage() &&
                        "pointer-events-none opacity-50"
                    )}
                    onClick={() => table.nextPage()}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </FrameFooter>
      )}
    </Frame>
  );
}

export type { UserRow } from "./columns";
