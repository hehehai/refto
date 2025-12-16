import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useUserDetailStore } from "@/stores/user-detail-store";
import { BanDialog } from "./ban-dialog";
import type { UserRow } from "./columns";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { useUserActions } from "./use-user-actions";
import { UserFormDialog } from "./user-form-dialog";

interface UserRowActionsProps {
  user: UserRow;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const actions = useUserActions();
  const openUserDetail = useUserDetailStore((state) => state.openUserDetail);
  const [, copy] = useCopyToClipboard();
  const [editOpen, setEditOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCopyUserId = async () => {
    const success = await copy(user.id);
    if (success) {
      toast.success("User ID copied to clipboard");
    }
  };

  const handleUpdate = async (data: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    image?: string | null;
  }) => {
    await actions.update.mutateAsync({
      id: user.id,
      name: data.name,
      role: data.role,
      image: data.image,
      password: data.password,
    });
  };

  const handleBan = async (userId: string, reason: string) => {
    await actions.ban.mutateAsync({ id: userId, reason });
    setBanOpen(false);
  };

  const handleUnban = async () => {
    await actions.unban.mutateAsync({ id: user.id });
  };

  const handleDelete = async () => {
    await actions.remove.mutateAsync({ id: user.id });
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button onClick={() => setEditOpen(true)} size="sm" variant="outline">
          <span className="i-hugeicons-user-edit-01 size-3.5" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon-sm" variant="outline">
                <span className="i-hugeicons-more-horizontal size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyUserId}>
              <span className="i-hugeicons-copy-01 size-4" />
              Copy UserId
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openUserDetail(user.id)}>
              <span className="i-hugeicons-user-account size-4" />
              User Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.banned ? (
              <DropdownMenuItem
                disabled={actions.unban.isPending}
                onClick={handleUnban}
                variant="destructive"
              >
                <span className="i-hugeicons-lock-key size-4" />
                {actions.unban.isPending ? "Unbanning..." : "Unban"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setBanOpen(true)}
                variant="destructive"
              >
                <span className="i-hugeicons-lock-password size-4" />
                Ban
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              variant="destructive"
            >
              <span className="i-hugeicons-delete-03 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UserFormDialog
        mode="edit"
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        open={editOpen}
        user={user}
      />

      <BanDialog
        onConfirm={handleBan}
        onOpenChange={setBanOpen}
        open={banOpen}
        user={user}
      />

      <DeleteConfirmDialog
        isLoading={actions.remove.isPending}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        user={user}
      />
    </>
  );
}
