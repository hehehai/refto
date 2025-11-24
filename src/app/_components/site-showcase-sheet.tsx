"use client";

import { useAtom } from "jotai";
import { Maximize2, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { refSiteSheetAtom } from "@/app/_store/sheet.store";
import { Spinner } from "@/components/shared/icons";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RefSite } from "@/db/schema";
import { client } from "@/lib/orpc/client";
import { SiteDetail } from "./site-detail";
import { SiteShowcaseCorrelation } from "./site-showcase-correlation";

export const SiteShowcaseSheet = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useAtom(refSiteSheetAtom);
  const contentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<RefSite | null>(null);

  const handleFetch = useCallback(async (id: string) => {
    if (!id) {
      return;
    }
    try {
      setLoading(true);
      const data = await client.refSites.detail({ id });
      if (!data) {
        throw new Error("Data not found");
      }
      setDetailData(data);
    } catch (_err: any) {
      toast.error("Please try again.", { description: "Fetch failed." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status.id) {
      handleFetch(status.id);
    } else {
      setDetailData(null);
    }

    if (status.id) {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
      window.history.pushState(
        null,
        "",
        `/${status.id}?${searchParams.toString()}`
      );
    } else {
      window.history.pushState(null, "", `/?${searchParams.toString()}`);
    }
  }, [status.id, handleFetch, searchParams]);

  return (
    <Sheet
      onOpenChange={(val) => {
        if (!val) {
          setStatus({ id: null });
        }
      }}
      open={!!status.id}
    >
      <SheetContent
        className="h-[calc(100dvh-52px)] rounded-t-2xl border-0 p-0"
        showClose={false}
        side="bottom"
      >
        <SheetTitle className="sr-only">{detailData?.siteTitle}</SheetTitle>
        <div className="relative h-full w-full">
          <div
            className="h-full w-full overflow-auto scroll-smooth rounded-t-2xl pb-20"
            ref={contentRef}
          >
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="text-3xl" />
              </div>
            ) : detailData ? (
              <SiteDetail item={detailData} />
            ) : null}

            <div className="container">
              <Separator className="my-12 md:my-28" />

              {status.id && (
                <SiteShowcaseCorrelation
                  id={status.id}
                  onDetailAction={(id) => setStatus({ id })}
                />
              )}
            </div>
          </div>

          <div className="-top-10 absolute right-6 z-50 flex items-center justify-center space-x-3">
            <SheetClose className="rounded-sm text-white opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-background/20 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <X className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">Close</span>
            </SheetClose>
            <Link
              className="rounded-sm p-1 text-white opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-background/20 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
              href={`/${status.id}`}
              prefetch={true}
            >
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Expand</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
