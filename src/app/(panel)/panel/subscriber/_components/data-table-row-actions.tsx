"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subscriber } from "@/db/schema";
import { orpc } from "@/lib/orpc/react";

interface DataTableRowActionsProps {
  row: Row<Subscriber>;
  onRefresh?: () => void;
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const { original } = row;

  const unSubRow = useMutation({
    ...orpc.subscriber.unsubscribeBatch.mutationOptions(),
    onSuccess: () => {
      onRefresh?.();
      toast.success("unSubscribe");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          variant="ghost"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {!original.unSubDate && (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-500"
            disabled={unSubRow.isPending}
            onClick={() => unSubRow.mutate({ emails: [original.email] })}
          >
            {unSubRow.isPending && <Spinner className="mr-2" />}
            <span>Unsubscribe</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
