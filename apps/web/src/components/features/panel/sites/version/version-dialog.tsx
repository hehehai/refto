import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface VersionData {
  id?: string;
  versionDate: Date;
  versionNote?: string | null;
}

interface VersionDialogProps {
  mode: "create" | "edit";
  version?: VersionData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    versionDate: Date;
    versionNote?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function VersionDialog({
  mode,
  version,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: VersionDialogProps) {
  const form = useForm({
    defaultValues: {
      versionDate: formatDateForInput(new Date()),
      versionNote: "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        versionDate: new Date(value.versionDate),
        versionNote: value.versionNote || undefined,
      });
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      if (version) {
        form.setFieldValue(
          "versionDate",
          formatDateForInput(version.versionDate)
        );
        form.setFieldValue("versionNote", version.versionNote ?? "");
      } else {
        form.setFieldValue("versionDate", formatDateForInput(new Date()));
      }
    }
  }, [open, version, form]);

  return (
    <Dialog modal={false} onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Version" : "Edit Version"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          id="version-dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* Version Date */}
          <form.Field name="versionDate">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="version-date">Version Date</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading || form.state.isSubmitting}
                    id="version-date"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="date"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Version Note */}
          <form.Field name="versionNote">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="version-note">Note (optional)</FieldLabel>
                <Textarea
                  disabled={isLoading || form.state.isSubmitting}
                  id="version-note"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Initial version, redesign, etc."
                  rows={2}
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
        </form>

        <DialogFooter>
          <Button
            disabled={isLoading || form.state.isSubmitting}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading || form.state.isSubmitting}
            form="version-dialog-form"
            type="submit"
          >
            {form.state.isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Add"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
