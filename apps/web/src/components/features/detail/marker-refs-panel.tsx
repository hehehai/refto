import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { ImagePreviewDialog } from "@/components/shared/image-preview-dialog";
import { useDownload } from "@/hooks/use-download";
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

function formatTimeShort(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
}

export function MarkerRefsPanel({
  markers: markerInput,
  videoUrl,
  coverUrl,
}: MarkerRefsPanelProps) {
  const videoRef = useRef<MarkerVideoPlayerHandle>(null);
  const [markers, setMarkers] = useState<MarkerState[]>([]);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const isCapturingRef = useRef(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const { download } = useDownload();

  useEffect(() => {
    const markerStates: MarkerState[] = markerInput.map((m) => ({
      id: m.id,
      sequence: m.sequence,
      time: m.time,
      text: m.text,
      thumbnail: undefined,
    }));
    setMarkers(markerStates);
    setIsVideoReady(false);
  }, [markerInput]);

  const handleDurationChange = useCallback((nextDuration: number) => {
    if (nextDuration > 0) {
      setIsVideoReady(true);
    }
  }, []);

  useEffect(() => {
    if (!(isVideoReady && videoRef.current) || isCapturingRef.current) return;
    const missing = markers.filter((marker) => !marker.thumbnail);
    if (missing.length === 0) return;

    isCapturingRef.current = true;
    let cancelled = false;

    const captureMissing = async () => {
      const thumbnails = new Map<string, string>();
      for (const marker of missing) {
        if (cancelled || !videoRef.current) break;
        const time = Math.max(0.01, marker.time);
        const thumbnail = await videoRef.current.captureFrameAt(time);
        if (thumbnail) {
          thumbnails.set(marker.id, thumbnail);
        }
      }

      if (!cancelled && thumbnails.size > 0) {
        setMarkers((prev) =>
          prev.map((marker) =>
            thumbnails.has(marker.id)
              ? { ...marker, thumbnail: thumbnails.get(marker.id) }
              : marker
          )
        );
      }

      if (!cancelled) {
        isCapturingRef.current = false;
      }
    };

    captureMissing();
    return () => {
      cancelled = true;
      isCapturingRef.current = false;
    };
  }, [markers, isVideoReady]);

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
        {markers.map((marker) => (
          <div
            className="flex flex-col gap-2 rounded-lg border p-3"
            key={marker.id}
          >
            <div
              className="group relative aspect-video w-full overflow-hidden rounded-md bg-muted"
              onClick={() =>
                marker.thumbnail && setPreviewSrc(marker.thumbnail)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (marker.thumbnail) {
                    setPreviewSrc(marker.thumbnail);
                  }
                }
              }}
              role="button"
              tabIndex={0}
            >
              {marker.thumbnail ? (
                <img
                  alt={`Marker ${marker.sequence}`}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                  src={marker.thumbnail}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted/60">
                  <div className="h-10 w-16 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              )}
              <div className="absolute top-2 left-2 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] text-background">
                #{marker.sequence}
              </div>
              {marker.thumbnail && (
                <button
                  className="absolute top-2 right-2 rounded bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    download({
                      dataUrl: marker.thumbnail ?? "",
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
                {formatTimeShort(marker.time)}
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
        ))}
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

      {previewSrc && (
        <ImagePreviewDialog
          alt="Marker frame preview"
          onOpenChange={(open) => !open && setPreviewSrc(null)}
          open={!!previewSrc}
          src={previewSrc}
          title="Marker frame"
        />
      )}
    </div>
  );
}
