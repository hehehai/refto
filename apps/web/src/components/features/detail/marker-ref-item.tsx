import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeShortWithMs } from "@/lib/time";
import { cn } from "@/lib/utils";

interface MarkerRefItemProps {
  markerNumber: number;
  markerTime: number;
  markerText: string | null;
  thumbnail?: string;
  onOpenPreview?: () => void;
  onDownload?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

function MarkerBadge({
  isSelectable,
  isSelected,
  markerNumber,
}: {
  isSelectable: boolean;
  isSelected: boolean;
  markerNumber: number;
}) {
  if (isSelectable) {
    return (
      <div
        className={cn(
          "absolute top-2 left-2 flex size-6 items-center justify-center rounded-full border border-foreground/70 bg-background/80",
          isSelected && "border-primary"
        )}
      >
        <span
          className={cn(
            "block size-3 rounded-full bg-primary transition-all",
            isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] text-background backdrop-blur-md",
        isSelected ? "bg-primary text-primary-foreground" : "bg-foreground/60"
      )}
    >
      #{markerNumber}
    </div>
  );
}

export function MarkerRefItem({
  markerNumber,
  markerTime,
  markerText,
  thumbnail,
  onOpenPreview,
  onDownload,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
}: MarkerRefItemProps) {
  const handleInteraction = () => {
    if (isSelectable) {
      onToggleSelect?.();
      return;
    }
    onOpenPreview?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!(isSelectable || onOpenPreview)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInteraction();
    }
  };

  const interactiveRole = isSelectable
    ? "checkbox"
    : onOpenPreview
      ? "button"
      : undefined;
  const interactiveTabIndex = isSelectable || onOpenPreview ? 0 : -1;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-muted p-3",
        isSelectable && "cursor-pointer",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      role={interactiveRole}
      tabIndex={interactiveTabIndex}
      {...(isSelectable ? { "aria-checked": isSelected } : {})}
    >
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-md bg-muted"
        onClick={(e) => {
          e.stopPropagation();
          handleInteraction();
        }}
      >
        {thumbnail ? (
          <img
            alt={`Marker ${markerNumber}`}
            className="size-full object-cover transition-transform group-hover:scale-105"
            src={thumbnail}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-background">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        )}
        <MarkerBadge
          isSelectable={isSelectable}
          isSelected={isSelected}
          markerNumber={markerNumber}
        />
        {thumbnail && onDownload && !isSelectable && (
          <Button
            className="absolute top-2 right-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDownload();
            }}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <span className="i-hugeicons-download-01 size-3.5" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-muted-foreground text-xs">
          {formatTimeShortWithMs(markerTime)}
        </span>
        <span
          className={cn(
            "truncate text-muted-foreground text-xs capitalize",
            !markerText && "italic"
          )}
        >
          {markerText || "No description"}
        </span>
      </div>
    </div>
  );
}
