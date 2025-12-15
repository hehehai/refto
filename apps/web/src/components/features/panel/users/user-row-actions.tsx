import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [editOpen, setEditOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
            {user.banned ? (
              <DropdownMenuItem
                disabled={actions.unban.isPending}
                onClick={handleUnban}
              >
                <span className="i-hugeicons-user-check-02 size-4" />
                {actions.unban.isPending ? "Unbanning..." : "Unban"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setBanOpen(true)}>
                <span className="i-hugeicons-user-block-02 size-4" />
                Ban
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
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
