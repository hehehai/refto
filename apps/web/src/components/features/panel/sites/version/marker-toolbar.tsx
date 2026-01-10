import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  icon: typeof Add01Icon;
  tooltip: string;
  onAction: () => void;
  disabled?: boolean;
  className?: string;
}

function HoldButton({
  icon,
  tooltip,
  onAction,
  disabled,
  className,
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
        <HugeiconsIcon className="size-3.5" icon={icon} strokeWidth={2} />
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
    <div className="flex items-center gap-1 border-t bg-muted/30 px-3 py-2">
      {!readOnly && (
        <>
          {/* Marker controls */}
          <div className="flex items-center gap-0.5">
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
                <HugeiconsIcon
                  className="size-3.5"
                  icon={Add01Icon}
                  strokeWidth={2}
                />
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
                <HugeiconsIcon
                  className="size-3.5"
                  icon={Delete02Icon}
                  strokeWidth={2}
                />
              </TooltipTrigger>
              <TooltipContent>Delete selected (Del)</TooltipContent>
            </Tooltip>

            <HoldButton
              disabled={!hasSelection}
              icon={ArrowLeft01Icon}
              onAction={onMoveSelectedLeft}
              tooltip="Move left (↑)"
            />

            <HoldButton
              disabled={!hasSelection}
              icon={ArrowRight01Icon}
              onAction={onMoveSelectedRight}
              tooltip="Move right (↓)"
            />
          </div>

          <Separator className="mx-1 h-5" orientation="vertical" />
        </>
      )}

      {/* Playback controls */}
      <div className="flex items-center gap-0.5">
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
            <HugeiconsIcon
              className="size-3.5"
              icon={StopIcon}
              strokeWidth={2}
            />
          </TooltipTrigger>
          <TooltipContent>Play from start</TooltipContent>
        </Tooltip>

        <HoldButton
          icon={ArrowLeft01Icon}
          onAction={() => onRewind(10)}
          tooltip="Rewind 10s (Shift+←)"
        />

        <HoldButton
          icon={ArrowLeft01Icon}
          onAction={() => onRewind(1)}
          tooltip="Rewind 1s (←)"
        />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={onPlayPause} size="icon-xs" variant="ghost" />
            }
          >
            <HugeiconsIcon
              className="size-3.5"
              icon={isPlaying ? PauseIcon : PlayIcon}
              strokeWidth={2}
            />
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause" : "Play"} (Space)
          </TooltipContent>
        </Tooltip>

        <HoldButton
          icon={ArrowRight01Icon}
          onAction={() => onForward(1)}
          tooltip="Forward 1s (→)"
        />

        <HoldButton
          icon={ArrowRight01Icon}
          onAction={() => onForward(10)}
          tooltip="Forward 10s (Shift+→)"
        />
      </div>

      {!readOnly && (
        <>
          <Separator className="mx-1 h-5" orientation="vertical" />

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
              <HugeiconsIcon
                className="size-3.5"
                icon={Delete02Icon}
                strokeWidth={2}
              />
            </TooltipTrigger>
            <TooltipContent>Delete all markers</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Time display */}
      <div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
        <span className={cn("tabular-nums", isPlaying && "text-foreground")}>
          {formatTime(currentTime)}
        </span>
        <span>/</span>
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
