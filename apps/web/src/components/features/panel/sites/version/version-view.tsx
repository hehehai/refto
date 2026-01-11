import { Bookmark02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { skipToken, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";
import { videoMarkerDetailDialog } from "@/lib/sheets";
import { cn } from "@/lib/utils";

interface VersionViewData {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
}

interface VersionViewProps {
  value: VersionViewData;
  versionId: string;
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

export function VersionView({ value, versionId }: VersionViewProps) {
  const { data: webMarkers = [] } = useQuery(
    orpc.panel.marker.list.queryOptions({
      input:
        value.webRecord && versionId
          ? { versionId, recordType: "web" }
          : skipToken,
    })
  );
  const { data: mobileMarkers = [] } = useQuery(
    orpc.panel.marker.list.queryOptions({
      input:
        value.mobileRecord && versionId
          ? { versionId, recordType: "mobile" }
          : skipToken,
    })
  );
  const hasWebMarkers = webMarkers.length > 0;
  const hasMobileMarkers = mobileMarkers.length > 0;

  const handleOpenMarkerDialog = (
    recordType: "web" | "mobile",
    videoUrl: string | null,
    coverUrl: string | null
  ) => {
    if (!videoUrl) return;
    videoMarkerDetailDialog.openWithPayload({
      versionId,
      recordType,
      videoUrl,
      coverUrl: coverUrl ?? "",
    });
  };

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
            <div className="mb-2 flex items-center justify-between text-muted-foreground text-xs">
              <span>Web Recording</span>
              {value.webRecord && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        className={cn(
                          "h-6 px-1.5",
                          hasWebMarkers && "text-primary ring-1 ring-primary/40"
                        )}
                        onClick={() =>
                          handleOpenMarkerDialog(
                            "web",
                            value.webRecord,
                            value.webCover
                          )
                        }
                        size="icon-xs"
                        variant="secondary"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Bookmark02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasWebMarkers ? "Markers set" : "View markers"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
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
            <div className="mb-2 flex items-center justify-between text-muted-foreground text-xs">
              <span>Mobile Recording</span>
              {value.mobileRecord && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        className={cn(
                          "h-6 px-1.5",
                          hasMobileMarkers &&
                            "text-primary ring-1 ring-primary/40"
                        )}
                        onClick={() =>
                          handleOpenMarkerDialog(
                            "mobile",
                            value.mobileRecord,
                            value.mobileCover
                          )
                        }
                        size="icon-xs"
                        variant="secondary"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Bookmark02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasMobileMarkers ? "Markers set" : "View markers"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
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
