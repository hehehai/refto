import { Button } from "@/components/ui/button";
import { formatTimeShortWithMs } from "@/lib/time";
import { cn } from "@/lib/utils";

interface MarkerRefItemProps {
  markerNumber: number;
  markerTime: number;
  markerText: string | null;
  thumbnail?: string;
  onOpenPreview?: () => void;
  onDownload?: () => void;
}

export function MarkerRefItem({
  markerNumber,
  markerTime,
  markerText,
  thumbnail,
  onOpenPreview,
  onDownload,
}: MarkerRefItemProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-md bg-muted"
        onClick={onOpenPreview}
        onKeyDown={(e) => {
          if (!onOpenPreview) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenPreview();
          }
        }}
        role={onOpenPreview ? "button" : undefined}
        tabIndex={onOpenPreview ? 0 : -1}
      >
        {thumbnail ? (
          <img
            alt={`Marker ${markerNumber}`}
            className="size-full object-cover transition-transform group-hover:scale-105"
            src={thumbnail}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/60">
            <div className="h-10 w-16 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        )}
        <div className="absolute top-2 left-2 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] text-background">
          #{markerNumber}
        </div>
        {thumbnail && onDownload && (
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
            "truncate text-muted-foreground text-xs",
            !markerText && "italic"
          )}
        >
          {markerText || "No description"}
        </span>
      </div>
    </div>
  );
}
