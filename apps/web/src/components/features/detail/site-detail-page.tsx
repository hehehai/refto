import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import slugify from "slug";
import { orpc } from "@/lib/orpc";
import { MarkerRefsPanel } from "./marker-refs-panel";
import { RelatedSites } from "./related-sites";
import { SiteHero } from "./site-hero";
import { SitePageHeader } from "./site-page-header";
import { VersionViewer } from "./version-viewer";

const HASH_PREFIX = /^#/;

interface SiteDetailPageProps {
  siteSlug: string;
  pageSlug?: string;
  versionSlug?: string;
  panel?: "record" | "refs";
}

export function SiteDetailPage({
  siteSlug,
  pageSlug,
  versionSlug,
  panel,
}: SiteDetailPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [detailTab, setDetailTab] = useState<"record" | "refs">(
    panel === "refs" ? "refs" : "record"
  );
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

  type MarkerListResult = Awaited<ReturnType<typeof orpc.app.marker.list.call>>;
  const markersQueryOptions = currentVersion
    ? orpc.app.marker.list.queryOptions({
        input: { versionId: currentVersion.id },
      })
    : {
        queryKey: ["markers", "empty"],
        queryFn: async (): Promise<MarkerListResult> => [],
      };
  const { data: markers = [] } = useSuspenseQuery(markersQueryOptions);
  const showDetailTabs = markers.length > 0;
  const orderedMarkers = useMemo(
    () =>
      [...markers].sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.id.localeCompare(b.id);
      }),
    [markers]
  );
  const markerSlugEntries = useMemo(() => {
    const seen = new Map<string, number>();
    return orderedMarkers.map((marker, index) => {
      const baseSlug = marker.text
        ? slugify(marker.text, { lower: true })
        : `marker-${index + 1}`;
      const normalized = baseSlug || `marker-${index + 1}`;
      const dupCount = (seen.get(normalized) ?? 0) + 1;
      seen.set(normalized, dupCount);
      const slug = dupCount > 1 ? `${normalized}-${dupCount}` : normalized;
      return { id: marker.id, slug, time: marker.time };
    });
  }, [orderedMarkers]);
  const markerSlugById = useMemo(
    () => new Map(markerSlugEntries.map((entry) => [entry.id, entry.slug])),
    [markerSlugEntries]
  );
  const markerIdBySlug = useMemo(
    () => new Map(markerSlugEntries.map((entry) => [entry.slug, entry.id])),
    [markerSlugEntries]
  );
  const markerHash = location.hash.replace(HASH_PREFIX, "");
  const focusMarkerTime = useMemo(() => {
    if (!markerHash) return null;
    const id = markerIdBySlug.get(markerHash);
    if (!id) return null;
    return orderedMarkers.find((marker) => marker.id === id)?.time ?? null;
  }, [markerHash, markerIdBySlug, orderedMarkers]);

  useEffect(() => {
    if (!showDetailTabs && detailTab === "refs") {
      setDetailTab("record");
    }
  }, [showDetailTabs, detailTab]);

  useEffect(() => {
    const requestedTab = panel === "refs" ? "refs" : "record";
    if (requestedTab === "refs" && !showDetailTabs) {
      if (detailTab !== "record") {
        setDetailTab("record");
      }
      if (panel === "refs") {
        navigate({
          to: location.pathname,
          search: (prev) => ({ ...prev, panel: undefined }),
          replace: true,
        });
      }
      return;
    }
    if (requestedTab !== detailTab) {
      setDetailTab(requestedTab);
    }
  }, [detailTab, location.pathname, navigate, panel, showDetailTabs]);

  useEffect(() => {
    if (!markerHash) return;
    if (detailTab !== "record") {
      setDetailTab("record");
      navigate({
        to: location.pathname,
        search: (prev) => ({ ...prev, panel: undefined }),
        replace: true,
      });
    }
  }, [detailTab, location.pathname, markerHash, navigate]);

  // Use local liked state if available, otherwise use from API
  const isLiked = liked ?? initialLiked;

  const handleLikeChange = (newLiked: boolean) => {
    setLiked(newLiked);
  };
  const handleDetailTabChange = useCallback(
    (tab: "record" | "refs") => {
      if (tab === "refs" && !showDetailTabs) return;
      setDetailTab(tab);
      navigate({
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          panel: tab === "refs" ? "refs" : undefined,
        }),
        replace: true,
      });
    },
    [location.pathname, navigate, showDetailTabs]
  );
  const handleMarkerSelect = useCallback(
    (markerId: string) => {
      const slug = markerSlugById.get(markerId);
      if (!slug) return;
      navigate({
        to: location.pathname,
        search: (prev) => ({ ...prev, panel: undefined }),
        hash: slug,
        replace: true,
      });
    },
    [location.pathname, markerSlugById, navigate]
  );

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
        onDetailTabChange={handleDetailTabChange}
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
                className="relative rounded-2xl bg-muted/50 p-18"
                focusMarkerTime={focusMarkerTime ?? undefined}
                markers={orderedMarkers.map((marker) => ({
                  id: marker.id,
                  time: marker.time,
                  text: marker.text,
                }))}
                onMarkerSelect={handleMarkerSelect}
                showMarkers={markers.length > 0}
                showShortcuts
                version={currentVersion}
              />
            ) : (
              <MarkerRefsPanel
                coverUrl={currentVersion.webCover}
                markers={orderedMarkers.map((marker) => ({
                  id: marker.id,
                  time: marker.time,
                  text: marker.text,
                }))}
                pageTitle={currentPage?.title}
                siteTitle={site.title}
                videoUrl={currentVersion.webRecord}
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
