import { createFileRoute } from "@tanstack/react-router";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import {
  createBreadcrumbSchema,
  createJsonLdScript,
  createSiteArticleSchema,
} from "@/lib/json-ld";
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
    const pageTitle = `${currentPage?.title ?? ""} - ${site.title}`;
    const url = `/${site.slug}/${currentPage?.slug ?? ""}`;
    const meta = createDetailPageMeta(
      pageTitle,
      site.description,
      currentVersion.webCover,
      url
    );

    const articleSchema = createSiteArticleSchema({
      title: pageTitle,
      description: site.description || `Explore ${site.title} design on Refto.`,
      image: currentVersion.webCover || "/images/og.jpg",
      url,
      datePublished: currentVersion.createdAt,
      dateModified: currentVersion.createdAt,
      tags: site.tags?.map((t) => t.name),
    });

    const breadcrumbSchema = createBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: site.title, url: `/${site.slug}` },
      { name: currentPage?.title ?? "", url },
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
});

function PageSlugIndexComponent() {
  const { siteSlug, pageSlug } = Route.useParams();

  return (
    <SiteDetailPage
      key={`${siteSlug}-${pageSlug}`}
      pageSlug={pageSlug}
      siteSlug={siteSlug}
    />
  );
}
