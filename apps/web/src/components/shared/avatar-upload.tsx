import { useFilePicker } from "use-file-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

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
    onSuccess: (result) => onChange(result.url),
  });

  const { openFilePicker, filesContent, clear } = useFilePicker({
    accept: "image/*",
    multiple: false,
    readAs: "DataURL",
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
    clear();
  };

  const image = value || filesContent[0]?.content;

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        className="group relative flex size-16 cursor-pointer items-center justify-center disabled:cursor-not-allowed"
        disabled={disabled || isUploading}
        onClick={handleClick}
        type="button"
      >
        <Avatar className="size-16">
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback className="text-xl">{fallback}</AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-black/50 transition-opacity",
            isUploading ? "opacity-100" : "opacity-0",
            !(disabled || isUploading) && "group-hover:opacity-100"
          )}
        >
          {isUploading ? (
            <Spinner className="size-6 text-white" />
          ) : (
            <span className="i-hugeicons-camera-02 size-6 text-white" />
          )}
        </div>
      </button>

      {/* Remove button */}
      {image && !disabled && !isUploading && (
        <Button
          className="-right-1 -top-1 absolute size-5 rounded-full p-0.5"
          onClick={handleRemove}
          size="icon-xs"
          type="button"
          variant="destructive"
        >
          <span className="i-hugeicons-cancel-01 size-3.5" />
        </Button>
      )}
    </div>
  );
}
