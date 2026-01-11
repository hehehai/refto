import { useCallback, useRef, useState } from "react";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { ImagePreviewDialog } from "@/components/shared/image-preview-dialog";
import { useDownload } from "@/hooks/use-download";
import { useMarkerThumbnails } from "@/hooks/use-marker-thumbnails";
import { imagePreviewDialog } from "@/lib/sheets";
import { formatTimeShortWithMs } from "@/lib/time";
import { cn } from "@/lib/utils";
import {
  MarkerVideoPlayer,
  type MarkerVideoPlayerHandle,
} from "../panel/sites/version/marker-video-player";

interface MarkerState {
  id: string;
  sequence: number;
  time: number;
  text: string | null;
  thumbnail?: string;
}

interface MarkerRefsPanelProps {
  markers: MarkerState[];
  videoUrl: string | null;
  coverUrl: string | null;
}

export function MarkerRefsPanel({
  markers,
  videoUrl,
  coverUrl,
}: MarkerRefsPanelProps) {
  const videoRef = useRef<MarkerVideoPlayerHandle>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { download } = useDownload();
  const { thumbnails } = useMarkerThumbnails({
    enabled: isVideoReady,
    markers,
    videoRef,
  });

  const handleDurationChange = useCallback((nextDuration: number) => {
    if (nextDuration > 0) {
      setIsVideoReady(true);
    }
  }, []);

  if (!videoUrl) {
    return (
      <EmptyPlaceholder
        className="flex-1"
        description="No recording available"
        icon="i-hugeicons-video-02"
      />
    );
  }

  if (markers.length === 0) {
    return (
      <EmptyPlaceholder
        className="flex-1"
        description="No markers available"
        icon="i-hugeicons-bookmark-01"
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {markers.map((marker) => {
          const thumbnail = thumbnails[marker.id];
          return (
            <div
              className="flex flex-col gap-2 rounded-lg border p-3"
              key={marker.id}
            >
              <div
                className="group relative aspect-video w-full overflow-hidden rounded-md bg-muted"
                onClick={() => {
                  if (!thumbnail) return;
                  const title = marker.text
                    ? `${marker.text} · ${formatTimeShortWithMs(marker.time)}`
                    : `Marker ${marker.sequence} · ${formatTimeShortWithMs(
                        marker.time
                      )}`;
                  imagePreviewDialog.openWithPayload({
                    src: thumbnail,
                    alt: `Marker ${marker.sequence}`,
                    title,
                    filename: `marker-${marker.sequence}-${marker.time.toFixed(
                      1
                    )}s.jpg`,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (thumbnail) {
                      const title = marker.text
                        ? `${marker.text} · ${formatTimeShortWithMs(marker.time)}`
                        : `Marker ${marker.sequence} · ${formatTimeShortWithMs(
                            marker.time
                          )}`;
                      imagePreviewDialog.openWithPayload({
                        src: thumbnail,
                        alt: `Marker ${marker.sequence}`,
                        title,
                        filename: `marker-${marker.sequence}-${marker.time.toFixed(
                          1
                        )}s.jpg`,
                      });
                    }
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {thumbnail ? (
                  <img
                    alt={`Marker ${marker.sequence}`}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                    src={thumbnail}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted/60">
                    <div className="h-10 w-16 animate-pulse rounded bg-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 left-2 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] text-background">
                  #{marker.sequence}
                </div>
                {thumbnail && (
                  <button
                    className="absolute top-2 right-2 rounded bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      download({
                        dataUrl: thumbnail,
                        filename: `marker-${marker.sequence}-${marker.time.toFixed(
                          1
                        )}s.jpg`,
                      });
                    }}
                    type="button"
                  >
                    <span className="i-hugeicons-download-01 size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-muted-foreground text-xs">
                  {formatTimeShortWithMs(marker.time)}
                </span>
                <span
                  className={cn(
                    "truncate text-muted-foreground text-xs",
                    !marker.text && "italic"
                  )}
                >
                  {marker.text || "No description"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none h-0 w-0 overflow-hidden">
        <MarkerVideoPlayer
          className="h-0 w-0"
          cover={coverUrl ?? ""}
          onDurationChange={handleDurationChange}
          ref={videoRef}
          src={videoUrl}
        />
      </div>

      <ImagePreviewDialog />
    </div>
  );
}
