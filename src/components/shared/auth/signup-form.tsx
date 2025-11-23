"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";
import {
  FileSizeValidator,
  FileTypeValidator,
} from "use-file-picker/validators";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type SignUpFormData, signUpSchema } from "@/lib/validations/auth";

interface SignupFormProps {
  onSubmit: (data: SignUpFormData) => void;
  children?: React.ReactNode;
}

export const SignupForm = ({ onSubmit, children }: SignupFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
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
        form.setValue("image", file, { shouldValidate: true });
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
      form.setValue("image", undefined, { shouldValidate: true });
      setImagePreview(null);
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
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
                <X className="size-3" />
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
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">First name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder="Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Confirm password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};
