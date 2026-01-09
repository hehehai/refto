import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { useTrackPageView } from "@/components/features/detail/use-track-page-view";
import {
  createBreadcrumbSchema,
  createJsonLdScript,
  createSiteArticleSchema,
} from "@/lib/json-ld";
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
      const pageTitle = `${currentPage?.title ?? ""} (${versionDateStr}) - ${site.title}`;
      const url = `/${site.slug}/${currentPage?.slug ?? ""}/${versionDateStr}`;
      const meta = createDetailPageMeta(
        pageTitle,
        site.description,
        currentVersion.webCover,
        url
      );

      const articleSchema = createSiteArticleSchema({
        title: pageTitle,
        description:
          site.description || `Explore ${site.title} design on Refto.`,
        image: currentVersion.webCover || "/images/og.jpg",
        url,
        datePublished: currentVersion.createdAt,
        dateModified: currentVersion.createdAt,
        tags: site.tags?.map((t) => t.name),
      });

      const breadcrumbSchema = createBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: site.title, url: `/${site.slug}` },
        {
          name: currentPage?.title ?? "",
          url: `/${site.slug}/${currentPage?.slug ?? ""}`,
        },
        { name: versionDateStr, url },
      ]);

      return {
        meta: meta.meta,
        links: meta.links,
        scripts: [
          createJsonLdScript(articleSchema),
          createJsonLdScript(breadcrumbSchema),
        ],
      };
    },
  }
);

function VersionSlugComponent() {
  const data = Route.useLoaderData();
  const { siteSlug, pageSlug, versionSlug } = Route.useParams();

  useTrackPageView(data?.site?.id, data?.currentPage?.id);

  return (
    <SiteDetailPage
      key={`${siteSlug}-${pageSlug}-${versionSlug}`}
      pageSlug={pageSlug}
      siteSlug={siteSlug}
      versionSlug={versionSlug}
    />
  );
}
