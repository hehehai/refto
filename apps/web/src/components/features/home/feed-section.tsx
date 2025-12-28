import type { FeedSortType } from "@refto-one/common";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import InViewLoader from "@/components/shared/in-view-loader";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { updateInfiniteQueryItem } from "@/lib/query-helpers";
import { FeedEmpty } from "./feed-empty";
import { FeedList } from "./feed-list";
import type { FeedItem } from "./feed-types";

const MAX_UNAUTH_ITEMS = 36;

interface FeedSectionProps {
  sort: FeedSortType;
  tags?: string[];
}

export function FeedSection({ sort, tags }: FeedSectionProps) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Create infinite options with sort parameter
  const infiniteOptions = useMemo(
    () =>
      orpc.app.site.getVersionsFeed.infiniteOptions({
        input: (pageParam) => ({ cursor: pageParam, limit: 12, sort, tags }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    [sort, tags]
  );

  // Use suspense infinite query - data already prefetched on server
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(infiniteOptions);

  // Get all items from loaded pages (liked status now comes from API)
  const allItems = data.pages.flatMap((page) => page.items);

  // For unauthenticated users, limit to MAX_UNAUTH_ITEMS
  const isAuthenticated = !!session;
  const displayItems = isAuthenticated
    ? allItems
    : allItems.slice(0, MAX_UNAUTH_ITEMS);

  // Determine if there are more items to load
  const canLoadMore = isAuthenticated
    ? hasNextPage
    : hasNextPage && allItems.length < MAX_UNAUTH_ITEMS;

  // Update query data when like status changes
  const handleLikeChange = useCallback(
    (versionId: string, liked: boolean) => {
      updateInfiniteQueryItem<FeedItem>(
        queryClient,
        infiniteOptions.queryKey,
        versionId,
        (item) => ({ ...item, liked }),
        (item) => item.version.id
      );
    },
    [queryClient, infiniteOptions.queryKey]
  );

  // Empty state
  if (displayItems.length === 0 && !isFetchingNextPage) {
    return (
      <section className="container mx-auto px-4 py-8">
        <FeedEmpty />
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <FeedList items={displayItems} onLikeChange={handleLikeChange} />
      {(canLoadMore || isFetchingNextPage) && (
        <InViewLoader
          className="flex items-center justify-center py-8"
          loadCondition={canLoadMore && !isFetchingNextPage}
          loadFn={fetchNextPage}
        >
          {isFetchingNextPage && (
            <span className="i-hugeicons-loading-01 animate-spin text-2xl text-muted-foreground" />
          )}
        </InViewLoader>
      )}
    </section>
  );
}
