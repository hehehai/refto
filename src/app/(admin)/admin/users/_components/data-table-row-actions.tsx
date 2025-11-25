"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/lib/orpc/react";
import { userEditDialogEmitter } from "../_store/dialog.store";
import type { UserWithMeta } from "./columns";

interface DataTableRowActionsProps {
  row: Row<UserWithMeta>;
  onRefresh?: () => void;
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const user = row.original;

  const deleteMutation = useMutation({
    mutationFn: () => orpc.adminUser.delete.call({ id: user.id }),
    onSuccess: () => {
      toast.success("User deleted successfully");
      onRefresh?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const banMutation = useMutation({
    mutationFn: () => orpc.adminUser.ban.call({ id: user.id }),
    onSuccess: () => {
      toast.success("User banned successfully");
      onRefresh?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ban user");
    },
  });

  const unbanMutation = useMutation({
    mutationFn: () => orpc.adminUser.unban.call({ id: user.id }),
    onSuccess: () => {
      toast.success("User unbanned successfully");
      onRefresh?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unban user");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => orpc.adminUser.resetPassword.call({ id: user.id }),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const handleViewSubmissions = () => {
    router.push(`/admin/submit-sites?userId=${user.id}`);
  };

  const handleEdit = () => {
    userEditDialogEmitter.emit("open", { user });
  };

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleEdit}>
            <span className="i-lucide-pencil mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => resetPasswordMutation.mutate()}>
            <span className="i-lucide-key mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewSubmissions}>
            <span className="i-lucide-file-text mr-2 h-4 w-4" />
            View Submissions
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.banned ? (
            <DropdownMenuItem onClick={() => unbanMutation.mutate()}>
              <span className="i-lucide-shield-check mr-2 h-4 w-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-orange-600 focus:text-orange-500"
              onClick={() => setShowBanDialog(true)}
            >
              <span className="i-lucide-shield-alert mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600 focus:text-red-500"
            onClick={() => setShowDeleteDialog(true)}
          >
            <span className="i-lucide-trash-2 mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user "{user.name || user.email}"?
              This action cannot be undone. All associated data including
              sessions and accounts will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowBanDialog} open={showBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban user "{user.name || user.email}"?
              They will be immediately logged out and unable to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => banMutation.mutate()}
            >
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
