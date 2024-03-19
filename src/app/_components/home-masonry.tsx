"use client";

import { Masonry } from "react-plock";
import { api } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { SiteShowcase } from "./site-showcase";
import { useAtom } from "jotai";
import { refSiteSheetAtom } from "../_store/sheet.store";
import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface HomeMasonryProps {
  search: string;
  tags: string[];
}

export const HomeMasonry = ({ search, tags }: HomeMasonryProps) => {
  const [_, setStatus] = useAtom(refSiteSheetAtom);
  const bottomTriggerRef = useRef(null);
  const inView = useIntersectionObserver(bottomTriggerRef, {
    rootMargin: "0px 0px 50% 0px",
    threshold: 0,
  });

  const [pages, allSitesQuery] =
    api.refSites.queryWithCursor.useSuspenseInfiniteQuery(
      {
        limit: 16,
        search,
        tags,
      },
      {
        retry: 2,
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const allData = pages.pages.map((page) => page.rows).flat();

  const { isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    allSitesQuery;

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="pb-8">
      {!isFetching && allData.length === 0 ? (
        <div className="flex min-h-96 w-full items-center justify-center">
          <div>No sites found.</div>
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
                ? "Loading more..."
                : hasNextPage
                  ? "Load More"
                  : "Nothing more to load"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
