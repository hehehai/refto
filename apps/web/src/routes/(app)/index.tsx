import { FeedSort } from "@refto-one/common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FeedSection } from "@/components/features/home/feed-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const searchSchema = z.object({
  sort: z
    .enum([FeedSort.LATEST, FeedSort.TRENDING, FeedSort.POPULAR])
    .optional()
    .default(FeedSort.LATEST),
});

const homeMeta = createPageMeta({
  description:
    "Unleash limitless inspiration. Embrace pure simplicity. Discover curated website designs.",
  url: "/",
});

export const Route = createFileRoute("/(app)/")({
  component: HomeComponent,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ sort: search.sort }),
  head: () => ({
    meta: homeMeta.meta,
    links: homeMeta.links,
  }),
  loader: async ({ context, deps }) => {
    const { sort } = deps;
    await Promise.all([
      context.queryClient.ensureQueryData(
        orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
      ),
      context.queryClient.prefetchInfiniteQuery(
        orpc.app.site.getVersionsFeed.infiniteOptions({
          input: (pageParam) => ({ cursor: pageParam, limit: 12, sort }),
          initialPageParam: undefined as string | undefined,
          getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        })
      ),
    ]);
  },
});

function HomeComponent() {
  const { sort } = Route.useSearch();

  const { data: pinnedSites } = useSuspenseQuery(
    orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
  );

  return (
    <div className="flex flex-col">
      {/* Hero section with tagline and pinned sites */}
      <HeroSection pinnedSites={pinnedSites} sort={sort} />

      {/* Feed section with infinite scroll grid */}
      <FeedSection sort={sort} />
    </div>
  );
}
