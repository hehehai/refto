import { useForm } from "@tanstack/react-form";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ImageUpload } from "@/components/shared/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Rating } from "@/components/ui/rating";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SiteRow } from "./types";

// Form-specific validation schema
const siteFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  logo: z.string().min(1, "Logo is required"),
  url: z.url("Invalid URL"),
  tags: z.array(z.string()),
  rating: z.number().min(0).max(5),
  isPinned: z.boolean(),
});

interface SiteFormDrawerProps {
  mode: "create" | "edit";
  site?: SiteRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    logo: string;
    url: string;
    tags: string[];
    rating: number;
    isPinned: boolean;
  }) => Promise<void>;
  trigger?: ReactElement<Record<string, unknown>>;
}

export function SiteFormDrawer({
  mode,
  site,
  open,
  onOpenChange,
  onSubmit,
  trigger,
}: SiteFormDrawerProps) {
  const [tagInput, setTagInput] = useState("");

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      logo: "",
      url: "",
      tags: [] as string[],
      rating: 0,
      isPinned: false,
    },
    validators: {
      onSubmit: siteFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        title: value.title,
        description: value.description,
        logo: value.logo,
        url: value.url,
        tags: value.tags,
        rating: value.rating,
        isPinned: value.isPinned,
      });
      onOpenChange(false);
    },
  });

  // Reset form when drawer opens or site changes
  useEffect(() => {
    if (open) {
      form.reset();
      setTagInput("");
      if (site) {
        form.setFieldValue("title", site.title ?? "");
        form.setFieldValue("description", site.description ?? "");
        form.setFieldValue("logo", site.logo ?? "");
        form.setFieldValue("url", site.url ?? "");
        form.setFieldValue("tags", site.tags ?? []);
        form.setFieldValue("rating", site.rating ?? 0);
        form.setFieldValue("isPinned", site.isPinned ?? false);
      }
    }
  }, [open, site, form]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !form.getFieldValue("tags").includes(tag)) {
        form.setFieldValue("tags", [...form.getFieldValue("tags"), tag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setFieldValue(
      "tags",
      form.getFieldValue("tags").filter((t) => t !== tagToRemove)
    );
  };

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      {trigger && <DrawerTrigger>{trigger}</DrawerTrigger>}
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {mode === "create" ? "Create Site" : "Edit Site"}
          </DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Add a new site to the collection."
              : "Update site information."}
          </DrawerDescription>
        </DrawerHeader>

        <form
          className="flex-1 space-y-4 overflow-y-auto px-4"
          id="site-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* Logo Upload */}
          <form.Field name="logo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field>
                  <FieldLabel>Logo</FieldLabel>
                  <ImageUpload
                    disabled={form.state.isSubmitting}
                    onChange={(url) => field.handleChange(url ?? "")}
                    uploadType="admin"
                    value={field.state.value}
                    variant="square"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Title */}
          <form.Field name="title">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={form.state.isSubmitting}
                    id="title"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter site title"
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
                  <FieldLabel htmlFor="url">URL</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={form.state.isSubmitting}
                    id="url"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    aria-invalid={isInvalid}
                    disabled={form.state.isSubmitting}
                    id="description"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter site description"
                    rows={3}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Tags */}
          <form.Field name="tags">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="tags">Tags</FieldLabel>
                <div className="space-y-2">
                  <Input
                    disabled={form.state.isSubmitting}
                    id="tags"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag and press Enter"
                    value={tagInput}
                  />
                  {field.state.value.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {field.state.value.map((tag) => (
                        <Badge
                          className="gap-1 px-0.5 pl-2"
                          key={tag}
                          variant="secondary"
                        >
                          {tag}
                          <button
                            className="ml-0.5 flex items-center justify-center rounded-full p-0.5 hover:bg-muted-foreground/20"
                            disabled={form.state.isSubmitting}
                            onClick={() => handleRemoveTag(tag)}
                            type="button"
                          >
                            <span className="i-hugeicons-cancel-01 size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            )}
          </form.Field>

          {/* Rating */}
          <form.Field name="rating">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel>Rating</FieldLabel>
                  <Rating
                    allowClear
                    disabled={form.state.isSubmitting}
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Pin Status */}
          <form.Field name="isPinned">
            {(field) => (
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className="mb-0" htmlFor="isPinned">
                    Pin to top
                  </FieldLabel>
                  <Switch
                    checked={field.state.value}
                    disabled={form.state.isSubmitting}
                    id="isPinned"
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </div>
              </Field>
            )}
          </form.Field>
        </form>

        <DrawerFooter className="flex-row justify-end gap-2 border-t pt-4">
          <DrawerClose>
            <Button
              disabled={form.state.isSubmitting}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </DrawerClose>
          <Button
            disabled={form.state.isSubmitting}
            form="site-form"
            type="submit"
          >
            {form.state.isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create"
                : "Save"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
