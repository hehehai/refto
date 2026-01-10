import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  open: boolean;
  src: string;
  alt?: string;
  title?: string;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({
  open,
  src,
  alt = "Preview image",
  title = "Image preview",
  onOpenChange,
}: ImagePreviewDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-5xl p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[80vh] items-center justify-center bg-black">
          <img alt={alt} className="max-h-[80vh] w-auto" src={src} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
