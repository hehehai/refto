import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import slugify from "slug";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";

const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  url: z.string().min(1, "URL is required"),
  isDefault: z.boolean(),
});

interface PageData {
  id?: string;
  title: string;
  slug: string;
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
    slug: string;
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
  const [lastAutoSlug, setLastAutoSlug] = useState("");

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
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

  const handleTitleChange = (value: string, field: any) => {
    field.handleChange(value);

    // Auto-generate slug from title if slug is empty or matches previous auto-generated value
    const currentSlug = form.getFieldValue("slug");
    if (!currentSlug || currentSlug === lastAutoSlug) {
      const newSlug = slugify(value, { lower: true });
      form.setFieldValue("slug", newSlug);
      setLastAutoSlug(newSlug);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset();
      setLastAutoSlug("");
      if (page) {
        form.setFieldValue("title", page.title);
        form.setFieldValue("slug", page.slug);
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
                    onChange={(e) => handleTitleChange(e.target.value, field)}
                    placeholder="e.g. Homepage"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Slug */}
          <form.Field name="slug">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="page-slug">Slug</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <span className="text-muted-foreground text-sm">/</span>
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={isInvalid}
                      disabled={isLoading || form.state.isSubmitting}
                      id="page-slug"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                        )
                      }
                      placeholder="e.g. homepage"
                      value={field.state.value}
                    />
                  </InputGroup>
                  <FieldDescription className="text-xs">
                    URL-friendly identifier. Auto-generated from title.
                  </FieldDescription>
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
