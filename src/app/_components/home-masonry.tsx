"use client";

import { Masonry } from "react-plock";
import { api } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { HomeShowcase } from "./home-showcase";

interface HomeMasonryProps {
  search: string;
  tags: string[];
}

export const HomeMasonry = ({ search, tags }: HomeMasonryProps) => {
  const [pages, allSitesQuery] =
    api.refSites.queryWithCursor.useSuspenseInfiniteQuery(
      {
        limit: 20,
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
              gap: [16, 16, 24, 32],
              media: [640, 768, 1024, 1280],
            }}
            render={(item) => <HomeShowcase item={item} />}
          />

          <div className="mt-8 flex w-full justify-center">
            <Button
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
