'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'

import { DataTableViewOptions } from '@/components/shared/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  actionsSlot?: React.ReactNode
  filterSlot?: React.ReactNode
  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  actionsSlot,
  filterSlot,
  searchPlaceholder,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-[420px]"
        />
        {filterSlot}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        {actionsSlot}
      </div>
    </div>
  )
}
