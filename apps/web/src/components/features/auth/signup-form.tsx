import { type SignUpFormData, signUpSchema } from "@refto-one/config";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";
import {
  FileSizeValidator,
  FileTypeValidator,
} from "use-file-picker/validators";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface SignupFormProps {
  onSubmit: (data: SignUpFormData) => void;
  children?: React.ReactNode;
}

export const SignupForm = ({ onSubmit, children }: SignupFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm({
    validators: {
      onSubmit: signUpSchema,
    },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      image: null,
    } as SignUpFormData,
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  const { openFilePicker, clear } = useFilePicker({
    readAs: "DataURL",
    accept: [".png", ".jpg", ".jpeg", ".webp"],
    multiple: false,
    validators: [
      new FileTypeValidator(["png", "jpg", "jpeg", "webp"]),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }), // 5MB
    ],
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
      const file = plainFiles[0];
      const content = filesContent[0]?.content;
      if (file && content) {
        form.setFieldValue("image", file);
        setImagePreview(content);
      }
    },
    onFilesRejected: ({ errors }) => {
      const error = errors[0];
      if (error?.name === "FileSizeError") {
        toast.error("File size must be less than 5MB");
      } else if (error?.name === "FileTypeError") {
        toast.error("Only PNG, JPEG, and WebP files are allowed");
      } else {
        toast.error("Invalid file selected");
      }
    },
    onClear: () => {
      form.setFieldValue("image", null);
      setImagePreview(null);
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar
            className="size-14 cursor-pointer border border-transparent hover:border-input"
            onClick={openFilePicker}
          >
            {imagePreview ? (
              <AvatarImage alt="Profile preview" src={imagePreview} />
            ) : (
              <AvatarFallback>ref</AvatarFallback>
            )}
          </Avatar>
          {imagePreview && (
            <button
              className="-top-0.5 -right-0.5 absolute flex size-4 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
              onClick={clear}
              type="button"
            >
              <span className="i-hugeicons-cancel-01 size-3" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <button
            className="cursor-pointer text-left text-muted-foreground text-sm hover:text-foreground"
            onClick={openFilePicker}
            type="button"
          >
            Upload avatar
          </button>
          <p className="text-muted-foreground/60 text-xs">Optional</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="firstName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel className="sr-only">First name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="First name"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="lastName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel className="sr-only">Last name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Last name"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </div>

      <form.Field name="email">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="sr-only">Email</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="off"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Email"
                type="email"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="sr-only">password</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="off"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="password"
                type="password"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="passwordConfirmation">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="sr-only">Confirm password</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="off"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Confirm password"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {children}
    </form>
  );
};
