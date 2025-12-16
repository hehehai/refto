import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!submission) return;

    if (!reason.trim()) {
      setError("Reject reason is required");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(submission.id, reason.trim());
      onOpenChange(false);
      setReason("");
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setReason("");
      setError("");
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Submission</DialogTitle>
          <DialogDescription>
            You are about to reject <strong>{submission?.siteTitle}</strong>.
            Please provide a reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reject-reason">Reason</Label>
          <Textarea
            aria-invalid={!!error}
            disabled={loading}
            id="reject-reason"
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="Enter the reason for rejecting this submission..."
            rows={3}
            value={reason}
          />
          {error && <FieldError>{error}</FieldError>}
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={handleConfirm}
            variant="destructive"
          >
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
