import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { client } from "@/lib/orpc/client";

export interface SiteMeta {
  url: string;
  siteName?: string | null;
  siteTitle?: string | null;
  siteDescription?: string | null;
  siteFavicon?: string | null;
  siteOGImage?: string | null;
}

interface UseUrlMetaFetchOptions {
  onSuccess?: (meta: SiteMeta) => void;
  onError?: (message: string) => void;
  showToast?: boolean;
}

/**
 * Hook for fetching URL metadata (favicon, title, description, etc.)
 */
export function useUrlMetaFetch(options: UseUrlMetaFetchOptions = {}) {
  const { onSuccess, onError, showToast = true } = options;

  const [isLoading, setIsLoading] = useState(false);

  const fetchMeta = useCallback(
    async (url: string): Promise<SiteMeta | null> => {
      // Validate URL
      const validUrl = z.string().trim().url().safeParse(url);
      if (!validUrl.success) {
        const message = "Please enter a valid URL";
        if (showToast) {
          toast.error(message);
        }
        onError?.(message);
        return null;
      }

      setIsLoading(true);

      try {
        const data = await client.siteMeta.meta({ url: validUrl.data });

        if (!data) {
          throw new Error("Failed to fetch site metadata");
        }

        const result: SiteMeta = {
          url: validUrl.data,
          siteName: data.siteName,
          siteTitle: data.siteTitle,
          siteDescription: data.siteDescription,
          siteFavicon: data.siteFavicon,
          siteOGImage: data.siteOGImage,
        };

        onSuccess?.(result);
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch site metadata";

        if (showToast) {
          toast.error(message);
        }

        onError?.(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, showToast]
  );

  return {
    fetchMeta,
    isLoading,
  };
}
