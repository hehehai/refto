"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { siteUpsertSheetAtom } from "@/app/(admin)/_store/dialog.store";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SiteWithQueryData } from "@/lib/db/schema";
import { orpc } from "@/lib/orpc/react";

interface DataTableRowActionsProps {
  row: Row<SiteWithQueryData>;
  onRefresh?: () => void;
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const [dialogStatus, setDialogStatus] = useAtom(siteUpsertSheetAtom);
  const { original } = row;

  // @ts-expect-error - oRPC mutationFn returns T | undefined, TanStack expects T
  const switchPinnedRow = useMutation({
    ...orpc.sites.switchPinned.mutationOptions(),
    onSuccess: (data) => {
      onRefresh?.();
      toast.success(
        `Site is now ${(data as { isPinned?: boolean } | undefined)?.isPinned ? "pinned" : "unpinned"}`
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteRow = useMutation({
    ...orpc.sites.delete.mutationOptions(),
    onSuccess: () => {
      onRefresh?.();
      toast.success("Ref Site deleted");
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
        <DropdownMenuItem
          disabled={dialogStatus.show}
          onClick={() =>
            setDialogStatus({ show: true, isAdd: false, id: original.id })
          }
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={dialogStatus.show}
          onClick={() =>
            setDialogStatus({ show: true, isAdd: true, id: original.id })
          }
        >
          Make a copy
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={switchPinnedRow.isPending}
          onClick={() =>
            switchPinnedRow.mutate({
              id: original.id,
              nextIsPinned: !original.isPinned,
            })
          }
        >
          {switchPinnedRow.isPending && <Spinner className="mr-2" />}
          <span>{original.isPinned ? "Unpin" : "Pin to top"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!original.deletedAt && (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-500"
            disabled={deleteRow.isPending}
            onClick={() => deleteRow.mutate({ ids: [original.id] })}
          >
            {deleteRow.isPending && <Spinner className="mr-2" />}
            <span>Delete</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
