import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { WeeklySection } from "@/components/features/weekly/weekly-section";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const weeklyMeta = createPageMeta({
  title: "Weekly Top",
  description:
    "Top liked designs of the week. Discover trending website inspiration.",
  url: "/weekly",
});

export const Route = createFileRoute("/(app)/weekly")({
  component: WeeklyPage,
  head: () => ({
    meta: weeklyMeta.meta,
    links: weeklyMeta.links,
  }),
  loader: async ({ context }) => {
    // Prefetch first 3 weeks
    await context.queryClient.prefetchInfiniteQuery(
      orpc.app.site.getWeeklyFeed.infiniteOptions({
        input: (pageParam) => ({ cursor: pageParam ?? 0, limit: 3 }),
        initialPageParam: 0 as number | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      })
    );
  },
});

function WeeklyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="mb-2 font-bold text-3xl tracking-tight">Weekly Top</h1>
        <p className="text-muted-foreground">
          Top liked designs of the week. Like to vote!
        </p>
      </header>

      <Suspense fallback={<WeeklyLoadingSkeleton />}>
        <WeeklySection />
      </Suspense>
    </div>
  );
}

function WeeklyLoadingSkeleton() {
  return (
    <div className="space-y-16">
      {[0, 1, 2].map((weekIdx) => (
        <section key={weekIdx}>
          {/* Week header skeleton */}
          <div className="mb-6">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="overflow-hidden rounded-2xl bg-card" key={i}>
                <div className="bg-muted p-3">
                  <div className="aspect-video animate-pulse rounded-[10px] bg-muted-foreground/10" />
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 pb-1.5">
                  <div className="size-5.5 animate-pulse rounded bg-muted-foreground/10" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
