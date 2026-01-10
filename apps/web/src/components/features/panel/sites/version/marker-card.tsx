import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { forwardRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MarkerState } from "./marker-timeline";

interface MarkerCardProps {
  marker: MarkerState;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
  onSeekTo: () => void;
}

function formatTimeShort(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
}

export const MarkerCard = forwardRef<HTMLDivElement, MarkerCardProps>(
  function MarkerCard(
    {
      marker,
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
              alt={`Marker ${marker.sequence}`}
              className="size-full object-cover"
              src={marker.thumbnail}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted/60">
              <div className="h-6 w-10 animate-pulse rounded bg-muted-foreground/20" />
            </div>
          )}
          {/* Sequence badge */}
          <div className="absolute top-0.5 left-0.5 flex size-4 items-center justify-center rounded bg-foreground/80 font-medium text-[10px] text-background">
            {marker.sequence}
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Time */}
          <div className="font-mono text-muted-foreground text-xs">
            {formatTimeShort(marker.time)}
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
              className="truncate text-left text-sm hover:text-primary"
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
            <HugeiconsIcon
              className="size-3.5"
              icon={Delete02Icon}
              strokeWidth={2}
            />
          </Button>
        )}
      </div>
    );
  }
);
