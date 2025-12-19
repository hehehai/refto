import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

interface VideoWrapper {
  className?: string;
  src?: string | null;
  cover: string;
  height?: string | number;
  width?: string | number;
}

export const VideoWrapper = ({ className, src, cover }: VideoWrapper) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useIntersectionObserver(videoRef, {
    rootMargin: "50% 0px 50% 0px",
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [inView]);

  return (
    <video
      aria-label="Video player"
      autoPlay={false}
      className={cn("block w-full", className)}
      loop
      muted
      playsInline
      poster={cover}
      preload="none"
      ref={videoRef}
    >
      <source src={src ?? undefined} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};
