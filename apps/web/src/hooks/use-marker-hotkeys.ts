import { useHotkeys } from "react-hotkeys-hook";

interface UseMarkerHotkeysOptions {
  enabled: boolean;
  enableReorder?: boolean;
  onPlayPause: () => void;
  onSeekLeft: () => void;
  onSeekRight: () => void;
  onSeekLeftFast: () => void;
  onSeekRightFast: () => void;
  onAddMarker: () => void;
  onDeleteSelected: () => void;
  onMoveSelectedUp: () => void;
  onMoveSelectedDown: () => void;
}

export function useMarkerHotkeys({
  enabled,
  enableReorder = true,
  onPlayPause,
  onSeekLeft,
  onSeekRight,
  onSeekLeftFast,
  onSeekRightFast,
  onAddMarker,
  onDeleteSelected,
  onMoveSelectedUp,
  onMoveSelectedDown,
}: UseMarkerHotkeysOptions) {
  const options = {
    enabled,
    enableOnFormTags: false,
    enableOnContentEditable: false,
    preventDefault: true,
  };
  const reorderOptions = {
    ...options,
    enabled: enabled && enableReorder,
  };

  useHotkeys("space", () => onPlayPause(), options, [onPlayPause]);
  useHotkeys(
    "left",
    (event) => {
      if (event.shiftKey) return;
      onSeekLeft();
    },
    options,
    [onSeekLeft]
  );
  useHotkeys("shift+left", () => onSeekLeftFast(), options, [onSeekLeftFast]);
  useHotkeys(
    "right",
    (event) => {
      if (event.shiftKey) return;
      onSeekRight();
    },
    options,
    [onSeekRight]
  );
  useHotkeys("shift+right", () => onSeekRightFast(), options, [
    onSeekRightFast,
  ]);
  useHotkeys("m", () => onAddMarker(), options, [onAddMarker]);
  useHotkeys(["backspace", "del"], () => onDeleteSelected(), options, [
    onDeleteSelected,
  ]);
  useHotkeys("up", () => onMoveSelectedUp(), reorderOptions, [
    onMoveSelectedUp,
  ]);
  useHotkeys("down", () => onMoveSelectedDown(), reorderOptions, [
    onMoveSelectedDown,
  ]);
}
