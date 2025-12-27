import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useMemo, useState } from "react";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { Frame } from "@/components/shared/frame";
import {
  FrameTable,
  FrameTableBody,
  FrameTableCell,
  FrameTableHead,
  FrameTableHeader,
  FrameTableRow,
} from "@/components/shared/frame-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SiteRow } from "../common/types";
import { useSiteActions } from "../common/use-site-actions";
import { createSiteColumns } from "./columns";
import { SiteRowContent } from "./site-row-content";

interface ServerPaginationInfo {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface SiteDataTableProps {
  data: SiteRow[];
  isLoading?: boolean;
  className?: string;
  sortBy?: "createdAt" | "visits";
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: "createdAt" | "visits",
    order: "asc" | "desc"
  ) => void;
  pagination?: ServerPaginationInfo;
  onPageChange?: (page: number) => void;
}

export function SiteDataTable({
  data,
  isLoading,
  className,
  sortBy,
  sortOrder,
  onSortChange,
  pagination,
  onPageChange,
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
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection, expanded },
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
  });

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

      <DataTablePagination
        selectionActions={({ selectedIds }) => (
          <Button
            disabled={actions.batchDelete.isPending}
            onClick={async () => {
              await actions.batchDelete.mutateAsync({ ids: selectedIds });
              setRowSelection({});
            }}
            size="sm"
            variant="destructive"
          >
            <span className="i-hugeicons-delete-03 size-3.5" />
            {actions.batchDelete.isPending ? "Deleting..." : "Delete Selected"}
          </Button>
        )}
        serverPagination={
          pagination && onPageChange
            ? {
                ...pagination,
                onPageChange,
              }
            : undefined
        }
        table={table}
      />
    </Frame>
  );
}
