import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { useTrackPageView } from "@/components/features/detail/use-track-page-view";
import { orpc } from "@/lib/orpc";
import { createSiteDetailHead } from "@/lib/seo";

type MarkerListResult = Awaited<
  ReturnType<typeof orpc.app.marker.list.call>
>;

export const Route = createFileRoute("/(app)/$siteSlug/")({
  component: SiteSlugIndexComponent,
  validateSearch: z.object({
    panel: z.enum(["record", "refs"]).optional(),
  }),
  loader: async ({ context, params }) => {
    const { siteSlug } = params;

    const data = await context.queryClient.ensureQueryData(
      orpc.app.site.getVersionBySlug.queryOptions({
        input: { siteSlug },
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
    const { site, currentVersion, markers = [] } = loaderData;
    const url = `/${site.slug}`;

    return createSiteDetailHead({
      pageTitle: site.title,
      url,
      siteTitle: site.title,
      siteDescription: site.description,
      siteTags: site.tags,
      currentVersion,
      markers,
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: site.title, url },
      ],
    });
  },
});

function SiteSlugIndexComponent() {
  const data = Route.useLoaderData();
  const { panel } = Route.useSearch();
  const { siteSlug } = Route.useParams();

  useTrackPageView(data?.site?.id, data?.currentPage?.id);

  return <SiteDetailPage key={siteSlug} panel={panel} siteSlug={siteSlug} />;
}
