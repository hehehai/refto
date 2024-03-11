"use client";

import { api } from "@/lib/trpc/react";
import { SiteShowcase } from "./site-showcase";
import { Skeleton } from "@/components/ui/skeleton";

const correlationSkeleton = () => {
  return Array.from({ length: 6 }, (_, i) => (
    <Skeleton key={i} className="h-[400px] w-full rounded-xl bg-slate-200" />
  ));
};

export const SiteShowcaseCorrelationSkeleton = () => {
  return correlationSkeleton();
};

export const SiteShowcaseCorrelation = ({
  id,
  onDetail,
}: {
  id: string;
  onDetail?: (id: string) => void;
}) => {
  const sitesQuery = api.refSites.correlation.useQuery({ id });

  return (
    <div>
      <div className="mb-6 text-2xl">You might also like</div>
      <div className="grid w-full grid-cols-3 gap-8">
        {sitesQuery.isLoading ? (
          <SiteShowcaseCorrelationSkeleton />
        ) : (
          sitesQuery.data?.map((item) => (
            <SiteShowcase
              key={item.id}
              item={item}
              fixedHeight={400}
              onClick={() => onDetail?.(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
