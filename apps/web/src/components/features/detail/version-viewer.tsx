import type { HTMLAttributes } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircularProgressButton } from "@/components/shared/circular-progress-button";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { CFImage, getCFImageUrlByPreset } from "@/components/ui/cf-image";
import type { VideoPreset } from "@/components/ui/cf-video";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Version {
  id: string;
  webCover: string;
  webRecord?: string | null;
  mobileCover?: string | null;
  mobileRecord?: string | null;
}

interface MarkerItem {
  id: string;
  sequence: number;
  time: number;
  text: string | null;
}

interface VersionViewerProps extends HTMLAttributes<HTMLDivElement> {
  version: Version;
  viewMode: "web" | "mobile";
  hasMobileContent: boolean;
  markers?: MarkerItem[];
  showMarkers?: boolean;
  showShortcuts?: boolean;
  onViewModeChange: (mode: "web" | "mobile") => void;
}

export function VersionViewer({
  version,
  viewMode,
  hasMobileContent,
  markers = [],
  showMarkers = false,
  showShortcuts = false,
  onViewModeChange,
  className,
  ...props
}: VersionViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Get current content based on view mode
  const cover = viewMode === "mobile" ? version.mobileCover : version.webCover;
  const record =
    viewMode === "mobile" ? version.mobileRecord : version.webRecord;
  const videoPreset: VideoPreset =
    viewMode === "mobile" ? "mobileRecord" : "webRecord";

  const hasVideo = Boolean(record);

  const sortedMarkers = useMemo(
    () => [...markers].sort((a, b) => a.sequence - b.sequence),
    [markers]
  );

  // Reset state when version or viewMode changes
  // Don't reset duration - let onLoadedMetadata update it naturally
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, [version.id, viewMode]);

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
    if (!sortedMarkers.length) return null;
    const active = [...sortedMarkers]
      .reverse()
      .find((marker) => marker.time <= currentTime);
    return active?.id ?? null;
  }, [sortedMarkers, currentTime]);

  useEffect(() => {
    if (!(hasVideo && showShortcuts)) return;
    const shouldIgnoreTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (target.isContentEditable) return true;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreTarget(e.target)) return;
      if (e.key === " ") {
        e.preventDefault();
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSeekBy(e.shiftKey ? -10 : -1);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSeekBy(e.shiftKey ? 10 : 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasVideo, showShortcuts, handleSeekBy]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showMarkersPanel = showMarkers && hasVideo && sortedMarkers.length > 0;

  return (
    <div className={cn("relative", className)} {...props}>
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
        <div className="flex rounded-lg bg-background/80 p-1 shadow-sm backdrop-blur-sm">
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              viewMode === "web"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("web")}
            title="Web view"
            type="button"
          >
            <span className="i-hugeicons-computer" />
          </button>
          {hasMobileContent && (
            <button
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                viewMode === "mobile"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onViewModeChange("mobile")}
              title="Mobile view"
              type="button"
            >
              <span className="i-hugeicons-smart-phone-01" />
            </button>
          )}
        </div>

        {/* Progress button - right (only for video) */}
        {hasVideo && (
          <CircularProgressButton
            iconClassName="text-xs"
            onClick={handleTogglePlay}
            playing={playing}
            progress={progress}
            size={28}
          />
        )}
      </div>

      <div className="flex items-stretch gap-6">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Content */}
          <div
            className={cn(
              "mx-auto overflow-hidden rounded-lg shadow-lg",
              viewMode === "mobile" ? "max-w-xs" : "w-full"
            )}
          >
            {hasVideo ? (
              <VideoWrapper
                className={cn(
                  "w-full",
                  viewMode === "mobile" ? "aspect-9/16" : "aspect-3420/1962"
                )}
                cover={
                  getCFImageUrlByPreset(
                    cover,
                    viewMode === "mobile" ? "mobileCover" : "webCover"
                  ) ?? ""
                }
                key={`${version.id}-${viewMode}`}
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
                className={cn(
                  "w-full",
                  viewMode === "mobile" ? "aspect-9/16" : "aspect-3420/1962"
                )}
                preset={viewMode === "mobile" ? "mobileCover" : "webCover"}
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
              Markers ({sortedMarkers.length})
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {sortedMarkers.map((marker) => (
                <Tooltip key={marker.id}>
                  <TooltipTrigger
                    render={
                      <button
                        className={cn(
                          "w-full truncate rounded-md px-2 py-1 text-left text-sm transition-colors",
                          marker.id === activeMarkerId
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/60"
                        )}
                        onClick={() => handleSeekTo(marker.time, true)}
                        type="button"
                      />
                    }
                  >
                    {marker.text || "No description"}
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {marker.time.toFixed(1)}s
                  </TooltipContent>
                </Tooltip>
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
    </div>
  );
}
