"use client";

import { Masonry } from "react-plock";
import { api } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { SiteShowcase } from "./site-showcase";
import { useAtom } from "jotai";
import { refSiteSheetAtom } from "../_store/sheet.store";
import { useEffect, useMemo, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useTranslations } from "next-intl";
import { increment, trackEvent } from "@openpanel/nextjs";

interface HomeMasonryProps {
  search: string;
  tags: string[];
  firstSlice?: any[];
  initNextCursor?: string;
}

export const HomeMasonry = ({
  search,
  tags,
  firstSlice,
  initNextCursor,
}: HomeMasonryProps) => {
  const t = useTranslations("Index.list");

  const [_, setStatus] = useAtom(refSiteSheetAtom);
  const bottomTriggerRef = useRef(null);
  const inView = useIntersectionObserver(bottomTriggerRef, {
    rootMargin: "0px 0px 100% 0px",
    threshold: 0,
  });

  const [sliceQuery, allSitesQuery] =
    api.refSites.queryWithCursor.useSuspenseInfiniteQuery(
      {
        limit: 14,
        search,
        tags,
      },
      {
        retry: 2,
        refetchOnWindowFocus: false,
        initialCursor: initNextCursor,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const allData = useMemo(() => {
    if (!initNextCursor) {
      return firstSlice || [];
    }
    return (
      firstSlice?.concat(sliceQuery.pages.map((page) => page.rows).flat()) || []
    );
  }, [sliceQuery.pages, firstSlice, initNextCursor]);

  const { isFetchingNextPage, fetchNextPage, hasNextPage } = allSitesQuery;

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="pb-8">
      {allData.length === 0 ? (
        <div className="flex min-h-96 w-full items-center justify-center">
          <div>{t("empty")}</div>
        </div>
      ) : (
        <>
          <Masonry
            items={allData}
            config={{
              columns: [1, 2, 3, 4],
              gap: [8, 12, 16, 24],
              media: [640, 768, 1024, 1280],
            }}
            render={(item) => (
              <SiteShowcase
                key={item.id}
                item={item}
                onClick={() => {
                  setStatus({ id: item.id });
                  trackEvent("viewSite", { id: item.id, name: item.siteName });
                  increment(`viewSite-${item.siteName}`, 1);
                }}
              />
            )}
          />

          <div className="mt-8 flex w-full justify-center">
            <Button
              ref={bottomTriggerRef}
              variant={"secondary"}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? t("loading")
                : hasNextPage
                  ? t("more")
                  : t("nothing")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
