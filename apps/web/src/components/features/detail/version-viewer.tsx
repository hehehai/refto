import type { HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircularProgressButton } from "@/components/shared/circular-progress-button";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { CFImage, getCFImageUrlByPreset } from "@/components/ui/cf-image";
import type { VideoPreset } from "@/components/ui/cf-video";
import { cn } from "@/lib/utils";

interface Version {
  id: string;
  webCover: string;
  webRecord?: string | null;
  mobileCover?: string | null;
  mobileRecord?: string | null;
}

interface VersionViewerProps extends HTMLAttributes<HTMLDivElement> {
  version: Version;
  viewMode: "web" | "mobile";
  hasMobileContent: boolean;
  onViewModeChange: (mode: "web" | "mobile") => void;
}

export function VersionViewer({
  version,
  viewMode,
  hasMobileContent,
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

  // Timer effect for progress tracking
  useEffect(() => {
    if (!playing || duration === 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= duration) {
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playing, duration]);

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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
              viewMode === "mobile" ? "aspect-[9/16]" : "aspect-[3420/1962]"
            )}
            cover={
              getCFImageUrlByPreset(
                cover,
                viewMode === "mobile" ? "mobileCover" : "webCover"
              ) ?? ""
            }
            onDurationChange={setDuration}
            onLoop={handleLoop}
            onPlayingChange={setPlaying}
            preset={videoPreset}
            ref={videoRef}
            src={record}
          />
        ) : cover ? (
          <CFImage
            alt="Page screenshot"
            className={cn(
              "w-full",
              viewMode === "mobile" ? "aspect-[9/16]" : "aspect-[3420/1962]"
            )}
            preset={viewMode === "mobile" ? "mobileCover" : "webCover"}
            src={cover}
          />
        ) : (
          <div className="flex aspect-[3420/1962] items-center justify-center bg-muted text-muted-foreground">
            <span className="i-hugeicons-image-not-found-01 text-4xl" />
          </div>
        )}
      </div>
    </div>
  );
}
