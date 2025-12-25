import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { orpc } from "@/lib/orpc";
import { createDetailPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/(app)/$siteSlug/$pageSlug/$versionSlug")(
  {
    component: VersionSlugComponent,
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

      return data;
    },
    head: ({ loaderData }) => {
      if (!(loaderData?.site && loaderData?.currentVersion)) return {};
      const { site, currentPage, currentVersion } = loaderData;
      const versionDateStr = format(currentVersion.versionDate, "yyyy-MM-dd");
      const meta = createDetailPageMeta(
        `${currentPage?.title ?? ""} (${versionDateStr}) - ${site.title}`,
        site.description,
        currentVersion.webCover,
        `/${site.slug}/${currentPage?.slug ?? ""}/${versionDateStr}`
      );
      return { meta: meta.meta, links: meta.links };
    },
  }
);

function VersionSlugComponent() {
  const { siteSlug, pageSlug, versionSlug } = Route.useParams();

  return (
    <SiteDetailPage
      pageSlug={pageSlug}
      siteSlug={siteSlug}
      versionSlug={versionSlug}
    />
  );
}
