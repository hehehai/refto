import { createFileRoute } from "@tanstack/react-router";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { orpc } from "@/lib/orpc";
import { createDetailPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/(app)/$siteSlug/")({
  component: SiteSlugIndexComponent,
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

    return data;
  },
  head: ({ loaderData }) => {
    if (!(loaderData?.site && loaderData?.currentVersion)) return {};
    const { site, currentVersion } = loaderData;
    const meta = createDetailPageMeta(
      site.title,
      site.description,
      currentVersion.webCover,
      `/${site.slug}`
    );
    return { meta: meta.meta, links: meta.links };
  },
});

function SiteSlugIndexComponent() {
  const { siteSlug } = Route.useParams();

  return <SiteDetailPage key={siteSlug} siteSlug={siteSlug} />;
}
