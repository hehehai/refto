import { skipToken, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { orpc } from "@/lib/orpc";
import { MarkerRefsPanel } from "./marker-refs-panel";
import { RelatedSites } from "./related-sites";
import { SiteHero } from "./site-hero";
import { SitePageHeader } from "./site-page-header";
import { VersionViewer } from "./version-viewer";

interface SiteDetailPageProps {
  siteSlug: string;
  pageSlug?: string;
  versionSlug?: string;
}

export function SiteDetailPage({
  siteSlug,
  pageSlug,
  versionSlug,
}: SiteDetailPageProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");
  const [detailTab, setDetailTab] = useState<"record" | "refs">("record");
  const [liked, setLiked] = useState<boolean | null>(null);

  // Fetch version data by slug
  const { data } = useSuspenseQuery(
    orpc.app.site.getVersionBySlug.queryOptions({
      input: { siteSlug, pageSlug, versionSlug },
    })
  );

  const { site, currentPage, currentVersion, liked: initialLiked } = data;

  // Fetch related sites
  const { data: relatedSites = [] } = useSuspenseQuery(
    orpc.app.site.getRelatedSites.queryOptions({
      input: { siteId: site.id, limit: 6 },
    })
  );

  // Check if mobile content is available for current version
  const hasMobileContent = !!(
    currentVersion?.mobileCover || currentVersion?.mobileRecord
  );

  const { data: markers = [] } = useQuery(
    orpc.app.marker.list.queryOptions({
      input: currentVersion
        ? { versionId: currentVersion.id, recordType: viewMode }
        : skipToken,
    })
  );
  const showDetailTabs = markers.length > 0;

  useEffect(() => {
    if (!showDetailTabs && detailTab === "refs") {
      setDetailTab("record");
    }
  }, [showDetailTabs, detailTab]);

  // Use local liked state if available, otherwise use from API
  const isLiked = liked ?? initialLiked;

  const handleLikeChange = (newLiked: boolean) => {
    setLiked(newLiked);
  };

  // Navigation handlers using slugs
  const handlePageChange = (pageId: string) => {
    const selectedPage = site.pages.find((p) => p.id === pageId);
    if (selectedPage) {
      setLiked(null);
      navigate({
        to: "/$siteSlug/$pageSlug",
        params: { siteSlug: site.slug, pageSlug: selectedPage.slug },
      });
    }
  };

  const handleVersionChange = (versionId: string) => {
    if (!currentPage) return;
    const version = currentPage.versions.find((v) => v.id === versionId);
    if (version) {
      const versionDateSlug = format(version.versionDate, "yyyy-MM-dd");
      setLiked(null);
      navigate({
        to: "/$siteSlug/$pageSlug/$versionSlug",
        params: {
          siteSlug: site.slug,
          pageSlug: currentPage.slug,
          versionSlug: versionDateSlug,
        },
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Site Hero */}
      <SiteHero site={site} />

      {/* Page Tabs and Version Select */}
      <SitePageHeader
        activeDetailTab={detailTab}
        currentPageId={currentPage?.id ?? ""}
        currentVersionId={currentVersion?.id ?? ""}
        liked={isLiked}
        markersCount={markers.length}
        onDetailTabChange={setDetailTab}
        onLikeChange={handleLikeChange}
        onPageChange={handlePageChange}
        onVersionChange={handleVersionChange}
        pages={site.pages}
        showDetailTabs={showDetailTabs}
      />

      {/* Version Viewer */}
      {currentVersion && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            {detailTab === "record" ? (
              <VersionViewer
                className="relative mx-auto w-[88%] rounded-2xl bg-muted/50 p-18"
                hasMobileContent={hasMobileContent}
                markers={markers.map((marker) => ({
                  id: marker.id,
                  sequence: marker.sequence,
                  time: marker.time,
                  text: marker.text,
                }))}
                onViewModeChange={setViewMode}
                showMarkers={markers.length > 0}
                showShortcuts
                version={currentVersion}
                viewMode={viewMode}
              />
            ) : (
              <MarkerRefsPanel
                coverUrl={
                  viewMode === "web"
                    ? currentVersion.webCover
                    : currentVersion.mobileCover
                }
                markers={markers.map((marker) => ({
                  id: marker.id,
                  sequence: marker.sequence,
                  time: marker.time,
                  text: marker.text,
                }))}
                videoUrl={
                  viewMode === "web"
                    ? currentVersion.webRecord
                    : currentVersion.mobileRecord
                }
              />
            )}
          </div>
        </section>
      )}

      {/* Related Sites */}
      {relatedSites.length > 0 && <RelatedSites sites={relatedSites} />}
    </div>
  );
}
