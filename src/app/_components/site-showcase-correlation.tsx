"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/trpc/react";
import { SiteShowcase } from "./site-showcase";

const correlationSkeleton = () =>
  Array.from({ length: 6 }, (_, i) => (
    <Skeleton
      className="h-[400px] w-full rounded-xl bg-slate-200"
      key={i as React.Key}
    />
  ));

export const SiteShowcaseCorrelationSkeleton = () => correlationSkeleton();

export const SiteShowcaseCorrelation = ({
  id,
  onDetailAction,
}: {
  id: string;
  onDetailAction?: (id: string) => void;
}) => {
  const t = useTranslations("Detail.correlation");
  const sitesQuery = api.refSites.correlation.useQuery({ id });

  return (
    <div>
      <div className="mb-3 text-lg md:mb-6 md:text-2xl">{t("title")}</div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 smg:gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
        {sitesQuery.isPending ? (
          <SiteShowcaseCorrelationSkeleton />
        ) : (
          sitesQuery.data?.map((item) => (
            <SiteShowcase
              fixedHeight={280}
              item={item}
              key={item.id}
              onDetail={() => onDetailAction?.(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
