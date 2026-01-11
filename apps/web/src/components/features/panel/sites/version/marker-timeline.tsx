import { useCallback, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface MarkerState {
  id: string;
  sequence: number;
  time: number;
  text: string | null;
  thumbnail?: string;
}

interface MarkerTimelineProps {
  duration: number;
  currentTime: number;
  markers: MarkerState[];
  selectedMarkerId: string | null;
  onSelectMarker: (id: string) => void;
  onSeekToMarker: (id: string) => void;
  onSeek: (time: number) => void;
}

function formatTimeShort(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MarkerTimeline({
  duration,
  currentTime,
  markers,
  selectedMarkerId,
  onSelectMarker,
  onSeekToMarker,
  onSeek,
}: MarkerTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Local preview position during drag (percentage 0-100)
  const [previewPosition, setPreviewPosition] = useState<number | null>(null);

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!(trackRef.current && duration)) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * duration;
    },
    [duration]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      const time = getTimeFromPosition(e.clientX);
      // Set local preview position during drag
      setPreviewPosition((time / duration) * 100);
    },
    [getTimeFromPosition, duration]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(e.clientX);
      // Only update local preview, don't seek video yet
      setPreviewPosition((time / duration) * 100);
    },
    [isDragging, getTimeFromPosition, duration]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && previewPosition !== null) {
      // Only seek when mouse is released
      const time = (previewPosition / 100) * duration;
      onSeek(time);
    }
    setIsDragging(false);
    // Don't clear previewPosition immediately - let currentTime catch up first
    // The position will be updated naturally when currentTime changes
  }, [isDragging, previewPosition, duration, onSeek]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging && previewPosition !== null) {
      // Seek to last position when leaving
      const time = (previewPosition / 100) * duration;
      onSeek(time);
    }
    setIsDragging(false);
    // Don't clear previewPosition immediately
  }, [isDragging, previewPosition, duration, onSeek]);

  // Calculate expected position from currentTime
  const currentTimePosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Clear preview position when currentTime catches up (within 1% tolerance)
  // This prevents flickering when transitioning from drag to normal playback
  if (
    previewPosition !== null &&
    !isDragging &&
    Math.abs(currentTimePosition - previewPosition) < 1
  ) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => setPreviewPosition(null), 0);
  }

  // Use preview position during drag, otherwise use actual currentTime
  const playheadPosition = previewPosition ?? currentTimePosition;

  return (
    <div
      className="group relative h-10 cursor-ew-resize select-none rounded-lg bg-muted"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={trackRef}
    >
      {/* Progress bar */}
      <div
        className="absolute inset-y-0 left-0 rounded-l-lg bg-primary/20 transition-[width] duration-150 ease-out"
        style={{ width: `${playheadPosition}%` }}
      />

      {/* Markers */}
      {markers.map((marker) => {
        const position = duration > 0 ? (marker.time / duration) * 100 : 0;
        const isSelected = marker.id === selectedMarkerId;

        return (
          <Tooltip key={marker.id}>
            <TooltipTrigger
              render={
                <button
                  className={cn(
                    "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border-2 font-medium text-[10px] transition-all duration-150",
                    isSelected
                      ? "scale-110 border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-foreground/50 bg-background text-foreground hover:scale-110 hover:border-primary hover:bg-primary/10 hover:shadow-sm"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMarker(marker.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onSeekToMarker(marker.id);
                  }}
                  onMouseDown={(e) => {
                    // Prevent timeline drag when clicking marker
                    e.stopPropagation();
                  }}
                  style={{ left: `${position}%` }}
                  type="button"
                />
              }
            >
              {marker.sequence}
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-center">
                <div className="font-medium">#{marker.sequence}</div>
                <div className="text-muted-foreground text-xs">
                  {formatTimeShort(marker.time)}
                </div>
                {marker.text && (
                  <div className="mt-1 max-w-32 truncate text-xs">
                    {marker.text}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Playhead */}
      <div
        className={cn(
          "-translate-x-1/2 pointer-events-none absolute top-0 bottom-0 z-20 w-0.5 bg-primary transition-[left,opacity] duration-150 ease-out",
          isDragging && "bg-primary/80"
        )}
        style={{ left: `${playheadPosition}%` }}
      >
        {/* Playhead handle */}
        <div
          className={cn(
            "-top-1 -translate-x-1/2 absolute left-1/2 size-3 rounded-full bg-primary shadow-sm transition-transform duration-150",
            isDragging && "scale-125"
          )}
        />
      </div>

      {/* Time labels */}
      <div className="pointer-events-none absolute inset-x-2 bottom-1 flex justify-between text-[10px] text-muted-foreground/60">
        <span>0:00</span>
        <span>{formatTimeShort(duration)}</span>
      </div>
    </div>
  );
}
