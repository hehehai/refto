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
import { useSiteDetailStore } from "@/stores/site-detail-store";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { SiteFormDrawer } from "./site-form-drawer";
import type { SiteRow } from "./types";
import { useSiteActions } from "./use-site-actions";

interface SiteRowActionsProps {
  site: SiteRow;
}

export function SiteRowActions({ site }: SiteRowActionsProps) {
  const actions = useSiteActions();
  const openSiteDetail = useSiteDetailStore((state) => state.openSiteDetail);
  const [, copy] = useCopyToClipboard();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCopySiteId = async () => {
    const success = await copy(site.id);
    if (success) {
      toast.success("Site ID copied to clipboard");
    }
  };

  const handleCopyUrl = async () => {
    const success = await copy(site.url);
    if (success) {
      toast.success("URL copied to clipboard");
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
    await actions.update.mutateAsync({
      id: site.id,
      ...data,
    });
  };

  const handlePin = async () => {
    await actions.pin.mutateAsync({ id: site.id });
  };

  const handleUnpin = async () => {
    await actions.unpin.mutateAsync({ id: site.id });
  };

  const handleDelete = async () => {
    await actions.remove.mutateAsync({ id: site.id });
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button onClick={() => setEditOpen(true)} size="sm" variant="outline">
          <span className="i-hugeicons-edit-02 size-3.5" />
          Edit
        </Button>
        <Button
          onClick={() => openSiteDetail(site.id)}
          size="sm"
          variant="outline"
        >
          <span className="i-hugeicons-view size-3.5" />
          Detail
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
            <DropdownMenuItem onClick={handleCopySiteId}>
              <span className="i-hugeicons-copy-01 size-4" />
              Copy Site ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyUrl}>
              <span className="i-hugeicons-link-01 size-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {site.isPinned ? (
              <DropdownMenuItem
                disabled={actions.unpin.isPending}
                onClick={handleUnpin}
              >
                <span className="i-hugeicons-pin-off-02 size-4" />
                {actions.unpin.isPending ? "Unpinning..." : "Unpin"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={actions.pin.isPending}
                onClick={handlePin}
              >
                <span className="i-hugeicons-pin size-4" />
                {actions.pin.isPending ? "Pinning..." : "Pin"}
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

      <SiteFormDrawer
        mode="edit"
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        open={editOpen}
        site={site}
      />

      <DeleteConfirmDialog
        isLoading={actions.remove.isPending}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        site={site}
      />
    </>
  );
}
