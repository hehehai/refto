import { useFilePicker } from "use-file-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  fallback?: string;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  disabled = false,
  fallback = "?",
  className,
}: AvatarUploadProps) {
  const { upload, isUploading } = useAdminUpload({
    onSuccess: (result) => {
      // Construct the public URL from R2
      const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${result.filename}`;
      onChange(publicUrl);
    },
  });

  const { openFilePicker } = useFilePicker({
    accept: "image/*",
    multiple: false,
    readAs: "ArrayBuffer",
    onFilesSuccessfullySelected: async ({ plainFiles }) => {
      const file = plainFiles[0];
      if (file) {
        await upload(file);
      }
    },
  });

  const handleClick = () => {
    if (!(disabled || isUploading)) {
      openFilePicker();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        className="group relative cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled || isUploading}
        onClick={handleClick}
        type="button"
      >
        <Avatar className="size-20" size="lg">
          <AvatarImage src={value ?? undefined} />
          <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity",
            !(disabled || isUploading) && "group-hover:opacity-100"
          )}
        >
          {isUploading ? (
            <span className="i-hugeicons-loading-03 size-6 animate-spin text-white" />
          ) : (
            <span className="i-hugeicons-camera-02 size-6 text-white" />
          )}
        </div>
      </button>

      {/* Remove button */}
      {value && !disabled && !isUploading && (
        <Button
          className="-right-1 -top-1 absolute rounded-full"
          onClick={handleRemove}
          size="icon-xs"
          type="button"
          variant="destructive"
        >
          <span className="i-hugeicons-cancel-01 size-3" />
        </Button>
      )}
    </div>
  );
}
