import { forwardRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeShortWithMs } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { MarkerState } from "./marker-timeline";

interface MarkerCardProps {
  marker: MarkerState;
  markerNumber: number;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
  onSeekTo: () => void;
}

export const MarkerCard = forwardRef<HTMLDivElement, MarkerCardProps>(
  function MarkerCard(
    {
      marker,
      markerNumber,
      isSelected,
      readOnly,
      onSelect,
      onUpdateText,
      onDelete,
      onSeekTo,
    },
    ref
  ) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(marker.text ?? "");

    const handleTextBlur = useCallback(() => {
      setIsEditing(false);
      if (editText !== (marker.text ?? "")) {
        onUpdateText(editText);
      }
    }, [editText, marker.text, onUpdateText]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleTextBlur();
        }
        if (e.key === "Escape") {
          setEditText(marker.text ?? "");
          setIsEditing(false);
        }
        // Stop propagation to prevent global hotkeys
        e.stopPropagation();
      },
      [handleTextBlur, marker.text]
    );

    return (
      <div
        className={cn(
          "group flex gap-3 rounded-lg border p-2 transition-colors",
          isSelected
            ? "border-primary bg-primary/5"
            : "border-transparent hover:border-border hover:bg-muted/50"
        )}
        onClick={onSelect}
        onDoubleClick={onSeekTo}
        ref={ref}
      >
        {/* Thumbnail */}
        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-muted">
          {marker.thumbnail ? (
            <img
              alt={`Marker ${markerNumber}`}
              className="size-full object-cover"
              src={marker.thumbnail}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-background">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          {/* Sequence badge */}
          <div className="absolute top-0.5 left-0.5 flex size-4 items-center justify-center rounded bg-foreground/80 font-medium text-[10px] text-background">
            {markerNumber}
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Time */}
          <div className="font-mono text-muted-foreground text-xs">
            {formatTimeShortWithMs(marker.time)}
          </div>

          {/* Text input */}
          {isEditing && !readOnly ? (
            <Input
              autoFocus
              className="h-6 px-1.5 text-xs"
              onBlur={handleTextBlur}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add description..."
              value={editText}
            />
          ) : readOnly ? (
            <div className="truncate text-muted-foreground text-sm">
              {marker.text || "No description"}
            </div>
          ) : (
            <button
              className="truncate py-1 text-left text-sm hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              type="button"
            >
              {marker.text || (
                <span className="text-muted-foreground italic">
                  Add description...
                </span>
              )}
            </button>
          )}
        </div>

        {/* Delete button */}
        {!readOnly && (
          <Button
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            size="icon-xs"
            variant="ghost"
          >
            <span className="i-hugeicons-bookmark-remove-02" />
          </Button>
        )}
      </div>
    );
  }
);
