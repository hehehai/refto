"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogPayload {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void> | void;
}

// Global handle for imperative usage
export const confirmDialog =
  AlertDialogPrimitive.createHandle<ConfirmDialogPayload>();

// Provider component - mount once at layout root
export function ConfirmDialogProvider() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (payload: ConfirmDialogPayload) => {
    setIsLoading(true);
    try {
      await payload.onConfirm();
      confirmDialog.close();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialogPrimitive.Root handle={confirmDialog}>
      {({ payload }) =>
        payload && (
          <AlertDialogPrimitive.Portal>
            <AlertDialogPrimitive.Backdrop
              className={cn(
                "data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 data-closed:animate-out data-open:animate-in supports-backdrop-filter:backdrop-blur-xs"
              )}
            />
            <AlertDialogPrimitive.Popup
              className={cn(
                "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 group/alert-dialog-content -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 grid w-full max-w-xs gap-4 rounded-xl bg-background p-4 outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in sm:max-w-sm"
              )}
            >
              {/* Header */}
              <div className="grid place-items-center gap-1.5 text-center sm:place-items-start sm:text-left">
                <AlertDialogPrimitive.Title className="font-medium text-sm">
                  {payload.title}
                </AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className="text-balance text-muted-foreground text-sm md:text-pretty">
                  {payload.description}
                </AlertDialogPrimitive.Description>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-2 sm:flex-row sm:justify-end">
                <AlertDialogPrimitive.Close
                  disabled={isLoading}
                  render={<Button variant="outline" />}
                >
                  {payload.cancelText ?? "Cancel"}
                </AlertDialogPrimitive.Close>
                <Button
                  disabled={isLoading}
                  onClick={() => handleConfirm(payload)}
                  variant={payload.variant}
                >
                  {isLoading
                    ? payload.variant === "destructive"
                      ? "Deleting..."
                      : "Loading..."
                    : (payload.confirmText ?? "Confirm")}
                </Button>
              </div>
            </AlertDialogPrimitive.Popup>
          </AlertDialogPrimitive.Portal>
        )
      }
    </AlertDialogPrimitive.Root>
  );
}
