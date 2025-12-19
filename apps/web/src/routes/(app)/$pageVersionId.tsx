import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTabs } from "@/components/features/detail/page-tabs";
import { RelatedSites } from "@/components/features/detail/related-sites";
import { SiteHero } from "@/components/features/detail/site-hero";
import { VersionViewer } from "@/components/features/detail/version-viewer";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(app)/$pageVersionId")({
  component: DetailComponent,
});

function DetailComponent() {
  const { pageVersionId } = Route.useParams();
  const [selectedVersionId, setSelectedVersionId] = useState(pageVersionId);
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");

  // Fetch version detail
  const { data: versionData, isLoading } = useQuery(
    orpc.app.site.getVersionDetail.queryOptions({
      input: { id: selectedVersionId },
    })
  );

  // Fetch related sites
  const { data: relatedSites = [] } = useQuery({
    ...orpc.app.site.getRelatedSites.queryOptions({
      input: { siteId: versionData?.page.site.id ?? "", limit: 6 },
    }),
    enabled: !!versionData?.page.site.id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="i-hugeicons-loading-01 animate-spin text-4xl text-muted-foreground" />
      </div>
    );
  }

  if (!versionData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-muted-foreground">
        <span className="i-hugeicons-alert-02 text-4xl" />
        <p className="mt-2">Version not found</p>
      </div>
    );
  }

  const { page, ...version } = versionData;
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

  return (
    <div className="flex flex-col">
      {/* Site Hero */}
      <SiteHero site={site} />

      {/* Page Tabs and Version Select */}
      <PageTabs
        currentPageId={page.id}
        currentVersionId={selectedVersionId}
        onPageChange={(pageId) => {
          // Switch to the first version of the selected page
          const selectedPage = site.pages.find((p) => p.id === pageId);
          if (selectedPage?.versions[0]) {
            setSelectedVersionId(selectedPage.versions[0].id);
          }
        }}
        onVersionChange={setSelectedVersionId}
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
