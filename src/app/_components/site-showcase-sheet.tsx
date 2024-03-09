"use client";

import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { refSiteSheetAtom } from "../_store/sheet.store";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { type RefSite } from "@prisma/client";
import { SiteDetail } from "./site-detail";
import { Spinner } from "@/components/shared/icons";
import { X } from "lucide-react";
import { SiteShowcaseCorrelation } from "./site-showcase-correlation";
import { Separator } from "@/components/ui/separator";

export const SiteShowcaseSheet = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useAtom(refSiteSheetAtom);

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
      } catch (err: any) {
        toast({
          title: "Fetch failed.",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [utils, toast],
  );

  useEffect(() => {
    if (status.id) {
      handleFetch(status.id);
    } else {
      setDetailData(null);
    }

    if (status.id) {
      window.history.pushState(
        null,
        "",
        `/${status.id}?${searchParams.toString()}`,
      );
    } else {
      window.history.pushState(null, "", `/?${searchParams.toString()}`);
    }
  }, [status.id]);

  return (
    <Sheet
      open={!!status.id}
      onOpenChange={(val) => {
        if (!val) {
          setStatus({ id: null });
        }
      }}
    >
      <SheetContent
        side="bottom"
        showClose={false}
        className="h-[calc(100dvh-64px)] overflow-auto rounded-t-2xl p-0"
      >
        <div className="relative h-full w-full">
          <div className="h-full w-full overflow-auto pb-20">
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="text-3xl" />
              </div>
            ) : detailData ? (
              <SiteDetail item={detailData} />
            ) : null}

            <div className="container">
              <Separator className="my-28" />

              {status.id && (
                <SiteShowcaseCorrelation
                  id={status.id}
                  onDetail={(id) => setStatus({ id })}
                />
              )}
            </div>
          </div>

          <SheetClose className="absolute right-6 top-6 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
