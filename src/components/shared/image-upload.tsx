"use client";

import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";
import {
  FileSizeValidator,
  FileTypeValidator,
} from "use-file-picker/validators";
import { Spinner } from "@/components/shared/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileUpload } from "@/hooks";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | undefined) => void;
  fallback?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  fallback = "IMG",
  disabled = false,
  className,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploadFile, isUploading } = useFileUpload({
    onSuccess: (url) => {
      onChange(url);
      setPreviewUrl(null);
    },
    onError: () => {
      setPreviewUrl(null);
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
        setPreviewUrl(content);
        uploadFile(file);
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
      setPreviewUrl(null);
    },
  });

  const handleClear = useCallback(() => {
    clear();
    onChange(undefined);
  }, [clear, onChange]);

  const displayUrl = previewUrl || value;

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar
          className={`size-14 cursor-pointer border border-transparent hover:border-input ${className} ${disabled || isUploading ? "pointer-events-none opacity-50" : ""}`}
          onClick={openFilePicker}
        >
          {isUploading ? (
            <AvatarFallback>
              <Spinner className="size-5" />
            </AvatarFallback>
          ) : displayUrl ? (
            <AvatarImage alt="Preview" src={displayUrl} />
          ) : (
            <AvatarFallback>{fallback}</AvatarFallback>
          )}
        </Avatar>
        {displayUrl && !isUploading && (
          <button
            className="-top-0.5 -right-0.5 absolute flex size-4 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
            disabled={disabled}
            onClick={handleClear}
            type="button"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <div className="flex-1">
        <button
          className="cursor-pointer text-left text-muted-foreground text-sm hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || isUploading}
          onClick={openFilePicker}
          type="button"
        >
          {isUploading ? "Uploading..." : "Upload image"}
        </button>
        <p className="text-muted-foreground/60 text-xs">
          PNG, JPEG, WebP. Max 5MB
        </p>
      </div>
    </div>
  );
}
