import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { z } from "zod";
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
import { Switch } from "@/components/ui/switch";

const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "URL is required"),
  isDefault: z.boolean(),
});

interface PageData {
  id?: string;
  title: string;
  url: string;
  isDefault: boolean;
}

interface PageDialogProps {
  mode: "create" | "edit";
  page?: PageData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    url: string;
    isDefault: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function PageDialog({
  mode,
  page,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: PageDialogProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      url: "",
      isDefault: false,
    },
    validators: {
      onSubmit: pageFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      if (page) {
        form.setFieldValue("title", page.title);
        form.setFieldValue("url", page.url);
        form.setFieldValue("isDefault", page.isDefault);
      }
    }
  }, [open, page, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent overlayProps={{ forceRender: true }}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Page" : "Edit Page"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          id="page-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* Title */}
          <form.Field name="title">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="page-title">Title</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading || form.state.isSubmitting}
                    id="page-title"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Homepage"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* URL */}
          <form.Field name="url">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="page-url">URL Path</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading || form.state.isSubmitting}
                    id="page-url"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. / or /about"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Is Default */}
          <form.Field name="isDefault">
            {(field) => (
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className="mb-0" htmlFor="page-isDefault">
                    Set as default page
                  </FieldLabel>
                  <Switch
                    checked={field.state.value}
                    disabled={isLoading || form.state.isSubmitting}
                    id="page-isDefault"
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </div>
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
            form="page-form"
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
