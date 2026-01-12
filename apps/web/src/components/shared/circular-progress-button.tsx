import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PauseIcon } from "./icons/pause";
import { PlayIcon } from "./icons/play";

interface CircularProgressButtonProps {
  playing: boolean;
  progress: number;
  size?: number;
  strokeWidth?: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  iconClassName?: string;
}

export function CircularProgressButton({
  playing,
  progress,
  size = 20,
  strokeWidth = 2,
  onClick,
  className,
  iconClassName,
}: CircularProgressButtonProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const prevProgressRef = useRef(progress);
  const [skipTransition, setSkipTransition] = useState(false);

  // Detect when progress resets (loops back to start)
  useEffect(() => {
    const prevProgress = prevProgressRef.current;
    // If progress drops significantly (e.g., from near end to near start), skip transition
    if (prevProgress > 50 && progress < 10) {
      setSkipTransition(true);
    } else if (skipTransition) {
      // Re-enable transition on the next normal progress update
      setSkipTransition(false);
    }
    prevProgressRef.current = progress;
  }, [progress, skipTransition]);

  return (
    <button
      aria-label={playing ? "Pause" : "Play"}
      className={cn(
        "relative flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/60",
        className
      )}
      onClick={onClick}
      style={{ width: size, height: size }}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
        height={size}
        width={size}
      >
        <circle
          className="text-white/30"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn(
            "text-white",
            !skipTransition && "transition-[stroke-dashoffset] duration-100"
          )}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <span
        className={cn(
          "relative z-10 flex items-center justify-center text-[10px]",
          iconClassName
        )}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </span>
    </button>
  );
}
