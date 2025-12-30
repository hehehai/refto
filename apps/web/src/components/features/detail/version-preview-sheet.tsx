import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Suspense, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { orpc } from "@/lib/orpc";
import { versionPreviewSheet } from "@/lib/sheets";
import { RelatedSites } from "./related-sites";
import { SiteHero } from "./site-hero";
import { SitePageHeader } from "./site-page-header";
import { VersionViewer } from "./version-viewer";

function VersionPreviewContent({
  siteSlug,
  pageSlug,
  versionSlug,
  open,
}: {
  siteSlug: string;
  pageSlug: string;
  versionSlug: string;
  open: boolean;
}) {
  const { setMeta, restore } = useDocumentMeta();
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");
  const [liked, setLiked] = useState<boolean | null>(null);
  const [currentPageSlug, setCurrentPageSlug] = useState(pageSlug);
  const [currentVersionSlug, setCurrentVersionSlug] = useState(versionSlug);

  // Fetch version data by slug
  const { data } = useSuspenseQuery(
    orpc.app.site.getVersionBySlug.queryOptions({
      input: {
        siteSlug,
        pageSlug: currentPageSlug,
        versionSlug: currentVersionSlug,
      },
    })
  );

  const { site, currentPage, currentVersion, liked: initialLiked } = data;

  // Track page view
  const trackPageView = useMutation({
    mutationFn: () =>
      orpc.app.filter.trackPageView.call({
        siteId: site.id,
        pageId: currentPage?.id,
      }),
  });

  useEffect(() => {
    // Track page view on mount (only once per page load)
    trackPageView.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site.id, currentPage?.id]);

  // Fetch related sites
  const { data: relatedSites = [] } = useSuspenseQuery(
    orpc.app.site.getRelatedSites.queryOptions({
      input: { siteId: site.id, limit: 6 },
    })
  );

  // Update document meta when sheet opens or content changes
  useEffect(() => {
    if (open && site && currentPage) {
      const title = `${site.title} - ${currentPage.title} | Refto`;
      const url = `/${siteSlug}/${currentPageSlug}/${currentVersionSlug}`;
      setMeta(title, url);
    }

    return () => {
      if (!open) {
        restore();
      }
    };
  }, [
    open,
    site,
    currentPage,
    siteSlug,
    currentPageSlug,
    currentVersionSlug,
    setMeta,
    restore,
  ]);

  // Restore when sheet closes
  useEffect(() => {
    if (!open) {
      restore();
    }
  }, [open, restore]);

  // Check if mobile content is available for current version
  const hasMobileContent = !!(
    currentVersion?.mobileCover || currentVersion?.mobileRecord
  );

  // Use local liked state if available, otherwise use from API
  const isLiked = liked ?? initialLiked;

  const handleLikeChange = (newLiked: boolean) => {
    setLiked(newLiked);
  };

  // Handle page change within sheet
  const handlePageChange = (pageId: string) => {
    const selectedPage = site.pages.find((p) => p.id === pageId);
    if (selectedPage) {
      setLiked(null);
      setCurrentPageSlug(selectedPage.slug);
      // Reset to first version of new page
      const firstVersion = selectedPage.versions[0];
      if (firstVersion) {
        setCurrentVersionSlug(format(firstVersion.versionDate, "yyyy-MM-dd"));
      }
    }
  };

  // Handle version change within sheet
  const handleVersionChange = (versionId: string) => {
    if (!currentPage) return;
    const version = currentPage.versions.find((v) => v.id === versionId);
    if (version) {
      setLiked(null);
      setCurrentVersionSlug(format(version.versionDate, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col">
          {/* Site Hero */}
          <SiteHero site={site} />

          {/* Page Tabs and Version Select */}
          <SitePageHeader
            currentPageId={currentPage?.id ?? ""}
            currentVersionId={currentVersion?.id ?? ""}
            liked={isLiked}
            onLikeChange={handleLikeChange}
            onPageChange={handlePageChange}
            onVersionChange={handleVersionChange}
            pages={site.pages}
          />

          {/* Version Viewer */}
          {currentVersion && (
            <VersionViewer
              hasMobileContent={hasMobileContent}
              onViewModeChange={setViewMode}
              version={currentVersion}
              viewMode={viewMode}
            />
          )}

          {/* Related Sites */}
          {relatedSites.length > 0 && <RelatedSites sites={relatedSites} />}
        </div>
      </div>
    </div>
  );
}

function VersionPreviewSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Hero skeleton */}
      <div className="border-b p-6">
        <div className="container mx-auto flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-xl bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      {/* Header skeleton */}
      <div className="border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            <div className="size-9 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-8">
        <div className="mx-auto aspect-video w-[88%] animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

export function VersionPreviewSheet() {
  return (
    <Sheet handle={versionPreviewSheet}>
      {({ payload }) =>
        payload && (
          <SheetContent
            className="gap-0 overflow-hidden rounded-t-2xl p-0 data-[side=bottom]:h-[calc(100dvh-4rem)]"
            showCloseButton
            side="bottom"
          >
            <SheetTitle className="sr-only">Site Preview</SheetTitle>
            <SheetDescription className="sr-only">
              Preview of the site version
            </SheetDescription>
            <Suspense fallback={<VersionPreviewSkeleton />}>
              <VersionPreviewContent
                open={true}
                pageSlug={payload.pageSlug}
                siteSlug={payload.siteSlug}
                versionSlug={payload.versionSlug}
              />
            </Suspense>
          </SheetContent>
        )
      }
    </Sheet>
  );
}
