import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { z } from "zod";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { useTrackPageView } from "@/components/features/detail/use-track-page-view";
import { orpc } from "@/lib/orpc";
import { createSiteDetailHead } from "@/lib/seo";

type MarkerListResult = Awaited<ReturnType<typeof orpc.app.marker.list.call>>;

export const Route = createFileRoute("/(app)/$siteSlug/$pageSlug/$versionSlug")(
  {
    component: VersionSlugComponent,
    validateSearch: z.object({
      panel: z.enum(["record", "refs"]).optional(),
    }),
    loader: async ({ context, params }) => {
      const { siteSlug, pageSlug, versionSlug } = params;

      const data = await context.queryClient.ensureQueryData(
        orpc.app.site.getVersionBySlug.queryOptions({
          input: { siteSlug, pageSlug, versionSlug },
        })
      );

      // Prefetch related sites
      if (data.site.id) {
        await context.queryClient.prefetchQuery(
          orpc.app.site.getRelatedSites.queryOptions({
            input: { siteId: data.site.id, limit: 6 },
          })
        );
      }

      let markers: MarkerListResult = [];
      if (data.currentVersion?.id) {
        markers = await context.queryClient.ensureQueryData(
          orpc.app.marker.list.queryOptions({
            input: { versionId: data.currentVersion.id },
          })
        );
      }

      return { ...data, markers };
    },
    head: ({ loaderData }) => {
      if (!(loaderData?.site && loaderData?.currentVersion)) return {};
      const { site, currentPage, currentVersion, markers = [] } = loaderData;
      const versionDateStr = format(currentVersion.versionDate, "yyyy-MM-dd");
      const pageTitle = `${currentPage?.title ?? ""} (${versionDateStr}) - ${site.title}`;
      const url = `/${site.slug}/${currentPage?.slug ?? ""}/${versionDateStr}`;

      return createSiteDetailHead({
        pageTitle,
        url,
        siteTitle: site.title,
        siteDescription: site.description,
        siteTags: site.tags,
        currentVersion,
        markers,
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: site.title, url: `/${site.slug}` },
          {
            name: currentPage?.title ?? "",
            url: `/${site.slug}/${currentPage?.slug ?? ""}`,
          },
          { name: versionDateStr, url },
        ],
      });
    },
  }
);

function VersionSlugComponent() {
  const data = Route.useLoaderData();
  const { panel } = Route.useSearch();
  const { siteSlug, pageSlug, versionSlug } = Route.useParams();

  useTrackPageView(data?.site?.id, data?.currentPage?.id);

  return (
    <SiteDetailPage
      key={`${siteSlug}-${pageSlug}-${versionSlug}`}
      pageSlug={pageSlug}
      panel={panel}
      siteSlug={siteSlug}
      versionSlug={versionSlug}
    />
  );
}
