"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFileUpload } from "@/hooks/use-file-upload";
import { orpc } from "@/lib/orpc/react";
import {
  userEditDialogAtom,
  userEditDialogEmitter,
} from "../_store/dialog.store";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  image: z.string().url().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function UserEditDialog() {
  const [dialogState, setDialogState] = useAtom(userEditDialogAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useFileUpload({
    showToast: true,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      image: null,
    },
  });

  // Listen to emitter events
  useEffect(() => {
    const handleOpen = ({ user }: { user: typeof dialogState.user }) => {
      setDialogState({ show: true, user });
      form.reset({
        name: user?.name || "",
        email: user?.email || "",
        image: user?.image || null,
      });
    };

    userEditDialogEmitter.on("open", handleOpen);

    return () => {
      userEditDialogEmitter.off("open", handleOpen);
    };
  }, [setDialogState, form]);

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) =>
      orpc.adminUser.update.call({
        id: dialogState.user!.id,
        ...data,
      }),
    onSuccess: () => {
      toast.success("User updated successfully");
      setDialogState({ show: false, user: null });
      userEditDialogEmitter.emit("success", undefined);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const handleClose = () => {
    setDialogState({ show: false, user: null });
    form.reset();
  };

  const handleSubmit = (values: FormValues) => {
    updateMutation.mutate(values);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const url = await uploadFile(file);
    if (url) {
      form.setValue("image", url);
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    form.setValue("image", null);
  };

  return (
    <Dialog
      onOpenChange={(open) => !open && handleClose()}
      open={dialogState.show}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="group relative cursor-pointer"
                onClick={handleAvatarClick}
              >
                <UserAvatar
                  className="h-20 w-20"
                  user={{
                    name: form.watch("name"),
                    image: form.watch("image"),
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-white text-xs">
                    {isUploading ? "Uploading..." : "Change"}
                  </span>
                </div>
              </div>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              {form.watch("image") && (
                <Button
                  onClick={handleRemoveAvatar}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Remove Avatar
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="User name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button onClick={handleClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button
                disabled={updateMutation.isPending || isUploading}
                type="submit"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
