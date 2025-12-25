import { createFileRoute } from "@tanstack/react-router";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { orpc } from "@/lib/orpc";
import { createDetailPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/(app)/$siteSlug/$pageSlug/")({
  component: PageSlugIndexComponent,
  loader: async ({ context, params }) => {
    const { siteSlug, pageSlug } = params;

    const data = await context.queryClient.ensureQueryData(
      orpc.app.site.getVersionBySlug.queryOptions({
        input: { siteSlug, pageSlug },
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
    const { site, currentPage, currentVersion } = loaderData;
    const meta = createDetailPageMeta(
      `${currentPage?.title ?? ""} - ${site.title}`,
      site.description,
      currentVersion.webCover,
      `/${site.slug}/${currentPage?.slug ?? ""}`
    );
    return { meta: meta.meta, links: meta.links };
  },
});

function PageSlugIndexComponent() {
  const { siteSlug, pageSlug } = Route.useParams();

  return <SiteDetailPage pageSlug={pageSlug} siteSlug={siteSlug} />;
}
