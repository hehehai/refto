import { useEffect } from "react";
import { orpc } from "@/lib/orpc";

const DUP_WINDOW_MS = 1000;
let lastViewKey = "";
let lastViewAt = 0;

export function useTrackPageView(siteId?: string, pageId?: string) {
  useEffect(() => {
    if (!siteId) return;
    const key = `${siteId}:${pageId ?? ""}`;
    const now = Date.now();
    if (key === lastViewKey && now - lastViewAt < DUP_WINDOW_MS) {
      return;
    }
    lastViewKey = key;
    lastViewAt = now;
    orpc.app.filter.trackPageView.call({ siteId, pageId }).catch((error) => {
      if (import.meta.env.DEV) {
        console.warn("Track page view failed", error);
      }
    });
  }, [siteId, pageId]);
}
