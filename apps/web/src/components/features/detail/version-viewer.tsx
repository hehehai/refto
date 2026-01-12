import type { HTMLAttributes } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CircularProgressButton } from "@/components/shared/circular-progress-button";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { CFImage, getCFImageUrlByPreset } from "@/components/ui/cf-image";
import {
  getCFVideoUrlByPreset,
  type VideoPreset,
} from "@/components/ui/cf-video";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDownload } from "@/hooks/use-download";
import { cn } from "@/lib/utils";
import {
  MarkerVideoPlayer,
  type MarkerVideoPlayerHandle,
} from "../panel/sites/version/marker-video-player";

interface Version {
  id: string;
  webCover: string;
  webRecord?: string | null;
}

interface MarkerItem {
  id: string;
  time: number;
  text: string | null;
}

interface VersionViewerProps extends HTMLAttributes<HTMLDivElement> {
  version: Version;
  markers?: MarkerItem[];
  showMarkers?: boolean;
  showShortcuts?: boolean;
  focusMarkerTime?: number;
  onMarkerSelect?: (markerId: string) => void;
}

export function VersionViewer({
  version,
  markers = [],
  showMarkers = false,
  showShortcuts = false,
  focusMarkerTime,
  onMarkerSelect,
  className,
  ...props
}: VersionViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<MarkerVideoPlayerHandle>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const { download } = useDownload();

  // Get current content based on view mode
  const cover = version.webCover;
  const record = version.webRecord;
  const videoPreset: VideoPreset = "webRecord";
  const captureSrc = useMemo(
    () => getCFVideoUrlByPreset(record, videoPreset),
    [record, videoPreset]
  );

  const hasVideo = Boolean(record);

  const orderedMarkers = useMemo(
    () =>
      [...markers].sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.id.localeCompare(b.id);
      }),
    [markers]
  );

  // Reset state when version changes
  // Don't reset duration - let onLoadedMetadata update it naturally
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, [version.id]);

  const handleLoop = useCallback(() => {
    setCurrentTime(0);
  }, []);

  const handleTogglePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleTimeUpdate = useCallback((nextTime: number) => {
    setCurrentTime(nextTime);
  }, []);

  const handleSeekTo = useCallback((time: number, shouldPause?: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
    if (shouldPause) {
      video.pause();
    }
  }, []);

  useEffect(() => {
    if (focusMarkerTime === undefined || focusMarkerTime === null) return;
    if (!hasVideo) return;
    handleSeekTo(focusMarkerTime, true);
  }, [focusMarkerTime, handleSeekTo, hasVideo]);

  const handleSeekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const nextTime = Math.min(
        Math.max(0, video.currentTime + delta),
        Number.isFinite(duration) ? duration : video.currentTime + delta
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const activeMarkerId = useMemo(() => {
    if (!orderedMarkers.length) return null;
    const active = [...orderedMarkers]
      .reverse()
      .find((marker) => marker.time <= currentTime);
    return active?.id ?? null;
  }, [orderedMarkers, currentTime]);

  const captureFrameAt = useCallback(async (time: number) => {
    if (captureRef.current) {
      return captureRef.current.captureFrameAt(time);
    }

    const video = videoRef.current;
    if (!video) return null;

    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const handleLoaded = () => resolve();
        video.addEventListener("loadeddata", handleLoaded, { once: true });
      });
    }

    if (video.readyState < 2) return null;

    const wasPlaying = !video.paused;
    const previousTime = video.currentTime;

    if (wasPlaying) {
      video.pause();
    }

    if (Math.abs(video.currentTime - time) > 0.01) {
      await new Promise<void>((resolve) => {
        const handleSeeked = () => resolve();
        video.addEventListener("seeked", handleSeeked, { once: true });
        video.currentTime = time;
      });
    }

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    video.currentTime = previousTime;
    if (wasPlaying) {
      video.play();
    }
    setCurrentTime(previousTime);

    try {
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch {
      return null;
    }
  }, []);

  const handleDownloadMarker = useCallback(
    async (marker: MarkerItem, markerNumber: number) => {
      const captureTime = marker.time === 0 ? 0.01 : marker.time;
      const dataUrl = await captureFrameAt(captureTime);
      if (!dataUrl) return;
      const filename = `marker-${markerNumber}-${marker.time.toFixed(1)}s.jpg`;
      download({ dataUrl, filename });
    },
    [captureFrameAt, download]
  );

  const hotkeyOptions = {
    enabled: hasVideo && showShortcuts,
    enableOnFormTags: false,
    enableOnContentEditable: false,
    preventDefault: true,
  };

  useHotkeys(
    "space",
    () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    },
    hotkeyOptions,
    [hasVideo, showShortcuts]
  );

  useHotkeys(
    "left",
    (event) => {
      if (event.shiftKey) return;
      handleSeekBy(-1);
    },
    hotkeyOptions,
    [handleSeekBy, hasVideo, showShortcuts]
  );

  useHotkeys("shift+left", () => handleSeekBy(-10), hotkeyOptions, [
    handleSeekBy,
    hasVideo,
    showShortcuts,
  ]);

  useHotkeys(
    "right",
    (event) => {
      if (event.shiftKey) return;
      handleSeekBy(1);
    },
    hotkeyOptions,
    [handleSeekBy, hasVideo, showShortcuts]
  );

  useHotkeys("shift+right", () => handleSeekBy(10), hotkeyOptions, [
    handleSeekBy,
    hasVideo,
    showShortcuts,
  ]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showMarkersPanel = showMarkers && hasVideo && orderedMarkers.length > 0;

  return (
    <div className={cn("relative", className)} {...props}>
      {hasVideo && (
        <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-end">
          <CircularProgressButton
            iconClassName="text-xs"
            onClick={handleTogglePlay}
            playing={playing}
            progress={progress}
            size={28}
          />
        </div>
      )}

      <div className="flex items-stretch gap-6">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Content */}
          <div className="mx-auto w-full overflow-hidden rounded-lg shadow-lg">
            {hasVideo ? (
              <VideoWrapper
                className="aspect-3420/1962 w-full"
                cover={getCFImageUrlByPreset(cover, "webCover") ?? ""}
                crossOrigin="anonymous"
                key={version.id}
                onDurationChange={setDuration}
                onLoop={handleLoop}
                onPlayingChange={setPlaying}
                onTimeUpdate={handleTimeUpdate}
                preset={videoPreset}
                ref={videoRef}
                src={record}
              />
            ) : cover ? (
              <CFImage
                alt="Page screenshot"
                className="aspect-3420/1962 w-full"
                preset="webCover"
                src={cover}
              />
            ) : (
              <div className="flex aspect-3420/1962 items-center justify-center bg-muted text-muted-foreground">
                <span className="i-hugeicons-image-not-found-01 text-4xl" />
              </div>
            )}
          </div>
        </div>

        {showMarkersPanel && (
          <div className="flex w-56 shrink-0 flex-col rounded-lg border bg-background/60 p-3">
            <div className="mb-2 font-medium text-muted-foreground text-xs">
              Markers ({orderedMarkers.length})
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {orderedMarkers.map((marker, index) => (
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-md px-2 py-1 transition-colors",
                    marker.id === activeMarkerId
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/60"
                  )}
                  key={marker.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("[data-marker-download]")) return;
                    onMarkerSelect?.(marker.id);
                    handleSeekTo(marker.time, true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onMarkerSelect?.(marker.id);
                      handleSeekTo(marker.time, true);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Tooltip>
                    <TooltipTrigger className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {marker.text || "No description"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {marker.time.toFixed(1)}s
                    </TooltipContent>
                  </Tooltip>
                  <button
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    data-marker-download
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownloadMarker(marker, index + 1);
                    }}
                    type="button"
                  >
                    <span className="i-hugeicons-download-01 size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showShortcuts && hasVideo && (
        <div className="mt-3 text-muted-foreground text-xs">
          Space: Play/Pause · ←/→: Seek 1s · Shift+←/→: Seek 10s
        </div>
      )}

      {hasVideo && (
        <div className="pointer-events-none h-0 w-0 overflow-hidden">
          <MarkerVideoPlayer
            className="h-0 w-0"
            cover={cover ?? ""}
            ref={captureRef}
            src={captureSrc}
          />
        </div>
      )}
    </div>
  );
}
