import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { orpc } from "@/lib/orpc";
import { siteDetailSheet, userDetailSheet } from "@/lib/sheets";
import { useSiteActions } from "../common/use-site-actions";
import { SiteFormSheet } from "../edit/site-form-sheet";

export function SiteDetailSheet() {
  return (
    <Sheet<{ siteId: string }> handle={siteDetailSheet}>
      {({ payload }) =>
        payload && <SiteDetailContent siteId={payload.siteId} />
      }
    </Sheet>
  );
}

function SiteDetailContent({ siteId }: { siteId: string }) {
  const actions = useSiteActions();
  const [, copy] = useCopyToClipboard();
  const [editOpen, setEditOpen] = useState(false);

  const { data: site, isLoading } = useQuery(
    orpc.panel.site.getById.queryOptions({
      input: { id: siteId },
    })
  );

  const handleCopySiteId = async () => {
    if (site) {
      const success = await copy(site.id);
      if (success) {
        toast.success("Site ID copied to clipboard");
      }
    }
  };

  const handleCopyUrl = async () => {
    if (site) {
      const success = await copy(site.url);
      if (success) {
        toast.success("URL copied to clipboard");
      }
    }
  };

  const handleUpdate = async (data: {
    title: string;
    description: string;
    logo: string;
    url: string;
    tags: string[];
    rating: number;
    isPinned: boolean;
  }) => {
    if (site) {
      await actions.upsert.mutateAsync({
        id: site.id,
        ...data,
      });
    }
  };

  const handlePin = async () => {
    if (site) {
      await actions.pin.mutateAsync({ id: site.id });
    }
  };

  const handleUnpin = async () => {
    if (site) {
      await actions.unpin.mutateAsync({ id: site.id });
    }
  };

  const handleDelete = () => {
    if (!site) return;
    confirmDialog.openWithPayload({
      title: "Delete Site",
      description: (
        <>
          Are you sure you want to delete <strong>{site.title}</strong>? This
          will also delete all associated pages and versions. This action cannot
          be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: site.id });
        siteDetailSheet.close();
      },
    });
  };

  const handleOpenCreatorDetail = () => {
    if (site?.createdBy) {
      userDetailSheet.openWithPayload({ userId: site.createdBy.id });
    }
  };

  return (
    <>
      <SheetContent
        className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3/4 data-[side=right]:sm:max-w-3/4"
        showCloseButton={false}
        side="right"
      >
        <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
          {isLoading || !site ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <SheetHeader className="flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  {site.logo && (
                    <img
                      alt={site.title}
                      className="size-12 rounded-lg object-cover"
                      src={site.logo}
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <SheetTitle className="text-base leading-none">
                        {site.title}
                      </SheetTitle>
                      {site.isPinned && <Badge variant="default">Pinned</Badge>}
                    </div>
                    <SheetDescription className="flex items-center gap-1 leading-none">
                      <a
                        className="hover:underline"
                        href={site.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {site.url}
                      </a>
                      <span className="i-hugeicons-link-square-01 size-3.5" />
                    </SheetDescription>
                  </div>
                </div>
                <SheetClose
                  className={buttonVariants({
                    size: "icon-sm",
                    variant: "outline",
                  })}
                >
                  <span className="i-hugeicons-cancel-01 text-lg" />
                </SheetClose>
              </SheetHeader>

              <div className="flex flex-col gap-6 overflow-y-auto p-4 pt-0">
                {/* Tags */}
                {site.tags && site.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {site.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleCopySiteId}
                    size="sm"
                    variant="outline"
                  >
                    <span className="i-hugeicons-copy-01 size-3.5" />
                    Copy ID
                  </Button>
                  <Button onClick={handleCopyUrl} size="sm" variant="outline">
                    <span className="i-hugeicons-link-01 size-3.5" />
                    Copy URL
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
                    <span className="i-hugeicons-edit-02 size-3.5" />
                    Edit
                  </Button>
                  {site.isPinned ? (
                    <Button
                      disabled={actions.unpin.isPending}
                      onClick={handleUnpin}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-pin-off-02 size-3.5" />
                      {actions.unpin.isPending ? "Unpinning..." : "Unpin"}
                    </Button>
                  ) : (
                    <Button
                      disabled={actions.pin.isPending}
                      onClick={handlePin}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-pin size-3.5" />
                      {actions.pin.isPending ? "Pinning..." : "Pin"}
                    </Button>
                  )}
                  <Button
                    onClick={handleDelete}
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
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="font-semibold text-2xl">{site.visits}</p>
                      <p className="text-muted-foreground text-xs">Visits</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="font-semibold text-2xl">
                        {site.pagesCount ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">Pages</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="font-semibold text-2xl">
                        {site.versionsCount ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">Versions</p>
                    </div>
                  </div>
                </section>

                {/* Rating */}
                <section>
                  <h3 className="mb-3 font-medium text-sm">Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          className={`i-hugeicons-star size-5 ${
                            i < Math.round(site.rating ?? 0)
                              ? "text-yellow-500"
                              : "text-muted-foreground/30"
                          }`}
                          key={i}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {site.rating?.toFixed(1) ?? "0.0"}
                    </span>
                  </div>
                </section>

                {/* Description */}
                {site.description && (
                  <section>
                    <h3 className="mb-3 font-medium text-sm">Description</h3>
                    <p className="text-muted-foreground text-sm">
                      {site.description}
                    </p>
                  </section>
                )}

                {/* Site Info */}
                <section>
                  <h3 className="mb-3 font-medium text-sm">Site Info</h3>
                  <div className="space-y-2">
                    <InfoRow
                      label="Created"
                      value={
                        site.createdAt
                          ? formatDistanceToNow(new Date(site.createdAt), {
                              addSuffix: true,
                            })
                          : "-"
                      }
                    />
                    <InfoRow
                      label="Updated"
                      value={
                        site.updatedAt
                          ? formatDistanceToNow(new Date(site.updatedAt), {
                              addSuffix: true,
                            })
                          : "-"
                      }
                    />
                  </div>
                </section>

                {/* Creator */}
                {site.createdBy && (
                  <section>
                    <h3 className="mb-3 font-medium text-sm">Creator</h3>
                    <button
                      className="flex w-full items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      onClick={handleOpenCreatorDetail}
                      type="button"
                    >
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={site.createdBy.name ?? ""}
                          src={site.createdBy.image ?? undefined}
                        />
                        <AvatarFallback>
                          {site.createdBy.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-medium text-sm">
                          {site.createdBy.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {site.createdBy.email}
                        </span>
                      </div>
                    </button>
                  </section>
                )}

                {/* Default Page */}
                {site.defaultPage && (
                  <section>
                    <h3 className="mb-3 font-medium text-sm">Default Page</h3>
                    <div className="rounded-lg border p-3">
                      <p className="font-medium text-sm">
                        {site.defaultPage.title || site.defaultPage.url || "/"}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>

      {site && (
        <SiteFormSheet
          mode="edit"
          onOpenChange={setEditOpen}
          onSubmit={handleUpdate}
          open={editOpen}
          site={{
            id: site.id,
            title: site.title,
            description: site.description,
            logo: site.logo,
            url: site.url,
            tags: site.tags,
            rating: site.rating,
            isPinned: site.isPinned,
            visits: site.visits,
            createdAt: site.createdAt,
            updatedAt: site.updatedAt,
            createdById: site.createdById,
            creatorName: site.createdBy?.name ?? null,
            creatorImage: site.createdBy?.image ?? null,
          }}
        />
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
