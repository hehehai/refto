import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { VersionGrid } from "@/components/shared/version-grid";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/lib/orpc";

interface FeedItem {
  version: {
    id: string;
    webCover: string;
    webRecord: string | null;
    mobileCover: string | null;
    mobileRecord: string | null;
    createdAt: Date;
  };
  page: {
    id: string;
    title: string;
    url: string;
  };
  site: {
    id: string;
    title: string;
    logo: string;
    url: string;
  };
}

interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function FeedSection() {
  const { data: session } = authClient.useSession();
  const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});

  // Fetch versions feed with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["app", "site", "getVersionsFeed"],
      queryFn: async ({ pageParam }) => {
        const result = await client.app.site.getVersionsFeed({
          limit: 12,
          cursor: pageParam,
        });
        return result as FeedPage;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  // Get all version IDs from loaded data
  const allItems = data?.pages.flatMap((page) => page.items) ?? [];
  const versionIds = allItems.map((item) => item.version.id);

  // Fetch like status for all loaded versions (only if logged in)
  useQuery({
    ...orpc.app.like.checkLikeStatus.queryOptions({
      input: { versionIds },
    }),
    enabled: !!session && versionIds.length > 0,
    select: (likeData) => {
      // Update local like map
      setLikeMap((prev) => ({ ...prev, ...likeData }));
      return likeData;
    },
  });

  // Handle like change
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
        isLoading={isLoading || isFetchingNextPage}
        items={items}
        onLikeChange={handleLikeChange}
        onLoadMore={() => fetchNextPage()}
      />
    </section>
  );
}
