import { useCallback } from "react";

interface DownloadOptions {
  dataUrl: string;
  filename: string;
}

export function useDownload() {
  const download = useCallback(({ dataUrl, filename }: DownloadOptions) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  return { download };
}
