import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface MarkerItem {
  id: string;
  time: number;
  text: string | null;
}

interface VersionMarkersPanelProps extends HTMLAttributes<HTMLDivElement> {
  markers: MarkerItem[];
  activeMarkerId: string | null;
  onMarkerSelect?: (marker: MarkerItem) => void;
  onDownload?: (marker: MarkerItem, index: number) => void;
}

export function VersionMarkersPanel({
  markers,
  activeMarkerId,
  onMarkerSelect,
  onDownload,
  className,
  ...props
}: VersionMarkersPanelProps) {
  return (
    <div
      className={cn(
        "flex w-56 shrink-0 flex-col rounded-lg border border-border/40 bg-background/60 p-3 shadow-lg",
        className
      )}
      {...props}
    >
      <div className="mb-2 font-medium text-muted-foreground text-xs">
        Markers ({markers.length})
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {markers.map((marker, index) => (
          <div
            className={cn(
              "group relative flex items-center gap-1 rounded-md pr-1 transition-colors",
              marker.id === activeMarkerId
                ? "text-primary"
                : "text-foreground hover:bg-muted/60"
            )}
            key={marker.id}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("[data-marker-download]")) return;
              onMarkerSelect?.(marker);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onMarkerSelect?.(marker);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {marker.id === activeMarkerId ? (
              <motion.div
                aria-hidden="true"
                className="-z-10 pointer-events-none absolute inset-0 rounded-md bg-muted"
                layoutId="marker-active-highlight"
              />
            ) : null}
            <Tooltip>
              <TooltipTrigger className="min-w-0 flex-1 px-3 py-1.5 text-left">
                <span className="truncate text-sm capitalize">
                  {marker.text || "No description"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                {marker.time.toFixed(1)}s
              </TooltipContent>
            </Tooltip>
            <Button
              className="opacity-0 transition-opacity group-hover:opacity-100"
              data-marker-download
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDownload?.(marker, index + 1);
              }}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <span className="i-hugeicons-download-01 size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
