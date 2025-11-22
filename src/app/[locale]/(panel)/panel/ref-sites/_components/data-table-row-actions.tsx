"use client";

import type { RefSite } from "@prisma/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { refSiteDialogAtom } from "@/app/[locale]/(panel)/_store/dialog.store";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc/react";

interface DataTableRowActionsProps {
  row: Row<RefSite>;
  onRefresh?: () => void;
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const [dialogStatus, setDialogStatus] = useAtom(refSiteDialogAtom);
  const { original } = row;
  const { toast } = useToast();

  const switchTopRow = api.refSites.switchTop.useMutation({
    onSuccess: ({ isTop }) => {
      onRefresh?.();
      toast({
        title: "Success",
        description: `Ref Site current ${isTop ? "TOP" : "NOT TOP"}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteRow = api.refSites.delete.useMutation({
    onSuccess: () => {
      onRefresh?.();
      toast({
        title: "Success",
        description: "Ref Site deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
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
      <DropdownMenuContent align="end" className="w-[160px]">
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
          disabled={switchTopRow.isPending}
          onClick={() =>
            switchTopRow.mutate({ id: original.id, nextIsTop: !original.isTop })
          }
        >
          {switchTopRow.isPending && <Spinner className="mr-2" />}
          <span>{original.isTop ? "Un Top" : "Set Top"}</span>
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
