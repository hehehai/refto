import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { VersionGrid } from "@/components/shared/version-grid";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";

export function FeedSection() {
  const { data: session } = authClient.useSession();
  const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});

  // Use suspense infinite query - data already prefetched on server
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      orpc.app.site.getVersionsFeed.infiniteOptions({
        input: (pageParam) => ({ cursor: pageParam, limit: 12 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      })
    );

  // Get all version IDs from loaded data
  const allItems = data.pages.flatMap((page) => page.items);
  const versionIds = allItems.map((item) => item.version.id);

  // Fetch like status for all loaded versions (only if logged in)
  useQuery({
    ...orpc.app.like.checkLikeStatus.queryOptions({
      input: { versionIds },
    }),
    enabled: !!session && versionIds.length > 0,
    select: (likeData) => {
      setLikeMap((prev) => ({ ...prev, ...likeData }));
      return likeData;
    },
  });

  const handleLikeChange = useCallback((versionId: string, liked: boolean) => {
    setLikeMap((prev) => ({ ...prev, [versionId]: liked }));
  }, []);

  // Transform items to include like status
  const items = allItems.map((item) => ({
    version: item.version,
    page: item.page,
    site: item.site,
    liked: likeMap[item.version.id] ?? false,
  }));

  return (
    <section className="container mx-auto px-4 py-8">
      <VersionGrid
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        items={items}
        onLikeChange={handleLikeChange}
        onLoadMore={() => fetchNextPage()}
      />
    </section>
  );
}
