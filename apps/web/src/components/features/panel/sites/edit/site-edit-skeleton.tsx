import { Skeleton } from "@/components/ui/skeleton";
import { SiteDetailSkeleton } from "../common/site-detail-skeleton";

export function SiteEditSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Site info */}
      <div className="h-full w-100 shrink-0 border-r">
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
          <SiteDetailSkeleton />
        </div>
        <div className="mt-auto flex h-14 items-center justify-between gap-2 border-border border-t px-4">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Middle: Page tabs */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-1 border-b px-2 py-1.5">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Version tabs (vertical) */}
          <div className="w-40 shrink-0 space-y-1 border-r p-2">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="mt-2 h-8 w-full rounded" />
          </div>

          {/* Version form */}
          <div className="flex-1 space-y-4 p-4">
            <div>
              <Skeleton className="mb-1.5 h-3 w-16" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-3 w-20" />
              <Skeleton className="aspect-video w-full max-w-md rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-3 w-24" />
              <Skeleton className="h-10 w-full max-w-md rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
