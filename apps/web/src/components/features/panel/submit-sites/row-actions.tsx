import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserDetailStore } from "@/stores/user-detail-store";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { RejectDialog } from "./reject-dialog";
import type { SubmitSiteRow } from "./types";
import { useSubmitSiteActions } from "./use-submit-site-actions";

interface SubmitSiteRowActionsProps {
  submission: SubmitSiteRow;
}

export function SubmitSiteRowActions({
  submission,
}: SubmitSiteRowActionsProps) {
  const actions = useSubmitSiteActions();
  const openUserDetail = useUserDetailStore((state) => state.openUserDetail);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleApprove = async () => {
    await actions.approve.mutateAsync({ id: submission.id });
  };

  const handleReject = async (id: number, reason: string) => {
    await actions.reject.mutateAsync({ id, reason });
    setRejectOpen(false);
  };

  const handleDelete = async () => {
    await actions.remove.mutateAsync({ id: submission.id });
    setDeleteOpen(false);
  };

  const isPending = submission.status === "PENDING";
  const isApproved = submission.status === "APPROVED";
  const isRejected = submission.status === "REJECTED";

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {isPending && (
          <>
            <Button
              disabled={actions.approve.isPending}
              onClick={handleApprove}
              size="sm"
              variant="outline"
            >
              <span className="i-hugeicons-checkmark-circle-01 size-3.5" />
              {actions.approve.isPending ? "..." : "Approve"}
            </Button>
            <Button
              onClick={() => setRejectOpen(true)}
              size="sm"
              variant="outline"
            >
              <span className="i-hugeicons-cancel-circle size-3.5" />
              Reject
            </Button>
          </>
        )}
        {(isApproved || isRejected) && (
          <Button
            onClick={() => setDeleteOpen(true)}
            size="sm"
            variant="destructive"
          >
            <span className="i-hugeicons-delete-03 size-3.5" />
            Delete
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon-sm" variant="outline">
                <span className="i-hugeicons-more-horizontal size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {submission.userId && (
              <DropdownMenuItem
                onClick={() => openUserDetail(submission.userId!)}
              >
                <span className="i-hugeicons-user-account size-4" />
                View Submitter
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => window.open(submission.siteUrl, "_blank")}
            >
              <span className="i-hugeicons-link-external-01 size-4" />
              Open Site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RejectDialog
        onConfirm={handleReject}
        onOpenChange={setRejectOpen}
        open={rejectOpen}
        submission={submission}
      />

      <DeleteConfirmDialog
        isLoading={actions.remove.isPending}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        submission={submission}
      />
    </>
  );
}
