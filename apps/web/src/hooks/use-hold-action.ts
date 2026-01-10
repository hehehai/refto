import { useCallback, useRef } from "react";

interface UseHoldActionOptions {
  /** Initial delay before starting continuous action (ms) */
  initialDelay?: number;
  /** Interval between subsequent actions (ms) */
  interval?: number;
  /** Callback when action is triggered */
  onAction: () => void;
}

/**
 * Hook for handling button hold/long-press with continuous action.
 * First triggers immediately on press, then after initialDelay,
 * continues triggering at the specified interval.
 */
export function useHoldAction({
  initialDelay = 400,
  interval = 100,
  onAction,
}: UseHoldActionOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    // Trigger immediately on press
    onAction();

    // After initial delay, start continuous triggering
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onAction();
      }, interval);
    }, initialDelay);
  }, [onAction, initialDelay, interval]);

  const handlers = {
    onMouseDown: startHold,
    onMouseUp: stopHold,
    onMouseLeave: stopHold,
    onTouchStart: startHold,
    onTouchEnd: stopHold,
  };

  return handlers;
}
