'use client'

import { refSiteDetailSheetAtom } from '@/app/[locale]/(panel)/_store/dialog.store'
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useAtom } from 'jotai'
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
import { siteTagMap } from '@/lib/constants'
import { api } from '@/lib/trpc/react'
import type { RefSite } from '@prisma/client'
import { columns } from './columns'

const statusOptions = Object.entries(siteTagMap).map(([value, item]) => ({
  label: `${item.en} / ${item['zh-CN']}`,
  value,
}))

interface RefSelectDataTableProps {
  value?: string[]
  onChange?: (value: RefSite[]) => void
  disabled?: boolean
}

export function RefSelectDataTable({
  value,
  onChange,
  disabled = false,
}: RefSelectDataTableProps) {
  const [_, setDetailStatus] = useAtom(refSiteDetailSheetAtom)
  const rowSelection = React.useMemo<RowSelectionState>(
    () =>
      value?.reduce((acc, cur) => {
        acc[cur] = true
        return acc
      }, {} as RowSelectionState) ?? {},
    [value],
  )
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

  const tableQuery = api.refSites.query.useQuery(
    {
      limit: pagination.pageSize,
      search: globalFilter,
      orderBy: sorting.map(({ id, desc }) => `${desc ? '-' : '+'}${id}`),
      page: pagination.pageIndex,
    },
    {
      refetchOnWindowFocus: false,
    },
  )

  const tableColumns = React.useMemo(() => {
    return columns({
      onDetail: setDetailStatus,
    })
  }, [setDetailStatus])

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
      const nextVal = (updateFn as any)(rowSelection)
      if (onChange) {
        const nextKeys = [
          ...new Set(Object.keys(nextVal).filter((key) => nextVal[key])),
        ]
        const selectRows = table
          .getRowModel()
          .rows.filter((row) => nextKeys.includes(row.id)).map((row) => row.original)
        onChange(selectRows as unknown as RefSite[])
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
  })

  return (
    <div className="space-y-4 max-w-[45vw]">
      <DataTableToolbar
        searchPlaceholder="Search with site name / title / url"
        table={table}
        filterSlot={
          <DataTableFacetedFilter
            value={(table.getState().columnFilters[0]?.value as string[]) ?? []}
            title="Tags"
            options={statusOptions}
            onChange={(value) =>
              table.setColumnFilters([{ id: 'tags', value }])
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
      <DataTablePagination table={table} total={tableQuery.data?.total} />
    </div>
  )
}
