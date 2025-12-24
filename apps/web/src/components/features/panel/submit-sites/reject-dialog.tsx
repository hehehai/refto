import { ReasonDialog } from "@/components/shared/reason-dialog";
import type { SubmitSiteRow } from "./types";

interface RejectDialogProps {
  submission: SubmitSiteRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: number, reason: string) => Promise<void>;
}

export function RejectDialog({
  submission,
  open,
  onOpenChange,
  onConfirm,
}: RejectDialogProps) {
  if (!submission) return null;

  return (
    <ReasonDialog
      confirmingText="Rejecting..."
      confirmText="Reject"
      description={
        <>
          You are about to reject <strong>{submission.siteTitle}</strong>.
          Please provide a reason.
        </>
      }
      label="Reason"
      onConfirm={(reason) => onConfirm(submission.id, reason)}
      onOpenChange={onOpenChange}
      open={open}
      placeholder="Enter the reason for rejecting this submission..."
      title="Reject Submission"
    />
  );
}
