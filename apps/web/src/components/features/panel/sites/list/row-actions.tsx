import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { siteDetailSheet, siteEditSheet } from "@/lib/sheets";
import type { SiteRow } from "../common/types";
import { useSiteActions } from "../common/use-site-actions";

interface SiteRowActionsProps {
  site: SiteRow;
}

export function SiteRowActions({ site }: SiteRowActionsProps) {
  const actions = useSiteActions();
  const [, copy] = useCopyToClipboard();

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

  const handlePin = async () => {
    await actions.pin.mutateAsync({ id: site.id });
  };

  const handleUnpin = async () => {
    await actions.unpin.mutateAsync({ id: site.id });
  };

  const handleDelete = () => {
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
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        onClick={() => siteEditSheet.openWithPayload({ siteId: site.id })}
        size="sm"
        variant="outline"
      >
        <span className="i-hugeicons-edit-02 size-3.5" />
        Edit
      </Button>
      <Button
        onClick={() => siteDetailSheet.openWithPayload({ siteId: site.id })}
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
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <span className="i-hugeicons-delete-03 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
