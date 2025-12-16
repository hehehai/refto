import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { orpc } from "@/lib/orpc";
import { useUserDetailStore } from "@/stores/user-detail-store";
import { BanDialog } from "./ban-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { useUserActions } from "./use-user-actions";
import { UserFormDialog } from "./user-form-dialog";

export function UserDetailDrawer() {
  const { userId, isOpen, closeUserDetail } = useUserDetailStore();
  const actions = useUserActions();
  const [, copy] = useCopyToClipboard();
  const [editOpen, setEditOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useQuery(
    orpc.panel.user.getById.queryOptions({
      input: { id: userId ?? "" },
      enabled: !!userId && isOpen,
    })
  );

  const { data: stats, isLoading: isStatsLoading } = useQuery(
    orpc.panel.user.getUserStats.queryOptions({
      input: { id: userId ?? "" },
      enabled: !!userId && isOpen,
    })
  );

  const handleCopyUserId = async () => {
    if (user) {
      const success = await copy(user.id);
      if (success) {
        toast.success("User ID copied to clipboard");
      }
    }
  };

  const handleCopyEmail = async () => {
    if (user) {
      const success = await copy(user.email);
      if (success) {
        toast.success("Email copied to clipboard");
      }
    }
  };

  const handleUpdate = async (data: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    image?: string | null;
  }) => {
    if (user) {
      await actions.update.mutateAsync({
        id: user.id,
        name: data.name,
        role: data.role,
        image: data.image,
        password: data.password,
      });
    }
  };

  const handleBan = async (userId: string, reason: string) => {
    await actions.ban.mutateAsync({ id: userId, reason });
    setBanOpen(false);
  };

  const handleUnban = async () => {
    if (user) {
      await actions.unban.mutateAsync({ id: user.id });
    }
  };

  const handleDelete = async () => {
    if (user) {
      await actions.remove.mutateAsync({ id: user.id });
      setDeleteOpen(false);
      closeUserDetail();
    }
  };

  const isLoading = isUserLoading || isStatsLoading;

  return (
    <>
      <Drawer
        direction="right"
        onOpenChange={(open) => !open && closeUserDetail()}
        open={isOpen}
      >
        <DrawerContent className="h-full data-[vaul-drawer-direction=right]:w-2xl data-[vaul-drawer-direction=right]:sm:max-w-2xl">
          {isLoading || !user ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <DrawerHeader className="flex-row items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-11">
                    <AvatarImage
                      alt={user.name}
                      src={user.image ?? undefined}
                    />
                    <AvatarFallback className="text-base">
                      {user.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <DrawerTitle className="text-base leading-none">
                        {user.name}
                      </DrawerTitle>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                      {user.banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                    </div>
                    <DrawerDescription className="leading-none">
                      {user.email}
                    </DrawerDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.banned && user.banReason && (
                    <div className="flex items-center gap-0.5">
                      <p className="text-muted-foreground text-sm">
                        {user.banReason}
                      </p>
                      <Badge variant="destructive">Baned</Badge>
                    </div>
                  )}
                  <DrawerClose
                    className={buttonVariants({
                      size: "icon-sm",
                      variant: "outline",
                    })}
                  >
                    <span className="i-hugeicons-cancel-01 text-lg" />
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex flex-col gap-6 p-4 pt-0">
                {/* Actions bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleCopyUserId}
                    size="sm"
                    variant="outline"
                  >
                    <span className="i-hugeicons-copy-01 size-3.5" />
                    Copy ID
                  </Button>
                  <Button onClick={handleCopyEmail} size="sm" variant="outline">
                    <span className="i-hugeicons-mail-01 size-3.5" />
                    Copy Email
                  </Button>
                  <Separator
                    className="h-5 data-[orientation=vertical]:self-center"
                    orientation="vertical"
                  />
                  <Button
                    onClick={() => setEditOpen(true)}
                    size="sm"
                    variant="outline"
                  >
                    <span className="i-hugeicons-user-edit-01 size-3.5" />
                    Edit
                  </Button>
                  {user.banned ? (
                    <Button
                      disabled={actions.unban.isPending}
                      onClick={handleUnban}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-lock-key size-3.5" />
                      {actions.unban.isPending ? "Unbanning..." : "Unban"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setBanOpen(true)}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-lock-password size-3.5" />
                      Ban
                    </Button>
                  )}
                  <Button
                    onClick={() => setDeleteOpen(true)}
                    size="sm"
                    variant="destructive"
                  >
                    <span className="i-hugeicons-delete-03 size-3.5" />
                    Delete
                  </Button>
                </div>

                {/* Statistics */}
                <section>
                  <h3 className="mb-3 font-medium text-sm">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="font-semibold text-2xl">
                        {stats?.totalSubmissions ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Total Submissions
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="font-semibold text-2xl">
                        {stats?.approvedSubmissions ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">Approved</p>
                    </div>
                  </div>
                </section>

                {/* User Info */}
                <section>
                  <h3 className="mb-3 font-medium text-sm">User Info</h3>
                  <div className="space-y-2">
                    <InfoRow
                      label="Created"
                      value={
                        user.createdAt
                          ? formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                            })
                          : "-"
                      }
                    />
                    <InfoRow
                      label="Updated"
                      value={
                        user.updatedAt
                          ? formatDistanceToNow(new Date(user.updatedAt), {
                              addSuffix: true,
                            })
                          : "-"
                      }
                    />
                    <InfoRow
                      label="Email Verified"
                      value={user.emailVerified ? "Yes" : "No"}
                    />
                  </div>
                </section>

                {/* Accounts */}
                <section>
                  <h3 className="mb-3 font-medium text-sm">
                    Accounts ({user.accounts?.length ?? 0})
                  </h3>
                  {user.accounts && user.accounts.length > 0 ? (
                    <div className="space-y-2">
                      {user.accounts.map((account) => (
                        <div
                          className="flex items-center justify-between rounded-lg border p-3"
                          key={account.id}
                        >
                          <div className="flex items-center gap-2">
                            <ProviderIcon providerId={account.providerId} />
                            <span className="font-medium text-sm capitalize">
                              {account.providerId}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {account.createdAt
                              ? formatDistanceToNow(
                                  new Date(account.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )
                              : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No accounts</p>
                  )}
                </section>

                {/* Sessions */}
                <section>
                  <h3 className="mb-3 font-medium text-sm">
                    Sessions ({user.sessions?.length ?? 0})
                  </h3>
                  {user.sessions && user.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {user.sessions.map((session) => (
                        <div className="rounded-lg border p-3" key={session.id}>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">
                              {session.createdAt
                                ? formatDistanceToNow(
                                    new Date(session.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )
                                : "-"}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Expires{" "}
                              {session.expiresAt
                                ? formatDistanceToNow(
                                    new Date(session.expiresAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )
                                : "-"}
                            </span>
                          </div>
                          {session.ipAddress && (
                            <p className="mt-1 text-xs">
                              IP: {session.ipAddress}
                            </p>
                          )}
                          {session.userAgent && (
                            <Tooltip>
                              <TooltipTrigger>
                                <p className="mt-1 cursor-help truncate text-muted-foreground text-xs">
                                  {session.userAgent}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                {session.userAgent}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No active sessions
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {user && (
        <>
          <UserFormDialog
            mode="edit"
            onOpenChange={setEditOpen}
            onSubmit={handleUpdate}
            open={editOpen}
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
              banned: user.banned,
              banReason: user.banReason,
              createdAt: user.createdAt,
              lastSignedIn: null,
            }}
          />

          <BanDialog
            onConfirm={handleBan}
            onOpenChange={setBanOpen}
            open={banOpen}
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
              banned: user.banned,
              banReason: user.banReason,
              createdAt: user.createdAt,
              lastSignedIn: null,
            }}
          />

          <DeleteConfirmDialog
            isLoading={actions.remove.isPending}
            onConfirm={handleDelete}
            onOpenChange={setDeleteOpen}
            open={deleteOpen}
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
              banned: user.banned,
              banReason: user.banReason,
              createdAt: user.createdAt,
              lastSignedIn: null,
            }}
          />
        </>
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ProviderIcon({ providerId }: { providerId: string }) {
  switch (providerId) {
    case "github":
      return <span className="i-hugeicons-github size-4" />;
    case "google":
      return <span className="i-hugeicons-google size-4" />;
    case "credential":
      return <span className="i-hugeicons-key-01 size-4" />;
    default:
      return <span className="i-hugeicons-link-01 size-4" />;
  }
}
