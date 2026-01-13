import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHoldAction } from "@/hooks/use-hold-action";
import { cn } from "@/lib/utils";

interface MarkerToolbarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  selectedMarkerId: string | null;
  hasMarkers: boolean;
  readOnly?: boolean;
  allowReorder?: boolean;
  onAddMarker: () => void;
  onDeleteSelected: () => void;
  onMoveSelectedLeft: () => void;
  onMoveSelectedRight: () => void;
  onPlayFromStart: () => void;
  onRewind: (seconds: number) => void;
  onPlayPause: () => void;
  onForward: (seconds: number) => void;
  onDeleteAll: () => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "00:00.0";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
}

interface HoldButtonProps {
  tooltip: string;
  onAction: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function HoldButton({
  tooltip,
  onAction,
  disabled,
  className,
  children,
}: HoldButtonProps) {
  const holdHandlers = useHoldAction({ onAction });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className={className}
            disabled={disabled}
            size="icon-xs"
            variant="ghost"
            {...holdHandlers}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function MarkerToolbar({
  isPlaying,
  currentTime,
  duration,
  selectedMarkerId,
  hasMarkers,
  readOnly = false,
  allowReorder = true,
  onAddMarker,
  onDeleteSelected,
  onMoveSelectedLeft,
  onMoveSelectedRight,
  onPlayFromStart,
  onRewind,
  onPlayPause,
  onForward,
  onDeleteAll,
}: MarkerToolbarProps) {
  const hasSelection = selectedMarkerId !== null;

  return (
    <div className="flex items-center justify-between gap-1 border-t bg-muted/30 px-3 py-1">
      {readOnly ? (
        <div className="w-40" />
      ) : (
        <>
          {/* Marker controls */}
          <div className="flex w-40 items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={onAddMarker}
                    size="icon-xs"
                    variant="ghost"
                  />
                }
              >
                <span className="i-hugeicons-bookmark-add-02" />
              </TooltipTrigger>
              <TooltipContent>Add marker (M)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    disabled={!hasSelection}
                    onClick={onDeleteSelected}
                    size="icon-xs"
                    variant="ghost"
                  />
                }
              >
                <span className="i-hugeicons-bookmark-remove-02" />
              </TooltipTrigger>
              <TooltipContent>Delete selected (Del)</TooltipContent>
            </Tooltip>

            <HoldButton
              disabled={!(hasSelection && allowReorder)}
              onAction={onMoveSelectedLeft}
              tooltip={allowReorder ? "Move left (↑)" : "Order locked by time"}
            >
              <span className="i-hugeicons-move-left" />
            </HoldButton>

            <HoldButton
              disabled={!(hasSelection && allowReorder)}
              onAction={onMoveSelectedRight}
              tooltip={allowReorder ? "Move right (↓)" : "Order locked by time"}
            >
              <span className="i-hugeicons-move-right" />
            </HoldButton>
          </div>
        </>
      )}

      {/* Playback controls */}
      <div className="flex flex-1 items-center justify-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onPlayFromStart}
                size="icon-xs"
                variant="ghost"
              />
            }
          >
            <span className="i-hugeicons-stop-circle" />
          </TooltipTrigger>
          <TooltipContent>Play from start</TooltipContent>
        </Tooltip>

        <HoldButton onAction={() => onRewind(1)} tooltip="Rewind 1s (Shift+←)">
          <span className="i-hugeicons-arrow-left-double" />
        </HoldButton>

        <HoldButton onAction={() => onRewind(0.1)} tooltip="Rewind 0.1s (←)">
          <span className="i-hugeicons-arrow-left-01" />
        </HoldButton>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={onPlayPause} size="icon-xs" variant="ghost" />
            }
          >
            <span
              className={cn(
                isPlaying ? "i-hugeicons-pause" : "i-hugeicons-play"
              )}
            />
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause" : "Play"} (Space)
          </TooltipContent>
        </Tooltip>

        <HoldButton onAction={() => onForward(0.1)} tooltip="Forward 0.1s (→)">
          <span className="i-hugeicons-arrow-right-01" />
        </HoldButton>

        <HoldButton
          onAction={() => onForward(1)}
          tooltip="Forward 1s (Shift+→)"
        >
          <span className="i-hugeicons-arrow-right-double" />
        </HoldButton>
      </div>

      {/* Time display */}
      <div className="flex w-40 items-center justify-end gap-2">
        {!readOnly && (
          <>
            {/* Delete all */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className="text-destructive hover:bg-destructive/10"
                    disabled={!hasMarkers}
                    onClick={onDeleteAll}
                    size="icon-xs"
                    variant="ghost"
                  />
                }
              >
                <span className="i-hugeicons-delete-03" />
              </TooltipTrigger>
              <TooltipContent>Delete all markers</TooltipContent>
            </Tooltip>
          </>
        )}
        <div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
          <span className={cn("tabular-nums", isPlaying && "text-foreground")}>
            {formatTime(currentTime)}
          </span>
          <span>/</span>
          <span className="tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
