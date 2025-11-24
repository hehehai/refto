import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { env } from "@/env";
import { client } from "@/lib/orpc/client";

interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (message: string) => void;
  showToast?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
}

/**
 * Hook for uploading files to R2 storage
 */
export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { onSuccess, onError, showToast = true } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      setState({ isUploading: true, progress: 0 });

      try {
        // Get signed upload URL from server
        const { uploadUrl, filename } = await client.upload.getUploadUrl(
          file.name
        );

        if (!uploadUrl) {
          throw new Error("Failed to get upload URL");
        }

        abortControllerRef.current = new AbortController();

        // Upload file to R2
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        // Construct the public URL
        const publicUrl = `${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/${filename}`;

        if (showToast) {
          toast.success("File uploaded successfully");
        }

        onSuccess?.(publicUrl);
        return publicUrl;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return null;
        }

        const message =
          error instanceof Error ? error.message : "Failed to upload file";

        if (showToast) {
          toast.error(message);
        }

        onError?.(message);
        return null;
      } finally {
        setState({ isUploading: false, progress: 0 });
        abortControllerRef.current = null;
      }
    },
    [onSuccess, onError, showToast]
  );

  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({ isUploading: false, progress: 0 });
  }, []);

  return {
    uploadFile,
    cancelUpload,
    isUploading: state.isUploading,
    progress: state.progress,
  };
}
