import type { Table } from "@tanstack/react-table";
import { FrameFooter } from "@/components/shared/frame";
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

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount();

  if (pageCount <= 1) {
    return null;
  }

  return (
    <FrameFooter className="p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <p className="text-muted-foreground text-sm">Viewing</p>
          <Select
            items={Array.from({ length: pageCount }, (_, i) => {
              const start = i * table.getState().pagination.pageSize + 1;
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
              {Array.from({ length: pageCount }, (_, i) => {
                const start = i * table.getState().pagination.pageSize + 1;
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
          <p className="text-muted-foreground text-sm">
            of{" "}
            <strong className="font-medium text-foreground">
              {table.getRowCount()}
            </strong>{" "}
            results
          </p>
        </div>

        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => table.previousPage()} />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => table.nextPage()} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </FrameFooter>
  );
}
