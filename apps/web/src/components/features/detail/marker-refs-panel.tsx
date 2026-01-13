import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MarkerRefItem } from "@/components/features/detail/marker-ref-item";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { useDownload } from "@/hooks/use-download";
import { useMarkerThumbnails } from "@/hooks/use-marker-thumbnails";
import { buildMarkerFilename } from "@/lib/markers";
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
  isSelectionMode?: boolean;
  selectedMarkerIds?: string[];
  onSelectedMarkersChange?: Dispatch<SetStateAction<string[]>>;
  downloadSelectedMarkersRef?: { current: (() => void) | null };
}

export function MarkerRefsPanel({
  markers,
  videoUrl,
  coverUrl,
  siteTitle,
  pageTitle,
  isSelectionMode = false,
  selectedMarkerIds = [],
  onSelectedMarkersChange,
  downloadSelectedMarkersRef,
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
  const markerById = useMemo(() => {
    const map = new Map<string, MarkerState>();
    for (const marker of orderedMarkers) {
      map.set(marker.id, marker);
    }
    return map;
  }, [orderedMarkers]);

  const markerNumberById = useMemo(() => {
    const map = new Map<string, number>();
    orderedMarkers.forEach((marker, index) => {
      map.set(marker.id, index + 1);
    });
    return map;
  }, [orderedMarkers]);

  const selectedMarkerSet = useMemo(
    () => new Set(selectedMarkerIds),
    [selectedMarkerIds]
  );

  const handleDurationChange = useCallback((nextDuration: number) => {
    if (nextDuration > 0) {
      setIsVideoReady(true);
    }
  }, []);

  const handleMarkerSelectionToggle = useCallback(
    (markerId: string) => {
      if (!onSelectedMarkersChange) return;
      onSelectedMarkersChange((prev) => {
        const selection = new Set(prev);
        if (selection.has(markerId)) {
          selection.delete(markerId);
        } else {
          selection.add(markerId);
        }
        return Array.from(selection);
      });
    },
    [onSelectedMarkersChange]
  );

  useEffect(() => {
    if (!downloadSelectedMarkersRef) return;
    const handler = () => {
      if (!selectedMarkerIds.length) return;
      for (const markerId of selectedMarkerIds) {
        const marker = markerById.get(markerId);
        const thumbnail = thumbnails[markerId];
        const markerNumber = markerNumberById.get(markerId);
        if (!(marker && thumbnail) || markerNumber === undefined) return;
        download({
          dataUrl: thumbnail,
          filename: buildMarkerFilename({
            markerNumber,
            markerTime: marker.time,
            markerTitle: marker.text,
            siteTitle,
            pageTitle,
          }),
        });
      }
    };
    downloadSelectedMarkersRef.current = handler;
    return () => {
      if (downloadSelectedMarkersRef.current === handler) {
        downloadSelectedMarkersRef.current = null;
      }
    };
  }, [
    download,
    downloadSelectedMarkersRef,
    markerById,
    markerNumberById,
    pageTitle,
    selectedMarkerIds,
    siteTitle,
    thumbnails,
  ]);

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
              filename: buildMarkerFilename({
                markerNumber,
                markerTime: marker.time,
                markerTitle: marker.text,
                siteTitle,
                pageTitle,
              }),
            });
          };

          return (
            <MarkerRefItem
              isSelectable={isSelectionMode}
              isSelected={selectedMarkerSet.has(marker.id)}
              key={marker.id}
              markerNumber={markerNumber}
              markerText={marker.text}
              markerTime={marker.time}
              onDownload={
                thumbnail
                  ? () =>
                      download({
                        dataUrl: thumbnail,
                        filename: buildMarkerFilename({
                          markerNumber,
                          markerTime: marker.time,
                          markerTitle: marker.text,
                          siteTitle,
                          pageTitle,
                        }),
                      })
                  : undefined
              }
              onOpenPreview={
                !isSelectionMode && thumbnail ? handleOpenPreview : undefined
              }
              onToggleSelect={
                isSelectionMode
                  ? () => handleMarkerSelectionToggle(marker.id)
                  : undefined
              }
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
