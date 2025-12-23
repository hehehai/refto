import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
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
import { client } from "@/lib/orpc";
import { submitSiteDialog } from "@/lib/sheets";

export function SubmitSiteDialog() {
  return (
    <Dialog handle={submitSiteDialog}>
      <DialogContent className="sm:max-w-md">
        <SubmitSiteContent />
      </DialogContent>
    </Dialog>
  );
}

function SubmitSiteContent() {
  const queryClient = useQueryClient();
  const [siteUrl, setSiteUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: (input: {
      siteUrl: string;
      siteTitle: string;
      siteDescription: string;
    }) => client.features.submitSite.create(input),
    onSuccess: () => {
      toast.success("Site submitted successfully");
      queryClient.invalidateQueries({
        queryKey: [["features", "submitSite", "list"]],
      });
      resetForm();
      submitSiteDialog.close();
    },
  });

  const resetForm = () => {
    setSiteUrl("");
    setSiteTitle("");
    setSiteDescription("");
    setErrors({});
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    submitMutation.mutate({
      siteUrl: siteUrl.trim(),
      siteTitle: siteTitle.trim(),
      siteDescription: siteDescription.trim(),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Submit a Site</DialogTitle>
        <DialogDescription>
          Submit a website for review. Once approved, it will be added to our
          collection.
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="siteUrl">
            Site URL <span className="text-destructive">*</span>
          </Label>
          <Input
            aria-invalid={!!errors.siteUrl}
            id="siteUrl"
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
          <Label htmlFor="siteTitle">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            aria-invalid={!!errors.siteTitle}
            id="siteTitle"
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
          <Label htmlFor="siteDescription">Description</Label>
          <Textarea
            aria-invalid={!!errors.siteDescription}
            id="siteDescription"
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
          <Button disabled={submitMutation.isPending} type="submit">
            {submitMutation.isPending ? "Submitting..." : "Submit Site"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
