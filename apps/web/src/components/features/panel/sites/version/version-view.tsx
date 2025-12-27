import { Button } from "@/components/ui/button";

interface VersionViewData {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
}

interface VersionViewProps {
  value: VersionViewData;
}

interface MediaPreviewProps {
  src: string;
  alt: string;
  className?: string;
  type: "image" | "video";
}

function MediaPreview({ src, alt, className, type }: MediaPreviewProps) {
  const handlePreview = () => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group relative">
      {type === "image" ? (
        <img alt={alt} className={className} src={src} />
      ) : (
        <video className={className} controls src={src} />
      )}
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          className="border-background/30 hover:border-background/70"
          onClick={handlePreview}
          size="icon-sm"
          variant="default"
        >
          <span className="i-hugeicons-chat-preview-01 size-4" />
        </Button>
      </div>
    </div>
  );
}

export function VersionView({ value }: VersionViewProps) {
  return (
    <div className="space-y-6">
      {/* OG Image */}
      {value.siteOG && (
        <div>
          <h4 className="mb-2 font-medium text-muted-foreground text-xs">
            OG Image
          </h4>
          <MediaPreview
            alt="Open Graph preview"
            className="max-w-xs rounded-lg object-cover"
            src={value.siteOG}
            type="image"
          />
        </div>
      )}

      {/* Web Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Web Version</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Web Cover */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Web Cover
            </span>
            {value.webCover ? (
              <MediaPreview
                alt="Web cover preview"
                className="aspect-video w-full rounded-lg object-cover"
                src={value.webCover}
                type="image"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No cover</span>
              </div>
            )}
          </div>

          {/* Web Recording */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Web Recording
            </span>
            {value.webRecord ? (
              <MediaPreview
                alt="Web recording"
                className="aspect-video w-full rounded-lg object-cover"
                src={value.webRecord}
                type="video"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No video</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Mobile Version</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Mobile Cover */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Mobile Cover
            </span>
            {value.mobileCover ? (
              <MediaPreview
                alt="Mobile cover preview"
                className="aspect-9/16 w-32 rounded-lg object-cover"
                src={value.mobileCover}
                type="image"
              />
            ) : (
              <div className="flex aspect-9/16 w-32 items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No cover</span>
              </div>
            )}
          </div>

          {/* Mobile Recording */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Mobile Recording
            </span>
            {value.mobileRecord ? (
              <MediaPreview
                alt="Mobile recording"
                className="aspect-9/16 w-32 rounded-lg object-cover"
                src={value.mobileRecord}
                type="video"
              />
            ) : (
              <div className="flex aspect-9/16 w-32 items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No video</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
