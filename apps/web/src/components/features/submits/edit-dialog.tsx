import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SubmitSiteRow } from "./types";
import { useSubmitActions } from "./use-submit-actions";

interface EditSubmitDialogProps {
  submission: SubmitSiteRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubmitDialog({
  submission,
  open,
  onOpenChange,
}: EditSubmitDialogProps) {
  const actions = useSubmitActions();
  const [siteUrl, setSiteUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      setSiteUrl(submission.siteUrl);
      setSiteTitle(submission.siteTitle);
      setSiteDescription(submission.siteDescription ?? "");
      setErrors({});
    }
  }, [submission]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (siteUrl.trim()) {
      try {
        new URL(siteUrl);
      } catch {
        newErrors.siteUrl = "Please enter a valid URL";
      }
    } else {
      newErrors.siteUrl = "Site URL is required";
    }

    if (!siteTitle.trim()) {
      newErrors.siteTitle = "Title is required";
    } else if (siteTitle.length > 200) {
      newErrors.siteTitle = "Title must be 200 characters or less";
    }

    if (siteDescription.length > 1000) {
      newErrors.siteDescription = "Description must be 1000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(submission && validate())) {
      return;
    }

    await actions.update.mutateAsync({
      id: submission.id,
      siteUrl: siteUrl.trim(),
      siteTitle: siteTitle.trim(),
      siteDescription: siteDescription.trim(),
    });

    onOpenChange(false);
  };

  if (!submission) {
    return null;
  }

  const isRejected = submission.status === "REJECTED";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
          <DialogDescription>
            {isRejected
              ? "Update your submission and resubmit for review."
              : "Make changes to your pending submission."}
          </DialogDescription>
        </DialogHeader>

        {isRejected && submission.rejectReason && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3">
            <p className="font-medium text-destructive text-sm">
              Rejection Reason:
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {submission.rejectReason}
            </p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-siteUrl">
              Site URL <span className="text-destructive">*</span>
            </Label>
            <Input
              aria-invalid={!!errors.siteUrl}
              id="edit-siteUrl"
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              value={siteUrl}
            />
            {errors.siteUrl && (
              <p className="text-destructive text-xs">{errors.siteUrl}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-siteTitle">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              aria-invalid={!!errors.siteTitle}
              id="edit-siteTitle"
              maxLength={200}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="My Awesome Website"
              value={siteTitle}
            />
            {errors.siteTitle && (
              <p className="text-destructive text-xs">{errors.siteTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-siteDescription">Description</Label>
            <Textarea
              aria-invalid={!!errors.siteDescription}
              id="edit-siteDescription"
              maxLength={1000}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="A brief description of the website..."
              rows={3}
              value={siteDescription}
            />
            <div className="flex items-center justify-between">
              {errors.siteDescription ? (
                <p className="text-destructive text-xs">
                  {errors.siteDescription}
                </p>
              ) : (
                <span />
              )}
              <p className="text-muted-foreground text-xs">
                {siteDescription.length}/1000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={actions.update.isPending} type="submit">
              {actions.update.isPending
                ? "Saving..."
                : isRejected
                  ? "Resubmit"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
