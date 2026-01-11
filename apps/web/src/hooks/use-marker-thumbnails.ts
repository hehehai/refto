import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type { MarkerVideoPlayerHandle } from "@/components/features/panel/sites/version/marker-video-player";

interface MarkerThumbnailInput {
  id: string;
  time: number;
}

interface UseMarkerThumbnailsOptions {
  markers: MarkerThumbnailInput[];
  videoRef: RefObject<MarkerVideoPlayerHandle | null>;
  enabled?: boolean;
}

export function useMarkerThumbnails({
  markers,
  videoRef,
  enabled = true,
}: UseMarkerThumbnailsOptions) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const isCapturingRef = useRef(false);

  useEffect(() => {
    if (!(enabled && videoRef.current) || isCapturingRef.current) return;

    const missing = markers.filter((marker) => !thumbnails[marker.id]);
    if (missing.length === 0) return;

    isCapturingRef.current = true;
    let cancelled = false;

    const captureMissing = async () => {
      const nextThumbnails: Record<string, string> = {};
      for (const marker of missing) {
        if (cancelled || !videoRef.current) break;
        const time = Math.max(0.01, marker.time);
        const thumbnail = await videoRef.current.captureFrameAt(time);
        if (thumbnail) {
          nextThumbnails[marker.id] = thumbnail;
        }
      }

      if (!cancelled && Object.keys(nextThumbnails).length > 0) {
        setThumbnails((prev) => ({ ...prev, ...nextThumbnails }));
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
  }, [enabled, markers, thumbnails, videoRef]);

  return { thumbnails };
}
