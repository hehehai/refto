import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
      versionDate: new Date() as Date | undefined,
      versionNote: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.versionDate) return;
      await onSubmit({
        versionDate: value.versionDate,
        versionNote: value.versionNote || undefined,
      });
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      if (version) {
        form.setFieldValue("versionDate", version.versionDate);
        form.setFieldValue("versionNote", version.versionNote ?? "");
      } else {
        form.setFieldValue("versionDate", new Date());
      }
    }
  }, [open, version, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent overlayProps={{ forceRender: true }}>
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
                  <DatePicker
                    className="w-full"
                    disabled={isLoading || form.state.isSubmitting}
                    onChange={(date) => field.handleChange(date)}
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
