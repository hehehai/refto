import { Skeleton } from "@/components/ui/skeleton";

export function SiteDetailSkeleton() {
  return (
    <div className="space-y-4">
      {/* Logo */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-8" />
        <Skeleton className="size-16 rounded-lg" />
      </div>

      {/* Title */}
      <div>
        <Skeleton className="mb-1 h-3 w-8" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* URL */}
      <div>
        <Skeleton className="mb-1 h-3 w-6" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Description */}
      <div>
        <Skeleton className="mb-1 h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </div>

      {/* Tags */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-8" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <Skeleton className="mb-1 h-3 w-10" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="size-4 rounded" key={i} />
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <Skeleton className="mb-1 h-3 w-10" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
