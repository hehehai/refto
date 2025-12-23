import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RelatedSites } from "@/components/features/detail/related-sites";
import { SiteHero } from "@/components/features/detail/site-hero";
import { SitePageHeader } from "@/components/features/detail/site-page-header";
import { VersionViewer } from "@/components/features/detail/version-viewer";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(app)/$pageVersionId")({
  component: DetailComponent,
  loader: async ({ context, params }) => {
    const { pageVersionId } = params;
    const versionData = await context.queryClient.ensureQueryData(
      orpc.app.site.getVersionDetail.queryOptions({
        input: { id: pageVersionId },
      })
    );

    // Prefetch related sites if we have site id
    if (versionData?.page.site.id) {
      await context.queryClient.prefetchQuery(
        orpc.app.site.getRelatedSites.queryOptions({
          input: { siteId: versionData.page.site.id, limit: 6 },
        })
      );
    }
  },
});

function DetailComponent() {
  const { pageVersionId } = Route.useParams();
  const [selectedVersionId, setSelectedVersionId] = useState(pageVersionId);
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");
  const [liked, setLiked] = useState<boolean | null>(null);

  // Fetch version detail (SSR prefetched)
  const { data: versionData } = useSuspenseQuery(
    orpc.app.site.getVersionDetail.queryOptions({
      input: { id: selectedVersionId },
    })
  );

  // Fetch related sites (SSR prefetched for initial version)
  const { data: relatedSites = [] } = useSuspenseQuery(
    orpc.app.site.getRelatedSites.queryOptions({
      input: { siteId: versionData.page.site.id, limit: 6 },
    })
  );

  const { page, liked: initialLiked, ...version } = versionData;
  const { site } = page;

  // Find current page in site's pages
  const currentPage = site.pages.find((p) => p.id === page.id);
  const currentVersion = currentPage?.versions.find(
    (v) => v.id === selectedVersionId
  );

  // Check if mobile content is available for current version
  const hasMobileContent = !!(
    currentVersion?.mobileCover || currentVersion?.mobileRecord
  );

  // Use local liked state if available, otherwise use from API
  const isLiked = liked ?? initialLiked;

  const handleLikeChange = (newLiked: boolean) => {
    setLiked(newLiked);
  };

  return (
    <div className="flex flex-col">
      {/* Site Hero */}
      <SiteHero site={site} />

      {/* Page Tabs and Version Select */}
      <SitePageHeader
        currentPageId={page.id}
        currentVersionId={selectedVersionId}
        liked={isLiked}
        onLikeChange={handleLikeChange}
        onPageChange={(pageId) => {
          // Switch to the first version of the selected page
          const selectedPage = site.pages.find((p) => p.id === pageId);
          if (selectedPage?.versions[0]) {
            setSelectedVersionId(selectedPage.versions[0].id);
            setLiked(null); // Reset liked state for new version
          }
        }}
        onVersionChange={(versionId) => {
          setSelectedVersionId(versionId);
          setLiked(null); // Reset liked state for new version
        }}
        pages={site.pages}
      />

      {/* Version Viewer */}
      <VersionViewer
        hasMobileContent={hasMobileContent}
        onViewModeChange={setViewMode}
        version={currentVersion ?? version}
        viewMode={viewMode}
      />

      {/* Related Sites */}
      {relatedSites.length > 0 && <RelatedSites sites={relatedSites} />}
    </div>
  );
}
