import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDownload } from "@/hooks/use-download";
import { imagePreviewDialog } from "@/lib/sheets";

export function ImagePreviewDialog() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { download } = useDownload();

  const handleCopy = useCallback(async (src: string) => {
    if (typeof navigator === "undefined") return;

    try {
      if (src.startsWith("data:") || src.startsWith("blob:")) {
        const blob = await fetch(src).then((res) => res.blob());
        if ("clipboard" in navigator && "ClipboardItem" in window) {
          const item = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([item]);
          return;
        }
      }

      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(src);
      }
    } catch {
      // ignore clipboard errors
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // ignore fullscreen exit errors
      });
      return;
    }
    contentRef.current?.requestFullscreen();
  }, []);

  return (
    <Dialog handle={imagePreviewDialog}>
      {({ payload }) => {
        if (!payload) return null;
        const title = payload.title ?? "Image preview";
        const alt = payload.alt ?? "Preview image";
        const filename =
          payload.filename ??
          `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;

        return (
          <DialogContent
            className="max-w-5xl sm:max-w-5xl"
            showCloseButton={false}
          >
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>{title}</DialogTitle>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      onClick={() =>
                        download({ dataUrl: payload.src, filename })
                      }
                      size="icon-xs"
                      variant="ghost"
                    >
                      <span className="i-hugeicons-download-01 size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      onClick={() => handleCopy(payload.src)}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <span className="i-hugeicons-copy-01 size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy URL</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      onClick={handleFullscreen}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <span className="i-hugeicons-full-screen size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle fullscreen</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <DialogClose
                      render={<Button size="icon-xs" variant="ghost" />}
                    >
                      <span className="i-hugeicons-cancel-01 size-4" />
                    </DialogClose>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </div>
            </DialogHeader>
            <div
              className="flex max-h-[80vh] items-center justify-center bg-black"
              ref={contentRef}
            >
              <img
                alt={alt}
                className="max-h-[80vh] w-auto"
                src={payload.src}
              />
            </div>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
