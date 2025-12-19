import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { VersionGrid } from "@/components/shared/version-grid";
import { client } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/(app)/likes")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: LikesComponent,
});

interface LikeItem {
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
  liked: boolean;
}

interface LikesPage {
  items: LikeItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

function LikesComponent() {
  const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});

  // Fetch user's liked versions with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["app", "like", "getUserLikes"],
      queryFn: async ({ pageParam }) => {
        const result = await client.app.like.getUserLikes({
          limit: 12,
          cursor: pageParam,
        });
        return result as LikesPage;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  // Transform items
  const allItems = data?.pages.flatMap((page) => page.items) ?? [];
  const items = allItems.map((item) => ({
    version: item.version,
    page: item.page,
    site: item.site,
    liked: likeMap[item.version.id] ?? true, // Default to liked since this is the likes page
  }));

  // Handle like change
  const handleLikeChange = useCallback((versionId: string, liked: boolean) => {
    setLikeMap((prev) => ({ ...prev, [versionId]: liked }));
  }, []);

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
