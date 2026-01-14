import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";

interface UseVideoPlayerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  hasVideo: boolean;
  autoPlay: boolean;
}

interface SeekOptions {
  pause?: boolean;
}

export function useVideoPlayer({
  videoRef,
  hasVideo,
  autoPlay,
}: UseVideoPlayerOptions) {
  const [playing, setPlaying] = useState(autoPlay);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!hasVideo) {
      setPlaying(false);
      return;
    }
    setPlaying(autoPlay);
  }, [autoPlay, hasVideo]);

  const seekTo = useCallback(
    async (time: number, options: SeekOptions = {}) => {
      setCurrentTime(time);
      const video = videoRef.current;
      if (!video) return;

      const applySeek = (target: HTMLVideoElement) => {
        const limit =
          Number.isFinite(target.duration) && target.duration > 0
            ? target.duration
            : time;
        const clamped = Math.max(0, Math.min(time, limit));
        target.currentTime = clamped;
        setCurrentTime(clamped);
        if (options.pause) {
          target.pause();
          setPlaying(false);
        }
      };

      if (video.readyState >= 1) {
        applySeek(video);
        return;
      }

      await new Promise<void>((resolve) => {
        const handleLoaded = () => {
          video.removeEventListener("loadedmetadata", handleLoaded);
          resolve();
        };
        video.addEventListener("loadedmetadata", handleLoaded, { once: true });
      }).catch(() => {
        // Swallow errors so callers can decide how to react.
      });

      if (!videoRef.current) return;
      applySeek(videoRef.current);
    },
    [videoRef]
  );

  return {
    playing,
    setPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    seekTo,
  };
}
