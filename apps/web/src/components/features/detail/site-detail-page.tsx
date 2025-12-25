import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { orpc } from "@/lib/orpc";
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
  );
}
