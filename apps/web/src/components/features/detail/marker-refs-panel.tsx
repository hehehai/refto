import { useCallback, useMemo, useRef, useState } from "react";
import { MarkerRefItem } from "@/components/features/detail/marker-ref-item";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { useDownload } from "@/hooks/use-download";
import { useMarkerThumbnails } from "@/hooks/use-marker-thumbnails";
import { imagePreviewDialog } from "@/lib/sheets";
import { formatTimeShortWithMs } from "@/lib/time";
import {
  MarkerVideoPlayer,
  type MarkerVideoPlayerHandle,
} from "../panel/sites/version/marker-video-player";

interface MarkerState {
  id: string;
  time: number;
  text: string | null;
  thumbnail?: string;
}

interface MarkerRefsPanelProps {
  markers: MarkerState[];
  videoUrl: string | null;
  coverUrl: string | null;
  siteTitle?: string | null;
  pageTitle?: string | null;
}

export function MarkerRefsPanel({
  markers,
  videoUrl,
  coverUrl,
  siteTitle,
  pageTitle,
}: MarkerRefsPanelProps) {
  const videoRef = useRef<MarkerVideoPlayerHandle>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { download } = useDownload();
  const { thumbnails } = useMarkerThumbnails({
    enabled: isVideoReady,
    markers,
    videoRef,
  });
  const orderedMarkers = useMemo(
    () =>
      [...markers].sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.id.localeCompare(b.id);
      }),
    [markers]
  );

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
        {orderedMarkers.map((marker, index) => {
          const thumbnail = thumbnails[marker.id];
          const markerNumber = index + 1;
          const handleOpenPreview = () => {
            if (!thumbnail) return;
            const markerLabel = marker.text
              ? `${marker.text} · ${formatTimeShortWithMs(marker.time)}`
              : `Marker ${markerNumber} · ${formatTimeShortWithMs(
                  marker.time
                )}`;
            const title = [siteTitle, pageTitle, markerLabel]
              .filter(Boolean)
              .join(" · ");
            imagePreviewDialog.openWithPayload({
              src: thumbnail,
              alt: `Marker ${markerNumber}`,
              title,
              filename: `marker-${markerNumber}-${marker.time.toFixed(1)}s.jpg`,
            });
          };

          return (
            <MarkerRefItem
              key={marker.id}
              markerNumber={markerNumber}
              markerText={marker.text}
              markerTime={marker.time}
              onDownload={
                thumbnail
                  ? () =>
                      download({
                        dataUrl: thumbnail,
                        filename: `marker-${markerNumber}-${marker.time.toFixed(
                          1
                        )}s.jpg`,
                      })
                  : undefined
              }
              onOpenPreview={thumbnail ? handleOpenPreview : undefined}
              thumbnail={thumbnail}
            />
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
    </div>
  );
}
