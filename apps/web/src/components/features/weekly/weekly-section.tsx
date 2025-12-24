import {
  type InfiniteData,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import InViewLoader from "@/components/shared/in-view-loader";
import { VersionCard } from "@/components/shared/version-card";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs } from "@/lib/orpc-types";

type WeeklyFeedOutput = ClientOutputs["app"]["site"]["getWeeklyFeed"];
type WeekData = WeeklyFeedOutput["weeks"][number];

const MAX_UNAUTH_WEEKS = 3;

export function WeeklySection() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const infiniteOptions = useMemo(
    () =>
      orpc.app.site.getWeeklyFeed.infiniteOptions({
        input: (pageParam) => ({ cursor: pageParam ?? 0, limit: 3 }),
        initialPageParam: 0 as number | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    []
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(infiniteOptions);

  const allWeeks = data.pages.flatMap((page) => page.weeks);

  const isAuthenticated = !!session?.user;
  const displayWeeks = isAuthenticated
    ? allWeeks
    : allWeeks.slice(0, MAX_UNAUTH_WEEKS);

  const canLoadMore = isAuthenticated
    ? hasNextPage
    : hasNextPage && allWeeks.length < MAX_UNAUTH_WEEKS;

  const handleLikeChange = useCallback(
    (versionId: string, liked: boolean) => {
      // Update the item in the infinite query cache
      queryClient.setQueryData<InfiniteData<WeeklyFeedOutput>>(
        infiniteOptions.queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              weeks: page.weeks.map((week) => ({
                ...week,
                items: week.items.map((item) =>
                  item.version.id === versionId ? { ...item, liked } : item
                ),
              })),
            })),
          };
        }
      );
    },
    [queryClient, infiniteOptions.queryKey]
  );

  if (displayWeeks.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {displayWeeks.map((week) => (
        <WeekGroup
          key={week.weekOffset}
          onLikeChange={handleLikeChange}
          week={week}
        />
      ))}

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

      {!isAuthenticated && allWeeks.length >= MAX_UNAUTH_WEEKS && (
        <div className="border-t py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Sign in to see more weekly content
          </p>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
            to="/signin"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

interface WeekGroupProps {
  week: WeekData;
  onLikeChange: (versionId: string, liked: boolean) => void;
}

function WeekGroup({ week, onLikeChange }: WeekGroupProps) {
  const formatDateRange = () => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (week.isCurrent) {
      return `${formatDate(start)} - Now`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <section>
      {/* Week header */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-semibold text-foreground text-lg">
          {formatDateRange()}
        </h2>
        {week.isCurrent && (
          <Badge className="text-xs" variant="secondary">
            This Week
          </Badge>
        )}
      </div>

      {/* Grid of items - same as home page */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {week.items.map((item) => (
          <VersionCard
            key={item.version.id}
            liked={item.liked}
            onLikeChange={(liked) => onLikeChange(item.version.id, liked)}
            page={item.page}
            site={item.site}
            version={item.version}
          />
        ))}
      </div>
    </section>
  );
}
