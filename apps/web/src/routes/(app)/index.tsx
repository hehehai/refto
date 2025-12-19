import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FeedSection } from "@/components/features/home/feed-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(app)/")({
  component: HomeComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
      ),
      context.queryClient.prefetchInfiniteQuery(
        orpc.app.site.getVersionsFeed.infiniteOptions({
          input: (pageParam) => ({ cursor: pageParam, limit: 12 }),
          initialPageParam: undefined as string | undefined,
          getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        })
      ),
    ]);
  },
});

function HomeComponent() {
  const { data: pinnedSites } = useSuspenseQuery(
    orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
  );

  return (
    <div className="flex flex-col">
      {/* Hero section with tagline and pinned sites */}
      <HeroSection pinnedSites={pinnedSites} />

      {/* Feed section with infinite scroll grid */}
      <FeedSection />
    </div>
  );
}
