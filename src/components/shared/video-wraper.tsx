import { cn } from "@/lib/utils";

interface VideoWrapper extends React.ComponentPropsWithoutRef<"video"> {}

export const VideoWrapper = ({ className, src }: VideoWrapper) => {
  return (
    <video
      className={cn("block w-full", className)}
      autoPlay
      loop
      muted
      playsInline
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};
