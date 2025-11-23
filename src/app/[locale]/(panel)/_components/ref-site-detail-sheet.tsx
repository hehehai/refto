"use client";

import { useAtom } from "jotai";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { SiteDetail } from "@/app/_components/site-detail";
import { refSiteDetailSheetAtom } from "@/app/[locale]/(panel)/_store/dialog.store";
import { Spinner } from "@/components/shared/icons";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import type { RefSite } from "@/db/schema";
import { api } from "@/lib/trpc/react";

export function RefSiteDetailSheet() {
  const locale = useLocale();
  const [status, setStatus] = useAtom(refSiteDetailSheetAtom);

  const { toast } = useToast();
  const utils = api.useUtils();
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<RefSite | null>(null);

  const handleFetch = useCallback(
    async (id: string) => {
      if (!id) {
        return;
      }
      try {
        setLoading(true);
        const data = await utils.refSites.detail.fetch({ id });
        if (!data) {
          throw new Error("Data not found");
        }
        setDetailData(data);
      } catch (_err: any) {
        toast({
          title: "Fetch failed.",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [utils, toast]
  );

  useEffect(() => {
    if (status) {
      handleFetch(status);
    } else {
      setDetailData(null);
    }
  }, [status, handleFetch]);

  return (
    <Sheet
      onOpenChange={(val) => {
        if (!val) {
          setStatus(null);
        }
      }}
      open={!!status}
    >
      <SheetContent
        className="h-[calc(100dvh-64px)] overflow-auto rounded-t-2xl border-0 p-0"
        showClose={false}
        side="bottom"
      >
        <div className="relative h-full w-full">
          <div className="h-full w-full overflow-auto scroll-smooth pb-20">
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="text-3xl" />
              </div>
            ) : detailData ? (
              <SiteDetail item={detailData} locale={locale} />
            ) : null}
          </div>

          <SheetClose className="absolute top-6 right-6 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

RefSiteDetailSheet.displayName = "RefSiteDetailSheet";

export default RefSiteDetailSheet;
