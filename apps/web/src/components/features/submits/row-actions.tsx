import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { SubmitSiteRow } from "./types";
import { useSubmitActions } from "./use-submit-actions";

interface SubmitRowActionsProps {
  submission: SubmitSiteRow;
  onEdit: (submission: SubmitSiteRow) => void;
}

export function SubmitRowActions({
  submission,
  onEdit,
}: SubmitRowActionsProps) {
  const actions = useSubmitActions();

  const handleDelete = () => {
    confirmDialog.openWithPayload({
      title: "Delete Submission",
      description: (
        <>
          Are you sure you want to delete{" "}
          <strong>{submission.siteTitle}</strong>? This action cannot be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: submission.id });
      },
    });
  };

  const canEdit =
    submission.status === "PENDING" || submission.status === "REJECTED";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {canEdit && (
        <Button onClick={() => onEdit(submission)} size="sm" variant="outline">
          <span className="i-hugeicons-pencil-edit-02 size-3.5" />
          Edit
        </Button>
      )}
      <Button onClick={handleDelete} size="sm" variant="outline">
        <span className="i-hugeicons-delete-03 size-3.5" />
        Delete
      </Button>
    </div>
  );
}
