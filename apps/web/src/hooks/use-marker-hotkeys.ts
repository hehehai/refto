import { useEffect, useRef } from "react";

interface UseMarkerHotkeysOptions {
  enabled: boolean;
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
  const handlersRef = useRef({
    onPlayPause,
    onSeekLeft,
    onSeekRight,
    onSeekLeftFast,
    onSeekRightFast,
    onAddMarker,
    onDeleteSelected,
    onMoveSelectedUp,
    onMoveSelectedDown,
  });

  useEffect(() => {
    handlersRef.current = {
      onPlayPause,
      onSeekLeft,
      onSeekRight,
      onSeekLeftFast,
      onSeekRightFast,
      onAddMarker,
      onDeleteSelected,
      onMoveSelectedUp,
      onMoveSelectedDown,
    };
  }, [
    onPlayPause,
    onSeekLeft,
    onSeekRight,
    onSeekLeftFast,
    onSeekRightFast,
    onAddMarker,
    onDeleteSelected,
    onMoveSelectedUp,
    onMoveSelectedDown,
  ]);

  useEffect(() => {
    if (!enabled) return;

    const shouldIgnoreTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (target.isContentEditable) return true;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled || shouldIgnoreTarget(e.target)) return;

      const key = e.key.toLowerCase();
      const handlers = handlersRef.current;

      if (key === " " || key === "spacebar") {
        e.preventDefault();
        handlers.onPlayPause();
        return;
      }

      if (key === "arrowleft") {
        e.preventDefault();
        if (e.shiftKey) {
          handlers.onSeekLeftFast();
        } else {
          handlers.onSeekLeft();
        }
        return;
      }

      if (key === "arrowright") {
        e.preventDefault();
        if (e.shiftKey) {
          handlers.onSeekRightFast();
        } else {
          handlers.onSeekRight();
        }
        return;
      }

      if (key === "m") {
        e.preventDefault();
        handlers.onAddMarker();
        return;
      }

      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        handlers.onDeleteSelected();
        return;
      }

      if (key === "arrowup") {
        e.preventDefault();
        handlers.onMoveSelectedUp();
        return;
      }

      if (key === "arrowdown") {
        e.preventDefault();
        handlers.onMoveSelectedDown();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled]);
}
