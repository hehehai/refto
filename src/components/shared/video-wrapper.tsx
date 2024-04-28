import { cn } from "@/lib/utils";

interface VideoWrapper extends React.ComponentPropsWithoutRef<"video"> {
  cover: string;
}

export const VideoWrapper = ({ className, src, cover }: VideoWrapper) => {
  return (
    <video
      className={cn("block w-full", className)}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      aria-label="Video player"
      poster={cover}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};
