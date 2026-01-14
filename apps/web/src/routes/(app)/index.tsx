import { FeedSort, site } from "@refto-one/common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FeedSection } from "@/components/features/home/feed-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const searchSchema = z.object({
  sort: z
    .enum([FeedSort.LATEST, FeedSort.TRENDING, FeedSort.POPULAR])
    .optional()
    .default(FeedSort.LATEST),
  tag: z.string().optional(), // Filter by tag values (comma-separated: "hero,footer")
  q: z.string().optional(), // Search query
});

const homeMeta = createPageMeta({
  description: `${site.description} Discover curated website designs.`,
  url: "/",
});

export const Route = createFileRoute("/(app)/")({
  component: HomeComponent,
  pendingComponent: HomeSkeleton,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    sort: search.sort,
    tags: search.tag?.split(",").filter(Boolean),
  }),
  head: () => ({
    meta: homeMeta.meta,
    links: homeMeta.links,
  }),
  loader: async ({ context, deps }) => {
    const { sort, tags } = deps;
    await Promise.all([
      context.queryClient.ensureQueryData(
        orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
      ),
      context.queryClient.prefetchInfiniteQuery(
        orpc.app.site.getVersionsFeed.infiniteOptions({
          input: (pageParam) => ({ cursor: pageParam, limit: 12, sort, tags }),
          initialPageParam: undefined as string | undefined,
          getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        })
      ),
    ]);
  },
});

function HomeComponent() {
  const { sort, tag } = Route.useSearch();
  const tags = tag?.split(",").filter(Boolean);

  const { data: pinnedSites } = useSuspenseQuery(
    orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
  );

  return (
    <div className="flex flex-col">
      {/* Hero section with tagline and pinned sites */}
      <HeroSection currentTag={tag} pinnedSites={pinnedSites} sort={sort} />

      {/* Feed section with infinite scroll grid */}
      <FeedSection sort={sort} tags={tags} />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col">
      <section className="w-full">
        <div className="container mx-auto px-4 pt-20 pb-10">
          <div className="flex items-end justify-between gap-32">
            <div className="w-1/2 space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-16 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
            <div className="grid w-1/2 grid-cols-2 gap-8">
              <div className="flex flex-col justify-end">
                <Skeleton className="aspect-video w-full rounded-xl" />
              </div>
              <div className="flex flex-col justify-end gap-8">
                {[0, 1].map((i) => (
                  <Skeleton
                    className="aspect-video w-full rounded-xl"
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="space-y-3 rounded-2xl bg-muted p-3" key={idx}>
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
