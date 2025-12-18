import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useMemo, useState } from "react";
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
import type { SiteRow } from "../common/types";
import { useSiteActions } from "../common/use-site-actions";
import { createSiteColumns } from "./columns";
import { SiteRowContent } from "./site-row-content";

interface SiteDataTableProps {
  data: SiteRow[];
  defaultPageSize?: number;
  isLoading?: boolean;
  className?: string;
  sortBy?: "createdAt" | "visits";
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: "createdAt" | "visits",
    order: "asc" | "desc"
  ) => void;
}

export function SiteDataTable({
  data,
  defaultPageSize = 20,
  isLoading,
  className,
  sortBy,
  sortOrder,
  onSortChange,
}: SiteDataTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const actions = useSiteActions();

  const columns = useMemo<ColumnDef<SiteRow>[]>(
    () => createSiteColumns({ sortBy, sortOrder, onSortChange }),
    [sortBy, sortOrder, onSortChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection, expanded },
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
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

  const toggleRowExpand = (rowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      if (typeof prev === "boolean") {
        return { [rowId]: !prev };
      }
      return {
        ...prev,
        [rowId]: !prev[rowId],
      };
    });
  };

  const isRowExpanded = (rowId: string) => {
    if (typeof expanded === "boolean") {
      return expanded;
    }
    return !!expanded[rowId];
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
              <FrameTableHead style={{ width: "40px" }} />
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
                colSpan={columns.length + 1}
              >
                Loading...
              </FrameTableCell>
            </FrameTableRow>
          ) : data.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <FrameTableRow
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  <FrameTableCell className="w-10">
                    <Button
                      className="size-7"
                      onClick={(e) => toggleRowExpand(row.id, e)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <span
                        className={cn(
                          "i-hugeicons-arrow-right-01 size-4 transition-transform",
                          isRowExpanded(row.id) && "rotate-90"
                        )}
                      />
                    </Button>
                  </FrameTableCell>
                  {row.getVisibleCells().map((cell) => (
                    <FrameTableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </FrameTableCell>
                  ))}
                </FrameTableRow>
                {isRowExpanded(row.id) && (
                  <FrameTableRow>
                    <FrameTableCell colSpan={columns.length + 1}>
                      <SiteRowContent site={row.original} />
                    </FrameTableCell>
                  </FrameTableRow>
                )}
              </Fragment>
            ))
          ) : (
            <FrameTableRow>
              <FrameTableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length + 1}
              >
                No sites found.
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
