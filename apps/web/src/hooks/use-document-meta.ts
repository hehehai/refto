import { useRouter } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

/**
 * Hook to manage document title and URL without navigation.
 * Useful for sheets/modals that need to update URL for sharing.
 * Uses router.history.block() to prevent TanStack Router from navigating.
 */
export function useDocumentMeta() {
  const router = useRouter();
  const originalTitle = useRef<string | null>(null);
  const originalUrl = useRef<string | null>(null);
  const unblockRef = useRef<(() => void) | null>(null);

  const setMeta = useCallback(
    (title: string, url: string) => {
      // Save original values only on first call
      if (originalTitle.current === null) {
        originalTitle.current = document.title;
      }
      if (originalUrl.current === null) {
        originalUrl.current = window.location.pathname + window.location.search;
      }

      // Block router navigation before changing URL
      if (!unblockRef.current) {
        unblockRef.current = router.history.block({
          blockerFn: () => true,
        });
      }

      document.title = title;
      window.history.pushState(null, "", url);
    },
    [router]
  );

  const restore = useCallback(() => {
    // Unblock router navigation first
    if (unblockRef.current) {
      unblockRef.current();
      unblockRef.current = null;
    }

    if (originalTitle.current !== null) {
      document.title = originalTitle.current;
      originalTitle.current = null;
    }
    if (originalUrl.current !== null) {
      window.history.pushState(null, "", originalUrl.current);
      originalUrl.current = null;
    }
  }, []);

  return { setMeta, restore };
}
