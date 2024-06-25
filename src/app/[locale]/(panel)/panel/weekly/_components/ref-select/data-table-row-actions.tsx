'use client'

import { refSiteDialogAtom } from '@/app/[locale]/(panel)/_store/dialog.store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RefSite } from '@prisma/client'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { useAtom } from 'jotai'

interface DataTableRowActionsProps {
  row: Row<RefSite>
  onRefresh?: () => void
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [dialogStatus, setDialogStatus] = useAtom(refSiteDialogAtom)
  const { original } = row

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          disabled={dialogStatus.show}
          onClick={() =>
            setDialogStatus({ show: true, isAdd: false, id: original.id })
          }
        >
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
