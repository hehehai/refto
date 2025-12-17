import { Skeleton } from "@/components/ui/skeleton";

export function VersionFormSkeleton() {
  return (
    <div className="space-y-4">
      {/* OG Image */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-16" />
        <Skeleton className="h-32 w-full max-w-xs rounded-lg" />
      </div>

      {/* Web Cover */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-20" />
        <Skeleton className="aspect-video w-full max-w-md rounded-lg" />
      </div>

      {/* Web Record */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-24" />
        <Skeleton className="h-10 w-full max-w-md rounded" />
      </div>

      {/* Mobile Cover */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-24" />
        <Skeleton className="aspect-[9/16] w-32 rounded-lg" />
      </div>

      {/* Mobile Record */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-28" />
        <Skeleton className="h-10 w-full max-w-md rounded" />
      </div>
    </div>
  );
}
