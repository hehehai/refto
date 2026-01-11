import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MarkerVideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  isPlaying: () => boolean;
  captureFrame: () => string | null;
  captureFrameAt: (time: number) => Promise<string | null>;
}

interface MarkerVideoPlayerProps {
  src: string;
  cover: string;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const MarkerVideoPlayer = forwardRef<
  MarkerVideoPlayerHandle,
  MarkerVideoPlayerProps
>(function MarkerVideoPlayer(
  {
    src,
    cover,
    className,
    onTimeUpdate,
    onDurationChange,
    onPlay,
    onPause,
    onEnded,
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureFrameSync = useCallback((video: HTMLVideoElement) => {
    if (video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current?.play();
    },
    pause: () => {
      videoRef.current?.pause();
    },
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    getDuration: () => videoRef.current?.duration ?? 0,
    isPlaying: () => (videoRef.current ? !videoRef.current.paused : false),
    captureFrame: () => {
      const video = videoRef.current;
      if (!video) return null;
      return captureFrameSync(video);
    },
    captureFrameAt: async (time: number) => {
      const video = videoRef.current;
      if (!video) return null;

      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const handleLoaded = () => resolve();
          video.addEventListener("loadeddata", handleLoaded, { once: true });
          video.load();
        });
      }

      if (video.readyState < 2) return null;

      const originalTime = video.currentTime;
      const shouldSeek = Math.abs(originalTime - time) > 0.001;

      if (shouldSeek) {
        await new Promise<void>((resolve) => {
          const handleSeeked = () => resolve();
          video.addEventListener("seeked", handleSeeked, { once: true });
          video.currentTime = time;
        });
      }

      const thumbnail = captureFrameSync(video);

      if (shouldSeek) {
        video.currentTime = originalTime;
      }

      return thumbnail;
    },
  }));

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      onTimeUpdate?.(e.currentTarget.currentTime);
    },
    [onTimeUpdate]
  );

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      onDurationChange?.(e.currentTarget.duration);
    },
    [onDurationChange]
  );

  return (
    <video
      className={cn("max-h-full max-w-full rounded-lg", className)}
      crossOrigin="anonymous"
      muted
      onEnded={onEnded}
      onLoadedMetadata={handleLoadedMetadata}
      onPause={onPause}
      onPlay={onPlay}
      onTimeUpdate={handleTimeUpdate}
      playsInline
      poster={cover}
      preload="metadata"
      ref={videoRef}
      src={src}
    >
      Your browser does not support the video tag.
    </video>
  );
});
