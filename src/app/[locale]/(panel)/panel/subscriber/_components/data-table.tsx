'use client'

import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTableFacetedFilter } from '@/components/shared/data-table-faceted-filter'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { Spinner } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/trpc/react'
import type { Subscriber } from '@prisma/client'
import { columns } from './columns'
import { DataTableRowActions } from './data-table-row-actions'

export function DataTable() {
  const { toast } = useToast()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const tableQuery = api.subscriber.query.useQuery(
    {
      limit: pagination.pageSize,
      search: globalFilter,
      orderBy: sorting.map(({ id, desc }) => `${desc ? '-' : '+'}${id}`),
      page: pagination.pageIndex,
      status: columnFilters[0]?.value as any,
    },
    {
      refetchOnWindowFocus: false,
    },
  )

  const unSubRow = api.subscriber.unsubscribeBatch.useMutation({
    onSuccess: () => {
      tableQuery.refetch()
      toast({
        title: 'Success',
        description: 'unSubscribe',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
      })
    },
  })

  const tableColumns = React.useMemo(() => {
    return columns((row) => {
      return <DataTableRowActions row={row} onRefresh={tableQuery.refetch} />
    })
  }, [tableQuery.refetch])

  const table = useReactTable<Subscriber>({
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
  })

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
              { label: 'Active', value: 'subscribed' },
              { label: 'Inactive', value: 'unsubscribed' },
            ]}
            onChange={(value) =>
              table.setColumnFilters([{ id: 'status', value }])
            }
          />
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
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
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
        total={tableQuery.data?.total}
        footerActions={
          <>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                size={'xs'}
                variant={'destructive'}
                disabled={unSubRow.isLoading}
                onClick={() => {
                  const emails = table
                    .getFilteredSelectedRowModel()
                    .rows.filter((row) => !row.original.unSubDate)
                    .map((row) => row.original.email)
                  if (!emails.length) {
                    return toast({
                      title: 'Error',
                      description: 'No can be deleted',
                    })
                  }
                  unSubRow.mutate({ emails })
                }}
              >
                {unSubRow.isLoading && <Spinner className="mr-2" />}
                <span>Unsubscribe</span>
              </Button>
            )}
          </>
        }
      />
    </div>
  )
}
