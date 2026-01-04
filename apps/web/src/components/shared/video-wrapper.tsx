import { useCallback, useEffect, useRef } from "react";
import {
  getCFVideoUrlByPreset,
  type VideoPreset,
} from "@/components/ui/cf-video";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

export type VideoLoadingState = "idle" | "loading" | "loaded" | "error";

export interface VideoWrapperProps {
  className?: string;
  src?: string | null;
  cover: string;
  preset?: VideoPreset;
  ref?: React.Ref<HTMLVideoElement>;
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onDurationChange?: (duration: number) => void;
  onLoadingStateChange?: (state: VideoLoadingState) => void;
  onLoop?: () => void;
}

export function VideoWrapper({
  className,
  src,
  cover,
  preset,
  ref,
  playing,
  onPlayingChange,
  onDurationChange,
  onLoadingStateChange,
  onLoop,
}: VideoWrapperProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) ?? internalRef;

  // Apply video transformations if preset is provided
  const videoSrc = preset ? getCFVideoUrlByPreset(src, preset) : src;

  const inView = useIntersectionObserver(videoRef, {
    rootMargin: "50% 0px 50% 0px",
    threshold: 0,
  });

  const isControlled = playing !== undefined;

  // Handle intersection-based playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!inView) {
      // Always pause when out of view
      video.pause();
      return;
    }

    // In view behavior depends on mode
    if (isControlled) {
      // Controlled mode: follow playing prop
      if (playing) {
        video.play();
      } else {
        video.pause();
      }
    } else {
      // Uncontrolled mode: auto-play when in view
      video.play();
    }
  }, [inView, isControlled, playing, videoRef]);

  // Event handlers
  const handlePlay = useCallback(() => {
    onPlayingChange?.(true);
  }, [onPlayingChange]);

  const handlePause = useCallback(() => {
    onPlayingChange?.(false);
  }, [onPlayingChange]);

  const handleEnded = useCallback(() => {
    onPlayingChange?.(false);
  }, [onPlayingChange]);

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      onDurationChange?.(video.duration);
    },
    [onDurationChange]
  );

  const handleLoadStart = useCallback(() => {
    onLoadingStateChange?.("loading");
  }, [onLoadingStateChange]);

  const handleCanPlay = useCallback(() => {
    onLoadingStateChange?.("loaded");
  }, [onLoadingStateChange]);

  const handleError = useCallback(() => {
    onLoadingStateChange?.("error");
  }, [onLoadingStateChange]);

  // Detect video loop by checking if seeked back to start
  const handleSeeked = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      // When video loops, it seeks back to near 0
      if (video.currentTime < 0.1) {
        onLoop?.();
      }
    },
    [onLoop]
  );

  return (
    <video
      aria-label="Video player"
      autoPlay={false}
      className={cn("block w-full", className)}
      loop
      muted
      onCanPlay={handleCanPlay}
      onEnded={handleEnded}
      onError={handleError}
      onLoadedMetadata={handleLoadedMetadata}
      onLoadStart={handleLoadStart}
      onPause={handlePause}
      onPlay={handlePlay}
      onSeeked={handleSeeked}
      playsInline
      poster={cover}
      preload="none"
      ref={videoRef}
    >
      <source src={videoSrc ?? undefined} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
