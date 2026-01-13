import DownloadBox from "@/components/shared/icons/download-box";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkerSelectionControlsProps {
  isSelectionMode: boolean;
  selectedMarkerCount: number;
  onToggleSelectionMode: () => void;
  onDownloadSelectedMarkers?: () => void;
}

export function MarkerSelectionControls({
  isSelectionMode,
  selectedMarkerCount,
  onToggleSelectionMode,
  onDownloadSelectedMarkers,
}: MarkerSelectionControlsProps) {
  const toggleTooltipLabel = isSelectionMode
    ? "Exit selection mode"
    : "Select markers";

  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger>
          <Button
            aria-pressed={isSelectionMode}
            onClick={onToggleSelectionMode}
            size="icon"
            type="button"
            variant={
              isSelectionMode || selectedMarkerCount > 0 ? "default" : "outline"
            }
          >
            <DownloadBox />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{toggleTooltipLabel}</TooltipContent>
      </Tooltip>
      {selectedMarkerCount > 0 && onDownloadSelectedMarkers && (
        <Button
          className="gap-2"
          onClick={onDownloadSelectedMarkers}
          type="button"
        >
          Download ({selectedMarkerCount})
        </Button>
      )}
    </div>
  );
}
