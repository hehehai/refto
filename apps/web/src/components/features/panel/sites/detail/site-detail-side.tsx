import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { siteDetailSheet, siteEditSheet } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { SiteDetailView } from "../common/site-detail-view";
import { useSiteDetail } from "./site-detail-context";

export function SiteDetailSide() {
  const { site, isLoading } = useSiteDetail();

  const handleEdit = () => {
    if (!site) return;
    siteDetailSheet.close();
    siteEditSheet.openWithPayload({ siteId: site.id });
  };

  return (
    <div className="h-full w-100 shrink-0 border-r">
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
        {isLoading ? (
          <SiteDetailSideSkeleton />
        ) : site ? (
          <>
            <SiteDetailView
              site={{
                title: site.title,
                description: site.description ?? "",
                logo: site.logo ?? "",
                url: site.url,
                tags: site.tags,
                rating: site.rating ?? 0,
                isPinned: site.isPinned,
              }}
            />

            {/* Extra info */}
            <div className="mt-6 space-y-4">
              {/* Visits */}
              <InfoRow label="Visits" value={site.visits.toLocaleString()} />

              {/* Created */}
              <InfoRow
                label="Created"
                value={format(site.createdAt, "MMM d, yyyy")}
              />

              {/* Updated */}
              <InfoRow
                label="Updated"
                value={format(site.updatedAt, "MMM d, yyyy")}
              />

              {/* Creator */}
              {site.createdBy && (
                <div>
                  <span className="mb-1.5 block font-medium text-muted-foreground text-xs">
                    Creator
                  </span>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarImage src={site.createdBy.image ?? undefined} />
                      <AvatarFallback>
                        {site.createdBy.name?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {site.createdBy.name ?? "Unknown"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-auto flex h-14 items-center justify-between gap-2 border-border border-t px-3">
        <SheetClose
          className={cn(
            "border-border!",
            buttonVariants({ variant: "outline" })
          )}
        >
          Close
        </SheetClose>
        <Button onClick={handleEdit} variant="outline">
          <span className="i-hugeicons-edit-02 mr-1.5 size-4" />
          Edit Site
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block font-medium text-muted-foreground text-xs">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function SiteDetailSideSkeleton() {
  return (
    <div className="space-y-4">
      {/* Logo */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-10" />
        <Skeleton className="size-16 rounded-lg" />
      </div>

      {/* Title */}
      <div>
        <Skeleton className="mb-1 h-3 w-10" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* URL */}
      <div>
        <Skeleton className="mb-1 h-3 w-8" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Description */}
      <div>
        <Skeleton className="mb-1 h-3 w-20" />
        <Skeleton className="h-16 w-full" />
      </div>

      {/* Tags */}
      <div>
        <Skeleton className="mb-1.5 h-3 w-10" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <Skeleton className="mb-1 h-3 w-12" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Status */}
      <div>
        <Skeleton className="mb-1 h-3 w-12" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Extra info */}
      <div className="mt-6 space-y-4">
        <div>
          <Skeleton className="mb-1 h-3 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-14" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-14" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          <Skeleton className="mb-1.5 h-3 w-14" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
