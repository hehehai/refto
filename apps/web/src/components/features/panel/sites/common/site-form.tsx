import { useState } from "react";
import slugify from "slug";
import { ImageUpload } from "@/components/shared/image-upload";
import { Badge } from "@/components/ui/badge";
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
import { Rating } from "@/components/ui/rating";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SiteFormType } from "@/lib/form-types";

export interface SiteFormValues {
  title: string;
  slug: string;
  description: string;
  logo: string;
  url: string;
  tags: string[];
  rating: number;
  isPinned: boolean;
}

interface SiteFormProps {
  form: SiteFormType;
  disabled?: boolean;
}

export function SiteForm({ form, disabled = false }: SiteFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [lastAutoSlug, setLastAutoSlug] = useState("");

  const handleTitleChange = (
    value: string,
    field: { handleChange: (value: string) => void }
  ) => {
    field.handleChange(value);

    // Auto-generate slug from title if slug is empty or matches previous auto-generated value
    const currentSlug = form.getFieldValue("slug");
    if (!currentSlug || currentSlug === lastAutoSlug) {
      const newSlug = slugify(value, { lower: true });
      form.setFieldValue("slug", newSlug);
      setLastAutoSlug(newSlug);
    }
  };

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
      form.getFieldValue("tags").filter((t: string) => t !== tagToRemove)
    );
  };

  const isSubmitting = form.state.isSubmitting;

  return (
    <div className="space-y-4">
      {/* Logo Upload */}
      <form.Field name="logo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field>
              <FieldLabel>Logo</FieldLabel>
              <ImageUpload
                disabled={disabled || isSubmitting}
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
                disabled={disabled || isSubmitting}
                id="title"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => handleTitleChange(e.target.value, field)}
                placeholder="Enter site title"
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
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <span className="text-muted-foreground text-sm">/</span>
                </InputGroupAddon>
                <InputGroupInput
                  aria-invalid={isInvalid}
                  disabled={disabled || isSubmitting}
                  id="slug"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  placeholder="auto-generated-from-title"
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
              <FieldLabel htmlFor="url">URL</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                disabled={disabled || isSubmitting}
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
                disabled={disabled || isSubmitting}
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
                disabled={disabled || isSubmitting}
                id="tags"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
                value={tagInput}
              />
              {field.state.value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {field.state.value.map((tag: string) => (
                    <Badge
                      className="gap-1 px-0.5 pl-2"
                      key={tag}
                      variant="secondary"
                    >
                      {tag}
                      <button
                        className="ml-0.5 flex items-center justify-center rounded-full p-0.5 hover:bg-muted-foreground/20"
                        disabled={disabled || isSubmitting}
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
                disabled={disabled || isSubmitting}
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
                disabled={disabled || isSubmitting}
                id="isPinned"
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
            </div>
          </Field>
        )}
      </form.Field>
    </div>
  );
}
