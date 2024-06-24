'use client'

import { Spinner } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/trpc/react'
import type { Subscriber } from '@prisma/client'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'

interface DataTableRowActionsProps {
  row: Row<Subscriber>
  onRefresh?: () => void
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const { original } = row
  const { toast } = useToast()

  const unSubRow = api.subscriber.unsubscribeBatch.useMutation({
    onSuccess: () => {
      onRefresh?.()
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
        {!original.unSubDate && (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-500"
            disabled={unSubRow.isLoading}
            onClick={() => unSubRow.mutate({ emails: [original.email] })}
          >
            {unSubRow.isLoading && <Spinner className="mr-2" />}
            <span>Unsubscribe</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
