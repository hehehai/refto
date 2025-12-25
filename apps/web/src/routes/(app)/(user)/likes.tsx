import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { VersionGrid } from "@/components/shared/version-grid";
import { orpc } from "@/lib/orpc";
import type { UserLikesOutput } from "@/lib/orpc-types";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";

const likesMeta = createPageMeta({
  title: "My Likes",
  description: "Your saved design inspirations on Refto.",
  url: "/likes",
  noIndex: true,
});

export const Route = createFileRoute("/(app)/(user)/likes")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: LikesComponent,
  head: () => ({
    meta: likesMeta.meta,
    links: likesMeta.links,
  }),
});

function LikesComponent() {
  const queryClient = useQueryClient();

  const infiniteOptions = useMemo(
    () =>
      orpc.app.like.getUserLikes.infiniteOptions({
        input: (pageParam) => ({ cursor: pageParam, limit: 12 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    []
  );

  // Fetch user's liked versions with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(infiniteOptions);

  // Transform items
  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) ?? [];
    return allItems.map((item) => ({
      version: item.version,
      page: item.page,
      site: item.site,
      liked: true, // Default to liked since this is the likes page
    }));
  }, [data]);

  // Handle like change - remove from list when unliked
  const handleLikeChange = useCallback(
    (versionId: string, liked: boolean) => {
      if (!liked) {
        // Remove the item from the cache when unliked
        queryClient.setQueryData(
          infiniteOptions.queryKey,
          (
            oldData:
              | { pages: UserLikesOutput[]; pageParams: (string | undefined)[] }
              | undefined
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.filter(
                  (item) => item.version.id !== versionId
                ),
              })),
            };
          }
        );
      }
    },
    [queryClient, infiniteOptions.queryKey]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">My Likes</h1>

      <VersionGrid
        hasMore={hasNextPage}
        isLoading={isLoading || isFetchingNextPage}
        items={items}
        onLikeChange={handleLikeChange}
        onLoadMore={() => fetchNextPage()}
      />
    </div>
  );
}
