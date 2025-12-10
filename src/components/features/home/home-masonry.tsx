"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import { Masonry } from "react-plock";
import { refSiteSheetAtom } from "@/app/_store/sheet.store";
import { SiteShowcase } from "@/components/features/site/site-showcase";
import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { orpc } from "@/lib/orpc/react";

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
  const [_, setStatus] = useAtom(refSiteSheetAtom);
  const bottomTriggerRef = useRef(null);
  const inView = useIntersectionObserver(bottomTriggerRef, {
    rootMargin: "0px 0px 100% 0px",
    threshold: 0,
  });

  const allSitesQuery = useSuspenseInfiniteQuery(
    orpc.sites.queryWithCursor.infiniteOptions({
      input: (pageParam) => ({
        limit: 16,
        search,
        tags,
        cursor: pageParam,
      }),
      initialPageParam: initNextCursor,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      retry: 2,
      refetchOnWindowFocus: false,
    })
  );

  const sliceQuery = allSitesQuery.data;

  const allData = useMemo(() => {
    if (!initNextCursor) {
      return firstSlice || [];
    }
    return (
      firstSlice?.concat(sliceQuery.pages.flatMap((page) => page.rows)) || []
    );
  }, [sliceQuery.pages, firstSlice, initNextCursor]);

  const { isFetchingNextPage, fetchNextPage, hasNextPage } = allSitesQuery;

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="pb-8">
      {allData.length === 0 ? (
        <div className="flex min-h-96 w-full items-center justify-center">
          <div>No sites found</div>
        </div>
      ) : (
        <>
          <Masonry
            config={{
              columns: [1, 2, 3, 3],
              gap: [8, 12, 16, 24],
              media: [640, 768, 1024, 1280],
            }}
            items={allData}
            render={(item) => (
              <SiteShowcase
                item={item}
                key={item.id}
                onDetail={() => {
                  setStatus({ id: item.id });
                }}
              />
            )}
          />

          <div className="mt-8 flex w-full justify-center">
            <Button
              disabled={!hasNextPage || isFetchingNextPage}
              onClick={() => fetchNextPage()}
              ref={bottomTriggerRef}
              variant={"secondary"}
            >
              {isFetchingNextPage
                ? "Loading..."
                : hasNextPage
                  ? "Load More"
                  : "No more sites"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
