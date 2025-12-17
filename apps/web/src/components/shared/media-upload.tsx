import { useRef } from "react";
import { useFilePicker } from "use-file-picker";
import { Button } from "@/components/ui/button";
import { useAdminUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

type MediaType = "image" | "video";
type AspectRatio = "og" | "cover" | "mobile";

interface MediaUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  mediaType?: MediaType;
  aspectRatio?: AspectRatio;
  label?: string;
}

const aspectRatioConfig: Record<
  AspectRatio,
  { ratio: string; width: string; height: string }
> = {
  og: { ratio: "1.91 / 1", width: "w-full", height: "h-auto" },
  cover: { ratio: "16 / 9", width: "w-full", height: "h-auto" },
  mobile: { ratio: "9 / 16", width: "w-32", height: "h-auto" },
};

const acceptTypes: Record<MediaType, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  video: "video/mp4,video/webm",
};

export function MediaUpload({
  value,
  onChange,
  disabled = false,
  className,
  mediaType = "image",
  aspectRatio = "cover",
  label,
}: MediaUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { upload, isUploading } = useAdminUpload({
    onSuccess: (result) => onChange(result.url),
  });

  const { openFilePicker, filesContent, clear } = useFilePicker({
    accept: acceptTypes[mediaType],
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

  const media = value || filesContent[0]?.content;
  const config = aspectRatioConfig[aspectRatio];
  const isVideo = mediaType === "video";

  const renderPreview = () => {
    if (!media) return null;

    if (isVideo) {
      return (
        <video
          className="size-full object-cover"
          controls
          muted
          ref={videoRef}
          src={media}
        />
      );
    }

    return <img alt="Preview" className="size-full object-cover" src={media} />;
  };

  return (
    <div className={cn("relative", config.width, className)}>
      {label && (
        <span className="mb-1.5 block font-medium text-muted-foreground text-xs">
          {label}
        </span>
      )}
      <button
        className={cn(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-input border-dashed bg-muted/30 transition-colors",
          "hover:border-primary hover:bg-muted/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          config.width
        )}
        disabled={disabled || isUploading}
        onClick={handleClick}
        style={{ aspectRatio: config.ratio }}
        type="button"
      >
        {media ? (
          renderPreview()
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <span
              className={cn(
                "size-8",
                isVideo ? "i-hugeicons-video-02" : "i-hugeicons-image-upload"
              )}
            />
            <span className="text-xs">
              {isVideo ? "Upload video" : "Upload image"}
            </span>
          </div>
        )}

        {/* Overlay for uploading or hover */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
            isUploading ? "opacity-100" : "opacity-0",
            !(disabled || isUploading) && media && "group-hover:opacity-100"
          )}
        >
          {isUploading ? (
            <Spinner className="size-8 text-white" />
          ) : (
            <span className="i-hugeicons-upload-04 size-8 text-white" />
          )}
        </div>
      </button>

      {/* Remove button */}
      {media && !disabled && !isUploading && (
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
